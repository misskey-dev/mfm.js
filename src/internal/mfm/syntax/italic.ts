import { ITALIC, MfmInline, MfmItalic } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { isAllowedAsBackChar } from '../../services/matchingUtil';
import { pushNode } from '../../services/nodeTree';
import { CharCode } from '../../services/character';
import { inlineParser } from '../parser';

export const italicAstaMatcher: Parser<MfmItalic> = cache((ctx) => {
	let matched;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "*"
	if (!ctx.char(CharCode.asterisk)) {
		return ctx.fail();
	}
	ctx.pos++;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.char(CharCode.asterisk)) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "*"
	if (!ctx.char(CharCode.asterisk)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(ITALIC(children));
});

export const italicUnderMatcher: Parser<MfmItalic> = cache((ctx) => {
	// let matched;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "_"
	if (!ctx.char(CharCode.underscore)) {
		return ctx.fail();
	}
	ctx.pos++;

	// children

	// TODO
	// /^[a-z0-9]/i
	// spacing

	// "_"
	if (!ctx.char(CharCode.underscore)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(ITALIC([]));
});

export const italicTagMatcher: Parser<MfmItalic> = cache((ctx) => {
	let matched;

	// "<i>"
	if (!ctx.str('<i>')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.str('</i>')) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</i>"
	if (!ctx.str('</i>')) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(ITALIC(children));
});
