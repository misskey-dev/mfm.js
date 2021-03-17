import assert from 'assert';
import { parse, parsePlain } from '../built/index';
import { createNode } from '../built/mfm-node';
import {
	TEXT, EMOJI
} from './node';

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
