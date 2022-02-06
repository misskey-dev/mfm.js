import { ITALIC, MfmInline, MfmItalic, TEXT } from '../../../node';
import { Parser } from '../../services/parser';
import { CharCode } from '../../services/character';
import { inlineParser } from '../services/mfmParser';
import { syntax } from '../services/syntaxParser';
import { ensureAllowedBackChar, ensureAllowedNextChar } from '../services/utility';
import { pushNode } from '../services/nodeTree';

export const italicAstaParser: Parser<MfmItalic> = syntax('italicAsta', (ctx) => {
	// check a back char
	if (!ensureAllowedBackChar(ctx)) {
		return ctx.fail();
	}

	// "*"
	if (!ctx.char(CharCode.asterisk).ok) {
		return ctx.fail();
	}

	// children
	const match = ctx.regex(/^[a-z0-9 \u3000\t\u00a0]+/i);
	if (!match.ok) {
		return ctx.fail();
	}
	const children = [TEXT(match.result[0])];

	// "*"
	if (!ctx.char(CharCode.asterisk).ok) {
		return ctx.fail();
	}

	// check a next char
	if (!ensureAllowedNextChar(ctx)) {
		return ctx.fail();
	}

	return ctx.ok(ITALIC(children));
});

export const italicUnderParser: Parser<MfmItalic> = syntax('italicUnder', (ctx) => {
	// check a back char
	if (!ensureAllowedBackChar(ctx)) {
		return ctx.fail();
	}

	// "_"
	if (!ctx.char(CharCode.underscore).ok) {
		return ctx.fail();
	}

	// children
	const match = ctx.regex(/^[a-z0-9 \u3000\t\u00a0]+/i);
	if (!match.ok) {
		return ctx.fail();
	}
	const children = [TEXT(match.result[0])];

	// "_"
	if (!ctx.char(CharCode.underscore).ok) {
		return ctx.fail();
	}

	// check a next char
	if (!ensureAllowedNextChar(ctx)) {
		return ctx.fail();
	}

	return ctx.ok(ITALIC(children));
});

export const italicTagParser: Parser<MfmItalic> = syntax('italicTag', (ctx) => {
	// "<i>"
	if (!ctx.str('<i>').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</i>')) break;

		const match = ctx.parser(inlineParser);
		if (!match.ok) break;
		pushNode(match.result, children);
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
