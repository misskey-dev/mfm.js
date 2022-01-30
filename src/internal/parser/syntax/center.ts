import { CENTER, MfmCenter, MfmInline } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineMatcher } from '../services/syntaxMatcher';

export const centerTagMatcher = defineCachedMatcher<MfmCenter>('center', ctx => {
	let matched;

	// line-head
	if (ctx.pos != 0) {
		// TODO: check column 0
	}

	// "<center>"
	if (!ctx.matchStr('<center>')) {
		return ctx.fail();
	}
	ctx.pos += 8;

	// optional LF
	matched = ctx.matchRegex(/^\r\n|[\r\n]/);
	if (matched != null) {
		ctx.pos += matched[0].length;
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</center>')) break;

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// optional LF
	matched = ctx.matchRegex(/^\r\n|[\r\n]/);
	if (matched != null) {
		ctx.pos += matched[0].length;
	}

	// "</center>"
	if (!ctx.matchStr('</center>')) {
		return ctx.fail();
	}
	ctx.pos += 9;

	// TODO: check line-end

	return ctx.ok(CENTER(children));
});
