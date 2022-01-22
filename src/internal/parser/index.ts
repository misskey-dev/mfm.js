import { MfmNode, MfmPlainNode } from '../../node';
import { MatcherContext } from './services/matcher';
import { pushNode } from './services/nodeTree';
import { fullMatcher, plainMatcher } from './services/syntaxMatcher';

export type FullParserOpts = Partial<{
	fnNameList: string[];
	nestLimit: number;
}>;

export function fullParser(input: string, opts: FullParserOpts) {
	const ctx = new MatcherContext(input, opts);
	const result: MfmNode[] = [];
	let matched;

	while (true) {
		matched = ctx.consume(fullMatcher);
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
		matched = ctx.consume(plainMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}
