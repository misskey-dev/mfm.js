import { ITALIC, MfmInline, MfmItalic } from '../../../node';
import { SyntaxMatcher } from '../services/matcher';
import { isAllowedAsBackChar } from '../services/matchingUtil';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';
import { SyntaxId } from '../services/syntax';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';

export const italicAstaMatcher = new SyntaxMatcher<MfmItalic>(SyntaxId.ItalicAsta, ctx => {
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
});

export const italicUnderMatcher = new SyntaxMatcher<MfmItalic>(SyntaxId.ItalicUnder, ctx => {
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
});

export const italicTagMatcher = new SyntaxMatcher<MfmItalic>(SyntaxId.ItalicTag, ctx => {
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
});
