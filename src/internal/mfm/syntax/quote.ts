import { fullMfmParser } from '..';
import { MfmQuote, QUOTE } from '../../../node';
import { Parser, ParserContext } from '../../services/parser';
import { syntax } from '../services/syntaxParser';

function lineParser(ctx: ParserContext) {
	// begin of line
	if (ctx.location(ctx.pos).column !== 0) {
		return ctx.fail();
	}

	// ">"
	if (!ctx.str('>').ok) {
		return ctx.fail();
	}

	// option _
	ctx.regex(/^[ \u3000\t\u00a0]/);

	let content = '';
	while (true) {
		// not-predicate LF
		if (ctx.matchRegex(/^(\r\n|[\r\n])/)) break;

		// any char
		const match = ctx.anyChar();
		if (!match.ok) break;
		content += match.result;
	}

	return ctx.ok(content);
}

export const quoteParser: Parser<MfmQuote> = syntax('quote', (ctx) => {
	let match;

	// lines
	const lines: string[] = [];
	match = ctx.parser(lineParser);
	if (!match.ok) {
		return ctx.fail();
	}
	lines.push(match.result);
	while (true) {
		match = ctx.sequence([
			() => ctx.regex(/^(\r\n|[\r\n])/),
			lineParser,
		]);
		if (!match.ok) break;
		const line = match.result[1];
		lines.push(line);
	}

	// after option LF
	ctx.regex(/^(\r\n|[\r\n])/);

	// failure if single line and the line is empty
	if (lines.length === 1 && lines[0].length === 0) {
		return ctx.fail();
	}

	const children = fullMfmParser(lines.join('\n'), {
		fnNameList: ctx.fnNameList,
		nestLimit: ctx.nestLimit,
	});

	return ctx.ok(QUOTE(children));
});
