import { MfmSearch, SEARCH } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';

const searchRightMatcher = defineCachedMatcher<true>('searchRight', ctx => {
	// spacing
	if (!ctx.matchRegex(/^[ \u3000\t\u00a0]/)) {
		return ctx.fail();
	}
	ctx.pos++;

	// search key
	const match = ctx.matchRegex(/^\[?(検索|search)]?/i);
	if (match == null) {
		return ctx.fail();
	}
	ctx.pos += match[0].length;

	// TODO: line-tail

	return ctx.ok(true);
});

export const searchMatcher = defineCachedMatcher<MfmSearch>('search', ctx => {

	// TODO: line-head

	const headPos = ctx.pos;

	// query
	let q = '';
	while (true) {
		if (ctx.match(searchRightMatcher).ok) break;
		if (ctx.matchRegex(/^\r\n|[\r\n]/) != null || ctx.eof()) break;

		q += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (q.length == 0) {
		return ctx.fail();
	}

	// right part
	if (!ctx.consume(searchRightMatcher).ok) {
		return ctx.fail();
	}

	const content = ctx.input.substring(headPos, ctx.pos);

	return ctx.ok(SEARCH(q, content));
});
