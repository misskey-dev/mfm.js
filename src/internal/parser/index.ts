import { MfmNode } from '../../node';
import { emojiCodeMatcher } from './syntax/emojiCode';
import { MatcherContext, MatcherResult } from './matcher';
import { boldMatcher } from './syntax/bold';
import { pushNode } from './util';

// consume and fallback:
// 
// const fallback = ctx.pos;
// const matched = matcher(ctx);
// if (matched.ok) {
// 	matched.resultData;
// } else {
// 	ctx.pos = fallback;
// }

// NOTE: 構文要素のマッチ試行の処理では、どの構文にもマッチしなかった場合に長さ1のstring型のノードが生成されます。
// MFM文字列を処理するために構文のマッチ試行が繰り返し実行された際は、連続するstring型ノードを1つのtextノードとして連結する必要があります。

export enum SyntaxLevel {
	plain = 0,
	inline,
	full
}

export function createSyntaxMatcher(syntaxLevel: SyntaxLevel) {
	return function(ctx: MatcherContext) {
		let matched;

		if (ctx.eof()) {
			return ctx.fail();
		}

		let input = ctx.input.substr(ctx.pos);

		switch (ctx.input[ctx.pos]) {

			case '*': {
				if (input.startsWith('***')) {
					// ***big***
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				else if (input.startsWith('**')) {
					// **bold**
					if (syntaxLevel < SyntaxLevel.inline) break;
					const fallback = ctx.pos;
					matched = boldMatcher(ctx);
					if (matched.ok) {
						return matched;
					} else {
						ctx.pos = fallback;
					}
				}
				else {
					// *italic*
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				break;
			}

			case '$': {
				// $[fn ]
				if (syntaxLevel < SyntaxLevel.inline) break;
				break;
			}

			case '?': {
				// ?[silent link]()
				if (syntaxLevel < SyntaxLevel.inline) break;
				break;
			}

			case '<': {
				if (input.startsWith('<s>')) {
					// <s>
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				else if (input.startsWith('<i>')) {
					// <i>
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				else if (input.startsWith('<b>')) {
					// <b>
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				else if (input.startsWith('<small>')) {
					// <small>
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				else if (input.startsWith('<center>')) {
					if (syntaxLevel < SyntaxLevel.full) break;
					// <center>
				}
				else if (input.startsWith('<https://') || input.startsWith('<http://')) {
					// <https://example.com>
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				break;
			}

			case '>': {
				// > quote
				if (syntaxLevel < SyntaxLevel.full) break;
				break;
			}

			case '[': {
				// [link]()
				if (syntaxLevel < SyntaxLevel.inline) break;
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
				if (syntaxLevel < SyntaxLevel.inline) break;
				break;
			}

			case ':': {
				if (syntaxLevel < SyntaxLevel.plain) break;
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
				if (syntaxLevel < SyntaxLevel.inline) break;
				break;
			}

			case '#': {
				// #hashtag
				if (syntaxLevel < SyntaxLevel.inline) break;
				break;
			}

			case 'h': {
				// https://example.com
				if (syntaxLevel < SyntaxLevel.inline) break;
				break;
			}
		}

		// search
		// unicode emoji

		// text node
		const text = ctx.input[ctx.pos];
		ctx.pos++;

		return ctx.ok(text);
	};
}

export function fullMfmMatcher(ctx: MatcherContext) {
	let matched;

	const result: MfmNode[] = [];
	while (true) {
		matched = ctx.state.fullMatcher(ctx);
		if (!matched.ok) break;
		pushNode(matched.resultData, result);
	}

	return ctx.ok(result);
}

export function plainMfmMatcher(ctx: MatcherContext) {
	return ctx.ok([]);
}
