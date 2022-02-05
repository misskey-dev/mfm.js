import { MfmQuote, QUOTE } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../parser';

export const quoteParser: Parser<MfmQuote> = syntax((ctx) => {
	// TODO

	return ctx.ok(QUOTE([]));
});
