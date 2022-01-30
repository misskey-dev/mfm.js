import { MATH_INLINE, MfmMathInline } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';

export const mathInlineMatcher = defineCachedMatcher<MfmMathInline>('mathInline', ctx => {
	// TODO

	return ctx.ok(MATH_INLINE(''));
});
