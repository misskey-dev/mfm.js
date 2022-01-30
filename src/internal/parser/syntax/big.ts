import { FN, MfmFn, MfmInline } from '../../../node';
import { CacheableMatcher, MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';

export class BigMatcher extends CacheableMatcher<MfmFn> {
	public name = 'big';

	public match(ctx: MatcherContext) {
		let matched;

		// "***"
		if (!ctx.matchStr('***')) {
			return ctx.fail();
		}
		ctx.pos += 3;
	
		// children
		const children: MfmInline[] = [];
		while (true) {
			if (ctx.matchStr('***')) break;
	
			matched = ctx.consume(inlineSyntaxMatcher);
			if (!matched.ok) break;
			pushNode(matched.result, children);
		}
		if (children.length < 1) {
			return ctx.fail();
		}
	
		// "***"
		if (!ctx.matchStr('***')) {
			return ctx.fail();
		}
		ctx.pos += 3;
	
		return ctx.ok(FN('tada', { }, children));
	}
}
