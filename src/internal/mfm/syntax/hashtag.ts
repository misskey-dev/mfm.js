import { HASHTAG, MfmHashtag } from '../../../node';
import { Parser, ParserContext, Result } from '../../services/parser';
import { CharCode } from '../../services/character';
import { syntax } from '../services/syntaxParser';
import { ensureAllowedBackChar } from '../services/utility';

const bracketTable = {
	'(': ')',
	'[': ']',
	'「': '」',
};

function valueParser(ctx: ParserContext): Result<string> {
	const match = ctx.choice([
		() => {
			const openMatch = ctx.regex(/^[([「]/);
			if (!openMatch.ok) {
				return ctx.fail();
			}

			let value = '';
			while (true) {
				const valueMatch = ctx.parser(valueParser);
				if (!valueMatch.ok) break;
				value += valueMatch.result;
			}
			if (value.length === 0) {
				return ctx.fail();
			}

			const open = openMatch.result[0] as '(' | '[' | '「';
			const close = bracketTable[open];
			if (!ctx.str(close).ok) {
				return ctx.fail();
			}
			return ctx.ok(`${open}${value}${close}`);
		},
		() => {
			if (ctx.matchRegex(/^[ \u3000\t.,!?'"#:/[\]【】()「」<>]/)) {
				return ctx.fail();
			}
			// LF
			if (ctx.matchRegex(/^(\r\n|[\r\n])/)) {
				return ctx.fail();
			}
			// .
			const match = ctx.anyChar();
			if (!match.ok) {
				return ctx.fail();
			}
			return ctx.ok(match.result);
		},
	]);
	return match;
}

export const hashtagParser: Parser<MfmHashtag> = syntax('hashtag', (ctx) => {
	// check a back char
	if (!ensureAllowedBackChar(ctx)) {
		return ctx.fail();
	}

	// "#"
	if (!ctx.char(CharCode.hash).ok) {
		return ctx.fail();
	}

	// ignore the keycap number sign
	const keycap = ctx.match(() => {
		ctx.str('\uFE0F'); // option
		return ctx.str('\u20E3');
	});
	if (keycap) {
		return ctx.fail();
	}

	// value
	let value = '';
	while (true) {
		const match = ctx.parser(valueParser);
		if (!match.ok) break;
		value += match.result;
	}

	// validate hashtag
	if (value.length === 0 || /^[0-9]+$/.test(value)) {
		return ctx.fail();
	}

	return ctx.ok(HASHTAG(value));
});
