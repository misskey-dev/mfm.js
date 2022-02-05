import { FN, MfmFn, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { CharCode } from '../../services/character';
import { inlineParser } from '../parser';
import { syntax } from '../services';

const argsParser: Parser<Record<string, string | true>> = (ctx) => {
	let match;
	const args: Record<string, string | true> = {};

	const argParser: Parser<{ k: string, v: string | true }> = (ctx) => {
		return ctx.choice([

			// key + value
			() => {
				const match = ctx.regex(/^([a-z0-9_]+)=([a-z0-9_.]+)/i);
				if (!match.ok) {
					return ctx.fail();
				}
				const k = match.result[1];
				const v = match.result[2];
				return ctx.ok({
					k: k,
					v: v,
				});
			},

			// key
			() => {
				const match = ctx.regex(/^([a-z0-9_]+)/i);
				if (!match.ok) {
					return ctx.fail();
				}
				const k = match.result[1];
				return ctx.ok<{ k: string, v: string | true }>({
					k: k,
					v: true,
				});
			},

		]);
	};

	// "."
	if (!ctx.char(CharCode.dot).ok) {
		return ctx.fail();
	}

	// head
	match = ctx.parser(argParser);
	if (!match.ok) {
		return ctx.fail();
	}
	args[match.result.k] = match.result.v;

	// tails
	while (true) {
		match = ctx.sequence([
			// ","
			() => ctx.char(CharCode.comma),
			// arg
			argParser,
		]);
		if (!match.ok) break;

		const arg = match.result[1];
		args[arg.k] = arg.v;
	}

	return ctx.ok(args);
};

export const fnParser: Parser<MfmFn> = syntax((ctx) => {
	let match;

	// "$["
	if (!ctx.str('$[').ok) {
		return ctx.fail();
	}

	// name
	match = ctx.regex(/^[a-z0-9_]+/i);
	if (!match.ok) {
		return ctx.fail();
	}
	const name = match.result[0];

	// (name) compare fn name
	if (ctx.fnNameList != null && !ctx.fnNameList.includes(name)) {
		return ctx.fail();
	}

	// args (option)
	match = ctx.parser(argsParser);
	const params = match.ok ? match.result : {};

	// spacing
	if (!ctx.regex(/^[ \u3000\t\u00a0]/).ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchChar(CharCode.closeBracket)) break;

		match = ctx.parser(inlineParser);
		if (!match.ok) break;
		pushNode(match.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "]"
	if (!ctx.char(CharCode.closeBracket).ok) {
		return ctx.fail();
	}

	return ctx.ok(FN(name, params, children));
});
