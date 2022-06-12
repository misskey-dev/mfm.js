import { MfmNode, MfmSimpleNode } from '../node';
import { Parser } from './core';

type FullParserOpts = {
	fnNameList?: string[];
	nestLimit?: number;
};

export function fullParser(input: string, opts: FullParserOpts): MfmNode[] {
	return [];
}

export function simpleParser(input: string): MfmSimpleNode[] {
	return [];
}
