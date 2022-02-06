import { MATH_BLOCK, MfmMathBlock } from '../../../node';
import { Parser, ParserContext, Result } from '../../services/parser';
import { syntax } from '../services/syntaxParser';
import { lineEndParser } from '../services/utility';

function lineParser(ctx: ParserContext): Result<string> {
	let line = '';
	while (true) {
		// "\\]"
		if (ctx.matchStr('\\]')) break;
		// LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;

		const match = ctx.anyChar();
		if (!match.ok) break;
		line += match.result;
	}
	if (line.length === 0) {
		return ctx.fail();
	}
	return ctx.ok(line);
}

export const mathBlockParser: Parser<MfmMathBlock> = syntax('mathBlock', (ctx) => {
	let match;

	// begin of line
	if (ctx.location(ctx.pos).column !== 0) {
		return ctx.fail();
	}

	// "\["
	if (!ctx.str('\\[').ok) {
		return ctx.fail();
	}

	// optional LF
	ctx.regex(/^(\r\n|[\r\n])/);

	// formula
	const beginFormula = ctx.pos;
	match = ctx.parser(lineParser);
	if (!match.ok) {
		return ctx.fail();
	}
	while (true) {
		match = ctx.sequence([
			() => ctx.regex(/^(\r\n|[\r\n])/),
			lineParser,
		]);
		if (!match.ok) break;
	}
	const formula = ctx.input.substring(beginFormula, ctx.pos);

	// optional LF
	ctx.regex(/^(\r\n|[\r\n])/);

	// "\]"
	if (!ctx.str('\\]').ok) {
		return ctx.fail();
	}

	// end of line
	match = lineEndParser(ctx);
	if (!match.ok) {
		return ctx.fail();
	}

	return ctx.ok(MATH_BLOCK(formula.trim()));
});
