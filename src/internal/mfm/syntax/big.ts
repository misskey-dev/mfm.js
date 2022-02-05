import { FN, MfmFn, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser, syntax } from '../parser';

export const bigParser: Parser<MfmFn> = syntax((ctx) => {
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
