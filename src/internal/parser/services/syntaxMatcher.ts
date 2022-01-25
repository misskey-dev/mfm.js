import { MatcherContext } from './matcher';
import { CharCode } from './string';

import { bigMatcher } from '../syntax/big';
import { boldAstaMatcher, boldTagMatcher, boldUnderMatcher } from '../syntax/bold';
import { centerTagMatcher } from '../syntax/center';
import { emojiCodeMatcher } from '../syntax/emojiCode';
import { fnMatcher } from '../syntax/fn';
import { hashtagMatcher } from '../syntax/hashtag';
import { italicAstaMatcher, italicTagMatcher, italicUnderMatcher } from '../syntax/italic';
import { mentionMatcher } from '../syntax/mention';
import { smallTagMatcher } from '../syntax/small';
import { strikeTagMatcher, strikeTildeMatcher } from '../syntax/strike';
import { unicodeEmojiMatcher } from '../syntax/unicodeEmoji';
import { inlineCodeMatcher } from '../syntax/inlineCode';
import { urlAltMatcher, urlMatcher } from '../syntax/url';

// NOTE: SyntaxMatcher は、対象となる全ての構文とマッチを試行し、マッチした場合はその構文のノードを生成、
// いずれの構文にもマッチしなかった場合は長さ1のstring型のノードを生成します。
//
// 通常は、範囲内のMFM文字列を処理するために SyntaxMatcher が繰り返し呼び出されるため、構文にマッチしなかった
// 部分は複数のstring型ノードになります。 pushNode を使用すると、通常の構文ノードはツリーに追加し
// 連続するstring型ノードは1つのtextノードとして連結してツリーに追加できます。

export function fullSyntaxMatcher(ctx: MatcherContext) {
	let matched;

	// check EOF
	if (ctx.eof()) {
		return ctx.fail();
	}

	if (ctx.depth < ctx.nestLimit) {
		ctx.depth++;

		switch (ctx.input.charCodeAt(ctx.pos)) {

			case CharCode.asterisk: {
				matched = ctx.tryConsumeAny([
					// ***big***
					bigMatcher,
					// **bold**
					boldAstaMatcher,
					// *italic*
					italicAstaMatcher,
				]);
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
				matched = ctx.tryConsumeAny([
					// <s>
					strikeTagMatcher,
					// <i>
					italicTagMatcher,
					// <b>
					boldTagMatcher,
					// <small>
					smallTagMatcher,
					// <center>
					centerTagMatcher,
					// <https://example.com>
					urlAltMatcher,
				]);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
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
				matched = ctx.tryConsume(inlineCodeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
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
				matched = ctx.tryConsume(emojiCodeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.underscore: {
				matched = ctx.tryConsumeAny([
					// __bold__
					boldUnderMatcher,
					// _italic_
					italicUnderMatcher,
				]);
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
				matched = ctx.tryConsume(hashtagMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}
		}

		matched = ctx.tryConsumeAny([
			// unicode emoji
			unicodeEmojiMatcher,
			// https://example.com
			urlMatcher,
			// abc [search]
			// searchMatcher,
		]);
		if (matched.ok) {
			ctx.depth--;
			return matched;
		}

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
	if (ctx.eof()) {
		return ctx.fail();
	}

	if (ctx.depth < ctx.nestLimit) {
		ctx.depth++;

		switch (ctx.input.charCodeAt(ctx.pos)) {

			case CharCode.asterisk: {
				matched = ctx.tryConsumeAny([
					// ***big***
					bigMatcher,
					// **bold**
					boldAstaMatcher,
					// *italic*
					italicAstaMatcher,
				]);
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
				matched = ctx.tryConsumeAny([
					// <s>
					strikeTagMatcher,
					// <i>
					italicTagMatcher,
					// <b>
					boldTagMatcher,
					// <small>
					smallTagMatcher,
					// <https://example.com>
					urlAltMatcher,
				]);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.openBracket: {
				// [link]()
				// linkMatcher
				break;
			}

			case CharCode.backtick: {
				// `inline code`
				matched = ctx.tryConsume(inlineCodeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
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
				matched = ctx.tryConsume(emojiCodeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.underscore: {
				matched = ctx.tryConsumeAny([
					// __bold__
					boldUnderMatcher,
					// _italic_
					italicUnderMatcher,
				]);
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
				matched = ctx.tryConsume(hashtagMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}
		}

		matched = ctx.tryConsumeAny([
			// unicode emoji
			unicodeEmojiMatcher,
			// https://example.com
			urlMatcher,
		]);
		if (matched.ok) {
			ctx.depth--;
			return matched;
		}

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
	if (ctx.eof()) {
		return ctx.fail();
	}

	matched = ctx.tryConsumeAny([
		// :emojiCode:
		emojiCodeMatcher,
		// unicode emoji
		unicodeEmojiMatcher,
	]);
	if (matched.ok) {
		return matched;
	}

	// text node
	const text = ctx.input.charAt(ctx.pos);
	ctx.pos++;

	return ctx.ok(text);
}
