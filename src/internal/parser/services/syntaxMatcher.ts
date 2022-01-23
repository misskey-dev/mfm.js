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

// NOTE: SyntaxMatcher は、対象となる全ての構文とマッチを試行し、マッチした場合はその構文のノードを生成、
// いずれの構文にもマッチしなかった場合は長さ1のstring型のノードを生成します。
//
// 通常は、範囲内のMFM文字列を処理するために SyntaxMatcher が繰り返し呼び出されるため、構文にマッチしなかった
// 部分は複数のstring型ノードになります。 pushNode を使用すると、通常の構文ノードはツリーに追加し
// 連続するstring型ノードは1つのtextノードとして連結してツリーに追加できます。

export function fullSyntaxMatcher(ctx: MatcherContext) {
	let matched;

	// check EOF
	if (ctx.pos >= ctx.input.length) {
		return ctx.fail();
	}

	if (ctx.depth < ctx.nestLimit) {
		ctx.depth++;

		switch (ctx.input.charCodeAt(ctx.pos)) {

			case CharCode.asterisk: {
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

			case CharCode.dollar: {
				// $[fn ]
				matched = ctx.tryConsume(fnMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.question: {
				// ?[silent link]()
				// silentLinkMatcher
				break;
			}

			case CharCode.lessThan: {
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

				// <center>
				matched = ctx.tryConsume(centerTagMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}

				// <https://example.com>
				// urlAltMatcher
				break;
			}

			case CharCode.greaterThan: {
				// > quote
				// quoteMatcher
				break;
			}

			case CharCode.openBracket: {
				// [link]()
				// linkMatcher
				break;
			}

			case CharCode.backtick: {
				// ```code block```
				// codeBlockMatcher;

				// `inline code`
				// inlineCodeMatcher
				break;
			}

			case CharCode.backslash: {
				// \(math inline\)
				//mathInlineMatcher;

				// \[math block\]
				//mathBlockMatcher;
				break;
			}

			case CharCode.tilde: {
				// ~~strike~~
				matched = ctx.tryConsume(strikeTildeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.colon: {
				// :emojiCode:
				matched = ctx.consume(emojiCodeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.underscore: {
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

			case CharCode.at: {
				// @mention
				matched = ctx.tryConsume(mentionMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.hash: {
				// #hashtag
				// hashtagMatcher
				break;
			}
		}

		// unicode emoji
		// unicodeEmojiMatcher

		// https://url.com
		// urlMatcher

		// abc [search]
		// searchMatcher

		ctx.depth--;
	}

	// text node
	const text = ctx.input.charAt(ctx.pos);
	ctx.pos++;

	return ctx.ok(text);
}

export function inlineSyntaxMatcher(ctx: MatcherContext) {
	let matched;

	// check EOF
	if (ctx.pos >= ctx.input.length) {
		return ctx.fail();
	}

	if (ctx.depth < ctx.nestLimit) {
		ctx.depth++;

		switch (ctx.input.charCodeAt(ctx.pos)) {

			case CharCode.asterisk: {
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

			case CharCode.dollar: {
				// $[fn ]
				matched = ctx.tryConsume(fnMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.question: {
				// ?[silent link]()
				// silentLinkMatcher
				break;
			}

			case CharCode.lessThan: {
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

				// <https://example.com>
				// urlAltMatcher
				break;
			}

			case CharCode.openBracket: {
				// [link]()
				// linkMatcher
				break;
			}

			case CharCode.backtick: {
				// `inline code`
				// inlineCodeMatcher
				break;
			}

			case CharCode.backslash: {
				// \(math inline\)
				//mathInlineMatcher;
				break;
			}

			case CharCode.tilde: {
				// ~~strike~~
				matched = ctx.tryConsume(strikeTildeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.colon: {
				// :emojiCode:
				matched = ctx.consume(emojiCodeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.underscore: {
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

			case CharCode.at: {
				// @mention
				matched = ctx.tryConsume(mentionMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.hash: {
				// #hashtag
				// hashtagMatcher
				break;
			}
		}

		// unicode emoji
		// unicodeEmojiMatcher

		// https://url.com
		// urlMatcher

		// abc [search]
		// searchMatcher

		ctx.depth--;
	}

	// text node
	const text = ctx.input.charAt(ctx.pos);
	ctx.pos++;

	return ctx.ok(text);
}

export function plainSyntaxMatcher(ctx: MatcherContext) {
	let matched;

	// check EOF
	if (ctx.pos >= ctx.input.length) {
		return ctx.fail();
	}

	// :emojiCode:
	matched = ctx.consume(emojiCodeMatcher);
	if (matched.ok) {
		return matched;
	}

	// unicode emoji
	// unicodeEmojiMatcher

	// text node
	const text = ctx.input.charAt(ctx.pos);
	ctx.pos++;

	return ctx.ok(text);
}
