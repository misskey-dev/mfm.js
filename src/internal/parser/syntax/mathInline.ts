import { MATH_INLINE, MfmMathInline } from '../../../node';
import { SyntaxMatcher } from '../services/matcher';
import { SyntaxId } from '../services/syntax';

export const mathInlineMatcher = new SyntaxMatcher<MfmMathInline>(SyntaxId.MathInline, ctx => {
	// TODO

	return ctx.ok(MATH_INLINE(''));
});
