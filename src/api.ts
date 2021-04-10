import peg from 'pegjs';
import { MfmNode, MfmPlainNode } from './node';
import { stringifyNode, stringifyTree } from './util';

const parser: peg.Parser = require('./parser');

export function parse(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'fullParser' });
	return nodes;
}

export function parsePlain(input: string): MfmPlainNode[] {
	const nodes = parser.parse(input, { startRule: 'plainParser' });
	return nodes;
}

export function toString(tree: MfmNode[]): string
export function toString(node: MfmNode): string
export function toString(node: MfmNode | MfmNode[]): string {
	if (Array.isArray(node)) {
		return stringifyTree(node);
	}
	else {
		return stringifyNode(node);
	}
}

export function inspect(tree: MfmNode[], action: (node: MfmNode) => void): void {
	for (const node of tree) {
		action(node);
		if (node.children != null) {
			inspect(node.children, action);
		}
	}
}

export function extract(nodes: MfmNode[], predicate: (node: MfmNode) => boolean): MfmNode[] {
	const dest = [] as MfmNode[];

	inspect(nodes, (node) => {
		if (predicate(node)) {
			dest.push(node);
		}
	});

	return dest;
}
