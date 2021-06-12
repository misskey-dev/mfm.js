import peg from 'peggy';
import { MfmNode, MfmPlainNode } from './node';
import { stringifyNode, stringifyTree, inspectOne } from './internal/util';

const parser: peg.Parser = require('./internal/parser');

/**
 * Generates a MfmNode tree from the MFM string.
*/
export function parse(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'fullParser' });
	return nodes;
}

/**
 * Generates a MfmNode tree of plain from the MFM string.
*/
export function parsePlain(input: string): MfmPlainNode[] {
	const nodes = parser.parse(input, { startRule: 'plainParser' });
	return nodes;
}

/**
 * Generates a MFM string from the MfmNode tree.
*/
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

/**
 * Inspects the MfmNode tree.
*/
export function inspect(node: MfmNode, action: (node: MfmNode) => void): void
export function inspect(nodes: MfmNode[], action: (node: MfmNode) => void): void
export function inspect(node: (MfmNode | MfmNode[]), action: (node: MfmNode) => void): void {
	if (Array.isArray(node)) {
		for (const n of node) {
			inspectOne(n, action);
		}
	}
	else {
		inspectOne(node, action);
	}
}

/**
 * Inspects the MfmNode tree and returns as an array the nodes that match the conditions
 * of the predicate function.
*/
export function extract(nodes: MfmNode[], predicate: (node: MfmNode) => boolean): MfmNode[] {
	const dest = [] as MfmNode[];

	inspect(nodes, (node) => {
		if (predicate(node)) {
			dest.push(node);
		}
	});

	return dest;
}
