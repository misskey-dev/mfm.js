import { INLINE_CODE, MfmInlineCode } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { CharCode } from '../../services/character';

export const inlineCodeParser: Parser<MfmInlineCode> = cache((ctx) => {
	// "`"
	if (!ctx.char(CharCode.backtick).ok) {
		return ctx.fail();
	}

	// code
	let code = '';
	while (true) {
		if (ctx.match(() => ctx.regex(/^[`´]/))) break;
		// LF
		if (ctx.match(() => ctx.regex(/^(\r\n|[\r\n])/))) break;
		// .
		const match = ctx.anyChar();
		if (!match.ok) break;
		code += match.result;
	}
	if (code.length < 1) {
		return ctx.fail();
	}

	// "`"
	if (!ctx.char(CharCode.backtick).ok) {
		return ctx.fail();
	}

	return ctx.ok(INLINE_CODE(code));
});
