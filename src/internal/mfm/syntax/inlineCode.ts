import { INLINE_CODE, MfmInlineCode } from '../../../node';
import { Parser, syntax } from '../../services/parser';
import { CharCode } from '../../services/character';

export const inlineCodeParser: Parser<MfmInlineCode> = syntax((ctx) => {
	// "`"
	if (!ctx.char(CharCode.backtick).ok) {
		return ctx.fail();
	}

	// code
	let code = '';
	while (true) {
		if (ctx.matchRegex(/^[`´]/)) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;
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
