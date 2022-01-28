import { EMOJI_CODE, MfmEmojiCode } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';

export function emojiCodeMatcher(ctx: MatcherContext): Match<MfmEmojiCode> {
	// ":"
	if (!ctx.matchCharCode(CharCode.colon)) {
		return ctx.fail();
	}
	ctx.pos++;

	// name
	const matched = ctx.matchRegex(/^[a-z0-9_+-]+/i);
	if (matched == null) {
		return ctx.fail();
	}
	const name = matched[0];
	ctx.pos += name.length;

	// ":"
	if (!ctx.matchCharCode(CharCode.colon)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(EMOJI_CODE(name));
}
