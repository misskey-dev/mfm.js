import * as M from '..';
import twemojiRegex from 'twemoji-parser/dist/lib/regex';
import * as P from './core';
import { mergeText } from './util';

const space = P.regexp(/[\u0020\u3000\t]/);
const alphaAndNum = P.regexp(/[a-z0-9]/i);
const LF = P.alt([P.str('\r\n'), P.str('\r'), P.str('\n')]);

function nest<T>(parser: P.Parser<T>): P.Parser<T> {
	return new P.Parser((input, index, state) => {
		if (state.depth >= state.nestLimit) {
			return P.failure();
		}
		state.depth++;
		const result = parser.handler(input, index, state);
		state.depth--;
		return result;
	});
}

const lang = P.createLanguage({
	fullParser: r => {
		return r.full.atLeast(0);
	},

	simpleParser: r => {
		return r.simple.atLeast(0);
	},

	full: r => {
		return P.alt([
			// r.quote,        // ">" block
			// r.codeBlock,    // "```" block
			// r.mathBlock,    // "\\[" block
			// r.center,       // "<center>" block
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
			// r.hashtag,      // "#"
			r.emojiCode,    // ":"
			// r.link,         // "?[" or "["
			// r.url,
			// r.search,       // block
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
			// r.hashtag,      // "#"
			r.emojiCode,    // ":"
			// r.link,         // "?[" or "["
			// r.url,
			r.text,
		]);
	},

	big: r => {
		const mark = P.str('***');
		return P.seq([
			mark,
			nest(P.seq([P.notMatch(mark), r.inline], 1).atLeast(1)),
			mark,
		]).map(result => M.FN('tada', {}, mergeText(result[1] as (M.MfmInline | string)[])));
	},

	boldAsta: r => {
		const mark = P.str('**');
		return P.seq([
			mark,
			nest(P.seq([P.notMatch(mark), r.inline], 1).atLeast(1)),
			mark,
		]).map(result => M.BOLD(mergeText(result[1] as (M.MfmInline | string)[])));
	},

	boldTag: r => {
		const open = P.str('<b>');
		const close = P.str('</b>');
		return P.seq([
			open,
			nest(P.seq([P.notMatch(close), r.inline], 1).atLeast(1)),
			close,
		]).map(result => M.BOLD(mergeText(result[1] as (M.MfmInline | string)[])));
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
		return P.seq([
			open,
			nest(P.seq([P.notMatch(close), r.inline], 1).atLeast(1)),
			close,
		]).map(result => M.SMALL(mergeText(result[1] as (M.MfmInline | string)[])));
	},

	italicTag: r => {
		const open = P.str('<i>');
		const close = P.str('</i>');
		return P.seq([
			open,
			nest(P.seq([P.notMatch(close), r.inline], 1).atLeast(1)),
			close,
		]).map(result => M.ITALIC(mergeText(result[1] as (M.MfmInline | string)[])));
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
		return P.seq([
			open,
			nest(P.seq([P.notMatch(close), r.inline], 1).atLeast(1)),
			close,
		]).map(result => M.STRIKE(mergeText(result[1] as (M.MfmInline | string)[])));
	},

	strikeWave: r => {
		const mark = P.str('~~');
		return P.seq([
			mark,
			nest(P.seq([P.notMatch(P.alt([mark, LF])), r.inline], 1).atLeast(1)),
			mark,
		]).map(result => M.STRIKE(mergeText(result[1] as (M.MfmInline | string)[])));
	},

	unicodeEmoji: r => {
		// TODO: fix bug
		const emojiRegex = RegExp(twemojiRegex.source);
		return P.regexp(emojiRegex).map(content => M.UNI_EMOJI(content));
	},

	plainTag: r => {
		// plainTag = open LF? (!(LF? close) .)+ LF? close
		const open = P.str('<plain>');
		const close = P.str('</plain>');
		return P.seq([
			open,
			P.option(LF),
			nest(P.seq([
				P.notMatch(P.seq([P.option(LF), close])),
				P.any,
			], 1).atLeast(1)),
			P.option(LF),
			close,
		]).map(result => M.PLAIN(result[2].join('')));
	},

	fn: r => {
		type ArgPair = { k: string, v: string | true };
		type Args = Record<string, string | true>;

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
		return P.seq([
			P.str('$['),
			fnName,
			P.option(args),
			P.str(' '),
			nest(P.seq([P.notMatch(fnClose), r.inline], 1).atLeast(1)),
			fnClose,
		]).map(result => {
			const name = result[1];
			const args = result[2] || {};
			const content = result[4];
			return M.FN(name, args, mergeText(content));
		});
	},

	inlineCode: r => {
		// inlineCode = mark (!(mark / LF) .)+ mark
		const mark = P.str('`');
		return P.seq([
			mark,
			P.seq([
				P.notMatch(P.alt([mark, LF])),
				P.any,
			], 1).atLeast(1),
			mark,
		]).map(result => M.INLINE_CODE(result[1].join('')));
	},

	mathInline: r => {
		// mathInline = open (!(close / LF) .)+ close
		const open = P.str('\\(');
		const close = P.str('\\)');
		return P.seq([
			open,
			P.seq([
				P.notMatch(P.alt([close, LF])),
				P.any,
			], 1).atLeast(1),
			close,
		]).map(result => M.MATH_INLINE(result[1].join('')));
	},

	mention: r => {
		// TODO: check deatail
		return P.seq([
			P.str('@'),
			P.regexp(/[a-z0-9_-]+/i),
			P.option(P.seq([
				P.str('@'),
				P.regexp(/[a-z0-9_.-]+/i)
			], 1)),
		]).map(result => {
			const name = result[1];
			const host = result[2];
			const acct = host != null ? `@${name}@${host}` : `@${name}`;
			M.MENTION(name, host, acct);
		});
	},

	// TOOD: hashtag

	emojiCode: r => {
		const mark = P.str(':');
		return P.seq([
			mark,
			P.regexp(/[a-z0-9_+-]+/i),
			mark,
		], 1).map(name => M.EMOJI_CODE(name as string));
	},

	text: r => P.any,
});

export type FullParserOpts = {
	fnNameList?: string[];
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): M.MfmNode[] {
	const reply = lang.fullParser.handler(input, 0, {
		nestLimit: (opts.nestLimit != null) ? opts.nestLimit : 20,
		fnNameList: opts.fnNameList,
		depth: 0,
	});
	if (!reply.success) {
		throw new Error('parsing error');
	}

	return mergeText(reply.value);
}

export function simpleParser(input: string): M.MfmSimpleNode[] {
	const reply = lang.simpleParser.handler(input, 0, { });
	if (!reply.success) {
		throw new Error('parsing error');
	}

	return mergeText(reply.value);
}
