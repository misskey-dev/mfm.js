import { MfmNode, MfmText } from './node';

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

/**
 * @param predicate specifies whether to group the previous item and the current item
 * @returns grouped items
*/
export function groupContinuous<T>(arr: T[], predicate: (prev: T, current: T) => boolean): T[][] {
	const dest: any[][] = [];

	for (let i = 0; i < arr.length; i++) {
		if (i != 0 && predicate(arr[i - 1], arr[i])) {
			dest[dest.length - 1].push(arr[i]);
		}
		else {
			dest.push([arr[i]]);
		}
	}

	return dest;
}

export function mergeGroupedTrees(groupedTrees: MfmNode[][]): MfmNode[] {
	return groupedTrees.reduce((acc, val) => acc.concat(val), ([] as MfmNode[]));
}

export function mergeText(trees: MfmNode[] | undefined, recursive?: boolean): MfmNode[] | undefined {
	let dest: MfmNode[];
	let groupes: MfmNode[][];

	if (trees == null) {
		return trees;
	}

	// group trees
	groupes = groupContinuous(trees, (prev, current) => prev.type == current.type);

	// concatinate text
	groupes = groupes.map((group) => {
		if (group[0].type == 'text') {
			return [
				createNode('text', {
					text: group.map(i => (i as MfmText).props.text).join('')
				})
			];
		}
		return group;
	});

	// merge groups
	dest = mergeGroupedTrees(groupes);

	if (recursive) {
		return dest.map(tree => {
			// apply recursively to children
			return createNode(tree.type, tree.props, recursive ? mergeText(tree.children) : tree.children);
		});
	}
	else {
		return dest;
	}
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
