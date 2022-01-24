import { LINK } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';
import { urlAltMatcher, urlMatcher } from './url';

export function linkMatcher(ctx: MatcherContext) {
	let matched;

	// "["
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.openBracket) {
		return ctx.fail();
	}
	ctx.pos++;

	// TODO: link label

	// "]("
	if (!ctx.input.startsWith('](', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// url
	let url = null;
	matched = ctx.tryConsume(urlAltMatcher);
	if (matched.ok) {
		url = matched.result;
	}
	if (url == null) {
		matched = ctx.tryConsume(urlMatcher);
		if (matched.ok) {
			url = matched.result;
		}
	}
	if (url == null) {
		return ctx.fail();
	}

	// ")"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.closeParen) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(LINK(false, url.props.url, []));
}

export function silentLinkMatcher(ctx: MatcherContext) {
	// "?"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.question) {
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
}
