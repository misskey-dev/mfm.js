import { CODE_BLOCK, MfmCodeBlock } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../services/syntaxParser';
import { lineEndParser } from '../services/utility';

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
	if (!ctx.regex(/^(\r\n|[\r\n])/).ok) {
		return ctx.fail();
	}

	// TODO: code

	// LF
	if (!ctx.regex(/^(\r\n|[\r\n])/).ok) {
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
	return ctx.ok(CODE_BLOCK('', (lang.length > 0 ? lang : null)));
});
