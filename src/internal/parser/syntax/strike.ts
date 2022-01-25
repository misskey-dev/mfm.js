import { MfmInline, STRIKE } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';

export function strikeTagMatcher(ctx: MatcherContext) {
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
		if (ctx.matchRegex(/^\r\n|[\r\n]/) != null) break;

		matched = ctx.consume(inlineSyntaxMatcher);
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
}

export function strikeTildeMatcher(ctx: MatcherContext) {
	let matched;

	// "~~"
	if (!ctx.matchStr('~~')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('~')) break;
		if (ctx.matchRegex(/^\r\n|[\r\n]/) != null) break;

		matched = ctx.consume(inlineSyntaxMatcher);
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
}
