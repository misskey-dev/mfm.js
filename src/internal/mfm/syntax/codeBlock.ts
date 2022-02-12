import { CODE_BLOCK, MfmCodeBlock } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../services/syntaxParser';
import { LfParser, lineEndParser } from '../services/utility';

export const codeBlockParser: Parser<MfmCodeBlock> = syntax('codeBlock', (ctx) => {
	let match;

	// begin of line
	if (ctx.location(ctx.pos).column !== 0) {
		return ctx.fail();
	}

	// "```"
	if (!ctx.str('```').ok) {
		return ctx.fail();
	}

	// lang
	let lang = '';
	while (true) {
		// !LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;

		// .
		match = ctx.anyChar();
		if (!match.ok) break;
		lang += match.result;
	}

	// LF
	if (!ctx.parser(LfParser).ok) {
		return ctx.fail();
	}

	// code
	let code = '';
	while (true) {
		match = ctx.matchSequence([
			// LF
			LfParser,
			// "```"
			() => ctx.str('```'),
			// end of line
			lineEndParser,
		]);
		if (match) break;

		match = ctx.anyChar();
		if (!match.ok) break;
		code += match.result;
	}

	// LF
	if (!ctx.parser(LfParser).ok) {
		return ctx.fail();
	}

	// "```"
	if (!ctx.str('```').ok) {
		return ctx.fail();
	}

	// end of line
	match = lineEndParser(ctx);
	if (!match.ok) {
		return ctx.fail();
	}

	lang = lang.trim();
	return ctx.ok(CODE_BLOCK(code, (lang.length > 0 ? lang : null)));
});
