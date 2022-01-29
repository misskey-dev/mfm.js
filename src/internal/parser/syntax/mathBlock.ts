import { MATH_BLOCK, MfmMathBlock } from '../../../node';
import { SyntaxMatcher } from '../services/matcher';
import { SyntaxId } from '../services/syntax';

export const mathBlockMatcher = new SyntaxMatcher<MfmMathBlock>(SyntaxId.MathBlock, ctx => {
	// TODO

	return ctx.ok(MATH_BLOCK(''));
});
