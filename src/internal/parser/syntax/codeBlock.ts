import { CODE_BLOCK, MfmCodeBlock } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';

export function codeBlockMatcher(ctx: MatcherContext): Match<MfmCodeBlock> {
	let matched;

	// TODO: check line-head

	// "```"
	if (!ctx.matchStr('```')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// lang
	let lang = '';
	while (true) {
		if (ctx.matchRegex(/^\r\n|[\r\n]/) != null) break;
		if (ctx.eof()) break;

		lang += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}

	// LF
	matched = ctx.matchRegex(/^\r\n|[\r\n]/);
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched.length;

	// TODO: code

	// LF
	matched = ctx.matchRegex(/^\r\n|[\r\n]/);
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched.length;

	// "```"
	if (!ctx.matchStr('```')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// TODO: check line-tail

	lang = lang.trim();
	return ctx.ok(CODE_BLOCK('', (lang.length > 0 ? lang : null)));
}
