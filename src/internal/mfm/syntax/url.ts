import { MfmUrl, N_URL } from '../../../node';
import { cache, Parser } from '../../services/parser';
import { CharCode } from '../../services/character';

// TODO: urlParser 括弧のペア

const schemes: string[] = [
	'https',
	'http',
];

export const urlParser: Parser<MfmUrl> = cache((ctx) => {
	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.str(sch + ':').ok) {
			found = true;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	// "//"
	if (!ctx.str('//').ok) {
		return ctx.fail();
	}

	// path
	const matched = /^[.,a-z0-9_/:%#@$&?!~=+-]+/i.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	let path = matched[0];

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

export const urlAltParser: Parser<MfmUrl> = cache((ctx) => {
	// "<"
	if (!ctx.char(CharCode.lessThan).ok) {
		return ctx.fail();
	}

	const urlHead = ctx.pos;

	// scheme
	let found = false;
	for (const sch of schemes) {
		if (ctx.str(sch + ':').ok) {
			found = true;
			break;
		}
	}
	if (!found) {
		return ctx.fail();
	}

	let c = '';
	while (true) {
		// ">" | spacing
		if (ctx.match(() => ctx.regex(/^[ \u3000\t>]/))) break;
		// LF
		if (ctx.match(() => ctx.regex(/^(\r\n|[\r\n])/))) break;
		// .
		const match = ctx.anyChar();
		if (!match.ok) break;
		c += match.result;
	}
	if (c.length === 0) {
		return ctx.fail();
	}

	const urlTail = ctx.pos;

	// ">"
	if (!ctx.char(CharCode.greaterThan).ok) {
		return ctx.fail();
	}

	const value = ctx.input.substring(urlHead, urlTail);

	return ctx.ok(N_URL(value, true));
});
