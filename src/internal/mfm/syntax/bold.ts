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
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.match(() => ctx.str('**'))) break;

		const match = ctx.parser(inlineMatcher);
		if (!match.ok) break;

		pushNode(match.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "**"
	if (!ctx.str('**').ok) {
		return ctx.fail();
	}

	return ctx.ok(BOLD(children));
};
