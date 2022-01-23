import { FN, MfmInline } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';
import { spacingMatcher } from '../services/utilMatchers';

function argMatcher(ctx: MatcherContext) {
	let matched;

	// select 1: key + value
	matched = /^([a-z0-9_]+)=([a-z0-9_.]+)/i.exec(ctx.input.substr(ctx.pos));
	if (matched != null) {
		ctx.pos += matched[0].length;
		const k = matched[1];
		const v = matched[2];
		return ctx.ok({
			k: k,
			v: v
		});
	}

	// select 2: key
	matched = /^([a-z0-9_]+)/i.exec(ctx.input.substr(ctx.pos));
	if (matched != null) {
		ctx.pos += matched[0].length;
		const k = matched[1];
		return ctx.ok<{ k: string, v: string | true }>({
			k: k,
			v: true
		});
	}

	return ctx.fail();
}

function argsMatcher(ctx: MatcherContext) {
	let matched;
	const args: Record<string, string | true> = {};

	// "."
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.dot) {
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
		let fallback = ctx.pos;
		// ","
		if (ctx.input.charCodeAt(ctx.pos) != CharCode.comma) {
			break;
		}
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

export function fnMatcher(ctx: MatcherContext) {
	let matched;

	// "$["
	if (!ctx.input.startsWith('$[', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// name
	matched = /^[a-z0-9_]+/i.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	const name = matched[0];
	ctx.pos += name.length;

	// args
	matched = ctx.tryConsume(argsMatcher);
	const params = matched.ok ? matched.result : {};

	// spacing
	if (!ctx.consume(spacingMatcher).ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.charCodeAt(ctx.pos) == CharCode.closeBracket) {
			break;
		}

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "]"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.closeBracket) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(FN(name, params, children));
}
