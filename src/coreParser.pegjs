start = root

// general

space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak

// title

titleA_char
	= !(lineBreak / "】") c:. { return c; }

titleA_content
	= t:$(titleA_char+) { return t; }

titleA
	= "【" titleA_content "】"

titleB_char
	= !(lineBreak / "]") c:. { return c; }

titleB_content
	= t:$(titleB_char+) { return t; }

titleB
	= "[" titleB_content "]"

title
	= titleA / titleB

// blockCode

blockCode_char
	= !(lineBreak / "```") c:. { return c; }

blockCode_line
	= t:$(blockCode_char*) lineBreak { return t; }

blockCode
	= "```" lineBreak blockCode_line* "```"

// parts

plain
	= emoji
	/ text

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
	/ inlineCode
	/ mathInline
	/ mention
	/ hashtag
	/ url
	/ link
	/ plain

root
	= block
	/ inline
