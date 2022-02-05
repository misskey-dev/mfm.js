import { MfmQuote, QUOTE } from '../../../node';
import { Parser, syntax } from '../../services/parser';

export const quoteParser: Parser<MfmQuote> = syntax((ctx) => {
	// TODO

	return ctx.ok(QUOTE([]));
});
