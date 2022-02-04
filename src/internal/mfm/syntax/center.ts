import { CENTER, MfmCenter, MfmInline } from '../../../node';
import { defineCachedMatcher } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser } from '../parser';

const centerTagRightMatcher = defineCachedMatcher<true>('centerTagRight', ctx => {
	// optional LF
	const matched = ctx.matchRegex(/^(\r\n|[\r\n])/);
	if (matched != null) {
		ctx.pos += matched[0].length;
	}

	// "</center>"
	if (!ctx.matchStr('</center>')) {
		return ctx.fail();
	}
	ctx.pos += 9;

	// TODO: check line-end

	return ctx.ok(true);
});

export const centerTagMatcher = defineCachedMatcher<MfmCenter>('centerTag', ctx => {
	let matched;

	// line-head
	if (ctx.pos !== 0) {
		// TODO: check column 0
	}

	// "<center>"
	if (!ctx.matchStr('<center>')) {
		return ctx.fail();
	}
	ctx.pos += 8;

	// optional LF
	matched = ctx.matchRegex(/^(\r\n|[\r\n])/);
	if (matched != null) {
		ctx.pos += matched[0].length;
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.match(centerTagRightMatcher).ok) break;

		matched = ctx.consume(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	if (!ctx.consume(centerTagRightMatcher).ok) {
		return ctx.fail();
	}

	return ctx.ok(CENTER(children));
});
