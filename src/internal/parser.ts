import twemojiRegex from 'twemoji-parser/dist/lib/regex';
import * as M from '..';
import * as P from './core';
import { mergeText } from './util';

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

function nest<T>(parser: P.Parser<T>, fallback?: P.Parser<string>) {
	return new P.Parser<T | string>((input, index, state) => {
		// nesting limited? -> No: specified parser, Yes: fallback parser (default = P.any)
		if (state.depth + 1 >= state.nestLimit) {
			if (fallback == null) fallback = P.any;
			return fallback.handler(input, index, state);
		} else {
			state.depth++;
			const result = parser.handler(input, index, state);
			state.depth--;
			return result;
		}
	});
}

const notLinkLabel = new P.Parser((input, index, state) => {
	return (state.linkLabel) ? P.failure() : P.success(index, null);
});

export const language = P.createLanguage({
	fullParser: r => {
		return r.full.atLeast(0);
	},

	simpleParser: r => {
		return r.simple.atLeast(0);
	},

	full: r => {
		return P.alt([
			// r.quote,        // ">" block
			r.codeBlock,    // "```" block
			r.mathBlock,    // "\\[" block
			r.centerTag,    // "<center>" block
			r.unicodeEmoji, // Regexp
			r.fn,           // "$[""
			r.big,          // "***"
			r.boldAsta,     // "**"
			r.italicAsta,   // "*"
			r.boldUnder,    // "__"
			r.italicUnder,  // "_"
			r.strikeWave,   // "~~"
			r.smallTag,     // "<small>"
			r.plainTag,     // "<plain>"
			r.boldTag,      // "<b>"
			r.italicTag,    // "<i>"
			r.strikeTag,    // "<s>"
			r.inlineCode,   // "`"
			r.mathInline,   // "\\("
			r.mention,      // "@"
			r.hashtag,      // "#"
			r.emojiCode,    // ":"
			r.link,         // "?[" or "["
			r.urlAlt,       // <http
			r.url,          // http
			r.search,       // block
			r.text,
		]);
	},

	simple: r => {
		return P.alt([
			r.unicodeEmoji, // Regexp
			r.emojiCode,    // ":"
			r.text,
		]);
	},

	inline: r => {
		return P.alt([
			r.unicodeEmoji, // Regexp
			r.fn,           // "$[""
			r.big,          // "***"
			r.boldAsta,     // "**"
			r.italicAsta,   // "*"
			r.boldUnder,    // "__"
			r.italicUnder,  // "_"
			r.strikeWave,   // "~~"
			r.smallTag,     // "<small>"
			r.plainTag,     // "<plain>"
			r.boldTag,      // "<b>"
			r.italicTag,    // "<i>"
			r.strikeTag,    // "<s>"
			r.inlineCode,   // "`"
			r.mathInline,   // "\\("
			r.mention,      // "@"
			r.hashtag,      // "#"
			r.emojiCode,    // ":"
			r.link,         // "?[" or "["
			r.urlAlt,       // <http
			r.url,          // http
			r.text,
		]);
	},

	codeBlock: r => {
		const mark = P.str('```');
		return P.seq([
			P.alt([newLine, P.lineBegin]),
			mark,
			P.seq([P.notMatch(newLine), P.any], 1).atLeast(0),
			newLine,
			P.seq([P.notMatch(P.seq([newLine, mark, P.alt([newLine, P.lineEnd])])), P.any], 1).atLeast(1),
			newLine,
			mark,
			P.alt([newLine, P.lineEnd]),
		]).map(result => {
			const lang = (result[2] as string[]).join('').trim();
			const code = (result[4] as string[]).join('');
			return M.CODE_BLOCK(code, (lang.length > 0 ? lang : null));
		});
	},

	mathBlock: r => {
		const open = P.str('\\[');
		const close = P.str('\\]');
		return P.seq([
			P.alt([newLine, P.lineBegin]),
			open,
			P.option(newLine),
			P.seq([P.notMatch(P.seq([P.option(newLine), close])), P.any], 1).atLeast(1),
			P.option(newLine),
			close,
			P.alt([newLine, P.lineEnd]),
		]).map(result => {
			const formula = (result[3] as string[]).join('');
			return M.MATH_BLOCK(formula);
		});
	},

	centerTag: r => {
		const open = P.str('<center>');
		const close = P.str('</center>');
		return P.seq([
			P.alt([newLine, P.lineBegin]),
			open,
			P.option(newLine),
			P.seq([P.notMatch(P.seq([P.option(newLine), close])), nest(r.inline)], 1).atLeast(1),
			P.option(newLine),
			close,
			P.alt([newLine, P.lineEnd]),
		]).map(result => {
			return M.CENTER(mergeText(result[3]));
		});
	},

	big: r => {
		const mark = P.str('***');
		return seqOrText([
			mark,
			P.seq([P.notMatch(mark), nest(r.inline)], 1).atLeast(1),
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
			P.seq([P.notMatch(mark), nest(r.inline)], 1).atLeast(1),
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
			P.seq([P.notMatch(close), nest(r.inline)], 1).atLeast(1),
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
			P.alt([alphaAndNum, space]).atLeast(1),
			mark,
		]).map(result => M.BOLD(mergeText(result[1] as string[])));
	},

	smallTag: r => {
		const open = P.str('<small>');
		const close = P.str('</small>');
		return seqOrText([
			open,
			P.seq([P.notMatch(close), nest(r.inline)], 1).atLeast(1),
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
			P.seq([P.notMatch(close), nest(r.inline)], 1).atLeast(1),
			close,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.ITALIC(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	italicAsta: r => {
		// TODO: check before and after
		const mark = P.str('*');
		return P.seq([
			mark,
			P.alt([alphaAndNum, space]).atLeast(1),
			mark,
		]).map(result => M.ITALIC(mergeText(result[1] as string[])));
	},

	italicUnder: r => {
		// TODO: check before and after
		const mark = P.str('_');
		return P.seq([
			mark,
			P.alt([alphaAndNum, space]).atLeast(1),
			mark,
		]).map(result => M.ITALIC(mergeText(result[1] as string[])));
	},

	strikeTag: r => {
		const open = P.str('<s>');
		const close = P.str('</s>');
		return seqOrText([
			open,
			P.seq([P.notMatch(close), nest(r.inline)], 1).atLeast(1),
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
			P.seq([P.notMatch(P.alt([mark, newLine])), nest(r.inline)], 1).atLeast(1),
			mark,
		]).map(result => {
			if (typeof result === 'string') return result;
			return M.STRIKE(mergeText(result[1] as (M.MfmInline | string)[]));
		});
	},

	unicodeEmoji: r => {
		const emoji = RegExp(twemojiRegex.source);
		return P.regexp(emoji).map(content => M.UNI_EMOJI(content));
	},

	plainTag: r => {
		// plainTag = open NewLine? (!(NewLine? close) .)+ NewLine? close
		const open = P.str('<plain>');
		const close = P.str('</plain>');
		return P.seq([
			open,
			P.option(newLine),
			P.seq([
				P.notMatch(P.seq([P.option(newLine), close])),
				P.any,
			], 1).atLeast(1),
			P.option(newLine),
			close,
		]).map(result => M.PLAIN(result[2].join('')));
	},

	fn: r => {
		const fnName = new P.Parser((input, index, state) => {
			const result = P.regexp(/[a-z0-9_]+/i).handler(input, index, state);
			if (!result.success) {
				return result;
			}
			if (state.fnNameList != null && !state.fnNameList.includes(result.value)) {
				return P.failure();
			}
			return P.success(result.index, result.value);
		});
		const arg: P.Parser<ArgPair> = P.seq([
			P.regexp(/[a-z0-9_]+/i),
			P.option(P.seq([
				P.str('='),
				P.regexp(/[a-z0-9_.]+/i),
			], 1)),
		]).map(result => {
			return {
				k: result[0],
				v: (result[1] != null) ? result[1] : true,
			};
		});
		const args = P.seq([
			P.str('.'),
			arg.sep1(P.str(',')),
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
			P.option(args),
			P.str(' '),
			P.seq([P.notMatch(fnClose), nest(r.inline)], 1).atLeast(1),
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
				P.any,
			], 1).atLeast(1),
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
				P.any,
			], 1).atLeast(1),
			close,
		]).map(result => M.MATH_INLINE(result[1].join('')));
	},

	mention: r => {
		// TODO: check deatail
		return P.seq([
			notLinkLabel,
			P.str('@'),
			P.regexp(/[a-z0-9_-]+/i),
			P.option(P.seq([
				P.str('@'),
				P.regexp(/[a-z0-9_.-]+/i),
			], 1)),
		]).map(result => {
			const name = result[2];
			const host = result[3];
			const acct = host != null ? `@${name}@${host}` : `@${name}`;
			return M.MENTION(name, host, acct);
		});
	},

	hashtag: r => {
		// TODO: check deatail
		// TODO: bracket pair
		const mark = P.str('#');
		return P.seq([
			notLinkLabel,
			mark,
			P.seq([
				P.notMatch(P.alt([P.regexp(/[ \u3000\t.,!?'"#:/[\]【】()「」（）<>]/), space, newLine])),
				P.any,
			], 1).atLeast(1),
		], 2).map(value => M.HASHTAG(value.join('')));
	},

	emojiCode: r => {
		const mark = P.str(':');
		return P.seq([
			mark,
			P.regexp(/[a-z0-9_+-]+/i),
			mark,
		], 1).map(name => M.EMOJI_CODE(name as string));
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
			], 1).atLeast(1),
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
				P.str('('), nest(innerItem, urlChar).atLeast(0), P.str(')'),
			]),
			P.seq([
				P.str('['), nest(innerItem, urlChar).atLeast(0), P.str(']'),
			]),
			urlChar,
		]));
		const parser = P.seq([
			notLinkLabel,
			P.regexp(/https?:\/\//),
			innerItem.atLeast(1),
		]).text();
		return new P.Parser((input, index, state) => {
			// TODO: check ".,"
			const result = parser.handler(input, index, state);
			if (!result.success) {
				return P.failure();
			}
			return P.success(result.index, M.N_URL(result.value, false));
		});
	},

	urlAlt: r => {
		const open = P.str('<');
		const close = P.str('>');
		const parser = P.seq([
			notLinkLabel,
			open,
			P.regexp(/https?:\/\//),
			P.seq([P.notMatch(P.alt([close, space])), P.any], 1).atLeast(1),
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
			P.alt([newLine, P.lineBegin]),
			P.seq([
				P.notMatch(P.alt([
					newLine,
					P.seq([space, button, P.alt([newLine, P.lineEnd])]),
				])),
				P.any,
			], 1).atLeast(1),
			space,
			button,
			P.alt([newLine, P.lineEnd]),
		]).map(result => {
			const query = result[1].join('');
			return M.SEARCH(query, `${query}${result[2]}${result[3]}`);
		});
	},

	text: r => P.any,
});
