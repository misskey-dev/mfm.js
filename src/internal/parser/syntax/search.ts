import { MfmSearch, SEARCH } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';

export const searchMatcher = defineCachedMatcher<MfmSearch>('search', ctx => {
	// TODO

	return ctx.ok(SEARCH('', ''));
});
