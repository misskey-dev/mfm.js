import { INLINE_CODE, MfmInlineCode } from '../../../node';
import { Parser } from '../../services/parser';
import { CharCode } from '../../services/character';
import { syntax } from '../services/syntaxParser';

export const inlineCodeParser: Parser<MfmInlineCode> = syntax('inlineCode', (ctx) => {
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
