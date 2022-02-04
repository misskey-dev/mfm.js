import { LINK, MfmInline, MfmLink } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { CharCode } from '../../services/character';
import { inlineParser } from '../parser';
import { urlAltMatcher, urlMatcher } from './url';

export const linkParser: Parser<MfmLink> = cache((ctx) => {
	let matched;

	// "?" (option)
	matched = ctx.char(CharCode.question);
	const silent = matched.ok;

	// "["
	if (!ctx.char(CharCode.openBracket).ok) {
		return ctx.fail();
	}

	// link label
	const label: MfmInline[] = [];
	while (true) {
		if (ctx.match(() => ctx.char(CharCode.closeBracket))) break;

		matched = ctx.parser(inlineParser);
		if (!matched.ok) break;
		pushNode(matched.result, label);
	}
	if (label.length < 1) {
		return ctx.fail();
	}

	// "]("
	if (!ctx.str('](').ok) {
		return ctx.fail();
	}

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
	if (!ctx.char(CharCode.closeParen).ok) {
		return ctx.fail();
	}

	return ctx.ok(LINK(silent, url.props.url, label));
});
