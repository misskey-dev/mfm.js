import { MfmInline, MfmSmall, SMALL } from '../../../node';
import { SyntaxMatcher } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { SyntaxId } from '../services/syntax';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';

export const smallTagMatcher = new SyntaxMatcher<MfmSmall>(SyntaxId.Small, ctx => {
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

		matched = ctx.consume(inlineSyntaxMatcher);
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
