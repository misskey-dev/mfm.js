import { MfmInline, MfmStrike, STRIKE } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';
import { inlineMatcher } from '../services/syntaxMatcher';

export const strikeTagMatcher = defineCachedMatcher<MfmStrike>('strikeTag', ctx => {
	let matched;

	// "<s>"
	if (!ctx.matchStr('<s>')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</s>')) break;
		if (ctx.matchRegex(/^(\r\n|[\r\n])/) != null) break;

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</s>"
	if (!ctx.matchStr('</s>')) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(STRIKE(children));
});

export const strikeTildeMatcher = defineCachedMatcher<MfmStrike>('strikeTilde', ctx => {
	let matched;

	// "~~"
	if (!ctx.matchStr('~~')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchCharCode(CharCode.tilde)) break;
		if (ctx.matchRegex(/^(\r\n|[\r\n])/) != null) break;

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "~~"
	if (!ctx.matchStr('~~')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(STRIKE(children));
});
