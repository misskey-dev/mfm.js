import { MfmUnicodeEmoji, UNI_EMOJI } from '../../../node';
import { SyntaxMatcher } from '../services/matcher';
import emojiRegex from 'twemoji-parser/dist/lib/regex';
import { SyntaxId } from '../services/syntax';
const anchoredEmojiRegex = RegExp(`^(?:${emojiRegex.source})`);

export const unicodeEmojiMatcher = new SyntaxMatcher<MfmUnicodeEmoji>(SyntaxId.UnicodeEmoji, ctx => {
	const matched = ctx.matchRegex(anchoredEmojiRegex);
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	return ctx.ok(UNI_EMOJI(matched[0]));
});
