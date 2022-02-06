import { HASHTAG, MfmHashtag } from '../../../node';
import { Parser } from '../../services/parser';
import { CharCode } from '../../services/character';
import { syntax } from '../services/syntaxParser';
import { ensureAllowedBackChar } from '../services/utility';

// TODO: 「#」がUnicode絵文字の一部である場合があるので判定する
// TODO: 括弧は対になっている時のみ内容に含めることができる。対象: `()` `[]` `「」`

export const hashtagParser: Parser<MfmHashtag> = syntax('hashtag', (ctx) => {
	// check a back char
	if (!ensureAllowedBackChar(ctx)) {
		return ctx.fail();
	}

	// "#"
	if (!ctx.char(CharCode.hash).ok) {
		return ctx.fail();
	}

	// value
	let value = '';
	while (true) {
		if (ctx.matchRegex(/^[ \u3000\t.,!?'"#:/[\]【】()「」<>]/)) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;
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
