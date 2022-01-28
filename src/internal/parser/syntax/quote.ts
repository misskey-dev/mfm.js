import { MfmQuote, QUOTE } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';

export function quoteMatcher(ctx: MatcherContext): Match<MfmQuote> {
	// TODO

	return ctx.ok(QUOTE([]));
}
