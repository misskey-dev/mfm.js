import { BOLD, MfmInline, TEXT } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';
import { spacingMatcher } from '../services/utilMatchers';

export function boldAstaMatcher(ctx: MatcherContext) {
	let matched;

	// "**"
	if (!ctx.input.startsWith('**', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('**', ctx.pos)) {
			break;
		}

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "**"
	if (!ctx.input.startsWith('**', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD(children));
}

export function boldUnderMatcher(ctx: MatcherContext) {
	let matched;

	// "__"
	if (!ctx.input.startsWith('__', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// text
	let text = '';
	while (true) {
		matched = /^[a-z0-9]/i.exec(ctx.input.substr(ctx.pos));
		if (matched != null) {
			text += matched[0];
			ctx.pos++;
			continue;
		}
		matched = ctx.tryConsume(spacingMatcher);
		if (matched.ok) {
			text += matched.result;
			continue;
		}
		break;
	}

	// "__"
	if (!ctx.input.startsWith('__', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(BOLD([TEXT(text)]));
}

export function boldTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<b>"
	if (!ctx.input.startsWith('<b>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('</b>', ctx.pos)) {
			break;
		}

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</b>"
	if (!ctx.input.startsWith('</b>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(BOLD(children));
}
