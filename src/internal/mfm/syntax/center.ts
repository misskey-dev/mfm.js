import { CENTER, MfmCenter, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser, syntax } from '../parser';

export const centerTagParser: Parser<MfmCenter> = syntax((ctx) => {
	let match, isMatch;

	// line-head
	if (ctx.pos !== 0) {
		// TODO: check column 0
	}

	// "<center>"
	if (!ctx.str('<center>').ok) {
		return ctx.fail();
	}

	// optional LF
	ctx.regex(/^(\r\n|[\r\n])/);

	// children
	const children: MfmInline[] = [];
	while (true) {
		isMatch = ctx.match(() => {
			ctx.regex(/^(\r\n|[\r\n])/); // option
			return ctx.str('</center>');
		});
		if (isMatch) break;

		match = ctx.parser(inlineParser);
		if (!match.ok) break;

		pushNode(match.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// optional LF
	ctx.regex(/^(\r\n|[\r\n])/);

	// "</center>"
	if (!ctx.str('</center>').ok) {
		return ctx.fail();
	}

	// TODO: check line-end

	return ctx.ok(CENTER(children));
});
