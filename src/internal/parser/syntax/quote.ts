import { QUOTE } from '../../../node';
import { MatcherContext } from '../services/matcher';

export function quoteMatcher(ctx: MatcherContext) {
	// TODO

	return ctx.ok(QUOTE([]));
}
