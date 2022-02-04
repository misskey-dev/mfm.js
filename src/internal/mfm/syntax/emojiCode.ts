import { EMOJI_CODE, MfmEmojiCode } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { CharCode } from '../../services/character';

export const emojiCodeMatcher: Parser<MfmEmojiCode> = cache((ctx) => {
	// ":"
	if (!ctx.char(CharCode.colon)) {
		return ctx.fail();
	}
	ctx.pos++;

	// name
	const matched = ctx.regex(/^[a-z0-9_+-]+/i);
	if (matched == null) {
		return ctx.fail();
	}
	const name = matched[0];
	ctx.pos += name.length;

	// ":"
	if (!ctx.char(CharCode.colon)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(EMOJI_CODE(name));
});
