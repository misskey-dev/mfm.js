import { HASHTAG, MfmHashtag } from '../../../node';
import { Parser } from '../../services/parser';
import { CharCode } from '../../services/character';
import { syntax } from '../services/syntaxParser';
import { ensureAllowedBackChar } from '../services/utility';

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
		if (ctx.matchRegex(/^[ \u3000\t.,!?'"#:/【】<>]/)) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;
		// .
		const match = ctx.anyChar();
		if (!match.ok) break;
		value += match.result;
	}

	// check bracket pair
	const pairs: [string, string][] = [
		['(', ')'], ['[', ']'], ['「', '」']
	];
	let valueLength = value.length;
	for (const [open, close] of pairs) {
		const pairStack: number[] = [];
		let p = 0;
		while (p < valueLength) {
			switch (value.charAt(p)) {
				case open: {
					pairStack.push(p);
					break;
				}
				case close: {
					// alone close
					if (pairStack.length === 0) {
						valueLength = p;
						break;
					}
					pairStack.pop();
					break;
				}
			}
			p++;
		}
		if (pairStack.length > 0) {
			valueLength = pairStack[0];
		}
	}
	if (value.length != valueLength) {
		ctx.pos -= (value.length - valueLength);
		value = value.substr(0, valueLength);
	}

	// validate hashtag
	if (value.length === 0 || /^[0-9]+$/.test(value)) {
		return ctx.fail();
	}

	return ctx.ok(HASHTAG(value));
});
