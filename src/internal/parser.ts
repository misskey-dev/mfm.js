import { BOLD, FN, MfmInline, MfmNode, MfmSimpleNode, SMALL } from '../node';
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

	full: r => {
		return P.alt([
			r.big,
			r.boldAsta,
			r.boldUnder,
			r.smallTag,
			r.boldTag,
			r.text,
		]);
	},

	inline: r => {
		return P.alt([
			r.big,
			r.boldAsta,
			r.boldUnder,
			r.smallTag,
			r.boldTag,
			r.text,
		]);
	},

	big: r => {
		const mark = P.str('***');
		return P.seq([
			mark,
			nest(P.seq([P.notMatch(mark), r.inline], 1).atLeast(1)),
			mark,
		]).map(result => FN('tada', {}, mergeText(result[1] as (MfmInline | string)[])));
	},

	boldAsta: r => {
		const mark = P.str('**');
		return P.seq([
			mark,
			nest(P.seq([P.notMatch(mark), r.inline], 1).atLeast(1)),
			mark,
		]).map(result => BOLD(mergeText(result[1] as (MfmInline | string)[])));
	},

	boldTag: r => {
		const open = P.str('<b>');
		const close = P.str('</b>');
		return P.seq([
			open,
			nest(P.seq([P.notMatch(close), r.inline], 1).atLeast(1)),
			close,
		]).map(result => BOLD(mergeText(result[1] as (MfmInline | string)[])));
	},

	boldUnder: r => {
		const mark = P.str('__');
		return P.seq([
			mark,
			P.alt([alphaAndNum, space]).atLeast(1),
			mark,
		]).map(result => BOLD(mergeText(result[1] as (MfmInline | string)[])));
	},

	smallTag: r => {
		const open = P.str('<small>');
		const close = P.str('</small>');
		return P.seq([
			open,
			nest(P.seq([P.notMatch(close), r.inline], 1).atLeast(1)),
			close,
		]).map(result => SMALL(mergeText(result[1] as (MfmInline | string)[])));
	},

	text: r => P.any,
});

export type FullParserOpts = {
	fnNameList?: string[];
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): MfmNode[] {
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

export function simpleParser(input: string): MfmSimpleNode[] {
	return [];
}
