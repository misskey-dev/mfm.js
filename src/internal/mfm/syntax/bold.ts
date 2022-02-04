import { BOLD, MfmBold, MfmInline } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser } from '../parser';

export const boldAstaParser: Parser<MfmBold> = cache((ctx) => {
	// "**"
	if (!ctx.str('**').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.match(() => ctx.str('**'))) break;

		const match = ctx.parser(inlineParser);
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
});
