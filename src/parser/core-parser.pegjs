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

inline
	= big
	/ bold
	/ text

text
	= c:. { return createTree('text', { text: c }); }


// block: title

title
	= titleA / titleB

titleA
	= BEGINLINE "【" content:(!("】" ENDLINE) i:inline { return i; })+ "】" ENDLINE
{
	return createTree('title', { }, mergeText(content));
}

titleB
	= BEGINLINE "[" content:(!("]" ENDLINE) i:inline { return i; })+ "]" ENDLINE
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
	= BEGINLINE ">" _? content:$(CHAR+) ENDLINE { return content; }


// block: search

search
	= BEGINLINE q:search_query sp:[ 　\t] key:search_keyToken ENDLINE
{
	return createTree('search', {
		query: q,
		content: [ q, sp, key ].join('')
	});
}

search_query
	= head:CHAR tail:(!([ 　\t] search_keyToken ENDLINE) c:CHAR { return c; })*
{
	return head + tail.join('');
}

search_keyToken
	= "検索" / "search"i


// block: blockCode

blockCode
	= BEGINLINE "```" lang:CHAR* NEWLINE lines:blockCode_line* "```" ENDLINE
{
	lang = lang.join('');
	return createTree('blockCode', {
		code: lines.join('\n'),
		lang: lang.length > 0 ? lang : null,
	});
}

blockCode_line
	= !("```" ENDLINE) line:$(CHAR+) NEWLINE { return line; }


// inline: big

big
	= "***" content:(!"***" i:inline { return i; })+ "***"
{
	return createTree('big', { }, mergeText(content));
}


// inline: bold

bold = bold_A / bold_B

bold_A
	= "**" content:(!"**" i:inline { return i; })+ "**"
{
	return createTree('bold', { }, mergeText(content));
}

bold_B
	= "__" content:(!"__" i:[a-zA-Z0-9 \t] { return i; })+ "__"
{
	const parsedContent = applyParser(content.join(''), 'inlineParser');
	return createTree('bold', { }, parsedContent);
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
	= [ \t]
