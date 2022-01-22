import { CODE_BLOCK } from '../../../node';
import { MatcherContext } from '../services/matcher';

export function codeBlockMatcher(ctx: MatcherContext) {
	// TODO

	return ctx.ok(CODE_BLOCK('', null));
}
