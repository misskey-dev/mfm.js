import { MfmNode } from './node';

export function createNode(type: string, props?: Record<string, any>, children?: MfmNode[]): MfmNode {
	const node: any = { type };
	if (props != null) {
		node.props = props;
	}
	if (children != null) {
		node.children = children;
	}
	return node;
}

export function mergeText(nodes: (MfmNode | string)[]): MfmNode[] {
	const dest: MfmNode[] = [];
	const storedChars: string[] = [];

	/**
	 * Generate a text node from the stored chars, And push it.
	*/
	function generateText() {
		if (storedChars.length > 0) {
			const textNode = createNode('text', { text: storedChars.join('') });
			dest.push(textNode);
			storedChars.length = 0;
		}
	}

	for (const node of nodes) {
		if (typeof node == 'string') {
			// Store the char.
			storedChars.push(node);
		}
		else {
			generateText();
			dest.push(node);
		}
	}
	generateText();

	return dest;
}

export function stringifyNode(node: MfmNode): string {
	switch(node.type) {
		// block
		case 'quote': {
			return stringifyTree(node.children).split('\n').map(line => `>${line}`).join('\n');
		}
		case 'search': {
			return node.props.content;
		}
		case 'blockCode': {
			return `\`\`\`${ node.props.lang ?? '' }\n${ node.props.code }\n\`\`\``;
		}
		case 'mathBlock': {
			return `\\[\n${ node.props.formula }\n\\]`;
		}
		case 'center': {
			return `<center>${ stringifyTree(node.children) }</center>`;
		}
		// inline
		case 'emoji': {
			if (node.props.name) {
				return `:${ node.props.name }:`;
			}
			else if (node.props.emoji) {
				return node.props.emoji;
			}
			else {
				return '';
			}
		}
		case 'bold': {
			return `**${ stringifyTree(node.children) }**`;
		}
		case 'small': {
			return `<small>${ stringifyTree(node.children) }</small>`;
		}
		case 'italic': {
			return `<i>${ stringifyTree(node.children) }</i>`;
		}
		case 'strike': {
			return `~~${ stringifyTree(node.children) }~~`;
		}
		case 'inlineCode': {
			return `\`${ node.props.code }\``;
		}
		case 'mathInline': {
			return `\\(${ node.props.formula }\\)`;
		}
		case 'mention': {
			return node.props.acct;
		}
		case 'hashtag': {
			return `#${ node.props.hashtag }`;
		}
		case 'url': {
			return node.props.url;
		}
		case 'link': {
			const prefix = node.props.silent ? '?' : '';
			return `${ prefix }[${ stringifyTree(node.children) }](${ node.props.url })`;
		}
		case 'fn': {
			const argFields = Object.keys(node.props.args).map(key => {
				const value = node.props.args[key];
				if (value === true) {
					return key;
				}
				else {
					return `${ key }=${ value }`;
				}
			});
			const args = (argFields.length > 0) ? '.' + argFields.join(',') : '';
			return `[${ node.props.name }${ args } ${ stringifyTree(node.children) }]`;
		}
		case 'text': {
			return node.props.text;
		}
	}
	throw new Error('unknown mfm node');
}

export function stringifyTree(tree: MfmNode[]): string {
	return tree.map(n => stringifyNode(n)).join('');
}

//
// dynamic consuming
//

/*
	1. If you want to consume 3 chars, call the setConsumeCount.
	```
	setConsumeCount(3);
	```

	2. And the rule to consume the input is as below:
	```
	rule = (&{ return consumeDynamically(); } .)+
	```
*/

let consumeCount = 0;

/**
 * set the length of dynamic consuming.
*/
export function setConsumeCount(count: number) {
	consumeCount = count;
}

/**
 * consume the input and returns matching result.
*/
export function consumeDynamically() {
	const matched = (consumeCount > 0);
	if (matched) {
		consumeCount--;
	}
	return matched;
}
