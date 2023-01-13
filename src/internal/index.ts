import * as M from '..';
import { language } from './parser';
import { mergeText } from './util';
import * as P from './core';

export type FullParserOpts = {
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): M.MfmNode[] {
	const result = language.fullParser.handler(input, 0, {
		nestLimit: (opts.nestLimit != null) ? opts.nestLimit : 20,
		depth: 0,
		linkLabel: false,
		trace: false,
	}) as P.Success<any>;
	return mergeText(result.value);
}

export function simpleParser(input: string): M.MfmSimpleNode[] {
	const result = language.simpleParser.handler(input, 0, { }) as P.Success<any>;
	return mergeText(result.value);
}
