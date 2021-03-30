export type MfmNode = MfmBlock | MfmInline;

export type MfmPlainNode = MfmUnicodeEmoji | MfmEmojiCode | MfmText;

export type MfmBlock = MfmQuote | MfmSearch | MfmCodeBlock | MfmMathBlock | MfmCenter;

const blockTypes: MfmNode['type'][] = [ 'quote', 'search', 'blockCode', 'mathBlock', 'center' ];
export function isMfmBlock(node: MfmNode): node is MfmBlock {
	return blockTypes.includes(node.type);
}

export type MfmQuote = {
	type: 'quote';
	props?: { };
	children: MfmNode[];
};

export type MfmSearch = {
	type: 'search';
	props: {
		query: string;
		content: string;
	};
	children?: [];
};

export type MfmCodeBlock = {
	type: 'blockCode';
	props: {
		code: string;
		lang: string | null;
	};
	children?: [];
};

export type MfmMathBlock = {
	type: 'mathBlock';
	props: {
		formula: string;
	};
	children?: [];
};

export type MfmCenter = {
	type: 'center';
	props?: { };
	children: MfmInline[];
};

export type MfmInline = MfmUnicodeEmoji | MfmEmojiCode | MfmBold | MfmSmall | MfmItalic | MfmStrike |
	MfmInlineCode | MfmMathInline | MfmMention | MfmHashtag | MfmUrl | MfmLink | MfmFn | MfmText;

export type MfmUnicodeEmoji = {
	type: 'unicodeEmoji';
	props: {
		emoji: string;
	};
	children?: [];
};

export type MfmEmojiCode = {
	type: 'emojiCode';
	props: {
		name: string;
	};
	children?: [];
};

export type MfmBold = {
	type: 'bold';
	props?: { };
	children: MfmInline[];
};

export type MfmSmall = {
	type: 'small';
	props?: { };
	children: MfmInline[];
};

export type MfmItalic = {
	type: 'italic';
	props?: { };
	children: MfmInline[];
};

export type MfmStrike = {
	type: 'strike';
	props?: { };
	children: MfmInline[];
};

export type MfmInlineCode = {
	type: 'inlineCode';
	props: {
		code: string;
	};
	children?: [];
};

export type MfmMathInline = {
	type: 'mathInline';
	props: {
		formula: string;
	};
	children?: [];
};

export type MfmMention = {
	type: 'mention';
	props: {
		username: string;
		host: string | null;
		acct: string;
	};
	children?: [];
};

export type MfmHashtag = {
	type: 'hashtag';
	props: {
		hashtag: string;
	};
	children?: [];
};

export type MfmUrl = {
	type: 'url';
	props: {
		url: string;
	};
	children?: [];
};

export type MfmLink = {
	type: 'link';
	props: {
		silent: boolean;
		url: string;
	};
	children: MfmInline[];
};

export type MfmFn = {
	type: 'fn';
	props: {
		name: string;
		args: Record<string, string | true>;
	};
	children: MfmInline[];
};

export type MfmText = {
	type: 'text';
	props: {
		text: string;
	};
	children?: [];
};

export type NodeType<T extends MfmNode['type']> =
	T extends 'quote' ? MfmQuote :
	T extends 'search' ? MfmSearch :
	T extends 'blockCode' ? MfmCodeBlock :
	T extends 'mathBlock' ? MfmMathBlock :
	T extends 'center' ? MfmCenter :
	T extends 'unicodeEmoji' ? MfmUnicodeEmoji :
	T extends 'emojiCode' ? MfmEmojiCode :
	T extends 'bold' ? MfmBold :
	T extends 'small' ? MfmSmall :
	T extends 'italic' ? MfmItalic :
	T extends 'strike' ? MfmStrike :
	T extends 'inlineCode' ? MfmInlineCode :
	T extends 'mathInline' ? MfmMathInline :
	T extends 'mention' ? MfmMention :
	T extends 'hashtag' ? MfmHashtag :
	T extends 'url' ? MfmUrl :
	T extends 'link' ? MfmLink :
	T extends 'fn' ? MfmFn :
	T extends 'text' ? MfmText :
	never;
