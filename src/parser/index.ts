import { MfmNode } from './mfm-node';
import peg from 'pegjs';
const coreParser: peg.Parser = require('./core-parser');

export function parse(input: string): MfmNode[] {
	let nodes: MfmNode[];
	nodes = coreParser.parse(input, { startRule: 'fullParser' });
	return nodes;
}

export function parsePlain(input: string): MfmNode[] {
	let nodes: MfmNode[];
	nodes = coreParser.parse(input, { startRule: 'plainParser' });
	return nodes;
}
