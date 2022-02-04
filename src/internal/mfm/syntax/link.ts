import { LINK, MfmInline, MfmLink } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { CharCode } from '../../services/character';
import { inlineParser } from '../parser';
import { urlAltMatcher, urlMatcher } from './url';

export const linkMatcher: Parser<MfmLink> = cache((ctx) => {
	let matched;

	// "["
	if (!ctx.char(CharCode.openBracket)) {
		return ctx.fail();
	}
	ctx.pos++;

	// link label
	const label: MfmInline[] = [];
	while (true) {
		if (ctx.char(CharCode.closeBracket)) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, label);
	}
	if (label.length < 1) {
		return ctx.fail();
	}

	// "]("
	if (!ctx.str('](')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// url
	matched = ctx.choice([
		urlAltMatcher,
		urlMatcher,
	]);
	if (!matched.ok) {
		return ctx.fail();
	}
	const url = matched.result;

	// ")"
	if (!ctx.char(CharCode.closeParen)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(LINK(false, url.props.url, label));
});

export const silentLinkMatcher: Parser<MfmLink> = cache((ctx) => {
	// "?"
	if (!ctx.char(CharCode.question)) {
		return ctx.fail();
	}
	ctx.pos++;

	const matched = ctx.parser(linkMatcher);
	if (!matched.ok) {
		return ctx.fail();
	}

	const link = matched.result;
	link.props.silent = true;

	return ctx.ok(link);
});
