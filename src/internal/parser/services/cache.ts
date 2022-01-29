import { MfmNode } from '../../../node';

export type CacheItem<T extends MfmNode> = {
	pos: number;
	result: T;
};

export enum SyntaxId {
	Big = 0,
	BoldAsta,
	BoldUnder,
	BoldTag,
	Center,
	CodeBlock,
	EmojiCode,
	Fn,
	HashTag,
	InlineCode,
	ItalicAsta,
	ItalicUnder,
	ItalicTag,
	Link,
	SilentLink,
	MathBlock,
	MathInline,
	Mention,
	Quote,
	Search,
	Small,
	StrikeTag,
	StrikeTilde,
	UnicodeEmoji,
	Url,
	UrlAlt,

	COUNT,
}
