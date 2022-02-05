import { EMOJI_CODE, MfmEmojiCode } from '../../../node';
import { Parser } from '../../services/parser';
import { CharCode } from '../../services/character';
import { syntax } from '../services/syntaxParser';

export const emojiCodeParser: Parser<MfmEmojiCode> = syntax('emojiCode', (ctx) => {
	// ":"
	if (!ctx.char(CharCode.colon).ok) {
		return ctx.fail();
	}

	// name
	const matched = ctx.regex(/^[a-z0-9_+-]+/i);
	if (!matched.ok) {
		return ctx.fail();
	}
	const name = matched.result[0];

	// ":"
	if (!ctx.char(CharCode.colon).ok) {
		return ctx.fail();
	}

	return ctx.ok(EMOJI_CODE(name));
});
