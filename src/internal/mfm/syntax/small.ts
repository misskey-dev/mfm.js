import { MfmInline, MfmSmall, SMALL } from '../../../node';
import { defineCachedMatcher } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineMatcher } from '../parser';

export const smallTagMatcher = defineCachedMatcher<MfmSmall>('small', ctx => {
	let matched;

	// "<small>"
	if (!ctx.matchStr('<small>')) {
		return ctx.fail();
	}
	ctx.pos += 7;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</small>')) break;

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</small>"
	if (!ctx.matchStr('</small>')) {
		return ctx.fail();
	}
	ctx.pos += 8;

	return ctx.ok(SMALL(children));
});
