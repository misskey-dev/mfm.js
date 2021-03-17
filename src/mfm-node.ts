export type MfmNode = {
	type: string;
	props: Record<string, any>;
	children: MfmNode[];
};

export function createNode(type: string, props?: Record<string, any>, children?: MfmNode[]): MfmNode {
	props = props ?? {};
	children = children ?? [];
	const node = { type, props, children };
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

export function mergeText(trees: MfmNode[], recursive?: boolean): MfmNode[] {
	let dest: MfmNode[];
	let groupes: MfmNode[][];

	// group trees
	groupes = groupContinuous(trees, (prev, current) => prev.type == current.type);

	// concatinate text
	groupes = groupes.map((group) => {
		if (group[0].type == 'text') {
			return [
				createNode('text', {
					text: group.map(i => i.props.text).join('')
				})
			];
		}
		return group;
	});

	// merge groups
	dest = mergeGroupedTrees(groupes);

	return dest.map(tree => {
		// apply recursively to children
		return createNode(tree.type, tree.props, recursive ? mergeText(tree.children) : tree.children);
	});
}
