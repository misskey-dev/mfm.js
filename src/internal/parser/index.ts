import { MfmNode, MfmPlainNode } from '../../node';
import { MatcherContext } from './services/matcher';
import { pushNode } from './services/nodeTree';
import { fullMatcher, plainMatcher } from './services/syntaxMatcher';

export type ParserOpts = Partial<{
	fnNameList: string[];
	nestLimit: number;
}>;

export function fullParser(input: string, opts: ParserOpts): MfmNode[] {
	const result: MfmNode[] = [];

	const ctx = new MatcherContext(input, opts);
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.consume(fullMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}

export function plainParser(input: string): MfmPlainNode[] {
	const result: MfmPlainNode[] = [];

	const ctx = new MatcherContext(input, {});
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.consume(plainMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}
