import { MatcherContext } from '../matcher';
import { pushNode } from '../../util';
import { ITALIC, MfmInline } from '../../../node';

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

		matched = ctx.consume(ctx.inlineMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
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
	if (ctx.input[ctx.pos] != '_') {
		return ctx.fail();
	}
	ctx.pos++;

	// children

	// TODO
	// /^[a-z0-9]/i
	// spacing

	// "_"
	if (ctx.input[ctx.pos] != '_') {
		return ctx.fail();
	}
	ctx.pos++;

	// TODO: 後ろの文字の判定

	return ctx.ok(ITALIC([]));
}

export function italicTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<i>"
	if (!ctx.input.startsWith('<i>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('</i>', ctx.pos)) {
			break;
		}

		matched = ctx.consume(ctx.inlineMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</i>"
	if (!ctx.input.startsWith('</i>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(ITALIC(children));
}
