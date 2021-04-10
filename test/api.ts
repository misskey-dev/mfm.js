import assert from 'assert';
import * as mfm from '../built/index';
import {
	TEXT, CENTER, FN, UNI_EMOJI, MENTION, EMOJI_CODE, HASHTAG, N_URL, BOLD, SMALL, ITALIC, STRIKE, QUOTE, MATH_BLOCK, SEARCH, CODE_BLOCK, LINK
} from '../built/index';

describe('API', () => {
	describe('toString', () => {
		it('basic', () => {
			const input =
`before
<center>
Hello [tada everynyan! 🎉]

I'm @ai, A bot of misskey!

https://github.com/syuilo/ai
</center>
after`;
			assert.strictEqual(mfm.toString(mfm.parse(input)), input);
		});
	});

	describe('inspect', () => {
		it('replace text', () => {
			const input = 'good morning [tada everynyan!]';
			const result = mfm.parse(input);
			mfm.inspect(result, node => {
				if (node.type == 'text') {
					node.props.text = node.props.text.replace(/good morning/g, 'hello');
				}
			});
			assert.strictEqual(mfm.toString(result), 'hello [tada everynyan!]');
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
			assert.deepStrictEqual(mfm.extract(nodes, 'mention'), expect);
		});

		it('nested', () => {
			const nodes = mfm.parse('abc:hoge:[tada 123 @hoge :foo:]:piyo:');
			const expect = [
				EMOJI_CODE('hoge'),
				EMOJI_CODE('foo'),
				EMOJI_CODE('piyo')
			];
			assert.deepStrictEqual(mfm.extract(nodes, 'emojiCode'), expect);
		});
	});
});
