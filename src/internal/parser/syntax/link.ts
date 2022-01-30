import { LINK, MfmInline, MfmLink } from '../../../node';
import { defineCachedMatcher } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { CharCode } from '../services/string';
import { inlineMatcher } from '../services/syntaxMatcher';
import { urlAltMatcher, urlMatcher } from './url';

export const linkMatcher = defineCachedMatcher<MfmLink>('link', ctx => {
	let matched;

	// "["
	if (!ctx.matchCharCode(CharCode.openBracket)) {
		return ctx.fail();
	}
	ctx.pos++;

	// link label
	const label: MfmInline[] = [];
	while (true) {
		if (ctx.matchCharCode(CharCode.closeBracket)) break;

		ctx.linkLabel = true;
		matched = ctx.consume(inlineMatcher);
		ctx.linkLabel = false;
		if (!matched.ok) break;
		pushNode(matched.result, label);
	}
	if (label.length < 1) {
		return ctx.fail();
	}

	// "]("
	if (!ctx.matchStr('](')) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// url
	matched = ctx.tryConsumeAny([
		urlAltMatcher,
		urlMatcher,
	]);
	if (!matched.ok) {
		return ctx.fail();
	}
	const url = matched.result;

	// ")"
	if (!ctx.matchCharCode(CharCode.closeParen)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(LINK(false, url.props.url, label));
});

export const silentLinkMatcher = defineCachedMatcher<MfmLink>('silentLink', ctx => {
	// "?"
	if (!ctx.matchCharCode(CharCode.question)) {
		return ctx.fail();
	}
	ctx.pos++;

	const matched = ctx.consume(linkMatcher);
	if (!matched.ok) {
		return ctx.fail();
	}

	const link = matched.result;
	link.props.silent = true;

	return ctx.ok(link);
});
