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

export function extract(nodes: MfmNode[], type: (MfmNode['type'] | MfmNode['type'][])): MfmNode[] {
	function predicate(node: MfmNode, type: (MfmNode['type'] | MfmNode['type'][])): boolean {
		if (Array.isArray(type)) {
			return (type.some(i => i == node.type));
		}
		else {
			return (type == node.type);
		}
	}

	const dest = [] as MfmNode[];
	for (const node of nodes) {
		if (predicate(node, type)) {
			dest.push(node);
		}
		if (node.children != null) {
			dest.push(...extract(node.children, type));
		}
	}

	return dest;
}

export { NodeType } from './node';

export {
	MfmNode,
	MfmBlock,
	MfmInline,

	// block
	MfmQuote,
	MfmSearch,
	MfmCodeBlock,
	MfmMathBlock,
	MfmCenter,

	// inline
	MfmUnicodeEmoji,
	MfmEmojiCode,
	MfmBold,
	MfmSmall,
	MfmItalic,
	MfmStrike,
	MfmInlineCode,
	MfmMathInline,
	MfmMention,
	MfmHashtag,
	MfmUrl,
	MfmLink,
	MfmFn,
	MfmText
} from './node';
