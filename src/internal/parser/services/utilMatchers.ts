import { MatcherContext } from './matcher';

export function LfMatcher(ctx: MatcherContext) {
	const matched = /^\r\n|[\r\n]/.exec(ctx.getText());
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	return ctx.ok(matched[0]);
}
