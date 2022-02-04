import { BOLD, MfmBold, MfmInline, TEXT } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser } from '../parser';

export const boldAstaParser: Parser<MfmBold> = cache((ctx) => {
	// "**"
	if (!ctx.str('**').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.match(() => ctx.str('**'))) break;

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

export const boldUnderParser: Parser<MfmBold> = cache((ctx) => {
	let matched;

	// "__"
	if (!ctx.str('__').ok) {
		return ctx.fail();
	}

	// content
	matched = ctx.regex(/^[a-z0-9 \u3000\t\u00a0]+/i);
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

export const boldTagParser: Parser<MfmBold> = cache((ctx) => {
	// "<b>"
	if (!ctx.str('<b>').ok) {
		return ctx.fail();
	}

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.match(() => ctx.str('</b>'))) break;

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
