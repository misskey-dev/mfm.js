import { MatcherContext } from './matcher';

export function LfMatcher(ctx: MatcherContext) {
	const matched = /^\r\n|[\r\n]/.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	return ctx.ok(matched[0]);
}

export function spacingMatcher(ctx: MatcherContext) {
	const matched = /^[ \u3000\t\u00a0]/.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(matched[0]);
}
