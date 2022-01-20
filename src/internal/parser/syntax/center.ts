import { LfMatcher, MatcherContext } from '../matcher';
import { pushNode } from '../../util';
import { CENTER, MfmInline } from '../../../node';

export function centerTagMatcher(ctx: MatcherContext) {
	let matched;

	// line-head
	if (ctx.pos != 0) {
		// TODO: check column 0
	}

	// "<center>"
	if (!ctx.input.startsWith('<center>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 8;

	// optional LF
	matched = LfMatcher(ctx);
	if (matched.ok) {
		ctx.pos += matched.result.length;
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('</center>', ctx.pos)) {
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

	// optional LF
	matched = LfMatcher(ctx);
	if (matched.ok) {
		ctx.pos += matched.result.length;
	}

	// "</center>"
	if (!ctx.input.startsWith('</center>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 9;

	// TODO: check line-end

	return ctx.ok(CENTER(children));
}
