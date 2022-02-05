import { FN, MfmFn, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { inlineParser } from '../parser';
import { pushNode, syntax } from '../services';

export const bigParser: Parser<MfmFn> = syntax('big', (ctx) => {
	// "***"
	if (!ctx.str('***').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('***')) break;

		const matched = ctx.parser(inlineParser);
		if (!matched.ok) break;

		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "***"
	if (!ctx.str('***').ok) {
		return ctx.fail();
	}

	return ctx.ok(FN('tada', { }, children));
});
