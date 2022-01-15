import { EMOJI_CODE, MfmNode, TEXT } from '../../node';
import { Matcher, MatcherContext, MatcherResult } from './matcher';

function emojiCodeMatcher(ctx: MatcherContext): MatcherResult {
	// :
	if (!ctx.input.startsWith(':', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos++;

	// name
	const matched = /^[a-z0-9_+-]+/i.exec(ctx.getText());
	if (matched == null) {
		return ctx.fail();
	}
	const name = matched[0];
	ctx.pos += name.length;

	// :
	if (!ctx.input.startsWith(':', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos++;

	return ctx.ok(EMOJI_CODE(name));
}

function createSyntaxMatcher(inlineOnly: boolean): Matcher {
	return function(ctx: MatcherContext): MatcherResult {
		let matched;

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
				matched = ctx.tryConsume(emojiCodeMatcher);
				if (matched.ok) {
					return matched;
				}
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
	};
}

const syntaxMatcher = createSyntaxMatcher(false);

export function matchMfm(ctx: MatcherContext): MatcherResult {
	let matched: MatcherResult;

	const result: MfmNode[] = [];
	while (true) {
		if (ctx.eof()) break;

		matched = ctx.tryConsume(syntaxMatcher);
		if (matched.ok) {
			result.push(matched.data);
		} else {
			// text
			const lastNode = result[result.length - 1];
			if (result.length > 0 && lastNode.type == 'text') {
				lastNode.props.text += ctx.input[ctx.pos];
				ctx.pos++;
			} else {
				result.push(TEXT(ctx.input[ctx.pos]));
				ctx.pos++;
			}
		}
	}

	return ctx.ok(result);
}
