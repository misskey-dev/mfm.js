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
			break;
		}
		case 'blockCode': {
			break;
		}
		case 'mathBlock': {
			break;
		}
		case 'center': {
			break;
		}
		// inline
		case 'emoji': {
			break;
		}
		case 'bold': {
			break;
		}
		case 'small': {
			break;
		}
		case 'italic': {
			break;
		}
		case 'strike': {
			break;
		}
		case 'inlineCode': {
			break;
		}
		case 'mathInline': {
			break;
		}
		case 'mention': {
			break;
		}
		case 'hashtag': {
			break;
		}
		case 'url': {
			break;
		}
		case 'link': {
			break;
		}
		case 'fn': {
			break;
		}
		case 'text': {
			return node.props.text;
		}
	}
	return '';
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
