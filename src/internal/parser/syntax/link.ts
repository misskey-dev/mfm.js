import { LINK } from '../../../node';
import { MatcherContext } from '../services/matcher';

export function linkMatcher(ctx: MatcherContext) {
	// TODO

	return ctx.ok(LINK(false, '', []));
}

export function silentLinkMatcher(ctx: MatcherContext) {
	// TODO

	return ctx.ok(LINK(true, '', []));
}
