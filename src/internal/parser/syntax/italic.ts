import { ITALIC, MfmInline } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';

export function italicAstaMatcher(ctx: MatcherContext) {
	let matched;

	// TODO: 前の文字の判定

	// "*"
	if (!ctx.matchCharCode(CharCode.asterisk)) {
		return ctx.fail();
	}
	ctx.pos++;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchCharCode(CharCode.asterisk)) {
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

	// "*"
	if (!ctx.matchCharCode(CharCode.asterisk)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(ITALIC(children));
}

export function italicUnderMatcher(ctx: MatcherContext) {
	let matched;

	// TODO: 前の文字の判定

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

export function italicTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<i>"
	if (!ctx.matchStr('<i>')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.matchStr('</i>')) {
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

	// "</i>"
	if (!ctx.matchStr('</i>')) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(ITALIC(children));
}
