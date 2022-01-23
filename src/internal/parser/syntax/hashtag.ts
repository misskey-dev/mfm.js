import { HASHTAG } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';
import { LfMatcher } from '../services/utilMatchers';

export function hashtagMatcher(ctx: MatcherContext) {
	// "#"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.hash) {
		return ctx.fail();
	}
	ctx.pos++;

	// value
	let value = '';
	while (true) {
		if (ctx.eof()) {
			break;
		}
		if (/^[ \u3000\t.,!?'"#:/[\]【】()「」<>]/i.test(ctx.input.substr(ctx.pos))) {
			break;
		}
		if (ctx.match(LfMatcher).ok) {
			break;
		}
		value += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (value.length == 0) {
		return ctx.fail();
	}

	return ctx.ok(HASHTAG(value));
}
