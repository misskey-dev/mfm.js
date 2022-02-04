import { MfmQuote, QUOTE } from '../../../node';
import { cache, Parser } from '../../services/parser';

export const quoteMatcher: Parser<MfmQuote> = cache((ctx) => {
	// TODO

	return ctx.ok(QUOTE([]));
});
