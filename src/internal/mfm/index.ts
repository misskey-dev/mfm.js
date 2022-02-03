import { MfmNode, MfmPlainNode } from '../../node';
import { ContextOpts, ParserContext } from '../services/parser';
import { pushNode } from '../services/nodeTree';
import { fullMatcher, plainMatcher } from './parser';

export function fullParser(input: string, opts: ContextOpts): MfmNode[] {
	const result: MfmNode[] = [];

	const ctx = new ParserContext(input, opts);
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.parser(fullMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}

export function plainParser(input: string): MfmPlainNode[] {
	const result: MfmPlainNode[] = [];

	const ctx = new ParserContext(input, {});
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.parser(plainMatcher);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}
