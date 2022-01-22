import { EMOJI_CODE } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';

export function emojiCodeMatcher(ctx: MatcherContext) {
	// ":"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.colon) {
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

	// ":"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.colon) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(EMOJI_CODE(name));
}
