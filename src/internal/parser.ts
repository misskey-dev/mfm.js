import { BOLD, MfmInline, MfmNode, MfmSimpleNode } from '../node';
import * as P from './core';
import { mergeText } from './util';

type FullParserOpts = {
	fnNameList?: string[];
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): MfmNode[] {
	let reply;

	reply = lang.full.handler(input, 0, {});
	if (!reply.success) {
		throw new Error('parsing error');
	}

	return mergeText(reply.value);
}

export function simpleParser(input: string): MfmSimpleNode[] {
	return [];
}

const lang = P.createLanguage({
	full: r => {
		return P.alt([
			r.boldAsta,
			r.text
		]).atLeast(0);
	},
	boldAsta: r => {
		const boldAstaMark = P.str('**');
		return P.seq([
			boldAstaMark,
			P.seq([P.notMatch(boldAstaMark), P.any], 1).atLeast(1),
			boldAstaMark,
		]).map(result => BOLD(mergeText(result[1] as (MfmInline | string)[])));
	},
	text: r => P.any,
});
