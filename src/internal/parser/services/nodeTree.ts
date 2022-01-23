import { MfmNode, MfmText, TEXT } from '../../../node';

export function pushNode<T extends MfmNode>(node: T | string, nodes: (T | MfmText)[]): void {
	if (typeof node != 'string') {
		nodes.push(node);
		return;
	}
	// if the last node is a text node, concatenate to it
	if (nodes.length > 0) {
		const lastNode = nodes[nodes.length - 1];
		if (lastNode.type == 'text') {
			(lastNode as MfmText).props.text += node;
			return;
		}
	}
	// generate a text node
	nodes.push(TEXT(node));
}
