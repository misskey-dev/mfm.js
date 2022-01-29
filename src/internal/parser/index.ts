import { MfmNode, MfmPlainNode } from '../../node';
import { MatcherContext } from './services/matcher';
import { pushNode } from './services/nodeTree';
import { fullSyntaxMatcher, plainSyntaxMatcher } from './services/syntaxMatcher';

export type FullParserOpts = Partial<{
	fnNameList: string[];
	nestLimit: number;
}>;

export function fullParser(input: string, opts: FullParserOpts): MfmNode[] {
	const result: MfmNode[] = [];

	const ctx = new MatcherContext(input, opts);
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.consume(fullSyntaxMatcher);
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
		matched = ctx.consume(plainSyntaxMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}
