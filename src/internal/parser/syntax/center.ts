import { CENTER, MfmInline } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';
import { LfMatcher } from '../services/utilMatchers';

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

		matched = ctx.consume(inlineSyntaxMatcher);
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
