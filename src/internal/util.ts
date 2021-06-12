import { isMfmBlock, MfmNode, TEXT } from '../node';

export function mergeText(nodes: (MfmNode | string)[]): MfmNode[] {
	const dest: MfmNode[] = [];
	const storedChars: string[] = [];

	/**
	 * Generate a text node from the stored chars, And push it.
	*/
	function generateText() {
		if (storedChars.length > 0) {
			dest.push(TEXT(storedChars.join('')));
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
			return stringifyTree(node.children).split('\n').map(line => `> ${line}`).join('\n');
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
			return `<center>\n${ stringifyTree(node.children) }\n</center>`;
		}
		// inline
		case 'emojiCode': {
			return `:${ node.props.name }:`;
		}
		case 'unicodeEmoji': {
			return node.props.emoji;
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
			return `$[${ node.props.name }${ args } ${ stringifyTree(node.children) }]`;
		}
		case 'text': {
			return node.props.text;
		}
	}
	throw new Error('unknown mfm node');
}

enum stringifyState {
	none = 0,
	inline,
	block
};

export function stringifyTree(nodes: MfmNode[]): string {
	let dest: MfmNode[] = [];
	let state: stringifyState = stringifyState.none;

	for (const node of nodes) {
		// 文脈に合わせて改行を追加する。
		// none -> inline   : No
		// none -> block    : No
		// inline -> inline : No
		// inline -> block  : Yes
		// block -> inline  : Yes
		// block -> block   : Yes

		let pushLf: boolean = true;
		if (isMfmBlock(node)) {
			if (state == stringifyState.none) {
				pushLf = false;
			}
			state = stringifyState.block;
		}
		else {
			if (state == stringifyState.none || state == stringifyState.inline) {
				pushLf = false;
			}
			state = stringifyState.inline;
		}
		if (pushLf) {
			dest.push(TEXT('\n'));
		}

		dest.push(node);
	}

	return dest.map(n => stringifyNode(n)).join('');
}

export function inspectOne(node: MfmNode, action: (node: MfmNode) => void) {
	action(node);
	if (node.children != null) {
		for (const child of node.children) {
			inspectOne(child, action);
		}
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
