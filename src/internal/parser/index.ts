import { MfmNode } from '../../node';
import { MatcherContext } from './matcher';
import { pushNode } from './util';
import { bigMatcher } from './syntax/big';
import { boldAstaMatcher, boldTagMatcher, boldUnderMatcher } from './syntax/bold';
import { italicAstaMatcher, italicTagMatcher, italicUnderMatcher } from './syntax/italic';
import { emojiCodeMatcher } from './syntax/emojiCode';

// consume and fallback:
// 
// const fallback = ctx.pos;
// const matched = matcher(ctx);
// if (matched.ok) {
// 	matched.resultData;
// } else {
// 	ctx.pos = fallback;
// }

// NOTE: 構文要素のマッチ試行の処理は、どの構文にもマッチしなかった場合に長さ1のstring型のノードを生成します。
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
				let fallback;
				if (syntaxLevel < SyntaxLevel.inline) break;

				// ***big***
				fallback = ctx.pos;
				matched = bigMatcher(ctx);
				if (matched.ok) {
					return matched;
				}
				ctx.pos = fallback;

				// **bold**
				fallback = ctx.pos;
				matched = boldAstaMatcher(ctx);
				if (matched.ok) {
					return matched;
				}
				ctx.pos = fallback;

				// *italic*
				fallback = ctx.pos;
				matched = italicAstaMatcher(ctx);
				if (matched.ok) {
					return matched;
				}
				ctx.pos = fallback;
				break;
			}

			case '$': {
				if (syntaxLevel < SyntaxLevel.inline) break;

				// $[fn ]
				break;
			}

			case '?': {
				if (syntaxLevel < SyntaxLevel.inline) break;

				// ?[silent link]()
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
					const fallback = ctx.pos;
					matched = italicTagMatcher(ctx);
					if (matched.ok) {
						return matched;
					}
					ctx.pos = fallback;
				}
				else if (input.startsWith('<b>')) {
					// <b>
					if (syntaxLevel < SyntaxLevel.inline) break;
					const fallback = ctx.pos;
					matched = boldTagMatcher(ctx);
					if (matched.ok) {
						return matched;
					}
					ctx.pos = fallback;
				}
				else if (input.startsWith('<small>')) {
					// <small>
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				else if (input.startsWith('<center>')) {
					// <center>
					if (syntaxLevel < SyntaxLevel.full) break;
				}
				else if (input.startsWith('<https://') || input.startsWith('<http://')) {
					// <https://example.com>
					if (syntaxLevel < SyntaxLevel.inline) break;
				}
				break;
			}

			case '>': {
				if (syntaxLevel < SyntaxLevel.full) break;

				// > quote
				break;
			}

			case '[': {
				if (syntaxLevel < SyntaxLevel.inline) break;

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
				if (syntaxLevel < SyntaxLevel.inline) break;
				// ~~strike~~
				break;
			}

			case ':': {
				if (syntaxLevel < SyntaxLevel.plain) break;

				// :emojiCode:
				const fallback = ctx.pos;
				matched = emojiCodeMatcher(ctx);
				if (matched.ok) {
					return matched;
				}
				ctx.pos = fallback;

				break;
			}

			case '_': {
				let fallback;
				if (syntaxLevel < SyntaxLevel.inline) break;

				// __bold__
				fallback = ctx.pos;
				matched = boldUnderMatcher(ctx);
				if (matched.ok) {
					return matched;
				}
				ctx.pos = fallback;

				// _italic_
				fallback = ctx.pos;
				matched = italicUnderMatcher(ctx);
				if (matched.ok) {
					return matched;
				}
				ctx.pos = fallback;

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
		matched = ctx.fullMatcher(ctx);
		if (!matched.ok) break;
		pushNode(matched.resultData, result);
	}

	return ctx.ok(result);
}

export function plainMfmMatcher(ctx: MatcherContext) {
	return ctx.ok([]);
}
