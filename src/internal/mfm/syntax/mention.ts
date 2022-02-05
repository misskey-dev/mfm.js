import { MENTION, MfmMention } from '../../../node';
import { Parser } from '../../services/parser';
import { CharCode } from '../../services/character';
import { isAllowedAsBackChar, syntax } from '../services';

const hostParser: Parser<string> = (ctx) => {
	// "@"
	if (!ctx.char(CharCode.at).ok) {
		return ctx.fail();
	}

	// name
	const matched = /^[a-z0-9_.-]+/.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	let name = matched[0];

	// (name) first character must not be "-" or "."
	const firstCode = name.charCodeAt(0);
	if (firstCode === CharCode.minus || firstCode === CharCode.dot) {
		return ctx.fail();
	}

	// (name) last character must not be "-" or "."
	let length = name.length;
	while (length > 0) {
		const lastCode = name.charCodeAt(length - 1);
		if (lastCode !== CharCode.minus && lastCode !== CharCode.dot) break;
		length--;
	}
	if (length === 0) {
		return ctx.fail();
	}
	if (length !== name.length) {
		name = name.substr(0, length);
	}
	ctx.pos += name.length;

	return ctx.ok(name);
};

export const mentionParser: Parser<MfmMention> = syntax('mention', (ctx) => {
	let matched;
	const headPos = ctx.pos;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "@"
	if (!ctx.char(CharCode.at).ok) {
		return ctx.fail();
	}

	// name
	matched = /^[a-z0-9_-]+/.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	let name = matched[0];
	// (name) first character must not be "-"
	if (name.charCodeAt(0) === CharCode.minus) {
		return ctx.fail();
	}
	// (name) last character must not be "-"
	let length = name.length;
	while (length > 0 && name.charCodeAt(length - 1) === CharCode.minus) {
		length--;
	}
	if (length === 0) {
		return ctx.fail();
	}
	if (length !== name.length) {
		name = name.substr(0, length);
	}
	ctx.pos += name.length;

	// host
	matched = ctx.parser(hostParser);
	const host = matched.ok ? matched.result : null;

	const acct = ctx.input.substring(headPos, ctx.pos);

	return ctx.ok(MENTION(name, host, acct));
});
