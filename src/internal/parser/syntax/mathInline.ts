import { MATH_INLINE, MfmMathInline } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';

export function mathInlineMatcher(ctx: MatcherContext): Match<MfmMathInline> {
	// TODO

	return ctx.ok(MATH_INLINE(''));
}
