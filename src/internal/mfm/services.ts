import { Parser, ParserResult } from '../services/parser';

export function syntax<T extends Parser<ParserResult<T>>>(parser: T): Parser<ParserResult<T>> {
	return function syntaxParser(ctx) {
		ctx.pushStack(syntaxParser);

		// get cache table
		let cacheTable = ctx.cache.get(parser);
		if (cacheTable == null) {
			cacheTable = new Map();
			ctx.cache.set(parser, cacheTable);
		}

		// get cache
		const cache = cacheTable.get(ctx.pos);
		if (cache != null) {
			ctx.pos = cache.pos;
			return ctx.ok(cache.result);
		}

		const cachePos = ctx.pos;
		const match = parser(ctx);

		// set cache
		if (match.ok) {
			cacheTable.set(cachePos, {
				pos: ctx.pos, // next pos
				result: match.result,
			});
		}

		ctx.popStack();

		return match;
	};
}
