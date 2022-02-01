import { MfmQuote, QUOTE } from '../../../node';
import { defineCachedMatcher } from '../../services/parser';

export const quoteMatcher = defineCachedMatcher<MfmQuote>('quote', ctx => {
	// TODO

	return ctx.ok(QUOTE([]));
});
