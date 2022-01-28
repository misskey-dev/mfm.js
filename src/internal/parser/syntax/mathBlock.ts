import { MATH_BLOCK, MfmMathBlock } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';

export function mathBlockMatcher(ctx: MatcherContext): Match<MfmMathBlock> {
	// TODO

	return ctx.ok(MATH_BLOCK(''));
}
