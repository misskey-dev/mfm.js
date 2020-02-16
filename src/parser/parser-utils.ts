import { Tree } from '.';

export function createTree(type: string, props?: Record<string, any>, children?: Tree[]): Tree {
	props = props || { };
	children = children || [ ];
	children = !Array.isArray(children) ? [children] : children;

	return { type, props, children };
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

export function mergeGroupedTrees(groupedTrees: Tree[][]): Tree[] {
	return groupedTrees.reduce((acc, val) => acc.concat(val), ([] as Tree[]));
}

export function mergeText(trees: Tree[], recursive?: boolean): Tree[] {
	let dest: Tree[];
	let groupes: Tree[][];

	// group trees
	groupes = groupContinuous(trees, (prev, current) => prev.type == current.type);

	// concatinate text
	groupes = groupes.map((group) => {
		if (group[0].type == 'text') {
			return [
				createTree('text', {
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
		return createTree(tree.type, tree.props, recursive ? mergeText(tree.children) : tree.children);
	});
}
