import * as M from '..';
import * as P from './core';
import { mergeText } from './util';

// NOTE:
// tsdのテストでファイルを追加しているにも関わらず「@twemoji/parser/dist/lib/regex」の型定義ファイルがないとエラーが出るため、
// このエラーを無視する。
/* eslint @typescript-eslint/ban-ts-comment: 1 */
// @ts-ignore
import twemojiRegex from '@twemoji/parser/dist/lib/regex';

type ArgPair = { k: string, v: string | true };
type Args = Record<string, string | true>;

const space = P.regexp(/[\u0020\u3000\t]/);
const alphaAndNum = P.regexp(/[a-z0-9]/i);
const newLine = P.alt([P.crlf, P.cr, P.lf]);

function seqOrText(parsers: P.Parser<any>[]): P.Parser<any[] | string> {
	return new P.Parser<any[] | string>((input, index, state) => {
		const accum: any[] = [];
		let latestIndex = index;
		for (let i = 0 ; i < parsers.length; i++) {
			const result = parsers[i].handler(input, latestIndex, state);
			if (!result.success) {
				if (latestIndex === index) {
					return P.failure();
				} else {
					return P.success(latestIndex, input.slice(index, latestIndex));
				}
			}
			accum.push(result.value);
			latestIndex = result.index;
		}
		return P.success(latestIndex, accum);
	});
}

const notLinkLabel = new P.Parser((_input, index, state) => {
	return (!state.linkLabel)
		? P.success(index, null)
		: P.failure();
});

const nestable = new P.Parser((_input, index, state) => {
	return (state.depth < state.nestLimit)
		? P.success(index, null)
		: P.failure();
});

function nest<T>(parser: P.Parser<T>, fallback?: P.Parser<string>): P.Parser<T | string> {
	// nesting limited? -> No: specified parser, Yes: fallback parser (default = P.char)
	const inner = P.alt([
		P.seq([nestable, parser], 1),
		(fallback != null) ? fallback : P.char,
	]);
	return new P.Parser<T | string>((input, index, state) => {
		state.depth++;
		const result = inner.handler(input, index, state);
		state.depth--;
		return result;
	});
}

export const language = P.createLanguage({
	fullParser: r => {
		return r.full.many(0);
	},

	simpleParser: r => {
		return r.simple.many(0);
	},

	full: r => {
		return P.alt([
			// Regexp
			r.unicodeEmoji,
			// "<center>" block
			r.centerTag,
			// "<small>"
			r.smallTag,
			// "<plain>"
			r.plainTag,
			// "<b>"
			r.boldTag,
			// "<i>"
			r.italicTag,
			// "<s>"
			r.strikeTag,
			// "<http"
			r.urlAlt,
			// "***"
			r.big,
			// "**"
			r.boldAsta,
			// "*"
			r.italicAsta,
			// "__"
			r.boldUnder,
			// "_"
			r.italicUnder,
			// "```" block
			r.codeBlock,
			// "`"
			r.inlineCode,
			// ">" block
			r.quote,
			// "\\[" block
			r.mathBlock,
			// "\\("
			r.mathInline,
			// "~~"
			r.strikeWave,
			// "$[""
			r.fn,
			// "@"
			r.mention,
			// "#"
			r.hashtag,
			// ":"
			r.emojiCode,
			// "?[" or "["
			r.link,
			// http
			r.url,
			// block
			r.search,
			r.text,
		]);
	},

	simple: r => {
		return P.alt([
			r.unicodeEmoji, // Regexp
			r.emojiCode, // ":"
			r.text,
		]);
	},

	inline: r => {
		return P.alt([
			// Regexp
			r.unicodeEmoji,
			// "<small>"
			r.smallTag,
			// "<plain>"
			r.plainTag,
			// "<b>"
			r.boldTag,
			// "<i>"
			r.italicTag,
			// "<s>"
			r.strikeTag,
			// <http
			r.urlAlt,
			// "***"
			r.big,
			// "**"
			r.boldAsta,
			// "*"
			r.italicAsta,
			// "__"
			r.boldUnder,
			// "_"
			r.italicUnder,
			// "`"
			r.inlineCode,
			// "\\("
			r.mathInline,
			// "~~"
			r.strikeWave,
			// "$[""
			r.fn,
			// "@"
			r.mention,
			// "#"
			r.hashtag,
			// ":"
			r.emojiCode,
			// "?[" or "["
			r.link,
			// http
			r.url,
			r.text,
		]);
	},

	quote: r => {
		const lines: P.Parser<string[]> = P.seq([
			P.str('>'),
			space.option(),
			P.seq([P.notMatch(newLine), P.char], 1).many(0).text(),
		], 2).sep(newLine, 1);
		const parser = P.seq([
			newLine.option(),
			newLine.option(),
			P.lineBegin,
			lines,
			newLine.option(),
			newLine.option(),
		], 3);
		return new P.Parser((input, index, state) => {
			let result;
			// parse quote
			result = parser.handler(input, index, state);
			if (!result.success) {
				return result;
			}
			const contents = result.value;
			const quoteIndex = result.index;
			// disallow empty content if single line
			if (contents.length === 1 && contents[0].length === 0) {
				return P.failure();
			}
			// parse inner content
			const contentParser = nest(r.fullParser).many(0);
			result = contentParser.handler(contents.join('\n'), 0, state);
			if (!result.success) {
				return result;
			}
			return P.success(quoteIndex, M.QUOTE(mergeText(result.value)));
		});
	},

	codeBlock: r => {
		const mark = P.str('```');
		return P.seq([
			newLine.option(),
			P.lineBegin,
			mark,
			P.seq([P.notMatch(newLine), P.char], 1).many(0),
			newLine,
			P.seq([P.notMatch(P.seq([newLine, mark, P.lineEnd])), P.char], 1).many(1),
			newLine,
			mark,
			P.lineEnd,
			newLine.option(),
		]).map(result => {
			const lang = (result[3] as string[]).join('').trim();
			const code = (result[5] as string[]).join('');
			return M.CODE_BLOCK(code, (lang.length > 0 ? lang : null));
		});
	},

	mathBlock: r => {
		const open = P.str('\\[');
		const close = P.str('\\]');
		return P.seq([
			newLine.option(),
			P.lineBegin,
			open,
			newLine.option(),
			P.seq([P.notMatch(P.seq([newLine.option(), close])), P.char], 1).many(1),
			newLine.option(),
			close,
			P.lineEnd,
			newLine.option(),
		]).map(result => {
			const formula = (result[4] as string[]).join('');
			return M.MATH_BLOCK(formula);
		});
	},

	centerTag: r => {
		const open = P.str('<center>');
		const close = P.str('</center>');
		return P.seq([
			newLine.option(),
			P.lineBegin,
			open,
			newLine.option(),
			P.seq([P.notMatch(P.seq([newLine.option(), close])), nest(r.inline)], 1).many(1),
			newLine.option(),
			close,
			P.lineEnd,
			newLine.option(),
		]).map(result => {
			return M.CENTER(mergeText(result[4]));
		});
	},

	big: r => {
		const mark = P.str('***');
		return seqOrText([
			mark,
			P.seq([P.notMatch(mark), nest(r.inline)], 1).many(1),
			mark,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.FN('tada', {}, mergeText(result[1]));
		});
	},

	boldAsta: r => {
		const mark = P.str('**');
		return seqOrText([
			mark,
			P.seq([P.notMatch(mark), nest(r.inline)], 1).many(1),
			mark,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.BOLD(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	boldTag: r => {
		const open = P.str('<b>');
		const close = P.str('</b>');
		return seqOrText([
			open,
			P.seq([P.notMatch(close), nest(r.inline)], 1).many(1),
			close,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.BOLD(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	boldUnder: r => {
		const mark = P.str('__');
		return P.seq([
			mark,
			P.alt([alphaAndNum, space]).many(1),
			mark,
		]).map(result => M.BOLD(mergeText(result[1] as string[])));
	},

	smallTag: r => {
		const open = P.str('<small>');
		const close = P.str('</small>');
		return seqOrText([
			open,
			P.seq([P.notMatch(close), nest(r.inline)], 1).many(1),
			close,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.SMALL(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	italicTag: r => {
		const open = P.str('<i>');
		const close = P.str('</i>');
		return seqOrText([
			open,
			P.seq([P.notMatch(close), nest(r.inline)], 1).many(1),
			close,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.ITALIC(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	italicAsta: r => {
		const mark = P.str('*');
		const parser = P.seq([
			mark,
			P.alt([alphaAndNum, space]).many(1),
			mark,
		]);
		return new P.Parser((input, index, state) => {
			const result = parser.handler(input, index, state);
			if (!result.success) {
				return P.failure();
			}
			// check before
			const beforeStr = input.slice(0, index);
			if (/[a-z0-9]$/i.test(beforeStr)) {
				return P.failure();
			}
			return P.success(result.index, M.ITALIC(mergeText(result.value[1] as string[])));
		});
	},

	italicUnder: r => {
		const mark = P.str('_');
		const parser = P.seq([
			mark,
			P.alt([alphaAndNum, space]).many(1),
			mark,
		]);
		return new P.Parser((input, index, state) => {
			const result = parser.handler(input, index, state);
			if (!result.success) {
				return P.failure();
			}
			// check before
			const beforeStr = input.slice(0, index);
			if (/[a-z0-9]$/i.test(beforeStr)) {
				return P.failure();
			}
			return P.success(result.index, M.ITALIC(mergeText(result.value[1] as string[])));
		});
	},

	strikeTag: r => {
		const open = P.str('<s>');
		const close = P.str('</s>');
		return seqOrText([
			open,
			P.seq([P.notMatch(close), nest(r.inline)], 1).many(1),
			close,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.STRIKE(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	strikeWave: r => {
		const mark = P.str('~~');
		return seqOrText([
			mark,
			P.seq([P.notMatch(P.alt([mark, newLine])), nest(r.inline)], 1).many(1),
			mark,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.STRIKE(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	unicodeEmoji: r => {
		const emoji = RegExp(twemojiRegex.source);
		return P.regexp(emoji).map(content => {
			// 異体字セレクタのみの場合は空文字として返す
			return /^[\uFE00-\uFE0F]+$/u.test(content) ? M.TEXT('') : M.UNI_EMOJI(content);
		});
	},

	plainTag: r => {
		const open = P.str('<plain>');
		const close = P.str('</plain>');
		return P.seq([
			open,
			newLine.option(),
			P.seq([
				P.notMatch(P.seq([newLine.option(), close])),
				P.char,
			], 1).many(1).text(),
			newLine.option(),
			close,
		], 2).map(result => M.PLAIN(result));
	},

	fn: r => {
		const fnName = new P.Parser((input, index, state) => {
			const result = P.regexp(/[a-z0-9_]+/i).handler(input, index, state);
			if (!result.success) {
				return result;
			}
			return P.success(result.index, result.value);
		});
		const arg: P.Parser<ArgPair> = P.seq([
			P.regexp(/[a-z0-9_]+/i),
			P.seq([
				P.str('='),
				P.regexp(/[a-z0-9_.-]+/i),
			], 1).option(),
		]).map(result => {
			return {
				k: result[0],
				v: (result[1] != null) ? result[1] : true,
			};
		});
		const args = P.seq([
			P.str('.'),
			arg.sep(P.str(','), 1),
		], 1).map(pairs => {
			const result: Args = { };
			for (const pair of pairs) {
				result[pair.k] = pair.v;
			}
			return result;
		});
		const fnClose = P.str(']');
		return seqOrText([
			P.str('$['),
			fnName,
			args.option(),
			P.str(' '),
			P.seq([P.notMatch(fnClose), nest(r.inline)], 1).many(1),
			fnClose,
		]).map(result => {
			if (typeof result === 'string') return result;
			const name = result[1];
			const args = result[2] || {};
			const content = result[4];
			return M.FN(name, args, mergeText(content));
		});
	},

	inlineCode: r => {
		const mark = P.str('`');
		return P.seq([
			mark,
			P.seq([
				P.notMatch(P.alt([mark, P.str('´'), newLine])),
				P.char,
			], 1).many(1),
			mark,
		]).map(result => M.INLINE_CODE(result[1].join('')));
	},

	mathInline: r => {
		const open = P.str('\\(');
		const close = P.str('\\)');
		return P.seq([
			open,
			P.seq([
				P.notMatch(P.alt([close, newLine])),
				P.char,
			], 1).many(1),
			close,
		]).map(result => M.MATH_INLINE(result[1].join('')));
	},

	mention: r => {
		const parser = P.seq([
			notLinkLabel,
			P.str('@'),
			P.regexp(/[a-z0-9_-]+/i),
			P.seq([
				P.str('@'),
				P.regexp(/[a-z0-9_.-]+/i),
			], 1).option(),
		]);
		return new P.Parser<M.MfmMention | string>((input, index, state) => {
			let result;
			result = parser.handler(input, index, state);
			if (!result.success) {
				return P.failure();
			}
			// check before (not mention)
			const beforeStr = input.slice(0, index);
			if (/[a-z0-9]$/i.test(beforeStr)) {
				return P.failure();
			}
			let invalidMention = false;
			const resultIndex = result.index;
			const username: string = result.value[2];
			const hostname: string | null = result.value[3];
			// remove [.-] of tail of hostname
			let modifiedHost = hostname;
			if (hostname != null) {
				result = /[.-]+$/.exec(hostname);
				if (result != null) {
					modifiedHost = hostname.slice(0, (-1 * result[0].length));
					if (modifiedHost.length === 0) {
						// disallow invalid char only hostname
						invalidMention = true;
						modifiedHost = null;
					}
				}
			}
			// remove "-" of tail of username
			let modifiedName = username;
			result = /-+$/.exec(username);
			if (result != null) {
				if (modifiedHost == null) {
					modifiedName = username.slice(0, (-1 * result[0].length));
				} else {
					// cannnot to remove tail of username if exist hostname
					invalidMention = true;
				}
			}
			// disallow "-" of head of username
			if (modifiedName.length === 0 || modifiedName[0] === '-') {
				invalidMention = true;
			}
			// disallow [.-] of head of hostname
			if (modifiedHost != null && /^[.-]/.test(modifiedHost)) {
				invalidMention = true;
			}
			// generate a text if mention is invalid
			if (invalidMention) {
				return P.success(resultIndex, input.slice(index, resultIndex));
			}
			const acct = modifiedHost != null ? `@${modifiedName}@${modifiedHost}` : `@${modifiedName}`;
			return P.success(index + acct.length, M.MENTION(modifiedName, modifiedHost, acct));
		});
	},

	hashtag: r => {
		const mark = P.str('#');
		const hashTagChar = P.seq([
			P.notMatch(P.alt([P.regexp(/[ \u3000\t.,!?'"#:/[\]【】()「」（）<>]/), space, newLine])),
			P.char,
		], 1);
		const innerItem: P.Parser<any> = P.lazy(() => P.alt([
			P.seq([
				P.str('('), nest(innerItem, hashTagChar).many(0), P.str(')'),
			]),
			P.seq([
				P.str('['), nest(innerItem, hashTagChar).many(0), P.str(']'),
			]),
			P.seq([
				P.str('「'), nest(innerItem, hashTagChar).many(0), P.str('」'),
			]),
			P.seq([
				P.str('（'), nest(innerItem, hashTagChar).many(0), P.str('）'),
			]),
			hashTagChar,
		]));
		const parser = P.seq([
			notLinkLabel,
			mark,
			innerItem.many(1).text(),
		], 2);
		return new P.Parser((input, index, state) => {
			const result = parser.handler(input, index, state);
			if (!result.success) {
				return P.failure();
			}
			// check before
			const beforeStr = input.slice(0, index);
			if (/[a-z0-9]$/i.test(beforeStr)) {
				return P.failure();
			}
			const resultIndex = result.index;
			const resultValue = result.value;
			// disallow number only
			if (/^[0-9]+$/.test(resultValue)) {
				return P.failure();
			}
			return P.success(resultIndex, M.HASHTAG(resultValue));
		});
	},

	emojiCode: r => {
		const side = P.notMatch(P.regexp(/[a-z0-9]/i));
		const mark = P.str(':');
		return P.seq([
			P.alt([P.lineBegin, side]),
			mark,
			P.regexp(/[a-z0-9_+-]+/i),
			mark,
			P.alt([P.lineEnd, side]),
		], 2).map(name => M.EMOJI_CODE(name as string));
	},

	link: r => {
		const labelInline = new P.Parser((input, index, state) => {
			state.linkLabel = true;
			const result = r.inline.handler(input, index, state);
			state.linkLabel = false;
			return result;
		});
		const closeLabel = P.str(']');
		return P.seq([
			notLinkLabel,
			P.alt([P.str('?['), P.str('[')]),
			P.seq([
				P.notMatch(P.alt([closeLabel, newLine])),
				nest(labelInline),
			], 1).many(1),
			closeLabel,
			P.str('('),
			P.alt([r.urlAlt, r.url]),
			P.str(')'),
		]).map(result => {
			const silent = (result[1] === '?[');
			const label = result[2];
			const url: M.MfmUrl = result[5];
			return M.LINK(silent, url.props.url, mergeText(label));
		});
	},

	url: r => {
		const urlChar = P.regexp(/[.,a-z0-9_/:%#@$&?!~=+-]/i);
		const innerItem: P.Parser<any> = P.lazy(() => P.alt([
			P.seq([
				P.str('('), nest(innerItem, urlChar).many(0), P.str(')'),
			]),
			P.seq([
				P.str('['), nest(innerItem, urlChar).many(0), P.str(']'),
			]),
			urlChar,
		]));
		const parser = P.seq([
			notLinkLabel,
			P.regexp(/https?:\/\//),
			innerItem.many(1).text(),
		]);
		return new P.Parser<M.MfmUrl | string>((input, index, state) => {
			let result;
			result = parser.handler(input, index, state);
			if (!result.success) {
				return P.failure();
			}
			const resultIndex = result.index;
			let modifiedIndex = resultIndex;
			const schema: string = result.value[1];
			let content: string = result.value[2];
			// remove the ".," at the right end
			result = /[.,]+$/.exec(content);
			if (result != null) {
				modifiedIndex -= result[0].length;
				content = content.slice(0, (-1 * result[0].length));
				if (content.length === 0) {
					return P.success(resultIndex, input.slice(index, resultIndex));
				}
			}
			return P.success(modifiedIndex, M.N_URL(schema + content, false));
		});
	},

	urlAlt: r => {
		const open = P.str('<');
		const close = P.str('>');
		const parser = P.seq([
			notLinkLabel,
			open,
			P.regexp(/https?:\/\//),
			P.seq([P.notMatch(P.alt([close, space])), P.char], 1).many(1),
			close,
		]).text();
		return new P.Parser((input, index, state) => {
			const result = parser.handler(input, index, state);
			if (!result.success) {
				return P.failure();
			}
			const text = result.value.slice(1, (result.value.length - 1));
			return P.success(result.index, M.N_URL(text, true));
		});
	},

	search: r => {
		const button = P.alt([
			P.regexp(/\[(検索|search)\]/i),
			P.regexp(/(検索|search)/i),
		]);
		return P.seq([
			newLine.option(),
			P.lineBegin,
			P.seq([
				P.notMatch(P.alt([
					newLine,
					P.seq([space, button, P.lineEnd]),
				])),
				P.char,
			], 1).many(1),
			space,
			button,
			P.lineEnd,
			newLine.option(),
		]).map(result => {
			const query = result[2].join('');
			return M.SEARCH(query, `${query}${result[3]}${result[4]}`);
		});
	},

	text: r => P.char,
});
