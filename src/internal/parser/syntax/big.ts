import { FN, MfmInline } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineMatcher } from '../services/syntaxMatcher';

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

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
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
