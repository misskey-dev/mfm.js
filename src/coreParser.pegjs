start = root

// general

space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak

// titile

title_nestContent
	= inline

titleA_char
	= !(title_nestContent / lineBreak / "】") c:. { return c; }

titleA_text
	= t:$(titleA_char+) { return t; }

titleA_content
	= (title_nestContent / titleA_text)+

titleA
	= "【" titleA_content "】"

titleB_char
	= !(title_nestContent / lineBreak / "]") c:. { return c; }

titleB_text
	= t:$(titleB_char+) { return t; }

titleB_content
	=  (title_nestContent / titleB_text)+

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
