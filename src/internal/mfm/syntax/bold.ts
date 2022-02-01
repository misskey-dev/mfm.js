import { BOLD, MfmBold, MfmInline, TEXT } from '../../../node';
import { defineCachedMatcher } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineMatcher } from '../parser';

export const boldAstaMatcher = defineCachedMatcher<MfmBold>('boldAsta', ctx => {
	let matched;

	// "**"
	if (!ctx.matchStr('**')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('**')) break;

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "**"
	if (!ctx.matchStr('**')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD(children));
});

export const boldUnderMatcher = defineCachedMatcher<MfmBold>('boldUnder', ctx => {
	let matched;

	// "__"
	if (!ctx.matchStr('__')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// text
	let text = '';
	while (true) {
		matched = ctx.matchRegex(/^[a-z0-9]/i);
		if (matched != null) {
			text += matched[0];
			ctx.pos++;
			continue;
		}
		matched = ctx.matchRegex(/^[ \u3000\t\u00a0]/);
		if (matched != null) {
			text += matched[0];
			continue;
		}
		break;
	}

	// "__"
	if (!ctx.matchStr('__')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD([TEXT(text)]));
});

export const boldTagMatcher = defineCachedMatcher<MfmBold>('boldTag', ctx => {
	let matched;

	// "<b>"
	if (!ctx.matchStr('<b>')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</b>')) break;

		matched = ctx.consume(inlineMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</b>"
	if (!ctx.matchStr('</b>')) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(BOLD(children));
});
