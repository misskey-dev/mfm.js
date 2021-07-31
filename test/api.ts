import assert from 'assert';
import * as mfm from '../src/index';
import {
	TEXT, CENTER, FN, UNI_EMOJI, MENTION, EMOJI_CODE, HASHTAG, N_URL, BOLD, SMALL, ITALIC, STRIKE, QUOTE, MATH_BLOCK, SEARCH, CODE_BLOCK, LINK
} from '../src/index';

describe('API', () => {
	describe('toString', () => {
		it('basic', () => {
			const input =
`before
<center>
Hello $[tada everynyan! 🎉]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>
after`;
			assert.strictEqual(mfm.toString(mfm.parse(input)), input);
		});

		it('preserve url brackets', () => {
			const input1 = 'https://github.com/syuilo/ai';
			assert.strictEqual(mfm.toString(mfm.parse(input1)), input1);

			const input2 = '<https://github.com/syuilo/ai>';
			assert.strictEqual(mfm.toString(mfm.parse(input2)), input2);
		});
	});

	describe('inspect', () => {
		it('replace text', () => {
			const input = 'good morning $[tada everynyan!]';
			const result = mfm.parse(input);
			mfm.inspect(result, node => {
				if (node.type == 'text') {
					node.props.text = node.props.text.replace(/good morning/g, 'hello');
				}
			});
			assert.strictEqual(mfm.toString(result), 'hello $[tada everynyan!]');
		});

		it('replace text (one item)', () => {
			const input = 'good morning $[tada everyone!]';
			const result = mfm.parse(input);
			mfm.inspect(result[1], node => {
				if (node.type == 'text') {
					node.props.text = node.props.text.replace(/one/g, 'nyan');
				}
			});
			assert.strictEqual(mfm.toString(result), 'good morning $[tada everynyan!]');
		});
	});

	describe('extract', () => {
		it('basic', () => {
			const nodes = mfm.parse('@hoge @piyo @bebeyo');
			const expect = [
				MENTION('hoge', null, '@hoge'),
				MENTION('piyo', null, '@piyo'),
				MENTION('bebeyo', null, '@bebeyo')
			];
			assert.deepStrictEqual(mfm.extract(nodes, node => node.type == 'mention'), expect);
		});

		it('nested', () => {
			const nodes = mfm.parse('abc:hoge:$[tada 123 @hoge :foo:]:piyo:');
			const expect = [
				EMOJI_CODE('hoge'),
				EMOJI_CODE('foo'),
				EMOJI_CODE('piyo')
			];
			assert.deepStrictEqual(mfm.extract(nodes, node => node.type == 'emojiCode'), expect);
		});
	});
});
