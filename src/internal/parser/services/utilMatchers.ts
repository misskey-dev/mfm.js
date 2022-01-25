import { MatcherContext } from './matcher';

export function LfMatcher(ctx: MatcherContext) {
	const matched = ctx.matchRegex(/^\r\n|[\r\n]/);
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	return ctx.ok(matched[0]);
}

export function spacingMatcher(ctx: MatcherContext) {
	const matched = ctx.matchRegex(/^[ \u3000\t\u00a0]/);
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(matched[0]);
}
