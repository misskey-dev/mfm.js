
class ParserContext {
	public input: string;
	public locStack: number[] = [];

	constructor(input: string) {
		this.input = input;
		this.locStack = [0];
	}

	public current() {
		return this.input.substr(this.locStack[0]);
	}

	public push() {
		this.locStack.unshift(this.locStack[0]);
	}

	public pop() {
		this.locStack.shift();
	}
}

export function parseFull(ctx: ParserContext)
{
	const input = ctx.current();

	if (input.length == 0) {
		// EOF
		return;
	}

	switch (input[0]) {

		case '*': {
			if (input.startsWith('***')) {
				// ***big***
				console.log('big');
			}
			else if (input.startsWith('**')) {
				// **bold**
				console.log('bold');
			}
			else {
				// *italic*
				console.log('italic');
			}
			break;
		}

		case '$': {
			// $[fn ]
			console.log('fn');
			break;
		}

		case '?': {
			// ?[silent link]()
			console.log('silent link');
			break;
		}

		case '<': {
			if (input.startsWith('<s>')) {
				// <s>
			}
			else if (input.startsWith('<i>')) {
				// <i>
			}
			else if (input.startsWith('<b>')) {
				// <b>
			}
			else if (input.startsWith('<small>')) {
				// <small>
			}
			else if (input.startsWith('<center>')) {
				// <center>
			}
			else if (input.startsWith('<https://') || input.startsWith('<http://')) {
				// <https://example.com>
			}
		}

		case '>': {
			// > quote
			break;
		}

		case '[': {
			// [link]()
			break;
		}

		case '`': {
			// ```code block```
			// `inline code`
		}

		case '\\': {
			// \(math inline\)
			// \[math block\]
		}

		case '~': {
			// ~~strike~~
		}

		case ':': {
			// :emojiCode:
		}

		case '_': {
			// __bold__
			// _italic_
		}

		case '@': {
			// @mention
		}

		case '#': {
			// #hashtag
		}

		case 'h': {
			// https://example.com
		}

		default:
			// search
			// unicode emoji
			// text
			break;

	}

}
