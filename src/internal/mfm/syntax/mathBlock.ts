import { MATH_BLOCK, MfmMathBlock } from '../../../node';
import { cache, Parser } from '../../services/parser';

export const mathBlockParser: Parser<MfmMathBlock> = cache((ctx) => {
	// TODO

	return ctx.ok(MATH_BLOCK(''));
});
