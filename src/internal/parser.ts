import { BOLD, MfmNode, MfmSimpleNode, TEXT } from '../node';
import * as P from './core';

type FullParserOpts = {
	fnNameList?: string[];
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): MfmNode[] {
	let reply;

	reply = boldAsta.handler(input, 0, {});
	if (!reply.success) {
		throw new Error('parsing error');
	}
	return [reply.value];
}

export function simpleParser(input: string): MfmSimpleNode[] {
	return [];
}

// boldAsta

const boldAstaMark = P.str('**');

const boldAsta = P.seq([
	boldAstaMark,
	P.str('abc'),
	boldAstaMark,
]).map(result => {
	return BOLD([TEXT(result[1])]);
});
