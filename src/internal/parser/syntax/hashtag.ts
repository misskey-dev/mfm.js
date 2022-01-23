import { HASHTAG } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';
import { LfMatcher, spacingMatcher } from '../services/utilMatchers';

// TODO: 括弧は対になっている時のみ内容に含めることができる。対象: `()` `[]` `「」`

// `#`の前の文字が:
// 無い OR 改行 OR スペース OR ![a-z0-9]i
// の時はハッシュタグとして認識する

export function hashtagMatcher(ctx: MatcherContext) {

	// check a back charactor
	if (ctx.pos > 0) {
		ctx.pos--;
		if (
			ctx.match(LfMatcher).ok &&
			!ctx.match(spacingMatcher).ok &&
			/^[a-z0-9]/i.test(ctx.input.charAt(ctx.pos))
		) {
			return ctx.fail();
		}
		ctx.pos++;
	}

	// "#"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.hash) {
		return ctx.fail();
	}
	ctx.pos++;

	// value
	let value = '';
	while (true) {
		if (/^[ \u3000\t.,!?'"#:/[\]【】()「」<>]/i.test(ctx.input.charAt(ctx.pos))) {
			break;
		}
		if (ctx.match(LfMatcher).ok) {
			break;
		}
		if (ctx.eof()) {
			break;
		}
		value += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (value.length == 0 || /^[0-9]+$/.test(value)) {
		return ctx.fail();
	}

	return ctx.ok(HASHTAG(value));
}
