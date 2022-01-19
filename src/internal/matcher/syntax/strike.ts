import { MfmInline, STRIKE } from '../../../node';
import { MatcherContext, pushNode } from '../util';

export function strikeTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<s>"
	if (!ctx.input.startsWith('<s>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('</s>', ctx.pos)) {
			break;
		}

		if (/^\r\n|[\r\n]/.test(ctx.getText())) {
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

	// "</s>"
	if (!ctx.input.startsWith('</s>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(STRIKE(children));
}
