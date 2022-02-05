import { MfmNode, MfmPlainNode } from '../../node';
import { ParserOpts, ParserContext } from '../services/parser';
import { pushNode } from '../services/nodeTree';
import { fullParser, plainParser } from './parser';

export function fullMfmParser(input: string, opts: ParserOpts): MfmNode[] {
	const result: MfmNode[] = [];

	const ctx = new ParserContext(input, opts);
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.parser(fullParser);
		if (!matched.ok) break;
		if (matched.result != null) {
			pushNode(matched.result, result);
		}
	}

	return result;
}

export function plainMfmParser(input: string): MfmPlainNode[] {
	const result: MfmPlainNode[] = [];

	const ctx = new ParserContext(input, {});
	//ctx.debug = true;
	let matched;
	while (true) {
		matched = ctx.parser(plainParser);
		if (!matched.ok) break;
		pushNode(matched.result, result);
	}

	return result;
}
