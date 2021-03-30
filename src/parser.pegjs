{
	const {
		createNode,
		mergeText,
		setConsumeCount,
		consumeDynamically
	} = require('./util');

	function applyParser(input, startRule) {
		let parseFunc = peg$parse;
		return parseFunc(input, startRule ? { startRule } : { });
	}

	// emoji

	const emojiRegex = require('twemoji-parser/dist/lib/regex').default;
	const anchoredEmojiRegex = RegExp(`^(?:${emojiRegex.source})`);

	/**
	 * check if the input matches the emoji regexp.
	 * if they match, set the byte length of the emoji.
	*/
	function matchUnicodeEmoji() {
		const offset = location().start.offset;
		const src = input.substr(offset);

		const result = anchoredEmojiRegex.exec(src);
		if (result != null) {
			setConsumeCount(result[0].length); // length(utf-16 byte length) of emoji sequence.
			return true;
		}

		return false;
	}
}

//
// parsers
//

fullParser
	= nodes:(&. n:(block / inline) { return n; })* { return mergeText(nodes); }

plainParser
	= nodes:(&. n:(emojiCode / unicodeEmoji / text) { return n; })* { return mergeText(nodes); }

inlineParser
	= nodes:(&. n:inline { return n; })* { return mergeText(nodes); }

//
// block rules
//

block
	= quote
	/ search
	/ codeBlock
	/ mathBlock
	/ center

// block: quote

quote
	= lines:quoteLine+
{
	const children = applyParser(lines.join('\n'), 'fullParser');
	return createNode('quote', null, children);
}

quoteLine
	= BEGIN ">" _? text:$(CHAR+) END { return text; }

// block: search

search
	= BEGIN q:searchQuery sp:_ key:searchKey END
{
	return createNode('search', {
		query: q,
		content: `${ q }${ sp }${ key }`
	});
}

searchQuery
	= (!(_ searchKey END) CHAR)+ { return text(); }

searchKey
	= "[" ("検索" / "Search"i) "]" { return text(); }
	/ "検索"
	/ "Search"i

// block: codeBlock

codeBlock
	= BEGIN "```" lang:$(CHAR*) LF code:codeBlockContent LF "```" END
{
	lang = lang.trim();
	return createNode('blockCode', {
		code: code,
		lang: lang.length > 0 ? lang : null,
	});
}

codeBlockContent
	= (!(LF "```" END) .)+
{ return text(); }

// block: mathBlock

mathBlock
	= BEGIN "\\[" LF? formula:mathBlockLines LF? "\\]" END
{
	return createNode('mathBlock', {
		formula: formula.trim()
	});
}

mathBlockLines
	= mathBlockLine (LF mathBlockLine)*
{ return text(); }

mathBlockLine
	= (!"\\]" CHAR)+

// block: center

center
	= BEGIN "<center>" LF? content:(!(LF? "</center>" END) i:inline { return i; })+ LF? "</center>" END
{
	return createNode('center', null, mergeText(content));
}

//
// inline rules
//

inline
	= emojiCode
	/ unicodeEmoji
	/ big
	/ bold
	/ small
	/ italic
	/ strike
	/ inlineCode
	/ mathInline
	/ mention
	/ hashtag
	/ url
	/ link
	/ fn
	/ text

// inline: emoji code

emojiCode
	= ":" name:emojiCodeName ":"
{
	return createNode('emojiCode', { name: name });
}

emojiCodeName
	= [a-z0-9_+-]i+ { return text(); }

// inline: unicode emoji

// NOTE: if the text matches one of the emojis, it will count the length of the emoji sequence and consume it.
unicodeEmoji
	= &{ return matchUnicodeEmoji(); } (&{ return consumeDynamically(); } .)+
{
	return createNode('unicodeEmoji', { emoji: text() });
}

// inline: big

big
	= "***" content:(!"***" i:inline { return i; })+ "***"
{
	return createNode('fn', {
		name: 'tada',
		args: { }
	}, mergeText(content));
}

// inline: bold

bold
	= "**" content:(!"**" i:inline { return i; })+ "**"
{
	return createNode('bold', null, mergeText(content));
}
	/ "__" content:$(!"__" c:([a-z0-9]i / _) { return c; })+ "__"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return createNode('bold', null, parsedContent);
}

// inline: small

small
	= "<small>" content:(!"</small>" i:inline { return i; })+ "</small>"
{
	return createNode('small', null, mergeText(content));
}

// inline: italic

italic
	= "<i>" content:(!"</i>" i:inline { return i; })+ "</i>"
{
	return createNode('italic', null, mergeText(content));
}
	/ "*" content:$(!"*" ([a-z0-9]i / _))+ "*"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return createNode('italic', null, parsedContent);
}
	/ "_" content:$(!"_" ([a-z0-9]i / _))+ "_"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return createNode('italic', null, parsedContent);
}

// inline: strike

strike
	= "~~" content:(!("~" / LF) i:inline { return i; })+ "~~"
{
	return createNode('strike', null, mergeText(content));
}

// inline: inlineCode

inlineCode
	= "`" content:$(!"`" c:CHAR { return c; })+ "`"
{
	return createNode('inlineCode', {
		code: content
	});
}

// inline: mathInline

mathInline
	= "\\(" content:$(!"\\)" c:CHAR { return c; })+ "\\)"
{
	return createNode('mathInline', {
		formula: content
	});
}

// inline: mention

mention
	= "@" name:mentionName host:("@" host:mentionHost { return host; })?
{
	return createNode('mention', {
		username: name,
		host: host,
		acct: text()
	});
}

mentionName
	= !"-" mentionNamePart+ // first char is not "-".
{
	return text();
}

mentionNamePart
	= "-" &mentionNamePart // last char is not "-".
	/ [a-z0-9_]i

mentionHost
	= ![.-] mentionHostPart+ // first char is neither "." nor "-".
{
	return text();
}

mentionHostPart
	= [.-] &mentionHostPart // last char is neither "." nor "-".
	/ [a-z0-9_]i

// inline: hashtag

hashtag
	= "#" content:hashtagContent
{
	return createNode('hashtag', { hashtag: content });
}

hashtagContent
	= (hashtagBracketPair / hashtagChar)+ { return text(); }

hashtagBracketPair
	= "(" hashtagContent* ")"
	/ "[" hashtagContent* "]"
	/ "「" hashtagContent* "」"

hashtagChar
	= ![ 　\t.,!?'"#:\/\[\]【】()「」] CHAR

// inline: URL

url
	= "<" url:urlFormat ">"
{
	return createNode('url', { url: url });
}
	/ url:urlFormat
{
	return createNode('url', { url: url });
}

urlFormat
	= "http" "s"? "://" urlContent
{
	return text();
}

urlContent
	= urlContentPart+

urlContentPart
	= urlBracketPair
	/ [.,] &urlContentPart // last char is neither "." nor ",".
	/ [a-z0-9_/:%#@$&?!~=+-]i

urlBracketPair
	= "(" urlContentPart* ")"
	/ "[" urlContentPart* "]"

// inline: link

link
	= silent:"?"? "[" label:linkLabel "](" url:linkUrl ")"
{
	return createNode('link', {
		silent: (silent != null),
		url: url
	}, mergeText(label));
}

linkLabel
	= (!"]" n:inline { return n; })+

linkUrl
	= url { return text(); }

// inline: fn

fn
	= "[" name:$([a-z0-9_]i)+ args:fnArgs? _ content:(!"]" i:inline { return i; })+ "]"
{
	args = args || {};
	return createNode('fn', {
		name: name,
		args: args
	}, mergeText(content));
}

fnArgs
	= "." head:fnArg tails:("," arg:fnArg { return arg; })*
{
	const args = { };
	for (const pair of [head, ...tails]) {
		args[pair.k] = pair.v;
	}
	return args;
}

fnArg
	= k:$([a-z0-9_]i)+ "=" v:$([a-z0-9_]i)+
{
	return { k, v };
}
	/ k:$([a-z0-9_]i)+
{
	return { k: k, v: true };
}

// inline: text

text
	= .

//
// General
//

BEGIN "beginning of line"
	= LF / &{ return location().start.column == 1; }

END "end of line"
	= LF / EOF

EOF
	= !.

CHAR
	= !LF . { return text(); }

LF
	= "\r\n" / [\r\n]

_ "whitespace"
	= [ 　\t\u00a0]
