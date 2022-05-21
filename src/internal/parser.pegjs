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

	function applyParser(input, startRule, opts) {
		const parseFunc = peg$parse;
		const parseOpts = {
			fnNameList: options.fnNameList,
			nestLimit: (nestLimit - depth),
			...(opts || {}),
		};
		if (startRule) parseOpts.startRule = startRule;
		return parseFunc(input, parseOpts);
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

	const nestLimit = (options.nestLimit != null ? options.nestLimit : 20);
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

L_inline
	= emojiCode
	/ unicodeEmoji
	/ L_big
	/ L_bold
	/ L_small
	/ L_italic
	/ L_strike
	/ inlineCode
	/ mathInline
	/ L_fn
	/ L_inlineText

plain
	= emojiCode
	/ unicodeEmoji
	/ plainText

//
// block rules
//

// block: quote

quote
	= &(BEGIN ">") &{ return (depth + 1 <= nestLimit); } @quoteInner LF?

quoteInner
	= head:(quoteLine / quoteEmptyLine) tails:(quoteLine / quoteEmptyLine)+
{
	depth++;
	const children = applyParser([head, ...tails].join('\n'), 'fullParser');
	depth--;
	return QUOTE(children);
}
	/ line:quoteLine
{
	depth++;
	const children = applyParser(line, 'fullParser');
	depth--;
	return QUOTE(children);
}

quoteLine
	= BEGIN ">" _? @$CHAR+ END

quoteEmptyLine
	= BEGIN ">" _? END
{
	return '';
}

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
	= BEGIN "<center>" LF? content:(!(LF? "</center>" END) @inline)* LF? "</center>" END
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

L_big
	= "***" content:L_bigContent "***"
{
	return FN('tada', { }, mergeText(content));
}

L_bigContent
	= &{ return enterNest(); } @(@(!"***" @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

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
	return BOLD([TEXT(content)]);
}

boldContent
	= &{ return enterNest(); } @(@(!"**" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

boldTagContent
	= &{ return enterNest(); } @(@(!"</b>" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

L_bold
	= "**" content:L_boldContent "**"
{
	return BOLD(mergeText(content));
}
	/ "<b>" content:L_boldTagContent "</b>"
{
	return BOLD(mergeText(content));
}
	/ "__" content:$(!"__" @([a-z0-9]i / _))+ "__"
{
	return BOLD([TEXT(content)]);
}

L_boldContent
	= &{ return enterNest(); } @(@(!"**" @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

L_boldTagContent
	= &{ return enterNest(); } @(@(!"</b>" @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: small

small
	= "<small>" content:smallContent "</small>"
{
	return SMALL(mergeText(content));
}

smallContent
	= &{ return enterNest(); } @(@(!"</small>" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

L_small
	= "<small>" content:L_smallContent "</small>"
{
	return SMALL(mergeText(content));
}

L_smallContent
	= &{ return enterNest(); } @(@(!"</small>" @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

// inline: italic

italic
	= "<i>" content:italicContent "</i>"
{
	return ITALIC(mergeText(content));
}
	/ italicAlt

L_italic
	= "<i>" content:L_italicContent "</i>"
{
	return ITALIC(mergeText(content));
}
	/ italicAlt

italicAlt
	= "*" content:$([a-z0-9]i / _)+ "*" &(EOF / LF / _ / ![a-z0-9]i)
{
	return ITALIC([TEXT(content)]);
}
	/ "_" content:$([a-z0-9]i / _)+ "_" &(EOF / LF / _ / ![a-z0-9]i)
{
	return ITALIC([TEXT(content)]);
}

italicContent
	= &{ return enterNest(); } @(@(!"</i>" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

L_italicContent
	= &{ return enterNest(); } @(@(!"</i>" @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

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
	= &{ return enterNest(); } @(@(!"</s>" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

L_strike
	= "~~" content:L_strikeContent "~~"
{
	return STRIKE(mergeText(content));
}
	/ "<s>" content:L_strikeTagContent "</s>"
{
	return STRIKE(mergeText(content));
}

L_strikeContent
	= &{ return enterNest(); } @(@(!("~" / LF) @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

L_strikeTagContent
	= &{ return enterNest(); } @(@(!"</s>" @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

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
	= (!"]" @L_inline)+

// inline: fn

fn
	= "$[" name:$([a-z0-9_]i)+ &{ return ensureFnName(name); } args:fnArgs? _ content:fnContent "]"
{
	args = args || {};
	return FN(name, args, mergeText(content));
}

L_fn
	= "$[" name:$([a-z0-9_]i)+ &{ return ensureFnName(name); } args:fnArgs? _ content:L_fnContent "]"
{
	args = args || {};
	return FN(name, args, mergeText(content));
}

fnContent
	= &{ return enterNest(); } @(@(!"]" @inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

L_fnContent
	= &{ return enterNest(); } @(@(!"]" @L_inline)+ &{ return leaveNest(); } / &{ return fallbackNest(); })

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

L_inlineText
	= !(LF / _) [a-z0-9]i &italicAlt . { return text(); } // italic ignore
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
