import { MATH_INLINE, MfmMathInline } from '../../../node';
import { Parser } from '../../services/parser';
import { syntax } from '../parser';

export const mathInlineParser: Parser<MfmMathInline> = syntax((ctx) => {
	// "\("
	if (!ctx.str('\\(').ok) {
		return ctx.fail();
	}

	// math
	let math = '';
	while (true) {
		if (ctx.matchStr('\\)')) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;
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
