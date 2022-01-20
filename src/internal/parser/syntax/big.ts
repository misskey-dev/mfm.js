import { MatcherContext } from '../matcher';
import { pushNode } from '../../util';
import { FN, MfmInline } from '../../../node';

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
