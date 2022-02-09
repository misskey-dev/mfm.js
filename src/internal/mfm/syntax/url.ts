import { MfmUrl, N_URL } from '../../../node';
import { Parser, ParserContext, Result } from '../../services/parser';
import { CharCode } from '../../services/character';
import { syntax } from '../services/syntaxParser';

const bracketTable = {
	'(': ')',
	'[': ']',
};

function contentParser(ctx: ParserContext): Result<string> {
	const match = ctx.choice([
		() => {
			const openMatch = ctx.regex(/^[([]/);
			if (!openMatch.ok) {
				return ctx.fail();
			}

			let content = '';
			while (true) {
				const contentMatch = ctx.parser(contentParser);
				if (!contentMatch.ok) break;
				content += contentMatch.result;
			}
			if (content.length === 0) {
				return ctx.fail();
			}

			const open = openMatch.result[0] as '(' | '[';
			const close = bracketTable[open];
			if (!ctx.str(close).ok) {
				return ctx.fail();
			}
			return ctx.ok(`${open}${content}${close}`);
		},
		() => {
			const match = ctx.regex(/^[.,a-z0-9_/:%#@$&?!~=+-]+/i);
			if (!match.ok) {
				return ctx.fail();
			}
			return ctx.ok(match.result[0]);
		},
	]);
	return match;
}

const schemes: string[] = [
	'https',
	'http',
];

export const urlParser: Parser<MfmUrl> = syntax('url', (ctx) => {
	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.str(sch + ':').ok) {
			found = true;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	// "//"
	if (!ctx.str('//').ok) {
		return ctx.fail();
	}

	// path
	let path = '';
	const originPos = ctx.pos;
	while (true) {
		const contentMatch = ctx.parser(contentParser);
		if (!contentMatch.ok) break;
		path += contentMatch.result;
	}
	ctx.pos = originPos;
	if (path.length === 0) {
		return ctx.fail();
	}

	// (path) last character must not be "." or ","
	let length = path.length;
	while (length > 0) {
		const lastCode = path.charCodeAt(length - 1);
		if (lastCode !== CharCode.dot && lastCode !== CharCode.comma) break;
		length--;
	}
	if (length === 0) {
		return ctx.fail();
	}
	if (length !== path.length) {
		path = path.substr(0, length);
	}
	ctx.pos += path.length;

	// url
	const value = ctx.input.substring(urlHead, ctx.pos);

	return ctx.ok(N_URL(value));
});

export const urlAltParser: Parser<MfmUrl> = syntax('urlAlt', (ctx) => {
	// "<"
	if (!ctx.char(CharCode.lessThan).ok) {
		return ctx.fail();
	}

	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.str(sch + ':').ok) {
			found = true;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	let c = '';
	while (true) {
		// ">" | spacing
		if (ctx.matchRegex(/^[ \u3000\t>]/)) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;
		// .
		const match = ctx.anyChar();
		if (!match.ok) break;
		c += match.result;
	}
	if (c.length === 0) {
		return ctx.fail();
	}

	const urlTail = ctx.pos;

	// ">"
	if (!ctx.char(CharCode.greaterThan).ok) {
		return ctx.fail();
	}

	const value = ctx.input.substring(urlHead, urlTail);

	return ctx.ok(N_URL(value, true));
});
