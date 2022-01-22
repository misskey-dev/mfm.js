import { INLINE_CODE } from '../../../node';
import { MatcherContext } from '../services/matcher';

export function inlineCodeMatcher(ctx: MatcherContext) {
	// TODO

	return ctx.ok(INLINE_CODE(''));
}
