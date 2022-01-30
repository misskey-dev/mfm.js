import { MfmQuote, QUOTE } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';

export const quoteMatcher = defineCachedMatcher<MfmQuote>('quote', ctx => {
	// TODO

	return ctx.ok(QUOTE([]));
});
