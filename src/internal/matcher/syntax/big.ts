import { FN, MfmInline } from '../../../node';
import { MatcherContext, pushNode } from '../util';

export function bigMatcher(ctx: MatcherContext) {
	let matched;

	// "***"
	if (ctx.input.substr(ctx.pos, 3) != '***') {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.substr(ctx.pos, 3) == '***') {
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

	// "***"
	if (ctx.input.substr(ctx.pos, 3) != '***') {
		return ctx.fail();
	}
	ctx.pos += 3;

	return ctx.ok(FN('tada', { }, children));
}
