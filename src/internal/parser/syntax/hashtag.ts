import { HASHTAG, MfmHashtag } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';
import { isAllowedAsBackChar } from '../services/matchingUtil';
import { CharCode } from '../services/string';

// TODO: 「#」がUnicode絵文字の一部である場合があるので判定する
// TODO: 括弧は対になっている時のみ内容に含めることができる。対象: `()` `[]` `「」`

export const hashtagMatcher = defineCachedMatcher<MfmHashtag>('hashtag', ctx => {
	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "#"
	if (!ctx.matchCharCode(CharCode.hash)) {
		return ctx.fail();
	}
	ctx.pos++;

	// value
	let value = '';
	while (true) {
		if (/^[ \u3000\t.,!?'"#:/[\]【】()「」<>]/i.test(ctx.input.charAt(ctx.pos))) break;
		if (ctx.matchRegex(/^\r\n|[\r\n]/) != null) break;
		if (ctx.eof()) break;

		value += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (value.length == 0 || /^[0-9]+$/.test(value)) {
		return ctx.fail();
	}

	return ctx.ok(HASHTAG(value));
});
