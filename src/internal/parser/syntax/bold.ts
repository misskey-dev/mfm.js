import { BOLD } from '../../../node';
import { MatcherContext, MatcherResult } from '../matcher';

export function boldMatcher(ctx: MatcherContext): MatcherResult {
	let matched;

	if (ctx.input.substr(ctx.pos, 2) != '**') {
		return ctx.fail();
	}
	ctx.pos += 2;

	while (true) {
		if (ctx.input.substr(ctx.pos, 2) == '**') {
			break;
		}

		matched = ctx.state.inlineSyntaxMatcher(ctx);
		if (!matched.ok) {
			return ctx.fail();
		}
	}

	if (ctx.input.substr(ctx.pos, 2) != '**') {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD([]));
}
