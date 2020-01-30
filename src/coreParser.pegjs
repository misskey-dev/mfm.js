start = root

// general

space
	= [ \t]
lineBreak
	= "\n" / "\r\n" / "\r"
spacing
	= space / lineBreak

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
