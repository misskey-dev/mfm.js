import { MfmInline, MfmSmall, SMALL } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser } from '../parser';

export const smallTagMatcher: Parser<MfmSmall> = cache((ctx) => {
	let matched;

	// "<small>"
	if (!ctx.str('<small>')) {
		return ctx.fail();
	}
	ctx.pos += 7;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.str('</small>')) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</small>"
	if (!ctx.str('</small>')) {
		return ctx.fail();
	}
	ctx.pos += 8;

	return ctx.ok(SMALL(children));
});
