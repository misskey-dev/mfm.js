import { BOLD, MfmInline } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineMatcher } from '../services/syntaxMatcher';

export function boldAstaMatcher(ctx: MatcherContext) {
	let matched;

	// "**"
	if (!ctx.input.startsWith('**', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('**', ctx.pos)) {
			break;
		}

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "**"
	if (!ctx.input.startsWith('**', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD(children));
}

export function boldUnderMatcher(ctx: MatcherContext) {
	let matched;

	// "__"
	if (!ctx.input.startsWith('__', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	// TODO

	// "__"
	if (!ctx.input.startsWith('__', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD([]));
}

export function boldTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<b>"
	if (!ctx.input.startsWith('<b>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('</b>', ctx.pos)) {
			break;
		}

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</b>"
	if (!ctx.input.startsWith('</b>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(BOLD(children));
}
