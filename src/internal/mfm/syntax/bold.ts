import { BOLD, MfmBold, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineMatcher } from '../parser';

export const boldAstaMatcher: Parser<MfmBold> = (ctx) => {
	// "**"
	if (!ctx.str('**').ok) {
		return ctx.fail();
	}

	// children
	const match = ctx.iteration(1, () => {
		if (ctx.match(() => ctx.str('**'))) {
			return ctx.fail();
		}
		return ctx.parser(inlineMatcher);
	});
	if (!match.ok) {
		return ctx.fail();
	}
	const children: MfmInline[] = [];
	match.result.forEach(i => pushNode(i, children));

	// "**"
	if (!ctx.str('**').ok) {
		return ctx.fail();
	}

	return ctx.ok(BOLD(children));
};
