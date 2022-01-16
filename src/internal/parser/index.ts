import { MfmNode, TEXT } from '../../node';
import { emojiCodeMatcher } from './emojiCode';
import { Matcher, MatcherContext, MatcherResult } from './matcher';

// match and consume:
// 
// const fallback = ctx.pos;
// const matched = matcher(ctx);
// if (matched.ok) {
// 	matched.resultData;
// } else {
// 	ctx.pos = fallback;
// }

function createSyntaxMatcher(inlineOnly: boolean): Matcher {
	return function(ctx: MatcherContext): MatcherResult {
		let matched;

		if (ctx.eof()) {
			return ctx.fail();
		}

		let input = ctx.input[ctx.pos];

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
				const fallback = ctx.pos;
				matched = emojiCodeMatcher(ctx);
				if (matched.ok) {
					return matched;
				} else {
					ctx.pos = fallback;
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

		const fallback = ctx.pos;
		matched = syntaxMatcher(ctx);
		if (matched.ok) {
			result.push(matched.resultData);
		} else {
			ctx.pos = fallback;
			// text
			let genText = true;
			if (result.length > 0) {
				const lastNode = result[result.length - 1];
				if (lastNode.type == 'text') {
					lastNode.props.text += ctx.input[ctx.pos];
					ctx.pos++;
					genText = false;
				}
			}
			if (genText) {
				result.push(TEXT(ctx.input[ctx.pos]));
				ctx.pos++;
			}
		}
	}

	return ctx.ok(result);
}
