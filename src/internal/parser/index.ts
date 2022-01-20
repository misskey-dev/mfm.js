import { MatcherContext, MatcherContextOpts } from './matcher';
import { pushNode } from '../util';
import { MfmNode, MfmPlainNode } from '../../node';

export function fullParser(input: string, opts: MatcherContextOpts) {
	const ctx = new MatcherContext(input, opts);
	const result: MfmNode[] = [];
	let matched;

	while (true) {
		matched = ctx.consume(ctx.fullMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}

export function plainParser(input: string) {
	const ctx = new MatcherContext(input, {});
	const result: MfmPlainNode[] = [];
	let matched;

	while (true) {
		matched = ctx.consume(ctx.plainMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}
