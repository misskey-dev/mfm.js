import { MfmInline, MfmStrike, STRIKE } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { CharCode } from '../../services/character';
import { inlineParser } from '../parser';

// TODO: apply new api

export const strikeTagParser: Parser<MfmStrike> = cache((ctx) => {
	let matched;

	// "<s>"
	if (!ctx.str('<s>')) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.str('</s>')) break;
		if (ctx.regex(/^(\r\n|[\r\n])/) != null) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</s>"
	if (!ctx.str('</s>')) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(STRIKE(children));
});

export const strikeTildeParser: Parser<MfmStrike> = cache((ctx) => {
	let matched;

	// "~~"
	if (!ctx.str('~~')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.char(CharCode.tilde)) break;
		if (ctx.regex(/^(\r\n|[\r\n])/) != null) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "~~"
	if (!ctx.str('~~')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(STRIKE(children));
});
