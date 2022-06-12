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

const boldAsta = new P.Parser((input, index, state) => {
	let reply;

	reply = boldAstaMark.handler(input, index, state);
	if (!reply.success) {
		return P.failure();
	}
	index = reply.index;
	const a = reply.value;

	reply = P.str('abc').handler(input, index, state);
	if (!reply.success) {
		return P.failure();
	}
	index = reply.index;
	const b = reply.value;
	const content = [TEXT('abc')];

	reply = boldAstaMark.handler(input, index, state);
	if (!reply.success) {
		return P.failure();
	}
	index = reply.index;
	const c = reply.value;

	return P.success(index, [a, b, c]);
}).map(result => {
	return BOLD([TEXT(result[1])]);
});
