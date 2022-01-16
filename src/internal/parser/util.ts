import { MfmInline, MfmNode, MfmPlainNode, TEXT } from '../../node';

/**
 * push a node to a node array.
 * in this operation, string node is managed.
*/
export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void
export function pushNode(node: MfmInline | string, nodes: MfmInline[]): void
export function pushNode(node: MfmPlainNode | string, nodes: MfmPlainNode[]): void
export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void {
	if (typeof node == 'string') {
		// store text node
		let foundText = false;
		if (nodes.length > 0) {
			const lastNode = nodes[nodes.length - 1];
			if (lastNode.type == 'text') {
				lastNode.props.text += node;
				foundText = true;
			}
		}
		if (!foundText) {
			nodes.push(TEXT(node));
		}
	} else {
		nodes.push(node);
	}
}
