import { ITALIC, MfmInline } from '../../../node';
import { MatcherContext, pushNode } from '../util';

export function italicAstaMatcher(ctx: MatcherContext) {
	let matched;

	// "*"
	if (ctx.input[ctx.pos] != '*') {
		return ctx.fail();
	}
	ctx.pos++;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input[ctx.pos] == '*') {
			break;
		}

		matched = ctx.inlineMatcher(ctx);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.resultData, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "*"
	if (ctx.input[ctx.pos] != '*') {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(ITALIC(children));
}

export function italicUnderMatcher(ctx: MatcherContext) {
	let matched;

	// TODO: 前の文字の判定

	// "_"
	if (ctx.input.substr(ctx.pos, 2) != '__') {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children

	// TODO
	// /^[a-z0-9]/i
	// spacing

	// "_"
	if (ctx.input.substr(ctx.pos, 2) != '__') {
		return ctx.fail();
	}
	ctx.pos += 2;

	// TODO: 後ろの文字の判定

	return ctx.ok(ITALIC([]));
}

export function italicTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<i>"
	if (ctx.input.substr(ctx.pos, 3) != '<i>') {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.substr(ctx.pos, 4) == '</i>') {
			break;
		}

		matched = ctx.inlineMatcher(ctx);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.resultData, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</i>"
	if (ctx.input.substr(ctx.pos, 4) != '</i>') {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(ITALIC(children));
}
