import { MfmInline, MfmNode, MfmPlainNode, TEXT } from '../../../node';

export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void
export function pushNode(node: MfmInline | string, nodes: MfmInline[]): void
export function pushNode(node: MfmPlainNode | string, nodes: MfmPlainNode[]): void
export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void {
	if (typeof node == 'string') {
		// store the string as a text node
		if (nodes.length > 0) {
			const lastNode = nodes[nodes.length - 1];
			if (lastNode.type == 'text') {
				// if the last node is a text node, concatenate to it.
				lastNode.props.text += node;
				return;
			}
		}
		nodes.push(TEXT(node));
		return;
	}
	nodes.push(node);
}
