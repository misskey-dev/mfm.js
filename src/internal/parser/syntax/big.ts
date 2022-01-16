import { FN, MfmInline } from '../../../node';
import { MatcherContext } from '../matcher';
import { pushNode } from '../util';

export function bigMatcher(ctx: MatcherContext) {
	let matched;

	if (ctx.input.substr(ctx.pos, 3) != '***') {
		return ctx.fail();
	}
	ctx.pos += 3;

	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.substr(ctx.pos, 3) == '***') {
			break;
		}

		matched = ctx.state.inlineMatcher(ctx);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.resultData, children);
	}

	if (ctx.input.substr(ctx.pos, 3) != '***') {
		return ctx.fail();
	}
	ctx.pos += 3;

	return ctx.ok(FN('tada', { }, children));
}
