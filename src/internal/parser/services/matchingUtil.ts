import { MatcherContext } from './matcher';
import { LfMatcher, spacingMatcher } from './utilMatchers';

// 一つ前の文字が:
// 無い OR 改行 OR スペース OR ![a-z0-9]i
// の時にtrueを返します。
export function isAllowedAsBackChar(ctx: MatcherContext) {
	if (ctx.pos > 0) {
		const fallback = ctx.pos;
		ctx.pos--;
		if (
			!ctx.match(LfMatcher).ok &&
			!ctx.match(spacingMatcher).ok &&
			/^[a-z0-9]/i.test(ctx.input.charAt(ctx.pos))
		) {
			ctx.pos = fallback;
			return false;
		}
		ctx.pos = fallback;
	}
	return true;
}
