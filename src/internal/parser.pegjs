{
	const {
		// block
		QUOTE,
		SEARCH,
		CODE_BLOCK,
		MATH_BLOCK,
		CENTER,

		// inline
		UNI_EMOJI,
		EMOJI_CODE,
		BOLD,
		SMALL,
		ITALIC,
		STRIKE,
		INLINE_CODE,
		MATH_INLINE,
		MENTION,
		HASHTAG,
		N_URL,
		LINK,
		FN,
		TEXT
	} = require('../node');

	const {
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
	= nodes:(&. n:full { return n; })* { return mergeText(nodes); }

plainParser
	= nodes:(&. n:plain { return n; })* { return mergeText(nodes); }

inlineParser
	= nodes:(&. n:inline { return n; })* { return mergeText(nodes); }

//
// syntax list
//

full
	= quote // block
	/ codeBlock // block
	/ mathBlock // block
	/ center // block
	/ emojiCode
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
	/ fnVer2
	/ link
	/ fnVer1
	/ search // block
	/ inlineText

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
	/ fnVer2
	/ link
	/ fnVer1
	/ inlineText

plain
	= emojiCode
	/ unicodeEmoji
	/ plainText

//
// block rules
//

// block: quote

quote
	= &(BEGIN ">") q:quoteInner LF? { return q; }

quoteInner
	= head:quoteMultiLine tails:quoteMultiLine+
{
	const children = applyParser([head, ...tails].join('\n'), 'fullParser');
	return QUOTE(children);
}
	/ line:quoteLine
{
	const children = applyParser(line, 'fullParser');
	return QUOTE(children);
}

quoteMultiLine
	= quoteLine / quoteEmptyLine

quoteLine
	= BEGIN ">" _? text:$(CHAR+) END { return text; }

quoteEmptyLine
	= BEGIN ">" _? END { return ''; }

// block: search

search
	= BEGIN q:searchQuery sp:_ key:searchKey END
{
	return SEARCH(q, `${ q }${ sp }${ key }`);
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
	return CODE_BLOCK(code, lang.length > 0 ? lang : null);
}

codeBlockContent
	= (!(LF "```" END) .)+
{ return text(); }

// block: mathBlock

mathBlock
	= BEGIN "\\[" LF? formula:mathBlockLines LF? "\\]" END
{
	return MATH_BLOCK(formula.trim());
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
	return CENTER(mergeText(content));
}

//
// inline rules
//

// inline: emoji code

emojiCode
	= ":" name:emojiCodeName ":"
{
	return EMOJI_CODE(name);
}

emojiCodeName
	= [a-z0-9_+-]i+ { return text(); }

// inline: unicode emoji

// NOTE: if the text matches one of the emojis, it will count the length of the emoji sequence and consume it.
unicodeEmoji
	= &{ return matchUnicodeEmoji(); } (&{ return consumeDynamically(); } .)+
{
	return UNI_EMOJI(text());
}

// inline: big

big
	= "***" content:(!"***" i:inline { return i; })+ "***"
{
	return FN('tada', { }, mergeText(content));
}

// inline: bold

bold
	= "**" content:(!"**" i:inline { return i; })+ "**"
{
	return BOLD(mergeText(content));
}
	/ "__" content:$(!"__" c:([a-z0-9]i / _) { return c; })+ "__"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return BOLD(parsedContent);
}

// inline: small

small
	= "<small>" content:(!"</small>" i:inline { return i; })+ "</small>"
{
	return SMALL(mergeText(content));
}

// inline: italic

italic
	= italicTag
	/ italicAlt

italicTag
	= "<i>" content:(!"</i>" i:inline { return i; })+ "</i>"
{
	return ITALIC(mergeText(content));
}

italicAlt
	= "*" content:$(!"*" ([a-z0-9]i / _))+ "*" &(EOF / LF / _ / ![a-z0-9]i)
{
	const parsedContent = applyParser(content, 'inlineParser');
	return ITALIC(parsedContent);
}
	/ "_" content:$(!"_" ([a-z0-9]i / _))+ "_" &(EOF / LF / _ / ![a-z0-9]i)
{
	const parsedContent = applyParser(content, 'inlineParser');
	return ITALIC(parsedContent);
}

// inline: strike

strike
	= "~~" content:(!("~" / LF) i:inline { return i; })+ "~~"
{
	return STRIKE(mergeText(content));
}

// inline: inlineCode

inlineCode
	= "`" content:$(![`´] c:CHAR { return c; })+ "`"
{
	return INLINE_CODE(content);
}

// inline: mathInline

mathInline
	= "\\(" content:$(!"\\)" c:CHAR { return c; })+ "\\)"
{
	return MATH_INLINE(content);
}

// inline: mention

mention
	= "@" name:mentionName host:("@" host:mentionHost { return host; })?
{
	return MENTION(name, host, text());
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
	= "#" !("\uFE0F"? "\u20E3") content:hashtagContent
{
	return HASHTAG(content);
}

hashtagContent
	= !(invalidHashtagContent !hashtagContentPart) hashtagContentPart+ { return text(); }

invalidHashtagContent
	= [0-9]+

hashtagContentPart
	= hashtagBracketPair / hashtagChar

hashtagBracketPair
	= "(" hashtagContent* ")"
	/ "[" hashtagContent* "]"
	/ "「" hashtagContent* "」"

hashtagChar
	= ![ 　\t.,!?'"#:\/\[\]【】()「」] CHAR

// inline: URL

url
	= "<" url:altUrlFormat ">"
{
	return N_URL(url, true);
}
	/ url:urlFormat
{
	return N_URL(url);
}

urlFormat
	= "http" "s"? "://" urlContentPart+
{
	return text();
}

urlContentPart
	= urlBracketPair
	/ [.,] &urlContentPart // last char is neither "." nor ",".
	/ [a-z0-9_/:%#@$&?!~=+-]i

urlBracketPair
	= "(" urlContentPart* ")"
	/ "[" urlContentPart* "]"

altUrlFormat
	= "http" "s"? "://" (!(">" / _) CHAR)+
{
	return text();
}

// inline: link

link
	= silent:"?"? "[" label:linkLabel "](" url:linkUrl ")"
{
	return LINK((silent != null), url, mergeText(label));
}

linkLabel
	= parts:linkLabelPart+
{
	return parts;
}

linkLabelPart
	= url { return text(); /* text node */ }
	/ link { return text(); /* text node */ }
	/ mention { return text(); /* text node */ }
	/ !"]" n:inline { return n; }

linkUrl
	= url { return text(); }

// inline: fn

fnVer1
	= "[" name:$([a-z0-9_]i)+ args:fnArgs? _ content:fnContentPart+ "]"
{
	args = args || {};
	return FN(name, args, mergeText(content));
}

fnVer2
	= "$[" name:$([a-z0-9_]i)+ args:fnArgs? _ content:fnContentPart+ "]"
{
	args = args || {};
	return FN(name, args, mergeText(content));
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
	= k:$([a-z0-9_]i)+ "=" v:$([a-z0-9_.]i)+
{
	return { k, v };
}
	/ k:$([a-z0-9_]i)+
{
	return { k: k, v: true };
}

fnContentPart
	= !("]") i:inline { return i; }

// inline: text

inlineText
	= !(LF / _) [a-z0-9]i &(hashtag / mention / italicAlt) . { return text(); } // hashtag, mention, italic ignore
	/ . /* text node */

// inline: text (for plainParser)

plainText
	= . /* text node */

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
