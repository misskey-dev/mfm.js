import { MatcherContext } from './matcher';

// 一つ前の文字が:
// 無い OR 改行 OR スペース OR ![a-z0-9]i
// の時にtrueを返します。
export function isAllowedAsBackChar(ctx: MatcherContext): boolean {
	if (ctx.pos > 0) {
		const fallback = ctx.pos;
		ctx.pos--;
		if (
			ctx.matchRegex(/^\r\n|[\r\n]/) == null &&
			ctx.matchRegex(/^[ \u3000\t\u00a0]/) == null &&
			/^[a-z0-9]/i.test(ctx.input.charAt(ctx.pos))
		) {
			ctx.pos = fallback;
			return false;
		}
		ctx.pos = fallback;
	}
	return true;
}
