import assert from 'assert';
import { ParserContext } from '../src/internal/services/parser';

describe('ParserContext', () => {

	describe('matchRegex', () => {
		it('offset -1', () => {
			const ctx = new ParserContext('\na', {});
			ctx.pos = 1;
			const result = ctx.matchRegex(/^[\r\n \u3000\t\u00a0]/i, -1);
			assert.ok(result === true);
		});
	});

});
