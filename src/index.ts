import peg from 'pegjs';
import { MfmNode } from './util';
const parser: peg.Parser = require('./parser');

export function parse(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'fullParser' });
	return nodes;
}

export function parsePlain(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'plainParser' });
	return nodes;
}
