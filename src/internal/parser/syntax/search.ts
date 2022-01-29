import { MfmSearch, SEARCH } from '../../../node';
import { SyntaxMatcher } from '../services/matcher';
import { SyntaxId } from '../services/syntax';

export const searchMatcher = new SyntaxMatcher<MfmSearch>(SyntaxId.Search, ctx => {
	// TODO

	return ctx.ok(SEARCH('', ''));
});
