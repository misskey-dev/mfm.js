import { MfmQuote, QUOTE } from '../../../node';
import { SyntaxMatcher } from '../services/matcher';
import { SyntaxId } from '../services/syntax';

export const quoteMatcher = new SyntaxMatcher<MfmQuote>(SyntaxId.Quote, ctx => {
	// TODO

	return ctx.ok(QUOTE([]));
});
