import assert from 'assert';
import * as mfm from '../src/index';
import {
	TEXT, CENTER, FN, UNI_EMOJI, MENTION, EMOJI_CODE, HASHTAG, N_URL, BOLD, SMALL, ITALIC, STRIKE, QUOTE, MATH_BLOCK, SEARCH, CODE_BLOCK, LINK, INLINE_CODE, MATH_INLINE
} from '../src/index';

describe('PlainParser', () => {
	describe('text', () => {
		it('basic', () => {
			const input = 'abc';
			const output = [TEXT('abc')];
			assert.deepStrictEqual(mfm.parsePlain(input), output);
		});

		it('ignore hashtag', () => {
			const input = 'abc#abc';
			const output = [TEXT('abc#abc')];
			assert.deepStrictEqual(mfm.parsePlain(input), output);
		});

		it('keycap number sign', () => {
			const input = 'abc#️⃣abc';
			const output = [TEXT('abc'), UNI_EMOJI('#️⃣'), TEXT('abc')];
			assert.deepStrictEqual(mfm.parsePlain(input), output);
		});
	});

	describe('emoji', () => {
		it('basic', () => {
			const input = ':foo:';
			const output = [EMOJI_CODE('foo')];
			assert.deepStrictEqual(mfm.parsePlain(input), output);
		});

		it('between texts', () => {
			const input = 'foo:bar:baz';
			const output = [TEXT('foo'), EMOJI_CODE('bar'), TEXT('baz')];
			assert.deepStrictEqual(mfm.parsePlain(input), output);
		});
	});

	it('disallow other syntaxes', () => {
		const input = 'foo **bar** baz';
		const output = [TEXT('foo **bar** baz')];
		assert.deepStrictEqual(mfm.parsePlain(input), output);
	});
});

describe('FullParser', () => {
	describe('text', () => {
		it('普通のテキストを入力すると1つのテキストノードが返される', () => {
			const input = 'abc';
			const output = [TEXT('abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('quote', () => {
		it('1行の引用ブロックを使用できる', () => {
			const input = '> abc';
			const output = [
				QUOTE([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('複数行の引用ブロックを使用できる', () => {
			const input = `
> abc
> 123
`;
			const output = [
				QUOTE([
					TEXT('abc\n123')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('引用ブロックはブロックをネストできる', () => {
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
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('引用ブロックはインライン構文を含んだブロックをネストできる', () => {
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
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('複数行の引用ブロックでは空行を含めることができる', () => {
			const input = `
> abc
>
> 123
`;
			const output = [
				QUOTE([
					TEXT('abc\n\n123')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('1行の引用ブロックを空行にはできない', () => {
			const input = '> ';
			const output = [
				TEXT('> ')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('引用ブロックの後ろの空行は無視される', () => {
			const input = `
> foo
> bar

hoge`;
			const output = [
				QUOTE([
					TEXT('foo\nbar')
				]),
				TEXT('hoge')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('search', () => {
		describe('検索構文を使用できる', () => {
			it('Search', () => {
				const input = 'MFM 書き方 123 Search';
				const output = [
					SEARCH('MFM 書き方 123', input)
				];
				assert.deepStrictEqual(mfm.parse(input), output);
			});
			it('[Search]', () => {
				const input = 'MFM 書き方 123 [Search]';
				const output = [
					SEARCH('MFM 書き方 123', input)
				];
				assert.deepStrictEqual(mfm.parse(input), output);
			});
			it('search', () => {
				const input = 'MFM 書き方 123 search';
				const output = [
					SEARCH('MFM 書き方 123', input)
				];
				assert.deepStrictEqual(mfm.parse(input), output);
			});
			it('[search]', () => {
				const input = 'MFM 書き方 123 [search]';
				const output = [
					SEARCH('MFM 書き方 123', input)
				];
				assert.deepStrictEqual(mfm.parse(input), output);
			});
			it('検索', () => {
				const input = 'MFM 書き方 123 検索';
				const output = [
					SEARCH('MFM 書き方 123', input)
				];
				assert.deepStrictEqual(mfm.parse(input), output);
			});
			it('[検索]', () => {
				const input = 'MFM 書き方 123 [検索]';
				const output = [
					SEARCH('MFM 書き方 123', input)
				];
				assert.deepStrictEqual(mfm.parse(input), output);
			});
		});
		it('ブロックの前後にあるテキストが正しく解釈される', () => {
			const input = 'abc\nhoge piyo bebeyo 検索\n123';
			const output = [
				TEXT('abc'),
				SEARCH('hoge piyo bebeyo', 'hoge piyo bebeyo 検索'),
				TEXT('123')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('code block', () => {
		it('コードブロックを使用できる', () => {
			const input = '```\nabc\n```';
			const output = [CODE_BLOCK('abc', null)];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('コードブロックには複数行のコードを入力できる', () => {
			const input = '```\na\nb\nc\n```';
			const output = [CODE_BLOCK('a\nb\nc', null)];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('コードブロックは言語を指定できる', () => {
			const input = '```js\nconst a = 1;\n```';
			const output = [CODE_BLOCK('const a = 1;', 'js')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ブロックの前後にあるテキストが正しく解釈される', () => {
			const input = 'abc\n```\nconst abc = 1;\n```\n123';
			const output = [
				TEXT('abc'),
				CODE_BLOCK('const abc = 1;', null),
				TEXT('123')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore internal marker', () => {
			const input = '```\naaa```bbb\n```';
			const output = [CODE_BLOCK('aaa```bbb', null)];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('trim after line break', () => {
			const input = '```\nfoo\n```\nbar';
			const output = [
				CODE_BLOCK('foo', null),
				TEXT('bar'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('mathBlock', () => {
		it('1行の数式ブロックを使用できる', () => {
			const input = '\\[math1\\]';
			const output = [
				MATH_BLOCK('math1')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('ブロックの前後にあるテキストが正しく解釈される', () => {
			const input = 'abc\n\\[math1\\]\n123';
			const output = [
				TEXT('abc'),
				MATH_BLOCK('math1'),
				TEXT('123')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('行末以外に閉じタグがある場合はマッチしない', () => {
			const input = '\\[aaa\\]after';
			const output = [
				TEXT('\\[aaa\\]after')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
		it('行頭以外に開始タグがある場合はマッチしない', () => {
			const input = 'before\\[aaa\\]';
			const output = [
				TEXT('before\\[aaa\\]')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('emoji code', () => {
		it('basic', () => {
			const input = ':abc:';
			const output = [EMOJI_CODE('abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('unicode emoji', () => {
		it('basic', () => {
			const input = '今起きた😇';
			const output = [TEXT('今起きた'), UNI_EMOJI('😇')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('keycap number sign', () => {
			const input = 'abc#️⃣123';
			const output = [TEXT('abc'), UNI_EMOJI('#️⃣'), TEXT('123')];
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('italic tag', () => {
		it('basic', () => {
			const input = '<i>abc</i>';
			const output = [
				ITALIC([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('italic alt 1', () => {
		it('basic', () => {
			const input = '*abc*';
			const output = [
				ITALIC([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('basic 2', () => {
			const input = 'before *abc* after';
			const output = [
				TEXT('before '),
				ITALIC([
					TEXT('abc')
				]),
				TEXT(' after')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore a italic syntax if the before char is neither a space nor an LF nor [^a-z0-9]i', () => {
			let input = 'before*abc*after';
			let output: mfm.MfmNode[] = [TEXT('before*abc*after')];
			assert.deepStrictEqual(mfm.parse(input), output);

			input = 'あいう*abc*えお';
			output = [
				TEXT('あいう'),
				ITALIC([
					TEXT('abc')
				]),
				TEXT('えお')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('italic alt 2', () => {
		it('basic', () => {
			const input = '_abc_';
			const output = [
				ITALIC([
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('basic 2', () => {
			const input = 'before _abc_ after';
			const output = [
				TEXT('before '),
				ITALIC([
					TEXT('abc')
				]),
				TEXT(' after')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore a italic syntax if the before char is neither a space nor an LF nor [^a-z0-9]i', () => {
			let input = 'before_abc_after';
			let output: mfm.MfmNode[] = [TEXT('before_abc_after')];
			assert.deepStrictEqual(mfm.parse(input), output);

			input = 'あいう_abc_えお';
			output = [
				TEXT('あいう'),
				ITALIC([
					TEXT('abc')
				]),
				TEXT('えお')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('strike', () => {
		it('basic', () => {
			const input = '~~foo~~';
			const output = [STRIKE([
				TEXT('foo')
			])];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('inlineCode', () => {
		it('basic', () => {
			const input = '`var x = "Strawberry Pasta";`';
			const output = [INLINE_CODE('var x = "Strawberry Pasta";')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('disallow line break', () => {
			const input = '`foo\nbar`';
			const output = [TEXT('`foo\nbar`')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('disallow ´', () => {
			const input = '`foo´bar`';
			const output = [TEXT('`foo´bar`')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('mathInline', () => {
		it('basic', () => {
			const input = '\\(x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}\\)';
			const output = [MATH_INLINE('x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('mention', () => {
		it('basic', () => {
			const input = '@abc';
			const output = [MENTION('abc', null, '@abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('basic 2', () => {
			const input = 'before @abc after';
			const output = [TEXT('before '), MENTION('abc', null, '@abc'), TEXT(' after')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('basic remote', () => {
			const input = '@abc@misskey.io';
			const output = [MENTION('abc', 'misskey.io', '@abc@misskey.io')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('basic remote 2', () => {
			const input = 'before @abc@misskey.io after';
			const output = [TEXT('before '), MENTION('abc', 'misskey.io', '@abc@misskey.io'), TEXT(' after')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('basic remote 3', () => {
			const input = 'before\n@abc@misskey.io\nafter';
			const output = [TEXT('before\n'), MENTION('abc', 'misskey.io', '@abc@misskey.io'), TEXT('\nafter')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore format of mail address', () => {
			const input = 'abc@example.com';
			const output = [TEXT('abc@example.com')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('detect as a mention if the before char is [^a-z0-9]i', () => {
			const input = 'あいう@abc';
			const output = [TEXT('あいう'), MENTION('abc', null, '@abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('hashtag', () => {
		it('basic', () => {
			const input = '#abc';
			const output = [HASHTAG('abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('basic 2', () => {
			const input = 'before #abc after';
			const output = [TEXT('before '), HASHTAG('abc'), TEXT(' after')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with keycap number sign', () => {
			const input = '#️⃣abc123 #abc';
			const output = [UNI_EMOJI('#️⃣'), TEXT('abc123 '), HASHTAG('abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with keycap number sign 2', () => {
			const input = `abc
#️⃣abc`;
			const output = [TEXT('abc\n'), UNI_EMOJI('#️⃣'), TEXT('abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore a hashtag if the before char is neither a space nor an LF nor [^a-z0-9]i', () => {
			let input = 'abc#abc';
			let output: mfm.MfmNode[] = [TEXT('abc#abc')];
			assert.deepStrictEqual(mfm.parse(input), output);

			input = 'あいう#abc';
			output = [TEXT('あいう'), HASHTAG('abc')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore comma and period', () => {
			const input = 'Foo #bar, baz #piyo.';
			const output = [TEXT('Foo '), HASHTAG('bar'), TEXT(', baz '), HASHTAG('piyo'), TEXT('.')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore exclamation mark', () => {
			const input = '#Foo!';
			const output = [HASHTAG('Foo'), TEXT('!')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore colon', () => {
			const input = '#Foo:';
			const output = [HASHTAG('Foo'), TEXT(':')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore single quote', () => {
			const input = '#Foo\'';
			const output = [HASHTAG('Foo'), TEXT('\'')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore double quote', () => {
			const input = '#Foo"';
			const output = [HASHTAG('Foo'), TEXT('"')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore square bracket', () => {
			const input = '#Foo]';
			const output = [HASHTAG('Foo'), TEXT(']')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore slash', () => {
			const input = '#foo/bar';
			const output = [HASHTAG('foo'), TEXT('/bar')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('allow including number', () => {
			const input = '#foo123';
			const output = [HASHTAG('foo123')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with brackets "()"', () => {
			const input = '(#foo)';
			const output = [TEXT('('), HASHTAG('foo'), TEXT(')')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with brackets "「」"', () => {
			const input = '「#foo」';
			const output = [TEXT('「'), HASHTAG('foo'), TEXT('」')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with mixed brackets', () => {
			const input = '「#foo(bar)」';
			const output = [TEXT('「'), HASHTAG('foo(bar)'), TEXT('」')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with brackets "()" (space before)', () => {
			const input = '(bar #foo)';
			const output = [TEXT('(bar '), HASHTAG('foo'), TEXT(')')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with brackets "「」" (space before)', () => {
			const input = '「bar #foo」';
			const output = [TEXT('「bar '), HASHTAG('foo'), TEXT('」')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('disallow number only', () => {
			const input = '#123';
			const output = [TEXT('#123')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('disallow number only (with brackets)', () => {
			const input = '(#123)';
			const output = [TEXT('(#123)')];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('url', () => {
		it('basic', () => {
			const input = 'https://misskey.io/@ai';
			const output = [
				N_URL('https://misskey.io/@ai'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with other texts', () => {
			const input = 'official instance: https://misskey.io/@ai.';
			const output = [
				TEXT('official instance: '),
				N_URL('https://misskey.io/@ai'),
				TEXT('.')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore trailing period', () => {
			const input = 'https://misskey.io/@ai.';
			const output = [
				N_URL('https://misskey.io/@ai'),
				TEXT('.')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore trailing periods', () => {
			const input = 'https://misskey.io/@ai...';
			const output = [
				N_URL('https://misskey.io/@ai'),
				TEXT('...')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with comma', () => {
			const input = 'https://example.com/foo?bar=a,b';
			const output = [
				N_URL('https://example.com/foo?bar=a,b'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore trailing comma', () => {
			const input = 'https://example.com/foo, bar';
			const output = [
				N_URL('https://example.com/foo'),
				TEXT(', bar')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with brackets', () => {
			const input = 'https://example.com/foo(bar)';
			const output = [
				N_URL('https://example.com/foo(bar)'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore parent brackets', () => {
			const input = '(https://example.com/foo)';
			const output = [
				TEXT('('),
				N_URL('https://example.com/foo'),
				TEXT(')'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore parent brackets (2)', () => {
			const input = '(foo https://example.com/foo)';
			const output = [
				TEXT('(foo '),
				N_URL('https://example.com/foo'),
				TEXT(')'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore parent brackets with internal brackets', () => {
			const input = '(https://example.com/foo(bar))';
			const output = [
				TEXT('('),
				N_URL('https://example.com/foo(bar)'),
				TEXT(')'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore parent []', () => {
			const input = 'foo [https://example.com/foo] bar';
			const output = [
				TEXT('foo ['),
				N_URL('https://example.com/foo'),
				TEXT('] bar'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('ignore non-ascii characters contained url without angle brackets', () => {
			const input = 'https://大石泉すき.example.com';
			const output = [
				TEXT('https://大石泉すき.example.com'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('match non-ascii characters contained url with angle brackets', () => {
			const input = '<https://大石泉すき.example.com>';
			const output = [
				N_URL('https://大石泉すき.example.com', true),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('silent flag', () => {
			const input = '?[official instance](https://misskey.io/@ai).';
			const output = [
				LINK(true, 'https://misskey.io/@ai', [
					TEXT('official instance')
				]),
				TEXT('.')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
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
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('do not yield link node even if label is recognisable as a link', () => {
			const input = 'official instance: [[https://misskey.io/@ai](https://misskey.io/@ai)](https://misskey.io/@ai).';
			const output = [
				TEXT('official instance: '),
				LINK(false, 'https://misskey.io/@ai', [
					TEXT('[https://misskey.io/@ai](https://misskey.io/@ai)')
				]),
				TEXT('.')
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('do not yield mention', () => {
			const input = '[@example](https://example.com)';
			const output = [
				LINK(false, 'https://example.com', [
					TEXT('@example')
				]),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with brackets', () => {
			const input = '[foo](https://example.com/foo(bar))';
			const output = [
				LINK(false, 'https://example.com/foo(bar)', [
					TEXT('foo')
				]),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with parent brackets', () => {
			const input = '([foo](https://example.com/foo(bar)))';
			const output = [
				TEXT('('),
				LINK(false, 'https://example.com/foo(bar)', [
					TEXT('foo')
				]),
				TEXT(')'),
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('fn v1', () => {
		it('basic', () => {
			const input = '[tada abc]';
			const output = [
				FN('tada', { }, [
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with a string argument', () => {
			const input = '[spin.speed=1.1s a]';
			const output = [
				FN('spin', { speed: '1.1s' }, [
					TEXT('a')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('nest', () => {
			const input = '[spin.speed=1.1s [shake a]]';
			const output = [
				FN('spin', { speed: '1.1s' }, [
					FN('shake', { }, [
						TEXT('a')
					])
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});
	});

	describe('fn v2', () => {
		it('basic', () => {
			const input = '$[tada abc]';
			const output = [
				FN('tada', { }, [
					TEXT('abc')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('with a string argument', () => {
			const input = '$[spin.speed=1.1s a]';
			const output = [
				FN('spin', { speed: '1.1s' }, [
					TEXT('a')
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
		});

		it('nest', () => {
			const input = '$[spin.speed=1.1s $[shake a]]';
			const output = [
				FN('spin', { speed: '1.1s' }, [
					FN('shake', { }, [
						TEXT('a')
					])
				])
			];
			assert.deepStrictEqual(mfm.parse(input), output);
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
		assert.deepStrictEqual(mfm.parse(input), output);
	});
});
