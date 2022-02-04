import { MATH_INLINE, MfmMathInline } from '../../../node';
import { cache, Parser } from '../../services/parser';

export const mathInlineParser: Parser<MfmMathInline> = cache((ctx) => {
	// "\("
	if (!ctx.str('\\(').ok) {
		return ctx.fail();
	}

	// math
	let math = '';
	while (true) {
		if (ctx.match(() => ctx.str('\\)'))) break;
		// LF
		if (ctx.match(() => ctx.regex(/^(\r\n|[\r\n])/))) break;
		// .
		const match = ctx.anyChar();
		if (!match.ok) break;
		math += match.result;
	}
	if (math.length === 0) {
		return ctx.fail();
	}

	// "\)"
	if (!ctx.str('\\)').ok) {
		return ctx.fail();
	}

	return ctx.ok(MATH_INLINE(math));
});
