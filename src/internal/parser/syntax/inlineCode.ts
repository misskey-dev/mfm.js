import { INLINE_CODE } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';
import { LfMatcher } from '../services/utilMatchers';

export function inlineCodeMatcher(ctx: MatcherContext) {
	// "`"
	if (!ctx.matchCharCode(CharCode.backtick)) {
		return ctx.fail();
	}
	ctx.pos++;

	// code
	let code = '';
	while (true) {
		if (/^[`´]/.test(ctx.input.charAt(ctx.pos))) {
			break;
		}
		if (ctx.match(LfMatcher).ok) {
			break;
		}
		if (ctx.eof()) {
			break;
		}
		code += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (code.length < 1) {
		return ctx.fail();
	}

	// "`"
	if (!ctx.matchCharCode(CharCode.backtick)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(INLINE_CODE(code));
}
