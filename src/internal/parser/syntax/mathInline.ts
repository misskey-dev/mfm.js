import { MATH_INLINE, MfmMathInline } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';

export const mathInlineMatcher = defineCachedMatcher<MfmMathInline>('mathInline', ctx => {
	// "\("
	if (!ctx.matchStr('\\(')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// math
	let math = '';
	while (true) {
		if (ctx.matchStr('\\)')) break;
		if (ctx.matchRegex(/^(\r\n|[\r\n])/) != null || ctx.eof()) break;

		math += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (math.length === 0) {
		return ctx.fail();
	}

	// "\)"
	if (!ctx.matchStr('\\)')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(MATH_INLINE(math));
});
