import { FN, MfmInline } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';

export function fnMatcher(ctx: MatcherContext) {
	let matched;

	// "$["
	if (!ctx.input.startsWith('$[', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// name
	matched = /^[a-z0-9_]+/i.exec(ctx.getText());
	if (matched == null) {
		return ctx.fail();
	}
	const name = matched[0];
	ctx.pos += name.length;

	// params
	// TODO
	const params = {};

	// spacing
	matched = /^[ \u3000\t\u00a0]/.exec(ctx.getText());
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.charCodeAt(ctx.pos) == CharCode.closeBracket) {
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

	// "]"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.closeBracket) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(FN(name, params, children));
}
