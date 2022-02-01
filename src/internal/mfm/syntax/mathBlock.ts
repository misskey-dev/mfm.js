import { MATH_BLOCK, MfmMathBlock } from '../../../node';
import { defineCachedMatcher } from '../../services/parser';

export const mathBlockMatcher = defineCachedMatcher<MfmMathBlock>('mathBlock', ctx => {
	// TODO

	return ctx.ok(MATH_BLOCK(''));
});
