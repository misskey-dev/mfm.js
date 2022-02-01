import { FN, MfmFn, MfmInline } from '../../../node';
import { defineCachedMatcher } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineMatcher } from '../parser';

export const bigMatcher = defineCachedMatcher<MfmFn>('big', ctx => {
	let matched;

	// "***"
	if (!ctx.matchStr('***')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('***')) break;

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "***"
	if (!ctx.matchStr('***')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	return ctx.ok(FN('tada', { }, children));
});
