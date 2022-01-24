import { N_URL } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';
import { LfMatcher, spacingMatcher } from '../services/utilMatchers';

// TODO: urlMatcher 括弧のペア

const schemes: string[] = [
	'https',
	'http',
];

export function urlMatcher(ctx: MatcherContext) {
	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.input.startsWith(sch + ':', ctx.pos)) {
			found = true;
			ctx.pos += sch.length + 1;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	const matched = /^\/\/[.,a-z0-9_/:%#@$&?!~=+-]+/i.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	const value = ctx.input.substring(urlHead, ctx.pos);

	return ctx.ok(N_URL(value));
}

export function urlAltMatcher(ctx: MatcherContext) {
	// "<"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.lessThan) {
		return ctx.fail();
	}
	ctx.pos++;

	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.input.startsWith(sch + ':', ctx.pos)) {
			found = true;
			ctx.pos += sch.length + 1;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	let c = '';
	while (true) {
		if (ctx.input.charCodeAt(ctx.pos) == CharCode.greaterThan) {
			break;
		}
		if (ctx.match(LfMatcher).ok) {
			break;
		}
		if (ctx.match(spacingMatcher).ok) {
			break;
		}
		if (ctx.eof()) {
			break;
		}
		c += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (c.length < 1) {
		return ctx.fail();
	}

	const urlTail = ctx.pos;

	// ">"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.greaterThan) {
		return ctx.fail();
	}
	ctx.pos++;

	const value = ctx.input.substring(urlHead, urlTail);

	return ctx.ok(N_URL(value, true));
}
