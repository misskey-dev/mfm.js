import { MENTION } from '../../../node';
import { MatcherContext } from '../util';

function hostMatcher(ctx: MatcherContext) {

	// TODO
	const name = '';

	return ctx.ok(name);
}

export function mentionMatcher(ctx: MatcherContext) {
	let matched;

	const headPos = ctx.pos;

	// "@"
	if (ctx.input[ctx.pos] != '@') {
		return ctx.fail();
	}
	ctx.pos++;

	// name
	// TODO
	const name = '';

	// host
	let host: string | null = null;
	matched = ctx.consume(hostMatcher);
	if (matched.ok) {
		host = matched.resultData;
	}

	const acct = ctx.input.substring(headPos, ctx.pos);

	return ctx.ok(MENTION(name, host, acct));
}
