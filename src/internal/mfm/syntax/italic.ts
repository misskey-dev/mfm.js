import { ITALIC, MfmInline, MfmItalic } from '../../../node';
import { Parser } from '../../services/parser';
import { CharCode } from '../../services/character';
import { inlineParser } from '../parser';
import { isAllowedAsBackChar, pushNode, syntax } from '../services';

export const italicAstaParser: Parser<MfmItalic> = syntax('italicAsta', (ctx) => {
	let matched;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "*"
	if (!ctx.char(CharCode.asterisk).ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchChar(CharCode.asterisk)) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "*"
	if (!ctx.char(CharCode.asterisk).ok) {
		return ctx.fail();
	}

	return ctx.ok(ITALIC(children));
});

export const italicUnderParser: Parser<MfmItalic> = syntax('italicUnder', (ctx) => {
	// let matched;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "_"
	if (!ctx.char(CharCode.underscore).ok) {
		return ctx.fail();
	}

	// children

	// TODO
	// /^[a-z0-9]/i
	// spacing

	// "_"
	if (!ctx.char(CharCode.underscore).ok) {
		return ctx.fail();
	}

	return ctx.ok(ITALIC([]));
});

export const italicTagParser: Parser<MfmItalic> = syntax('italicTag', (ctx) => {
	let matched;

	// "<i>"
	if (!ctx.str('<i>').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</i>')) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</i>"
	if (!ctx.str('</i>').ok) {
		return ctx.fail();
	}

	return ctx.ok(ITALIC(children));
});
