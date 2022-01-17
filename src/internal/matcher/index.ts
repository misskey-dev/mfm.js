import { MfmNode, MfmPlainNode } from '../../node';
import { MatcherContext, MatcherContextOpts, pushNode, SyntaxLevel } from './util';
import { bigMatcher } from './syntax/big';
import { boldAstaMatcher, boldTagMatcher, boldUnderMatcher } from './syntax/bold';
import { italicAstaMatcher, italicTagMatcher, italicUnderMatcher } from './syntax/italic';
import { emojiCodeMatcher } from './syntax/emojiCode';

// NOTE: 構文要素のマッチ試行の処理は、どの構文にもマッチしなかった場合に長さ1のstring型のノードを生成します。
// MFM文字列を処理するために構文のマッチ試行が繰り返し実行された際は、連続するstring型ノードを1つのtextノードとして連結する必要があります。

export function createSyntaxMatcher(syntaxLevel: SyntaxLevel) {
	return function (ctx: MatcherContext) {
		let matched;

		if (ctx.eof()) {
			return ctx.fail();
		}

		const input = ctx.input.substr(ctx.pos);

		if (ctx.depth < ctx.nestLimit) {
			ctx.depth++;

			switch (ctx.input[ctx.pos]) {

				case '*': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// ***big***
					matched = ctx.tryConsume(bigMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					// **bold**
					matched = ctx.tryConsume(boldAstaMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					// *italic*
					matched = ctx.tryConsume(italicAstaMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
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
					} else if (input.startsWith('<i>')) {
						// <i>
						if (syntaxLevel < SyntaxLevel.inline) break;
						matched = ctx.tryConsume(italicTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}
					} else if (input.startsWith('<b>')) {
						// <b>
						if (syntaxLevel < SyntaxLevel.inline) break;
						matched = ctx.tryConsume(boldTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}
					} else if (input.startsWith('<small>')) {
						// <small>
						if (syntaxLevel < SyntaxLevel.inline) break;
					} else if (input.startsWith('<center>')) {
						// <center>
						if (syntaxLevel < SyntaxLevel.full) break;
					} else if (input.startsWith('<https://') || input.startsWith('<http://')) {
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
					matched = ctx.consume(emojiCodeMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					break;
				}

				case '_': {
					if (syntaxLevel < SyntaxLevel.inline) break;

					// __bold__
					matched = ctx.tryConsume(boldUnderMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

					// _italic_
					matched = ctx.tryConsume(italicUnderMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}

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

			ctx.depth--;
		}

		// text node
		const text = ctx.input[ctx.pos];
		ctx.pos++;

		return ctx.ok(text);
	};
}

export function fullParser(input: string, opts: MatcherContextOpts) {
	const ctx = new MatcherContext(input, opts);
	const result: MfmNode[] = [];
	let matched;

	while (true) {
		matched = ctx.consume(ctx.fullMatcher);
		if (!matched.ok) break;
		pushNode(matched.resultData, result);
	}

	return result;
}

export function plainParser(input: string) {
	const ctx = new MatcherContext(input, {});
	const result: MfmPlainNode[] = [];
	let matched;

	while (true) {
		matched = ctx.consume(ctx.plainMatcher);
		if (!matched.ok) break;
		pushNode(matched.resultData, result);
	}

	return result;
}
