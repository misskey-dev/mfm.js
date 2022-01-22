import { MatcherContext } from './matcher';
import { CharCode } from './string';

import { bigMatcher } from '../syntax/big';
import { boldAstaMatcher, boldTagMatcher, boldUnderMatcher } from '../syntax/bold';
import { centerTagMatcher } from '../syntax/center';
import { emojiCodeMatcher } from '../syntax/emojiCode';
import { fnMatcher } from '../syntax/fn';
import { italicAstaMatcher, italicTagMatcher, italicUnderMatcher } from '../syntax/italic';
import { mentionMatcher } from '../syntax/mention';
import { smallTagMatcher } from '../syntax/small';
import { strikeTagMatcher, strikeTildeMatcher } from '../syntax/strike';

export enum SyntaxLevel {
	plain = 0,
	inline,
	full,
}

export const plainMatcher = createSyntaxMatcher(SyntaxLevel.plain);
export const inlineMatcher = createSyntaxMatcher(SyntaxLevel.inline);
export const fullMatcher = createSyntaxMatcher(SyntaxLevel.full);

// NOTE: SyntaxMatcherは、どの構文にもマッチしなかった場合に長さ1のstring型のノードを生成します。
// MFM文字列を処理するために構文のマッチ試行が繰り返し実行された際は、連続するstring型ノードを1つのtextノードとして連結する必要があります。

export function createSyntaxMatcher(syntaxLevel: SyntaxLevel) {
	return function (ctx: MatcherContext) {
		let matched;

		// check EOF
		if (ctx.pos >= ctx.input.length) {
			return ctx.fail();
		}

		if (ctx.depth < ctx.nestLimit) {
			ctx.depth++;

			switch (ctx.input.charCodeAt(ctx.pos)) {

				case CharCode.asterisk: {
					if (syntaxLevel >= SyntaxLevel.inline) {
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
					}
					break;
				}

				case CharCode.dollar: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// $[fn ]
						matched = ctx.tryConsume(fnMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}
					}
					break;
				}

				case CharCode.question: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// ?[silent link]()
						// silentLinkMatcher
					}
					break;
				}

				case CharCode.lessThan: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// <s>
						matched = ctx.tryConsume(strikeTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						// <i>
						matched = ctx.tryConsume(italicTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						// <b>
						matched = ctx.tryConsume(boldTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						// <small>
						matched = ctx.tryConsume(smallTagMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}

						if (syntaxLevel >= SyntaxLevel.full) {
							// <center>
							matched = ctx.tryConsume(centerTagMatcher);
							if (matched.ok) {
								ctx.depth--;
								return matched;
							}
						}

						// <https://example.com>
						// urlAltMatcher
					}
					break;
				}

				case CharCode.greaterThan: {
					if (syntaxLevel >= SyntaxLevel.full) {
						// > quote
						// quoteMatcher
					}
					break;
				}

				case CharCode.openBracket: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// [link]()
						// linkMatcher
					}
					break;
				}

				case CharCode.backtick: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						if (syntaxLevel >= SyntaxLevel.full) {
							// ```code block```
							// codeBlockMatcher;
						}

						// `inline code`
						// inlineCodeMatcher
					}
					break;
				}

				case CharCode.backslash: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// \(math inline\)
						//mathInlineMatcher;

						if (syntaxLevel >= SyntaxLevel.full) {
							// \[math block\]
							//mathBlockMatcher;
						}
					}
					break;
				}

				case CharCode.tilde: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// ~~strike~~
						matched = ctx.tryConsume(strikeTildeMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}
					}
					break;
				}

				case CharCode.colon: {
					if (syntaxLevel >= SyntaxLevel.plain) {
						// :emojiCode:
						matched = ctx.consume(emojiCodeMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}
					}
					break;
				}

				case CharCode.underscore: {
					if (syntaxLevel >= SyntaxLevel.inline) {
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
					}
					break;
				}

				case CharCode.at: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// @mention
						matched = ctx.tryConsume(mentionMatcher);
						if (matched.ok) {
							ctx.depth--;
							return matched;
						}
					}
					break;
				}

				case CharCode.hash: {
					if (syntaxLevel >= SyntaxLevel.inline) {
						// #hashtag
						// hashtagMatcher
					}
					break;
				}
			}

			if (syntaxLevel >= SyntaxLevel.plain) {
				// unicode emoji
				// unicodeEmojiMatcher

				if (syntaxLevel >= SyntaxLevel.inline) {
					// https://url.com
					// urlMatcher

					// abc [search]
					// searchMatcher
				}
			}

			ctx.depth--;
		}

		// text node
		const text = ctx.input.charAt(ctx.pos);
		ctx.pos++;

		return ctx.ok(text);
	};
}
