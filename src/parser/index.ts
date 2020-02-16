import peg from 'pegjs';
const coreParser: peg.Parser = require('./core-parser');

export interface Tree {
	type: string;
	props: Record<string, string>;
	children: Tree[];
};

export function parse(input: string) {
	let trees: Tree[];
	trees = coreParser.parse(input);
	return trees;
}
