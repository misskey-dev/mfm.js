import { CENTER, MfmCenter, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { pushNode } from '../../services/nodeTree';
import { inlineParser } from '../parser';
import { lineEndParser, syntax } from '../services';

export const centerTagParser: Parser<MfmCenter> = syntax('centerTag', (ctx) => {
	let match, isMatch;

	// begin of line
	if (ctx.location(ctx.pos).column !== 0) {
		return ctx.fail();
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

	// end of line
	match = lineEndParser(ctx);
	if (!match.ok) {
		return ctx.fail();
	}

	return ctx.ok(CENTER(children));
});
