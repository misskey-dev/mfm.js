import { N_URL } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { CharCode } from '../services/string';

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
		if (ctx.matchStr(sch + ':')) {
			found = true;
			ctx.pos += sch.length + 1;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	const matched = ctx.matchRegex(/^\/\/[.,a-z0-9_/:%#@$&?!~=+-]+/i);
	if (matched == null) {
		return ctx.fail();
	}
	ctx.pos += matched[0].length;

	const value = ctx.input.substring(urlHead, ctx.pos);

	return ctx.ok(N_URL(value));
}

export function urlAltMatcher(ctx: MatcherContext) {
	// "<"
	if (!ctx.matchCharCode(CharCode.lessThan)) {
		return ctx.fail();
	}
	ctx.pos++;

	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.matchStr(sch + ':')) {
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
		if (ctx.matchCharCode(CharCode.greaterThan)) break;
		if (ctx.matchRegex(/^\r\n|[\r\n]/) != null) break;
		if (ctx.matchRegex(/^[ \u3000\t\u00a0]/) != null) break;
		if (ctx.eof()) break;

		c += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (c.length < 1) {
		return ctx.fail();
	}

	const urlTail = ctx.pos;

	// ">"
	if (!ctx.matchCharCode(CharCode.greaterThan)) {
		return ctx.fail();
	}
	ctx.pos++;

	const value = ctx.input.substring(urlHead, urlTail);

	return ctx.ok(N_URL(value, true));
}
