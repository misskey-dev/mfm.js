import { MfmSearch, SEARCH } from '../../../node';
import { cache, Parser } from '../../services/parser';

const searchRightMatcher: Parser<true> = cache((ctx) => {
	// spacing
	if (!ctx.regex(/^[ \u3000\t\u00a0]/)) {
		return ctx.fail();
	}
	ctx.pos++;

	// search key
	const match = ctx.regex(/^\[?(検索|search)]?/i);
	if (match == null) {
		return ctx.fail();
	}
	ctx.pos += match[0].length;

	// TODO: line-tail

	return ctx.ok(true);
});

export const searchMatcher: Parser<MfmSearch> = cache((ctx) => {

	// TODO: line-head

	const headPos = ctx.pos;

	// query
	let q = '';
	while (true) {
		if (ctx.match(searchRightMatcher).ok) break;
		if (ctx.regex(/^(\r\n|[\r\n])/) != null || ctx.eof()) break;

		q += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (q.length === 0) {
		return ctx.fail();
	}

	// right part
	if (!ctx.parser(searchRightMatcher).ok) {
		return ctx.fail();
	}

	const content = ctx.input.substring(headPos, ctx.pos);

	return ctx.ok(SEARCH(q, content));
});
