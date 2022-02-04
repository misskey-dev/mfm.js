import { FN, MfmFn, MfmInline } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser } from '../parser';

export const bigMatcher: Parser<MfmFn> = cache((ctx) => {
	// "***"
	if (!ctx.str('***').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.match(() => ctx.str('***'))) break;

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
