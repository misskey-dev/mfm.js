import { EMOJI_CODE } from '../../../node';
import { MatcherContext } from '../matcher';

export function emojiCodeMatcher(ctx: MatcherContext) {
	// :
	if (ctx.input[ctx.pos] != ':') {
		return ctx.fail();
	}
	ctx.pos++;

	// name
	const matched = /^[a-z0-9_+-]+/i.exec(ctx.getText());
	if (matched == null) {
		return ctx.fail();
	}
	const name = matched[0];
	ctx.pos += name.length;

	// :
	if (ctx.input[ctx.pos] != ':') {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(EMOJI_CODE(name));
}
