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
