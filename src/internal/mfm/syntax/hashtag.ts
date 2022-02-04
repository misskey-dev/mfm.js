import { HASHTAG, MfmHashtag } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { isAllowedAsBackChar } from '../../services/matchingUtil';
import { CharCode } from '../../services/character';

// TODO: 「#」がUnicode絵文字の一部である場合があるので判定する
// TODO: 括弧は対になっている時のみ内容に含めることができる。対象: `()` `[]` `「」`

export const hashtagParser: Parser<MfmHashtag> = cache((ctx) => {
	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "#"
	if (!ctx.char(CharCode.hash).ok) {
		return ctx.fail();
	}

	// value
	let value = '';
	while (true) {
		if (ctx.match(() => ctx.regex(/^[ \u3000\t.,!?'"#:/[\]【】()「」<>]/))) break;
		// LF
		if (ctx.match(() => ctx.regex(/^(\r\n|[\r\n])/))) break;
		// .
		const match = ctx.anyChar();
		if (!match.ok) break;
		value += match.result;
	}
	if (value.length === 0 || /^[0-9]+$/.test(value)) {
		return ctx.fail();
	}

	return ctx.ok(HASHTAG(value));
});
