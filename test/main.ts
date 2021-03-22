import assert from 'assert';
import { parse, parsePlain } from '../built/index';
import { createNode } from '../built/util';
import {
	TEXT, CENTER, FN, UNI_EMOJI, MENTION, CUSTOM_EMOJI, HASHTAG, N_URL, BOLD, SMALL, ITALIC, STRIKE, QUOTE
} from './node';

describe('text', () => {
	it('basic', () => {
		const input = 'abc';
		const output = [TEXT('abc')];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('quote', () => {
	it('single', () => {
		const input = '> abc';
		const output = [
			QUOTE([
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('multiple', () => {
		const input = `
> abc
> 123
`;
		const output = [
			TEXT('\n'),
			QUOTE([
				TEXT('abc\n123')
			]),
			TEXT('\n')
		];
		assert.deepStrictEqual(parse(input), output);
	});

	it('with block (center)', () => {
		const input = `
> <center>
> a
> </center>
`;
		const output = [
			TEXT('\n'),
			QUOTE([
				CENTER([
					TEXT('\na\n')
				])
			]),
			TEXT('\n')
		];
		assert.deepStrictEqual(parse(input), output);
	});

	it('with block (center, mention)', () => {
		const input = `
> <center>
> I'm @ai, An bot of misskey!
> </center>
`;
		const output = [
			TEXT('\n'),
			QUOTE([
				CENTER([
					TEXT('\nI\'m '),
					MENTION('ai', null, '@ai'),
					TEXT(', An bot of misskey!\n'),
				])
			]),
			TEXT('\n')
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('fn', () => {
	it('basic', () => {
		const input = '[tada abc]';
		const output = [
			FN('tada', { }, [
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('big', () => {
	it('basic', () => {
		const input = '***abc***';
		const output = [
			FN('tada', { }, [
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容にはインライン構文を利用できる', () => {
		const input = '***123**abc**123***';
		const output = [
			FN('tada', { }, [
				TEXT('123'),
				BOLD([
					TEXT('abc')
				]),
				TEXT('123')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容は改行できる', () => {
		const input = '***123\n**abc**\n123***';
		const output = [
			FN('tada', { }, [
				TEXT('123\n'),
				BOLD([
					TEXT('abc')
				]),
				TEXT('\n123')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('bold', () => {
	it('basic', () => {
		const input = '**abc**';
		const output = [
			BOLD([
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容にはインライン構文を利用できる', () => {
		const input = '**123~~abc~~123**';
		const output = [
			BOLD([
				TEXT('123'),
				STRIKE([
					TEXT('abc')
				]),
				TEXT('123')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容は改行できる', () => {
		const input = '**123\n~~abc~~\n123**';
		const output = [
			BOLD([
				TEXT('123\n'),
				STRIKE([
					TEXT('abc')
				]),
				TEXT('\n123')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('small', () => {
	it('basic', () => {
		const input = '<small>abc</small>';
		const output = [
			SMALL([
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容にはインライン構文を利用できる', () => {
		const input = '<small>abc**123**abc</small>';
		const output = [
			SMALL([
				TEXT('abc'),
				BOLD([
					TEXT('123')
				]),
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容は改行できる', () => {
		const input = '<small>abc\n**123**\nabc</small>';
		const output = [
			SMALL([
				TEXT('abc\n'),
				BOLD([
					TEXT('123')
				]),
				TEXT('\nabc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('italic 1', () => {
	it('basic', () => {
		const input = '<i>abc</i>';
		const output = [
			ITALIC([
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容にはインライン構文を利用できる', () => {
		const input = '<i>abc**123**abc</i>';
		const output = [
			ITALIC([
				TEXT('abc'),
				BOLD([
					TEXT('123')
				]),
				TEXT('abc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('内容は改行できる', () => {
		const input = '<i>abc\n**123**\nabc</i>';
		const output = [
			ITALIC([
				TEXT('abc\n'),
				BOLD([
					TEXT('123')
				]),
				TEXT('\nabc')
			])
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('italic 2', () => {
	it('basic', () => {
		const input = '*abc*';
		const output = [
			ITALIC([
				TEXT('abc')
			])
		];
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
