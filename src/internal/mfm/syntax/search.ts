import { MfmSearch, SEARCH } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../parser';

export const searchParser: Parser<MfmSearch> = syntax((ctx) => {

	// TODO: line-head

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
			const match = ctx.regex(/^\[?(検索|search)]?/i);
			if (!match.ok) {
				return ctx.fail();
			}
			// TODO: line-tail
			return ctx.ok(null);
		})) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;
		// .
		const match = ctx.anyChar();
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
	const match = ctx.regex(/^\[?(検索|search)]?/i);
	if (!match.ok) {
		return ctx.fail();
	}

	const tailPos = ctx.pos;

	// TODO: line-tail

	const content = ctx.input.substring(headPos, tailPos);

	return ctx.ok(SEARCH(q, content));
});
