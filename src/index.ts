import peg from 'pegjs';
import { MfmNode } from './node';
const parser: peg.Parser = require('./parser');

export function parse(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'fullParser' });
	return nodes;
}

export function parsePlain(input: string): MfmNode[] {
	const nodes = parser.parse(input, { startRule: 'plainParser' });
	return nodes;
}

function nodeStringify(node: MfmNode): string {
	switch(node.type) {
		// block
		case 'quote': {
			return toString(node.children).split('\n').map(line => `>${line}`).join('\n');
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
			return `<center>${ toString(node.children) }</center>`;
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
			return `**${ toString(node.children) }**`;
		}
		case 'small': {
			return `<small>${ toString(node.children) }</small>`;
		}
		case 'italic': {
			return `<i>${ toString(node.children) }</i>`;
		}
		case 'strike': {
			return `~~${ toString(node.children) }~~`;
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
			return `${ prefix }[${ toString(node.children) }](${ node.props.url })`;
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
			const args = argFields.join(',');
			return `[${ node.props.name }${ args } ${ toString(node.children) }]`;
		}
		case 'text': {
			return node.props.text;
		}
	}
	throw new Error('unknown mfm node');
}

export function toString(nodes: MfmNode[]): string {
	return nodes.map(node => nodeStringify(node)).join('');
}

export {
	MfmNode,
	MfmBlock,
	MfmInline,

	// block
	MfmQuote,
	MfmSearch,
	MfmCodeBlock,
	MfmMathBlock,
	MfmCenter,

	// inline
	MfmEmoji,
	MfmBold,
	MfmSmall,
	MfmItalic,
	MfmStrike,
	MfmInlineCode,
	MfmMathInline,
	MfmMention,
	MfmHashtag,
	MfmUrl,
	MfmLink,
	MfmFn,
	MfmText
} from './node';
