import peg from 'pegjs';
import { MfmNode } from './mfm-node';
const parser: peg.Parser = require('./parser');

export function parse(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'fullParser' });
	return nodes;
}

export function parsePlain(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'plainParser' });
	return nodes;
}
