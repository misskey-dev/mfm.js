import { MfmInline, MfmSmall, SMALL } from '../../../node';
import { Parser, syntax } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser } from '../parser';

export const smallTagParser: Parser<MfmSmall> = syntax((ctx) => {
	let matched;

	// "<small>"
	if (!ctx.str('<small>').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</small>')) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</small>"
	if (!ctx.str('</small>').ok) {
		return ctx.fail();
	}

	return ctx.ok(SMALL(children));
});
