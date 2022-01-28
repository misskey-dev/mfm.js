import { ITALIC, MfmInline, MfmItalic } from '../../../node';
import { Match, MatcherContext } from '../services/matcher';
import { isAllowedAsBackChar } from '../services/matchingUtil';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';

export function italicAstaMatcher(ctx: MatcherContext): Match<MfmItalic> {
	let matched;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "*"
	if (!ctx.matchCharCode(CharCode.asterisk)) {
		return ctx.fail();
	}
	ctx.pos++;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchCharCode(CharCode.asterisk)) break;

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "*"
	if (!ctx.matchCharCode(CharCode.asterisk)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(ITALIC(children));
}

export function italicUnderMatcher(ctx: MatcherContext): Match<MfmItalic> {
	// let matched;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "_"
	if (!ctx.matchCharCode(CharCode.underscore)) {
		return ctx.fail();
	}
	ctx.pos++;

	// children

	// TODO
	// /^[a-z0-9]/i
	// spacing

	// "_"
	if (!ctx.matchCharCode(CharCode.underscore)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(ITALIC([]));
}

export function italicTagMatcher(ctx: MatcherContext): Match<MfmItalic> {
	let matched;

	// "<i>"
	if (!ctx.matchStr('<i>')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</i>')) break;

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</i>"
	if (!ctx.matchStr('</i>')) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(ITALIC(children));
}
