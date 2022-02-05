import { MfmSearch, SEARCH } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../services/syntaxParser';
import { lineEndParser } from '../services/utility';

export const searchParser: Parser<MfmSearch> = syntax('search', (ctx) => {
	let match;

	// begin of line
	if (ctx.location(ctx.pos).column !== 0) {
		return ctx.fail();
	}

	const headPos = ctx.pos;

	// query
	let q = '';
	while (true) {
		if (ctx.match(() => {
			// spacing
			if (!ctx.regex(/^[ \u3000\t\u00a0]/).ok) {
				return ctx.fail();
			}
			// search key
			match = ctx.regex(/^\[?(検索|search)]?/i);
			if (!match.ok) {
				return ctx.fail();
			}
			// end of line
			match = lineEndParser(ctx);
			if (!match.ok) {
				return ctx.fail();
			}
			return ctx.ok(null);
		})) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;
		// .
		match = ctx.anyChar();
		if (!match.ok) break;
		q += match.result;
	}
	if (q.length === 0) {
		return ctx.fail();
	}

	// spacing
	if (!ctx.regex(/^[ \u3000\t\u00a0]/).ok) {
		return ctx.fail();
	}

	// search key
	match = ctx.regex(/^\[?(検索|search)]?/i);
	if (!match.ok) {
		return ctx.fail();
	}

	const tailPos = ctx.pos;

	// end of line
	match = lineEndParser(ctx);
	if (!match.ok) {
		return ctx.fail();
	}

	const content = ctx.input.substring(headPos, tailPos);

	return ctx.ok(SEARCH(q, content));
});
