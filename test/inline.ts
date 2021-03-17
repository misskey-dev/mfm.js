import assert from 'assert';
import { parse, parsePlain } from '../built/index';
import { createNode } from '../built/mfm-node';
import {
	TEXT, EMOJI, UNI_EMOJI, HASHTAG, N_URL
} from './node';

describe('text', () => {
	it('basic', () => {
		const input = 'abc';
		const output = [TEXT('abc')];
		assert.deepStrictEqual(parse(input), output);
	});
});
describe('custom emoji', () => {
	it('basic', () => {
		const input = ':abc:';
		const output = [EMOJI('abc')];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('unicode emoji', () => {
	it('basic', () => {
		const input = '今起きた😇';
		const output = [TEXT('今起きた'), UNI_EMOJI('😇')];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('hashtag', () => {
	it('and unicode emoji', () => {
		const input = '#️⃣abc123#abc';
		const output = [UNI_EMOJI('#️⃣'), TEXT('abc123'), HASHTAG('abc')];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('url', () => {
	it('basic', () => {
		const input = 'official instance: https://misskey.io/@ai.';
		const output = [
			TEXT('official instance: '),
			N_URL('https://misskey.io/@ai'),
			TEXT('.')
		];
		assert.deepStrictEqual(parse(input), output);
	});
});
