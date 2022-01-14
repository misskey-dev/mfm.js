import { MfmNode, TEXT } from '../../node';
import { Matcher, MatcherContext, MatcherResult } from './matcher';

function createSyntaxMatcher(inlineOnly: boolean): Matcher {
	return function(ctx: MatcherContext): MatcherResult {
		if (ctx.eof()) {
			return ctx.fail();
		}

		let input = ctx.getText();

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
					if (inlineOnly) break;
					// <center>
				}
				else if (input.startsWith('<https://') || input.startsWith('<http://')) {
					// <https://example.com>
				}
				break;
			}

			case '>': {
				// > quote
				if (inlineOnly) break;
				break;
			}

			case '[': {
				// [link]()
				break;
			}

			case '`': {
				// ```code block```
				// `inline code`
				break;
			}

			case '\\': {
				// \(math inline\)
				// \[math block\]
				break;
			}

			case '~': {
				// ~~strike~~
				break;
			}

			case ':': {
				// :emojiCode:
				break;
			}

			case '_': {
				// __bold__
				// _italic_
				break;
			}

			case '@': {
				// @mention
				break;
			}

			case '#': {
				// #hashtag
				break;
			}

			case 'h': {
				// https://example.com
				break;
			}
		}

		// search
		// unicode emoji

		return ctx.fail();
	}
}

export function matchMfm(ctx: MatcherContext): MatcherResult {
	let matched: MatcherResult;
	let input: string;
	const result: MfmNode[] = [];

	const syntaxMatcher = createSyntaxMatcher(false);

	while (true) {
		if (ctx.eof()) break;

		matched = ctx.tryConsume(syntaxMatcher);
		if (matched.ok) {
			result.push(matched.data);
			continue;
		}

		input = ctx.getText();

		// text
		const lastNode = result[result.length-1];
		if (lastNode != null && lastNode.type == 'text') {
			lastNode.props.text += input[0];
			ctx.pos++;
		}
		else {
			result.push(TEXT(input[0]));
			ctx.pos++;
		}
	}

	return ctx.ok(result);
}
