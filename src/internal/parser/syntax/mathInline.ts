import { MATH_BLOCK } from '../../../node';
import { MatcherContext } from '../services/matcher';

export function mathInlineMatcher(ctx: MatcherContext) {
	// TODO

	return ctx.ok(MATH_BLOCK(''));
}
