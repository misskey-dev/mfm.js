import { UNI_EMOJI } from '../../../node';
import { MatcherContext } from '../services/matcher';
const emojiRegex: RegExp = require('twemoji-parser/dist/lib/regex').default;
const anchoredEmojiRegex = RegExp(`^(?:${emojiRegex.source})`);

export function unicodeEmojiMatcher(ctx: MatcherContext) {
	const matched = anchoredEmojiRegex.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	return ctx.ok(UNI_EMOJI(matched[0]));
}
