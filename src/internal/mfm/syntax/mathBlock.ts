import { MATH_BLOCK, MfmMathBlock } from '../../../node';
import { } from '../../services/parser';

export const mathBlockMatcher: Parser<MfmMathBlock> = cache((ctx) => {
	// TODO

	return ctx.ok(MATH_BLOCK(''));
});
