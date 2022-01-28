import { MfmSearch, SEARCH } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';

export function searchMatcher(ctx: MatcherContext): Match<MfmSearch> {
	// TODO

	return ctx.ok(SEARCH('', ''));
}
