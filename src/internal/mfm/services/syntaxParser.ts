import { Parser, ParserResult } from '../../services/parser';

export function syntax<T extends Parser<ParserResult<T>>>(name: string, parser: T): Parser<ParserResult<T>> {
	return function syntaxParser(ctx) {
		// select cache source
		let cacheSource;
		if (ctx.inLink) {
			cacheSource = ctx.cacheSources[1]; // for link label
		} else {
			cacheSource = ctx.cacheSources[0]; // for general
		}

		// get syntax cache
		let syntaxCache = cacheSource.get(parser);
		if (syntaxCache == null) {
			syntaxCache = new Map();
			cacheSource.set(parser, syntaxCache);
		}

		let records = '';
		if (ctx.debug) {
			for (const [pos] of syntaxCache.entries()) {
				records += `${pos} `;
			}
			records = records.trim();
		}

		// get cache record
		const cacheRecord = syntaxCache.get(ctx.pos);
		if (cacheRecord != null) {
			if (cacheRecord.ok) {
				ctx.pos = cacheRecord.pos;
				return ctx.ok(cacheRecord.result);
			} else {
				return ctx.fail();
			}
		}

		// // push stack
		// ctx.stack.unshift(syntaxParser);

		const cachePos = ctx.pos;
		const match = parser(ctx);

		// // pop stack
		// ctx.stack.shift();

		// set cache record
		if (match.ok) {
			syntaxCache.set(cachePos, {
				ok: true,
				pos: ctx.pos, // next pos
				result: match.result,
			});
			if (ctx.debug) {
				let records = '';
				for (const [pos] of syntaxCache.entries()) {
					records += `${pos} `;
				}
				records = records.trim();
			}
		} else {
			syntaxCache.set(cachePos, {
				ok: false,
			});
		}

		return match;
	};
}
