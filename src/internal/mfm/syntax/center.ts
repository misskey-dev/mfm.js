import { CENTER, MfmCenter, MfmInline } from '../../../node';
import { Parser } from '../../services/parser';
import { inlineParser } from '../services/mfmParser';
import { pushNode } from '../services/nodeTree';
import { syntax } from '../services/syntaxParser';
import { LfParser, lineEndParser } from '../services/utility';

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
	ctx.parser(LfParser);

	// children
	const children: MfmInline[] = [];
	while (true) {
		isMatch = ctx.match(() => {
			ctx.parser(LfParser); // option
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
	ctx.parser(LfParser);

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
