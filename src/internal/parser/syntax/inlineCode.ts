import { INLINE_CODE, MfmInlineCode } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';
import { CharCode } from '../services/string';

export const inlineCodeMatcher = defineCachedMatcher<MfmInlineCode>('inlineCode', ctx => {
	// "`"
	if (!ctx.matchCharCode(CharCode.backtick)) {
		return ctx.fail();
	}
	ctx.pos++;

	// code
	let code = '';
	while (true) {
		if (/^[`´]/.test(ctx.input.charAt(ctx.pos))) break;
		if (ctx.matchRegex(/^\r\n|[\r\n]/) != null || ctx.eof()) break;

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
});
