import { MfmInline, MfmNode, MfmPlainNode } from '../../node';
import { Parser } from '../services/parser';
import { CharCode } from '../services/character';

import { bigMatcher } from './syntax/big';
import { boldAstaParser, boldUnderParser, boldTagParser } from './syntax/bold';
import { centerTagMatcher } from './syntax/center';
import { emojiCodeParser } from './syntax/emojiCode';
import { fnParser } from './syntax/fn';
import { hashtagParser } from './syntax/hashtag';
import { inlineCodeParser } from './syntax/inlineCode';
import { italicAstaMatcher, italicTagMatcher, italicUnderMatcher } from './syntax/italic';
import { linkMatcher, silentLinkMatcher } from './syntax/link';
import { mathInlineMatcher } from './syntax/mathInline';
import { mentionMatcher } from './syntax/mention';
import { searchMatcher } from './syntax/search';
import { smallTagMatcher } from './syntax/small';
import { strikeTagMatcher, strikeTildeMatcher } from './syntax/strike';
import { unicodeEmojiMatcher } from './syntax/unicodeEmoji';
import { urlAltMatcher, urlMatcher } from './syntax/url';

// NOTE: SyntaxMatcher は、対象となる全ての構文とマッチを試行し、マッチした場合はその構文のノードを生成、
// いずれの構文にもマッチしなかった場合は長さ1のstring型のノードを生成します。
//
// 通常は、範囲内のMFM文字列を処理するために SyntaxMatcher が繰り返し呼び出されるため、構文にマッチしなかった
// 部分は複数のstring型ノードになります。 pushNode を使用すると、通常の構文ノードはツリーに追加し
// 連続するstring型ノードは1つのtextノードとして連結してツリーに追加できます。

// NOTE:
// リンクラベル部分はinlineSyntaxMatcherが適用されます。
// inlineSyntaxMatcherに含まれる構文でネストされた部分はinlineSyntaxMatcherが適用されることが分かっており、
// リンクラベル部分以外のマッチではlinkLabelが常にfalseであることが分かっているため、
// inlineSyntaxMatcherでのみlinkLabelの判定をすれば良いと分かります。

export const fullParser: Parser<MfmNode | string> = (ctx) => {
	let matched;

	// check EOF
	if (ctx.eof()) {
		return ctx.fail();
	}

	if (ctx.depth < ctx.nestLimit) {
		ctx.depth++;

		switch (ctx.input.charCodeAt(ctx.pos)) {

			case CharCode.asterisk: {
				matched = ctx.choice([
					// ***big***
					bigMatcher,
					// **bold**
					boldAstaParser,
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
				matched = ctx.parser(fnParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.question: {
				// ?[silent link]()
				matched = ctx.parser(silentLinkMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.lessThan: {
				matched = ctx.choice([
					// <s>
					strikeTagMatcher,
					// <i>
					italicTagMatcher,
					// <b>
					boldTagParser,
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
				matched = ctx.parser(linkMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.backtick: {
				// ```code block```
				// codeBlockParser;

				// `inline code`
				matched = ctx.parser(inlineCodeParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.backslash: {
				// \(math inline\)
				matched = ctx.parser(mathInlineMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}

				// \[math block\]
				//mathBlockMatcher;
				break;
			}

			case CharCode.tilde: {
				// ~~strike~~
				matched = ctx.parser(strikeTildeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.colon: {
				// :emojiCode:
				matched = ctx.parser(emojiCodeParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.underscore: {
				matched = ctx.choice([
					// __bold__
					boldUnderParser,
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
				matched = ctx.parser(mentionMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.hash: {
				// #hashtag
				matched = ctx.parser(hashtagParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}
		}

		matched = ctx.choice([
			// unicode emoji
			unicodeEmojiMatcher,
			// https://example.com
			urlMatcher,
			// abc [search]
			searchMatcher,
		]);
		if (matched.ok) {
			ctx.depth--;
			return matched;
		}

		ctx.depth--;
	}

	// text node
	if (ctx.debug) console.log(`${ctx.pos}\tmatch text`);
	return ctx.anyChar();
};

export const inlineParser: Parser<MfmInline | string> = (ctx) => {
	let matched;

	// check EOF
	if (ctx.eof()) {
		return ctx.fail();
	}

	if (ctx.depth < ctx.nestLimit) {
		ctx.depth++;

		// have some links in parent matchers
		const inLink = ctx.stack.find(m => m.name === 'link') != null;

		switch (ctx.input.charCodeAt(ctx.pos)) {

			case CharCode.asterisk: {
				matched = ctx.choice([
					// ***big***
					bigMatcher,
					// **bold**
					boldAstaParser,
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
				matched = ctx.parser(fnParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.question: {
				if (!inLink) {
					// ?[silent link]()
					matched = ctx.parser(silentLinkMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
				}
				break;
			}

			case CharCode.lessThan: {
				matched = ctx.choice([
					// <s>
					strikeTagMatcher,
					// <i>
					italicTagMatcher,
					// <b>
					boldTagParser,
					// <small>
					smallTagMatcher,
				]);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				if (!inLink) {
					// <https://example.com>
					matched = ctx.parser(urlAltMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
				}
				break;
			}

			case CharCode.openBracket: {
				if (!inLink) {
					// [link]()
					matched = ctx.parser(linkMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
				}
				break;
			}

			case CharCode.backtick: {
				// `inline code`
				matched = ctx.parser(inlineCodeParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.backslash: {
				// \(math inline\)
				matched = ctx.parser(mathInlineMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.tilde: {
				// ~~strike~~
				matched = ctx.parser(strikeTildeMatcher);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.colon: {
				// :emojiCode:
				matched = ctx.parser(emojiCodeParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.underscore: {
				matched = ctx.choice([
					// __bold__
					boldUnderParser,
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
				if (!inLink) {
					// @mention
					matched = ctx.parser(mentionMatcher);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
				}
				break;
			}

			case CharCode.hash: {
				// #hashtag
				matched = ctx.parser(hashtagParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}
		}

		// unicode emoji
		matched = ctx.parser(unicodeEmojiMatcher);
		if (matched.ok) {
			ctx.depth--;
			return matched;
		}
		if (!inLink) {
			// https://example.com
			matched = ctx.parser(urlMatcher);
			if (matched.ok) {
				ctx.depth--;
				return matched;
			}
		}

		ctx.depth--;
	}

	// text node
	if (ctx.debug) console.log(`${ctx.pos}\tmatch text`);
	return ctx.anyChar();
};

export const plainParser: Parser<MfmPlainNode | string> = (ctx) => {
	// check EOF
	if (ctx.eof()) {
		return ctx.fail();
	}

	const matched = ctx.choice([
		// :emojiCode:
		emojiCodeParser,
		// unicode emoji
		unicodeEmojiMatcher,
	]);
	if (matched.ok) {
		return matched;
	}

	// text node
	if (ctx.debug) console.log(`${ctx.pos}\tmatch text`);
	return ctx.anyChar();
};
