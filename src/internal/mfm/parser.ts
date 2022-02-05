import { MfmInline, MfmNode, MfmPlainNode } from '../../node';
import { ParserContext, Result } from '../services/parser';
import { CharCode } from '../services/character';

import { bigParser } from './syntax/big';
import { boldAstaParser, boldUnderParser, boldTagParser } from './syntax/bold';
import { centerTagParser } from './syntax/center';
import { emojiCodeParser } from './syntax/emojiCode';
import { fnParser } from './syntax/fn';
import { hashtagParser } from './syntax/hashtag';
import { inlineCodeParser } from './syntax/inlineCode';
import { italicAstaParser, italicTagParser, italicUnderParser } from './syntax/italic';
import { linkParser } from './syntax/link';
import { mathInlineParser } from './syntax/mathInline';
import { mentionParser } from './syntax/mention';
import { searchParser } from './syntax/search';
import { smallTagParser } from './syntax/small';
import { strikeTagParser, strikeTildeParser } from './syntax/strike';
import { unicodeEmojiParser } from './syntax/unicodeEmoji';
import { urlAltParser, urlParser } from './syntax/url';

// NOTE: MfmParser は、対象となる全ての構文とマッチを試行し、マッチした場合はその構文のノードを生成、
// いずれの構文にもマッチしなかった場合は長さ1のstring型のノードを生成します。
//
// 通常は、範囲内のMFM文字列を処理するために MfmParser が繰り返し呼び出されるため、構文にマッチしなかった
// 部分は複数のstring型ノードになります。 pushNode を使用すると、通常の構文ノードはツリーに追加し
// 連続するstring型ノードは1つのtextノードとして連結してツリーに追加できます。

// NOTE:
// リンクラベル部分はinlineParserが適用されます。
// inlineParserに含まれる構文でネストされた部分はinlineParserが適用されることが分かっており、
// リンクラベル部分以外のマッチではlinkLabelが常にfalseであることが分かっているため、
// inlineParserでのみlinkLabelの判定をすれば良いと分かります。

export function fullParser(ctx: ParserContext): Result<MfmNode | string | null> {
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
					bigParser,
					// **bold**
					boldAstaParser,
					// *italic*
					italicAstaParser,
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
				matched = ctx.parser(linkParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.lessThan: {
				matched = ctx.choice([
					// <s>
					strikeTagParser,
					// <i>
					italicTagParser,
					// <b>
					boldTagParser,
					// <small>
					smallTagParser,
					// <center>
					centerTagParser,
					// <https://example.com>
					urlAltParser,
				]);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.greaterThan: {
				// > quote
				// quoteParser
				break;
			}

			case CharCode.openBracket: {
				// [link]()
				matched = ctx.parser(linkParser);
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
				matched = ctx.parser(mathInlineParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}

				// \[math block\]
				//mathBlockParser;
				break;
			}

			case CharCode.tilde: {
				// ~~strike~~
				matched = ctx.parser(strikeTildeParser);
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
					italicUnderParser,
				]);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.at: {
				// @mention
				matched = ctx.parser(mentionParser);
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
			unicodeEmojiParser,
			// https://example.com
			urlParser,
			// abc [search]
			searchParser,
		]);
		if (matched.ok) {
			ctx.depth--;
			return matched;
		}

		ctx.depth--;
	}

	// consume LF before block syntaxes
	matched = ctx.matchSequence([
		() => ctx.regex(/^(\r\n|[\r\n])/),
		centerTagParser,
	]);
	if (matched) {
		ctx.regex(/^(\r\n|[\r\n])/); // ignore LF
		return ctx.ok(null);
	}

	// text node (LF or any char)
	matched = ctx.regex(/^(\r\n|[\r\n])/);
	if (matched.ok) {
		return ctx.ok(matched.result[0]);
	}
	return ctx.anyChar();
}

export function inlineParser(ctx: ParserContext): Result<MfmInline | string> {
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
					bigParser,
					// **bold**
					boldAstaParser,
					// *italic*
					italicAstaParser,
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
				if (!ctx.inLink) {
					// ?[silent link]()
					matched = ctx.parser(linkParser);
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
					strikeTagParser,
					// <i>
					italicTagParser,
					// <b>
					boldTagParser,
					// <small>
					smallTagParser,
				]);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				if (!ctx.inLink) {
					// <https://example.com>
					matched = ctx.parser(urlAltParser);
					if (matched.ok) {
						ctx.depth--;
						return matched;
					}
				}
				break;
			}

			case CharCode.openBracket: {
				if (!ctx.inLink) {
					// [link]()
					matched = ctx.parser(linkParser);
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
				matched = ctx.parser(mathInlineParser);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.tilde: {
				// ~~strike~~
				matched = ctx.parser(strikeTildeParser);
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
					italicUnderParser,
				]);
				if (matched.ok) {
					ctx.depth--;
					return matched;
				}
				break;
			}

			case CharCode.at: {
				if (!ctx.inLink) {
					// @mention
					matched = ctx.parser(mentionParser);
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
		matched = ctx.parser(unicodeEmojiParser);
		if (matched.ok) {
			ctx.depth--;
			return matched;
		}
		if (!ctx.inLink) {
			// https://example.com
			matched = ctx.parser(urlParser);
			if (matched.ok) {
				ctx.depth--;
				return matched;
			}
		}

		ctx.depth--;
	}

	// text node (LF or any char)
	matched = ctx.regex(/^(\r\n|[\r\n])/);
	if (matched.ok) {
		return ctx.ok(matched.result[0]);
	}
	return ctx.anyChar();
}

export function plainParser(ctx: ParserContext): Result<MfmPlainNode | string> {
	let matched;

	// check EOF
	if (ctx.eof()) {
		return ctx.fail();
	}

	matched = ctx.choice([
		// :emojiCode:
		emojiCodeParser,
		// unicode emoji
		unicodeEmojiParser,
	]);
	if (matched.ok) {
		return matched;
	}

	// text node (LF or any char)
	matched = ctx.regex(/^(\r\n|[\r\n])/);
	if (matched.ok) {
		return ctx.ok(matched.result[0]);
	}
	return ctx.anyChar();
}
