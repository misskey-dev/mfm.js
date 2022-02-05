import { ParserContext } from './parser';

// 一つ前の文字が:
// 無い OR 改行 OR スペース OR ![a-z0-9]i
// の時にtrueを返します。
export function isAllowedAsBackChar(ctx: ParserContext): boolean {
	if (ctx.pos > 0) {
		ctx.pos--;
		if (
			!ctx.matchRegex(/^(\r\n|[\r\n])/) &&
			!ctx.matchRegex(/^[ \u3000\t\u00a0]/) &&
			ctx.matchRegex(/^[a-z0-9]/i)
		) {
			ctx.pos++;
			return false;
		}
		ctx.pos++;
	}
	return true;
}
