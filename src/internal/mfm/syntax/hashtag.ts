import { HASHTAG, MfmHashtag } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { isAllowedAsBackChar } from '../../services/matchingUtil';
import { CharCode } from '../../services/character';

// TODO: 「#」がUnicode絵文字の一部である場合があるので判定する
// TODO: 括弧は対になっている時のみ内容に含めることができる。対象: `()` `[]` `「」`

export const hashtagMatcher: Parser<MfmHashtag> = cache((ctx) => {
	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "#"
	if (!ctx.char(CharCode.hash)) {
		return ctx.fail();
	}
	ctx.pos++;

	// value
	let value = '';
	while (true) {
		if (/^[ \u3000\t.,!?'"#:/[\]【】()「」<>]/i.test(ctx.input.charAt(ctx.pos))) break;
		if (ctx.regex(/^(\r\n|[\r\n])/) != null || ctx.eof()) break;

		value += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (value.length === 0 || /^[0-9]+$/.test(value)) {
		return ctx.fail();
	}

	return ctx.ok(HASHTAG(value));
});
