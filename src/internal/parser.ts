import { BOLD, MfmInline, MfmNode, MfmSimpleNode } from '../node';
import * as P from './core';
import { mergeText } from './util';

const lang = P.createLanguage({
	fullParser: r => {
		return r.full.atLeast(0);
	},
	full: r => {
		return P.alt([
			r.boldAsta,
			r.text,
		]);
	},
	inline: r => {
		return P.alt([
			r.boldAsta,
			r.text,
		]);
	},
	boldAsta: r => {
		const boldAstaMark = P.str('**');
		return P.seq([
			boldAstaMark,
			P.seq([P.notMatch(boldAstaMark), r.inline], 1).atLeast(1),
			boldAstaMark,
		]).map(result => BOLD(mergeText(result[1] as (MfmInline | string)[])));
	},
	text: r => P.any,
});

export type FullParserOpts = {
	fnNameList?: string[];
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): MfmNode[] {
	const reply = lang.fullParser.handler(input, 0, {});
	if (!reply.success) {
		throw new Error('parsing error');
	}

	return mergeText(reply.value);
}

export function simpleParser(input: string): MfmSimpleNode[] {
	return [];
}
