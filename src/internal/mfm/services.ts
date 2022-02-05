import { Parser, ParserResult } from '../services/parser';

export function syntax<T extends Parser<ParserResult<T>>>(name: string, parser: T): Parser<ParserResult<T>> {
	return function syntaxParser(ctx) {
		// select cache storage
		let cacheStorage;
		if (ctx.inLink) {
			cacheStorage = ctx.cacheStorage[1]; // for link label
		} else {
			cacheStorage = ctx.cacheStorage[0]; // for general
		}

		// select cache table
		let cacheTable = cacheStorage.get(parser);
		if (cacheTable == null) {
			cacheTable = new Map();
			cacheStorage.set(parser, cacheTable);
		}

		if (ctx.debug) {
			let records = '';
			for (const [pos] of cacheTable.entries()) {
				records += `${pos} `;
			}
			records = records.trim();
			ctx.debugLog(`[check] syntax=${name} pos=${ctx.pos} inLink=${ctx.inLink} records=[${records}]`);
		}

		// get cache
		const cache = cacheTable.get(ctx.pos);
		if (cache != null) {
			ctx.debugLog('[hit]');
			ctx.pos = cache.pos;
			return ctx.ok(cache.result);
		} else {
			ctx.debugLog('[miss]');
		}

		// // push stack
		// ctx.stack.unshift(syntaxParser);

		const cachePos = ctx.pos;
		const match = parser(ctx);

		// // pop stack
		// ctx.stack.shift();

		// set cache
		if (match.ok) {
			cacheTable.set(cachePos, {
				pos: ctx.pos, // next pos
				result: match.result,
			});
			if (ctx.debug) {
				let records = '';
				for (const [pos] of cacheTable.entries()) {
					records += `${pos} `;
				}
				records = records.trim();
				ctx.debugLog(`[set] syntax=${name} pos=${cachePos} next=${ctx.pos} inLink=${ctx.inLink} records=[${records}]`);
			}
		}

		return match;
	};
}
