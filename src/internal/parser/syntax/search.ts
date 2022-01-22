import { SEARCH } from '../../../node';
import { MatcherContext } from '../services/matcher';

export function searchMatcher(ctx: MatcherContext) {
	// TODO

	return ctx.ok(SEARCH('', ''));
}
