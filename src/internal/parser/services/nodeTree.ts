import { MfmInline, MfmNode, MfmPlainNode, TEXT } from '../../../node';

export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void
export function pushNode(node: MfmInline | string, nodes: MfmInline[]): void
export function pushNode(node: MfmPlainNode | string, nodes: MfmPlainNode[]): void
export function pushNode(node: MfmNode | string, nodes: MfmNode[]): void {
	if (typeof node != 'string') {
		nodes.push(node);
		return;
	}
	// if the last node is a text node, concatenate to it
	if (nodes.length > 0) {
		const lastNode = nodes[nodes.length - 1];
		if (lastNode.type == 'text') {
			lastNode.props.text += node;
			return;
		}
	}
	// generate a text node
	nodes.push(TEXT(node));
}
