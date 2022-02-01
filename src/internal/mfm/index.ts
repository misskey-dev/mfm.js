import { MfmNode, MfmPlainNode } from '../../node';
import { ParserContext } from '../services/parser';
import { pushNode } from '../services/nodeTree';
import { fullMatcher, plainMatcher } from './parser';

export type ParserOpts = Partial<{
	fnNameList: string[];
	nestLimit: number;
}>;

export function fullParser(input: string, opts: ParserOpts): MfmNode[] {
	const result: MfmNode[] = [];

	const ctx = new ParserContext(input, opts);
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.consume(fullMatcher);
		if (!matched.ok) break;
		pushNode(matched.resultData, result);
	}

	return result;
}

export function plainParser(input: string): MfmPlainNode[] {
	const result: MfmPlainNode[] = [];

	const ctx = new ParserContext(input, {});
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.consume(plainMatcher);
		if (!matched.ok) break;
		pushNode(matched.resultData, result);
	}

	return result;
}
