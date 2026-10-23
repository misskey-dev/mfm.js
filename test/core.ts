import { describe, test, vi } from 'vitest';
import assert from 'assert';
import * as P from '../src/internal/core';
import { language } from '../src/internal/parser';
import { mergeText } from '../src/internal/util';
import { TEXT, BOLD, ITALIC } from '../src/index';

function createState() {
	return { nestLimit: 20, depth: 0 };
}

describe('core', () => {
	describe('first', () => {
		test('match at the declared chars', () => {
			const parser = P.first('a', P.str('ab'));
			const result = parser.handler('ab', 0, createState());
			assert.deepStrictEqual(result, P.success(2, 'ab'));
		});

		test('fail at other chars', () => {
			const parser = P.first('a', P.str('b'));
			assert.deepStrictEqual(parser.handler('b', 0, createState()), P.failure());
		});

		test('fail at the end of input', () => {
			const parser = P.first('a', P.lineEnd);
			assert.deepStrictEqual(parser.handler('a', 1, createState()), P.failure());
		});
	});

	describe('alt', () => {
		test('skip parsers that cannot start with the current char', () => {
			const handler = vi.fn(() => P.success(1, 'b'));
			const parser = P.alt([
				P.first('a', new P.Parser(handler)),
				P.str('b'),
			]);
			assert.deepStrictEqual(parser.handler('b', 0, createState()), P.success(1, 'b'));
			assert.strictEqual(handler.mock.calls.length, 0);
		});

		test('skip parsers made by first at the end of input', () => {
			const parser = P.alt([
				P.first('a', P.str('a')),
				P.lineEnd,
			]);
			assert.deepStrictEqual(parser.handler('a', 1, createState()), P.success(1, null));
		});
	});

	describe('until', () => {
		test('basic', () => {
			const parser = P.until(P.str(']'), 1);
			assert.deepStrictEqual(parser.handler('ab]', 0, createState()), P.success(2, 'ab'));
		});

		test('reuse the scanned span', () => {
			const terminator = vi.fn(P.str(']').handler);
			const parser = P.until(new P.Parser(terminator), 1);
			const state = createState();
			assert.deepStrictEqual(parser.handler('ab]', 0, state), P.success(2, 'ab'));
			const calls = terminator.mock.calls.length;
			assert.deepStrictEqual(parser.handler('ab]', 1, state), P.success(2, 'b'));
			assert.strictEqual(terminator.mock.calls.length, calls);
		});

		test('fail if shorter than min', () => {
			const parser = P.until(P.str(']'), 1);
			assert.deepStrictEqual(parser.handler(']', 0, createState()), P.failure());
		});
	});

	describe('manyThen', () => {
		test('basic', () => {
			const parser = P.manyThen(P.char, P.str(']'), P.str(']'), 1);
			assert.deepStrictEqual(parser.handler('ab]', 0, createState()), P.success(3, [['a', 'b'], ']']));
		});

		test('fail if fewer items than min', () => {
			const parser = P.manyThen(P.char, P.str(']'), P.str(']'), 1);
			assert.deepStrictEqual(parser.handler(']', 0, createState()), P.failure());
		});

		test('skip the after parser when reaching a known failure', () => {
			const after = vi.fn(P.str(']').handler);
			const parser = P.manyThen(P.char, P.str(']'), new P.Parser(after), 1);
			const state = createState();
			assert.deepStrictEqual(parser.handler('xab', 1, state), P.failure());
			assert.strictEqual(after.mock.calls.length, 1);
			assert.deepStrictEqual(parser.handler('xab', 0, state), P.failure());
			assert.strictEqual(after.mock.calls.length, 1);
		});

		test('keep failures separately for each state', () => {
			// "after" succeeds only in link labels
			const after = new P.Parser((_input, index, state) => state.linkLabel ? P.success(index, null) : P.failure());
			const parser = P.manyThen(P.char, P.str(']'), after, 1);
			const state = { ...createState(), linkLabel: false };
			assert.deepStrictEqual(parser.handler('ab', 0, state), P.failure());
			state.linkLabel = true;
			assert.deepStrictEqual(parser.handler('ab', 0, state), P.success(2, [['a', 'b'], null]));
		});
	});

	describe('createLanguage', () => {
		test('log the calls of the rules when trace is enabled', () => {
			const log = vi.spyOn(console, 'log').mockImplementation(() => {});
			try {
				const lang = P.createLanguage<{ a: string }>({
					a: () => P.str('a'),
				});
				const state = { ...createState(), trace: true };
				lang.a.handler('a', 0, state);
				lang.a.handler('b', 0, state);
				assert.deepStrictEqual(log.mock.calls, [
					['0     enter a'],
					['0:1   match a'],
					['0     enter a'],
					['0     fail a'],
				]);
			} finally {
				log.mockRestore();
			}
		});

		test('throw if the syntax does not return a parser', () => {
			const lang = P.createLanguage<{ a: string }>({
				// @ts-expect-error returning an invalid value
				a: () => null,
			});
			assert.throws(() => lang.a.handler('a', 0, createState()), /syntax must return a parser\./);
		});
	});
});

describe('nest budget', () => {
	test('nest while the budget remains', () => {
		const input = '**<i>a</i>**';
		const result = language.fullParser.handler(input, 0, { ...createState(), nestBudget: 2 });
		assert.ok(result.success);
		assert.deepStrictEqual(mergeText(result.value), [BOLD([ITALIC([TEXT('a')])])]);
	});

	test('stop nesting once the budget runs out', () => {
		const input = '**<i>a</i>**';
		const result = language.fullParser.handler(input, 0, { ...createState(), nestBudget: 0 });
		assert.ok(result.success);
		assert.deepStrictEqual(mergeText(result.value), [BOLD([TEXT('<i>a</i>')])]);
	});

	test('no limit without the budget', () => {
		const input = '**<i>a</i>**';
		const result = language.fullParser.handler(input, 0, createState());
		assert.ok(result.success);
		assert.deepStrictEqual(mergeText(result.value), [BOLD([ITALIC([TEXT('a')])])]);
	});
});
