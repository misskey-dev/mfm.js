import { MfmNode, MfmText, TEXT } from '../../node';
import { Parser, ParserContext, ParserResult, Result } from '../services/parser';

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

export function pushNode<T extends MfmNode>(node: T | string, nodes: (T | MfmText)[]): void {
	if (typeof node !== 'string') {
		nodes.push(node);
		return;
	}
	// if the last node is a text node, concatenate to it
	if (nodes.length > 0) {
		const lastNode = nodes[nodes.length - 1];
		if (lastNode.type === 'text') {
			(lastNode as MfmText).props.text += node;
			return;
		}
	}
	// generate a text node
	nodes.push(TEXT(node));
}

export function lineEndParser(ctx: ParserContext): Result<null> {
	const match = ctx.choice([
		() => ctx.regex(/^(\r\n|[\r\n])/),
		() => ctx.eof() ? ctx.ok(null) : ctx.fail(),
	]);

	if (!match.ok) {
		return ctx.fail();
	}

	return ctx.ok(null);
}

// 一つ前の文字が:
// 無い OR 改行 OR スペース OR ![a-z0-9]i
// の時にtrueを返します。
export function isAllowedAsBackChar(ctx: ParserContext): boolean {
	if (ctx.pos > 0) {
		ctx.pos--;
		if (
			!ctx.matchRegex(/^(\r\n|[\r\n])/) &&
			!ctx.matchRegex(/^[ \u3000\t\u00a0]/) &&
			ctx.matchRegex(/^[a-z0-9]/i)
		) {
			ctx.pos++;
			return false;
		}
		ctx.pos++;
	}
	return true;
}
