import { FN, MfmFn, MfmInline } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';

function argMatcher(ctx: MatcherContext): Match<{ k: string, v: string | true }> {
	let matched;

	// select 1: key + value
	matched = ctx.matchRegex(/^([a-z0-9_]+)=([a-z0-9_.]+)/i);
	if (matched != null) {
		ctx.pos += matched[0].length;
		const k = matched[1];
		const v = matched[2];
		return ctx.ok({
			k: k,
			v: v,
		});
	}

	// select 2: key
	matched = ctx.matchRegex(/^([a-z0-9_]+)/i);
	if (matched != null) {
		ctx.pos += matched[0].length;
		const k = matched[1];
		return ctx.ok<{ k: string, v: string | true }>({
			k: k,
			v: true,
		});
	}

	return ctx.fail();
}

function argsMatcher(ctx: MatcherContext): Match<Record<string, string | true>> {
	let matched;
	const args: Record<string, string | true> = {};

	// "."
	if (!ctx.matchCharCode(CharCode.dot)) {
		return ctx.fail();
	}
	ctx.pos++;

	// arg list
	matched = ctx.consume(argMatcher);
	if (!matched.ok) {
		return ctx.fail();
	}
	args[matched.result.k] = matched.result.v;

	while (true) {
		const fallback = ctx.pos;
		// ","
		if (!ctx.matchCharCode(CharCode.comma)) break;
		ctx.pos++;

		// arg
		matched = ctx.consume(argMatcher);
		if (!matched.ok) {
			ctx.pos = fallback;
			break;
		}

		args[matched.result.k] = matched.result.v;
	}

	return ctx.ok(args);
}

export function fnMatcher(ctx: MatcherContext): Match<MfmFn> {
	let matched;

	// "$["
	if (!ctx.matchStr('$[')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// name
	matched = ctx.matchRegex(/^[a-z0-9_]+/i);
	if (matched == null) {
		return ctx.fail();
	}
	const name = matched[0];
	ctx.pos += name.length;

	// (name) compare fn name
	if (ctx.fnNameList != null && !ctx.fnNameList.includes(name)) {
		return ctx.fail();
	}

	// args
	matched = ctx.tryConsume(argsMatcher);
	const params = matched.ok ? matched.result : {};

	// spacing
	if (!ctx.matchRegex(/^[ \u3000\t\u00a0]/)) {
		return ctx.fail();
	}
	ctx.pos++;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchCharCode(CharCode.closeBracket)) break;

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "]"
	if (!ctx.matchCharCode(CharCode.closeBracket)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(FN(name, params, children));
}
