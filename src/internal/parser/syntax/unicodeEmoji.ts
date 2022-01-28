import { MfmUnicodeEmoji, UNI_EMOJI } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';
import emojiRegex from 'twemoji-parser/dist/lib/regex';
const anchoredEmojiRegex = RegExp(`^(?:${emojiRegex.source})`);

export function unicodeEmojiMatcher(ctx: MatcherContext): Match<MfmUnicodeEmoji> {
	const matched = ctx.matchRegex(anchoredEmojiRegex);
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	return ctx.ok(UNI_EMOJI(matched[0]));
}
