import assert from 'assert';
import { parse, parsePlain } from '../built/index';
import { createNode } from '../built/util';
import {
	TEXT, CENTER, FN, UNI_EMOJI, MENTION, CUSTOM_EMOJI, HASHTAG, N_URL
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
		const output = [CUSTOM_EMOJI('abc')];
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

describe('search', () => {
	describe('basic', () => {
		it('Search', () => {
			const input = 'MFM 書き方 123 Search';
			const output = [
				createNode('search', {
					query: 'MFM 書き方 123',
					content: input
				})
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('[Search]', () => {
			const input = 'MFM 書き方 123 [Search]';
			const output = [
				createNode('search', {
					query: 'MFM 書き方 123',
					content: input
				})
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('search', () => {
			const input = 'MFM 書き方 123 search';
			const output = [
				createNode('search', {
					query: 'MFM 書き方 123',
					content: input
				})
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('[search]', () => {
			const input = 'MFM 書き方 123 [search]';
			const output = [
				createNode('search', {
					query: 'MFM 書き方 123',
					content: input
				})
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('検索', () => {
			const input = 'MFM 書き方 123 検索';
			const output = [
				createNode('search', {
					query: 'MFM 書き方 123',
					content: input
				})
			];
			assert.deepStrictEqual(parse(input), output);
		});
		it('[検索]', () => {
			const input = 'MFM 書き方 123 [検索]';
			const output = [
				createNode('search', {
					query: 'MFM 書き方 123',
					content: input
				})
			];
			assert.deepStrictEqual(parse(input), output);
		});
	});
});

describe('center', () => {
	it('single text', () => {
		const input = '<center>abc</center>';
		const output = [
			CENTER([
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('multiple text', () => {
		const input = '<center>\nabc\n123\n\npiyo\n</center>';
		const output = [
			CENTER([
				TEXT('\nabc\n123\n\npiyo\n')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

it('composite', () => {
	const input =
`<center>
Hello [tada everynyan! 🎉]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>`;
	const output = [
		CENTER([
			TEXT('\nHello '),
			FN('tada', { }, [
				TEXT('everynyan! '),
				UNI_EMOJI('🎉')
			]),
			TEXT('\n\nI\'m '),
			MENTION('ai', null, '@ai'),
			TEXT(', A bot of misskey!\n\n'),
			N_URL('https://github.com/syuilo/ai'),
			TEXT('\n')
		])
	];
	assert.deepStrictEqual(parse(input), output);
});
