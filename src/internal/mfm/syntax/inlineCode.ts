import { INLINE_CODE, MfmInlineCode } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { CharCode } from '../../services/character';

export const inlineCodeMatcher: Parser<MfmInlineCode> = cache((ctx) => {
	// "`"
	if (!ctx.char(CharCode.backtick)) {
		return ctx.fail();
	}
	ctx.pos++;

	// code
	let code = '';
	while (true) {
		if (/^[`´]/.test(ctx.input.charAt(ctx.pos))) break;
		if (ctx.regex(/^(\r\n|[\r\n])/) != null || ctx.eof()) break;

		code += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (code.length < 1) {
		return ctx.fail();
	}

	// "`"
	if (!ctx.char(CharCode.backtick)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(INLINE_CODE(code));
});
