{
	const {
		createTree,
		mergeText
	} = require('./parser-utils');

	function applyParser(input, startRule) {
		let parseFunc = peg$parse;
		return parseFunc(input, startRule ? { startRule } : { });
	}
}

rootParser
	= ts:(block / inline)* { return mergeText(ts); }

plainParser
	= ts:(text /*/ emoji*/)* { return mergeText(ts); }

inlineParser
	= ts:(inline)* { return mergeText(ts); }

block
	= title
	/ quote
	/ search
	/ blockCode
	/ mathBlock
	/ center

inline
	= big
	/ bold
	/ small
	/ italic
	/ strike
	/ motion
	/ spin
	/ jump
	/ flip
	// / inlineCode
	// / mathInline
	// / mention
	// / hashtag
	// / url
	// / link
	// / emoji
	/ text

text
	= c:. { return createTree('text', { text: c }); }


// block: title

title
	= titleA / titleB

titleA
	= BEGINLINE "【" content:(!(NEWLINE / "】" ENDLINE) i:inline { return i; })+ "】" ENDLINE
{
	return createTree('title', { }, mergeText(content));
}

titleB
	= BEGINLINE "[" content:(!(NEWLINE / "]" ENDLINE) i:inline { return i; })+ "]" ENDLINE
{
	return createTree('title', { }, mergeText(content));
}


// block: quote

quote
	= lines:quote_line+
{
	const children = applyParser(lines.join('\n'), 'rootParser');
	return createTree('quote', { }, children);
}

quote_line
	= BEGINLINE (!"><" ">" / !"＞＜" "＞") _? content:$(CHAR+) ENDLINE { return content; }


// block: search

search
	= BEGINLINE q:search_query _ search_keyToken ENDLINE
{
	return createTree('search', {
		query: q,
		content: text()
	});
}

search_query
	= $(!(_ search_keyToken ENDLINE) c:CHAR { return c; })+

search_keyToken
	= "検索" / "search"i


// block: blockCode

blockCode
	= BEGINLINE "```" lang:$(CHAR*) NEWLINE lines:blockCode_line* "```" ENDLINE
{
	return createTree('blockCode', {
		code: lines.join('\n'),
		lang: lang.length > 0 ? lang : null,
	});
}

blockCode_line
	= !("```" ENDLINE) line:$(CHAR+) NEWLINE { return line; }


// block: mathBlock

mathBlock
	= BEGINLINE "\\[" content:$(!"\\]" c:. { return c; })+ "\\]" ENDLINE
{
	return createTree('mathBlock', {
		formula: content.trim()
	});
}


// block: center

center
	= BEGINLINE "<center>" content:(!"</center>" i:inline { return i; })+ "</center>"
{
	return createTree('center', { }, mergeText(content));
}


// inline: big

big
	= "***" content:(!"***" i:inline { return i; })+ "***"
{
	return createTree('big', { }, mergeText(content));
}


// inline: bold

bold
	= boldA / boldB

boldA
	= "**" content:(!"**" i:inline { return i; })+ "**"
{
	return createTree('bold', { }, mergeText(content));
}

boldB
	= "__" content:$(!"__" c:[a-zA-Z0-9 \t] { return c; })+ "__"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return createTree('bold', { }, parsedContent);
}


// inline: small

small
	= "<small>" content:(!"</small>" i:inline { return i; })+ "</small>"
{
	return createTree('small', { }, mergeText(content));
}


// inline: italic

italic
	= italicA / italicB / italicC

italicA
	= "<i>" content:(!"</i>" i:inline { return i; })+ "</i>"
{
	return createTree('italic', { }, mergeText(content));
}

italicB
	= "*" content:$(!"*" c:[a-zA-Z0-9 \t] { return c; })+ "*"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return createTree('italic', { }, parsedContent);
}

italicC
	= "_" content:$(!"_" c:[a-zA-Z0-9 \t] { return c; })+ "_"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return createTree('italic', { }, parsedContent);
}


// inline: strike

strike
	= "~~" content:(!"~~" i:inline { return i; })+ "~~"
{
	return createTree('strike', { }, mergeText(content));
}


// inline: motion

motion
	= motionA / motionB

motionA
	= "<motion>" content:(!"</motion>" i:inline { return i; })+ "</motion>"
{
	return createTree('motion', { }, mergeText(content));
}

motionB
	= "(((" content:(!")))" i:inline { return i; })+ ")))"
{
	return createTree('motion', { }, mergeText(content));
}


// inline: spin

spin
	= "<spin" attr:spin_attr? ">" content:(!"</spin>" i:inline { return i; })+ "</spin>"
{
	return createTree('spin', { attr: attr }, mergeText(content));
}

spin_attr
	= _ str:$(!">" CHAR)* { return str; }


// inline: jump

jump
	= "<jump>" content:(!"</jump>" i:inline { return i; })+ "</jump>"
{
	return createTree('jump', { }, mergeText(content));
}


// inline: flip

flip
	= "<flip>" content:(!"</flip>" i:inline { return i; })+ "</flip>"
{
	return createTree('flip', { }, mergeText(content));
}


// Core rules

CHAR
	= !NEWLINE c:. { return c; }

ENDLINE
	= NEWLINE / EOF

NEWLINE
	= "\r\n" / [\r\n]

BEGINLINE
	= &{ return location().start.column == 1; }

EOF
	= !.

_ "whitespace"
	= [ 　\t]
