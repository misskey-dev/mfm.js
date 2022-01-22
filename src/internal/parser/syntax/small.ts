import { MfmInline, SMALL } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineMatcher } from '../services/syntaxMatcher';

export function smallTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<small>"
	if (!ctx.input.startsWith('<small>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 7;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('</small>', ctx.pos)) {
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

	// "</small>"
	if (!ctx.input.startsWith('</small>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 8;

	return ctx.ok(SMALL(children));
}
