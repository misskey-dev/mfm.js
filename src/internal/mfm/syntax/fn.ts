import { FN, MfmFn, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { CharCode } from '../../services/character';
import { inlineMatcher } from '../parser';

const argsMatcher: Parser<Record<string, string | true>> = (ctx) => {
	let matched;
	const args: Record<string, string | true> = {};

	const argMatcher: Parser<{ k: string, v: string | true }> = (ctx) => {
		return ctx.choice([
	
			// select 1: key + value
			() => {
				const matched = ctx.regex(/^([a-z0-9_]+)=([a-z0-9_.]+)/i);
				if (!matched.ok) {
					return ctx.fail();
				}
				const k = matched.result[1];
				const v = matched.result[2];
				return ctx.ok({
					k: k,
					v: v,
				});
			},
	
			// select 2: key
			() => {
				const matched = ctx.regex(/^([a-z0-9_]+)/i);
				if (!matched.ok) {
					return ctx.fail();
				}
				const k = matched.result[1];
				return ctx.ok<{ k: string, v: string | true }>({
					k: k,
					v: true,
				});
			}
	
		]);
	};

	// "."
	if (!ctx.char(CharCode.dot).ok) {
		return ctx.fail();
	}

	// head
	matched = ctx.parser(argMatcher);
	if (!matched.ok) {
		return ctx.fail();
	}
	args[matched.result.k] = matched.result.v;

	// tails
	while (true) {
		matched = ctx.sequence([
			// ","
			() => ctx.char(CharCode.comma),
			// arg
			argMatcher,
		]);
		if (!matched.ok) break;

		const arg = matched.result[1];
		args[arg.k] = arg.v;
	}

	return ctx.ok(args);
};

export const fnMatcher: Parser<MfmFn> = (ctx) => {
	let matched;

	// "$["
	if (!ctx.str('$[').ok) {
		return ctx.fail();
	}

	// name
	matched = ctx.regex(/^[a-z0-9_]+/i);
	if (!matched.ok) {
		return ctx.fail();
	}
	const name = matched.result[0];

	// (name) compare fn name
	if (ctx.fnNameList != null && !ctx.fnNameList.includes(name)) {
		return ctx.fail();
	}

	// args (option)
	matched = ctx.parser(argsMatcher);
	const params = matched.ok ? matched.result : {};

	// spacing
	if (!ctx.regex(/^[ \u3000\t\u00a0]/).ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.match(() => ctx.char(CharCode.closeBracket))) break;

		matched = ctx.parser(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "]"
	if (!ctx.char(CharCode.closeBracket).ok) {
		return ctx.fail();
	}

	return ctx.ok(FN(name, params, children));
};
