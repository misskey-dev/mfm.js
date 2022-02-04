import { ITALIC, MfmInline, MfmItalic } from '../../../node';
import { defineCachedMatcher } from '../../services/parser';
import { isAllowedAsBackChar } from '../../services/matchingUtil';
import { pushNode } from '../../services/nodeTree';
import { CharCode } from '../../services/character';
import { inlineParser } from '../parser';

export const italicAstaMatcher = defineCachedMatcher<MfmItalic>('italicAsta', ctx => {
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

		matched = ctx.consume(inlineParser);
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

export const italicUnderMatcher = defineCachedMatcher<MfmItalic>('italicUnder', ctx => {
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

export const italicTagMatcher = defineCachedMatcher<MfmItalic>('italicTag', ctx => {
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

		matched = ctx.consume(inlineParser);
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
