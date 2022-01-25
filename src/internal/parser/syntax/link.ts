import { LINK } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';
import { urlAltMatcher, urlMatcher } from './url';

export function linkMatcher(ctx: MatcherContext) {
	let matched;

	// "["
	if (!ctx.matchCharCode(CharCode.openBracket)) {
		return ctx.fail();
	}
	ctx.pos++;

	// TODO: link label

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

	return ctx.ok(LINK(false, url.props.url, []));
}

export function silentLinkMatcher(ctx: MatcherContext) {
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
}
