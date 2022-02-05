import { MfmUnicodeEmoji, UNI_EMOJI } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../services/syntaxParser';
import emojiRegex from 'twemoji-parser/dist/lib/regex';
const anchoredEmojiRegex = RegExp(`^(?:${emojiRegex.source})`);

export const unicodeEmojiParser: Parser<MfmUnicodeEmoji> = syntax('unicodeEmoji', (ctx) => {
	const matched = ctx.regex(anchoredEmojiRegex);
	if (!matched.ok) {
		return ctx.fail();
	}

	return ctx.ok(UNI_EMOJI(matched.result[0]));
});
