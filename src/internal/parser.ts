import { BOLD, MfmInline, MfmNode, MfmSimpleNode } from '../node';
import * as P from './core';
import { mergeText } from './util';

type FullParserOpts = {
	fnNameList?: string[];
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): MfmNode[] {
	let reply;

	const full = P.alt([
		boldAsta,
		text
	]).atLeast(0);

	reply = full.handler(input, 0, {});
	if (!reply.success) {
		throw new Error('parsing error');
	}

	return mergeText(reply.value);
}

export function simpleParser(input: string): MfmSimpleNode[] {
	return [];
}

// boldAsta

const boldAstaMark = P.str('**');

const boldAsta = P.seq([
	boldAstaMark,
	P.seq([P.notMatch(boldAstaMark), P.any]).map(result => result[1])
		.atLeast(1),
	boldAstaMark,
]).map(result => {
	return BOLD(mergeText(result[1] as (MfmInline | string)[]));
});

// text

const text = P.any;
