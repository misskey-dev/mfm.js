import { FN, MfmInline } from '../../../node';
import { MatcherContext, pushNode } from '../util';

export function bigMatcher(ctx: MatcherContext) {
	let matched;

	// "***"
	if (!ctx.input.startsWith('***', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('***', ctx.pos)) {
			break;
		}

		matched = ctx.consume(ctx.inlineMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.resultData, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "***"
	if (!ctx.input.startsWith('***', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 3;

	return ctx.ok(FN('tada', { }, children));
}
