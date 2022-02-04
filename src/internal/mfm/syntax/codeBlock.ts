import { CODE_BLOCK, MfmCodeBlock } from '../../../node';
import { cache, Parser } from '../../services/parser';

export const codeBlockParser: Parser<MfmCodeBlock> = cache((ctx) => {
	let matched;

	// TODO: check line-head

	// "```"
	if (!ctx.str('```').ok) {
		return ctx.fail();
	}

	// lang
	let lang = '';
	while (true) {
		// !LF
		if (ctx.match(() => ctx.regex(/^(\r\n|[\r\n])/))) break;

		// .
		matched = ctx.anyChar();
		if (!matched.ok) break;
		lang += matched.result;
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

	// TODO: check line-tail

	lang = lang.trim();
	return ctx.ok(CODE_BLOCK('', (lang.length > 0 ? lang : null)));
});
