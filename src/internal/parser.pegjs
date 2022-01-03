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

	function ensureFnName(name) {
		if (!options.fnNameList) return true;
		if (!Array.isArray(options.fnNameList)) {
			error("options.fnNameList must be an array.");
		}
		return options.fnNameList.includes(name);
	}

	// nesting control

	const nestLimit = options.nestLimit || 10;
	let depth = 0;
	function enterNest() {
		if (depth + 1 > nestLimit) {
			return false;
		}
		depth++;
		return true;
	}

	function leaveNest() {
		depth--;
		return true;
	}

	function fallbackNest() {
		depth--;
		return false;
	}
}

//
// parsers
//

fullParser
	= nodes:(&. @full)* { return mergeText(nodes); }

plainParser
	= nodes:(&. @plain)* { return mergeText(nodes); }

inlineParser
	= nodes:(&. @inline)* { return mergeText(nodes); }

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
	/ fn
	/ link
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
	/ fn
	/ link
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
	= head:(quoteLine / quoteEmptyLine) tails:(quoteLine / quoteEmptyLine)+
{
	const children = applyParser([head, ...tails].join('\n'), 'fullParser');
	return QUOTE(children);
}
	/ line:quoteLine
{
	const children = applyParser(line, 'fullParser');
	return QUOTE(children);
}

quoteLine
	= BEGIN ">" _? text:$CHAR+ END { return text; }

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
	= BEGIN "<center>" LF? content:(!(LF? "</center>" END) @inline)+ LF? "</center>" END
{
	return CENTER(mergeText(content));
}

//
// inline rules
//

// inline: emoji code

emojiCode
	= ":" name:$[a-z0-9_+-]i+ ":"
{
	return EMOJI_CODE(name);
}

// inline: unicode emoji

// NOTE: if the text matches one of the emojis, it will count the length of the emoji sequence and consume it.
unicodeEmoji
	= &{ return matchUnicodeEmoji(); } (&{ return consumeDynamically(); } .)+
{
	return UNI_EMOJI(text());
}

// inline: big

big
	= "***" content:bigContent "***"
{
	return FN('tada', { }, mergeText(content));
}

bigContent
	= &{ return enterNest(); } @(@(!"***" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: bold

bold
	= "**" content:boldContent "**"
{
	return BOLD(mergeText(content));
}
	/ "<b>" content:boldTagContent "</b>"
{
	return BOLD(mergeText(content));
}
	/ "__" content:$(!"__" @([a-z0-9]i / _))+ "__"
{
	const parsedContent = applyParser(content, 'inlineParser');
	return BOLD(parsedContent);
}

boldContent
	= &{ return enterNest(); } @(@(!"**" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

boldTagContent
	= &{ return enterNest(); } @(@(!"</b>" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: small

small
	= "<small>" content:smallContent "</small>"
{
	return SMALL(mergeText(content));
}

smallContent
	= &{ return enterNest(); } @(@(!"</small>" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: italic

italic
	= "<i>" content:italicContent "</i>"
{
	return ITALIC(mergeText(content));
}
	/ italicAlt

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

italicContent
	= &{ return enterNest(); } @(@(!"</i>" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: strike

strike
	= "~~" content:strikeContent "~~"
{
	return STRIKE(mergeText(content));
}
	/ "<s>" content:strikeTagContent "</s>"
{
	return STRIKE(mergeText(content));
}

strikeContent
	= &{ return enterNest(); } @(@(!("~" / LF) @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

strikeTagContent
	= &{ return enterNest(); } @(@(!("</s>" / LF) @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: inlineCode

inlineCode
	= "`" content:$(![`´] CHAR)+ "`"
{
	return INLINE_CODE(content);
}

// inline: mathInline

mathInline
	= "\\(" content:$(!"\\)" CHAR)+ "\\)"
{
	return MATH_INLINE(content);
}

// inline: mention

mention
	= "@" name:mentionName host:("@" @mentionHost)?
{
	return MENTION(name, host, text());
}

mentionName
	= [a-z0-9_]i (&("-"+ [a-z0-9_]i) . / [a-z0-9_]i)*
{
	// NOTE: first char and last char are not "-".
	return text();
}

mentionHost
	= [a-z0-9_]i (&([.-]i+ [a-z0-9_]i) . / [a-z0-9_]i)*
{
	// NOTE: first char and last char are neither "." nor "-".
	return text();
}

// inline: hashtag

hashtag
	= "#" !("\uFE0F"? "\u20E3") !(invalidHashtagContent !hashtagContentPart) content:$hashtagContentPart+
{
	return HASHTAG(content);
}

invalidHashtagContent
	= [0-9]+

hashtagContentPart
	= "(" hashPairInner ")"
	/ "[" hashPairInner "]"
	/ "「" hashPairInner "」"
	/ ![ 　\t.,!?'"#:\/\[\]【】()「」<>] CHAR

hashPairInner
	= &{ return enterNest(); } @(@hashtagContentPart* &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: URL

url
	= "<" url:$("http" "s"? "://" (!(">" / _) CHAR)+) ">"
{
	return N_URL(url, true);
}
	/ "http" "s"? "://" (&([.,]+ urlContentPart) . / urlContentPart)+
{
	// NOTE: last char is neither "." nor ",".
	return N_URL(text());
}

urlContentPart
	= "(" urlPairInner ")"
	/ "[" urlPairInner "]"
	/ [a-z0-9_/:%#@$&?!~=+-]i

urlPairInner
	= &{ return enterNest(); } @(@(urlContentPart / [.,])* &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: link

link
	= silent:"?"? "[" label:linkLabel "](" url:url ")"
{
	return LINK((silent != null), url.props.url, mergeText(label));
}

linkLabel
	= (!"]" linkLabelPart)+

linkLabelPart
	= emojiCode
	/ unicodeEmoji
	/ big
	/ bold
	/ small
	/ italic
	/ strike
	/ inlineCode
	/ mathInline
	/ hashtag
	/ fn
	/ inlineText

// inline: fn

fn
	= "$[" name:$([a-z0-9_]i)+ &{ return ensureFnName(name); } args:fnArgs? _ content:fnContent "]"
{
	args = args || {};
	return FN(name, args, mergeText(content));
}

fnContent
	= &{ return enterNest(); } @(@(!"]" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

fnArgs
	= "." head:fnArg tails:("," @fnArg)*
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
