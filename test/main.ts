import assert from 'assert';
import { extract, inspect, parse, parsePlain, toString } from '../built/index';
import { createNode } from '../built/util';
import {
	TEXT, CENTER, FN, UNI_EMOJI, MENTION, EMOJI_CODE, HASHTAG, N_URL, BOLD, SMALL, ITALIC, STRIKE, QUOTE, MATH_BLOCK, SEARCH, CODE_BLOCK, LINK
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
			QUOTE([
				TEXT('abc\n123')
			])
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
			QUOTE([
				CENTER([
					TEXT('a')
				])
			])
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
			QUOTE([
				CENTER([
					TEXT('I\'m '),
					MENTION('ai', null, '@ai'),
					TEXT(', An bot of misskey!'),
				])
			])
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
	it('with text', () => {
		const input = 'abc\nhoge piyo bebeyo 検索\n123';
		const output = [
			TEXT('abc'),
			SEARCH('hoge piyo bebeyo', 'hoge piyo bebeyo 検索'),
			TEXT('123')
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('code block', () => {
	it('basic', () => {
		const input = '```\nabc\n```';
		const output = [CODE_BLOCK('abc', null)];
		assert.deepStrictEqual(parse(input), output);
	});
	it('multi line', () => {
		const input = '```\na\nb\nc\n```';
		const output = [CODE_BLOCK('a\nb\nc', null)];
		assert.deepStrictEqual(parse(input), output);
	});
	it('basic (lang)', () => {
		const input = '```js\nconst a = 1;\n```';
		const output = [CODE_BLOCK('const a = 1;', 'js')];
		assert.deepStrictEqual(parse(input), output);
	});
	it('with text', () => {
		const input = 'abc\n```\nconst abc = 1;\n```\n123';
		const output = [
			TEXT('abc'),
			CODE_BLOCK('const abc = 1;', null),
			TEXT('123')
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('mathBlock', () => {
	it('basic', () => {
		const input = '123\n\\[math1\\]\nabc\n\\[math2\\]';
		const output = [
			TEXT('123'),
			MATH_BLOCK('math1'),
			TEXT('abc'),
			MATH_BLOCK('math2')
		];
		assert.deepStrictEqual(parse(input), output);
	});
	it('case of no matched', () => {
		const input = '\\[aaa\\]\\[bbb\\]';
		const output = [
			TEXT('\\[aaa\\]\\[bbb\\]')
		];
		assert.deepStrictEqual(parse(input), output);
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
		const input = 'before\n<center>\nabc\n123\n\npiyo\n</center>\nafter';
		const output = [
			TEXT('before'),
			CENTER([
				TEXT('abc\n123\n\npiyo')
			]),
			TEXT('after')
		];
		assert.deepStrictEqual(parse(input), output);
	});
});

describe('emoji code', () => {
	it('basic', () => {
		const input = ':abc:';
		const output = [EMOJI_CODE('abc')];
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

// strike

// inlineCode

// mathInline

// mention

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

describe('link', () => {
	it('basic', () => {
		const input = '[official instance](https://misskey.io/@ai).';
		const output = [
			LINK(false, 'https://misskey.io/@ai', [
				TEXT('official instance')
			]),
			TEXT('.')
		];
		assert.deepStrictEqual(parse(input), output);
	});

	it('silent flag', () => {
		const input = '?[official instance](https://misskey.io/@ai).';
		const output = [
			LINK(true, 'https://misskey.io/@ai', [
				TEXT('official instance')
			]),
			TEXT('.')
		];
		assert.deepStrictEqual(parse(input), output);
	});

	it('do not yield url node even if label is recognisable as a url', () => {
		const input = 'official instance: [https://misskey.io/@ai](https://misskey.io/@ai).';
		const output = [
			TEXT('official instance: '),
			LINK(false, 'https://misskey.io/@ai', [
				TEXT('https://misskey.io/@ai')
			]),
			TEXT('.')
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

it('composite', () => {
	const input =
`before
<center>
Hello [tada everynyan! 🎉]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>
after`;
	const output = [
		TEXT('before'),
		CENTER([
			TEXT('Hello '),
			FN('tada', { }, [
				TEXT('everynyan! '),
				UNI_EMOJI('🎉')
			]),
			TEXT('\n\nI\'m '),
			MENTION('ai', null, '@ai'),
			TEXT(', A bot of misskey!\n\n'),
			N_URL('https://github.com/syuilo/ai')
		]),
		TEXT('after')
	];
	assert.deepStrictEqual(parse(input), output);
});

describe('toString API', () => {
	it('basic', () => {
		const input =
`before
<center>
Hello [tada everynyan! 🎉]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>
after`;
		assert.strictEqual(toString(parse(input)), input);
	});
});

describe('inspect API', () => {
	it('replace text', () => {
		const input = 'good morning [tada everynyan!]';
		const result = parse(input);
		inspect(result, node => {
			if (node.type == 'text') {
				node.props.text = node.props.text.replace(/good morning/g, 'hello');
			}
		});
		assert.strictEqual(toString(result), 'hello [tada everynyan!]');
	});
});

describe('extract API', () => {
	it('basic', () => {
		const nodes = parse('abc:hoge:[tada 123:hoge:]:piyo:');
		const expect = [
			EMOJI_CODE('hoge'),
			EMOJI_CODE('hoge'),
			EMOJI_CODE('piyo')
		];
		assert.deepStrictEqual(extract(nodes, 'emojiCode'), expect);
	});
});
