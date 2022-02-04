import { MATH_INLINE, MfmMathInline } from '../../../node';
import { cache, Parser } from '../../services/parser';

export const mathInlineMatcher: Parser<MfmMathInline> = cache((ctx) => {
	// "\("
	if (!ctx.str('\\(')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// math
	let math = '';
	while (true) {
		if (ctx.str('\\)')) break;
		if (ctx.regex(/^(\r\n|[\r\n])/) != null || ctx.eof()) break;

		math += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (math.length === 0) {
		return ctx.fail();
	}

	// "\)"
	if (!ctx.str('\\)')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(MATH_INLINE(math));
});
