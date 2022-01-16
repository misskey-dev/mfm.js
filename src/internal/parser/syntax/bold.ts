import { BOLD, MfmInline } from '../../../node';
import { MatcherContext } from '../matcher';
import { pushNode } from '../util';

export function boldMatcher(ctx: MatcherContext) {
	let matched;

	if (ctx.input.substr(ctx.pos, 2) != '**') {
		return ctx.fail();
	}
	ctx.pos += 2;

	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.substr(ctx.pos, 2) == '**') {
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

	if (ctx.input.substr(ctx.pos, 2) != '**') {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD(children));
}

export function boldTagMatcher(ctx: MatcherContext) {
	let matched;

	if (ctx.input.substr(ctx.pos, 3) != '<b>') {
		return ctx.fail();
	}
	ctx.pos += 3;

	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.substr(ctx.pos, 4) == '</b>') {
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

	if (ctx.input.substr(ctx.pos, 4) != '</b>') {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(BOLD(children));
}
