import { BOLD, MfmBold, MfmInline, TEXT } from '../../../node';
import { Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser, syntax } from '../parser';

export const boldAstaParser: Parser<MfmBold> = syntax((ctx) => {
	// "**"
	if (!ctx.str('**').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('**')) break;

		const match = ctx.parser(inlineParser);
		if (!match.ok) break;

		pushNode(match.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "**"
	if (!ctx.str('**').ok) {
		return ctx.fail();
	}

	return ctx.ok(BOLD(children));
});

export const boldUnderParser: Parser<MfmBold> = syntax((ctx) => {
	// "__"
	if (!ctx.str('__').ok) {
		return ctx.fail();
	}

	// content
	const matched = ctx.regex(/^[a-z0-9 \u3000\t\u00a0]+/i);
	if (!matched.ok) {
		return ctx.fail();
	}
	const text = matched.result[0];

	// "__"
	if (!ctx.str('__').ok) {
		return ctx.fail();
	}

	return ctx.ok(BOLD([TEXT(text)]));
});

export const boldTagParser: Parser<MfmBold> = syntax((ctx) => {
	// "<b>"
	if (!ctx.str('<b>').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</b>')) break;

		const match = ctx.parser(inlineParser);
		if (!match.ok) break;

		pushNode(match.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</b>"
	if (!ctx.str('</b>').ok) {
		return ctx.fail();
	}

	return ctx.ok(BOLD(children));
});
