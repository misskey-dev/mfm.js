import { MatcherContext } from '../matcher';
import { MENTION } from '../../../node';

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
	matched = ctx.tryConsume(hostMatcher);
	if (matched.ok) {
		host = matched.result;
	}

	const acct = ctx.input.substring(headPos, ctx.pos);

	return ctx.ok(MENTION(name, host, acct));
}
