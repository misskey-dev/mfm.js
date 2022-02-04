import { MfmUrl, N_URL } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { CharCode } from '../../services/character';

// TODO: urlMatcher 括弧のペア

const schemes: string[] = [
	'https',
	'http',
];

export const urlMatcher: Parser<MfmUrl> = cache((ctx) => {
	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.str(sch + ':')) {
			found = true;
			ctx.pos += sch.length + 1;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	// path
	const matched = ctx.regex(/^\/\/([.,a-z0-9_/:%#@$&?!~=+-]+)/i);
	if (matched == null) {
		return ctx.fail();
	}
	let path = matched[1];
	ctx.pos += 2;

	// (path) last character must not be "." or ","
	let length = path.length;
	while (length > 0) {
		const lastCode = path.charCodeAt(length - 1);
		if (lastCode !== CharCode.dot && lastCode !== CharCode.comma) break;
		length--;
	}
	if (length === 0) {
		return ctx.fail();
	}
	if (length !== path.length) {
		path = path.substr(0, length);
	}
	ctx.pos += path.length;

	// url
	const value = ctx.input.substring(urlHead, ctx.pos);

	return ctx.ok(N_URL(value));
});

export const urlAltMatcher: Parser<MfmUrl> = cache((ctx) => {
	// "<"
	if (!ctx.char(CharCode.lessThan)) {
		return ctx.fail();
	}
	ctx.pos++;

	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.str(sch + ':')) {
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
		if (ctx.char(CharCode.greaterThan)) break;
		if (ctx.regex(/^[ \u3000\t\u00a0]/) != null) break;
		if (ctx.regex(/^(\r\n|[\r\n])/) != null || ctx.eof()) break;

		c += ctx.input.charAt(ctx.pos);
		ctx.pos++;
	}
	if (c.length < 1) {
		return ctx.fail();
	}

	const urlTail = ctx.pos;

	// ">"
	if (!ctx.char(CharCode.greaterThan)) {
		return ctx.fail();
	}
	ctx.pos++;

	const value = ctx.input.substring(urlHead, urlTail);

	return ctx.ok(N_URL(value, true));
});
