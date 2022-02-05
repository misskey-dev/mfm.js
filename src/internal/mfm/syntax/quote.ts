import { MfmQuote, QUOTE } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../services/syntaxParser';

export const quoteParser: Parser<MfmQuote> = syntax('quote', (ctx) => {
	// TODO

	return ctx.ok(QUOTE([]));
});
