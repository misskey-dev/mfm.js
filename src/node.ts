export type MfmNode = MfmBlock | MfmInline;

export type MfmBlock = MfmQuote | MfmSearch | MfmCodeBlock | MfmMathBlock | MfmCenter;

export type MfmQuote = {
	type: 'quote';
	props: { };
	children: MfmNode[];
};

export type MfmSearch = {
	type: 'search';
	props: {
		q: string;
		content: string;
	};
	children: [];
};

export type MfmCodeBlock = {
	type: 'blockCode';
	props: {
		code: string;
		lang: string | null;
	};
	children: [];
};

export type MfmMathBlock = {
	type: 'mathBlock';
	props: {
		formula: string;
	};
	children: [];
};

export type MfmCenter = {
	type: 'center';
	props: {

	};
	children: MfmInline[];
};

export type MfmInline = MfmEmoji | MfmBold | MfmSmall | MfmItalic | MfmStrike | MfmInlineCode |
	MfmMathInline | MfmMention | MfmHashtag | MfmUrl | MfmLink | MfmFn | MfmText;

export type MfmEmoji = {
	type: 'emoji';
	props: {
		emoji?: string;
		name?: string;
	};
	children: [];
};

export type MfmBold = {
	type: 'bold';
	props: { };
	children: MfmInline[];
};

export type MfmSmall = {
	type: 'small';
	props: { };
	children: MfmInline[];
};

export type MfmItalic = {
	type: 'italic';
	props: { };
	children: MfmInline[];
};

export type MfmStrike = {
	type: 'strike';
	props: { };
	children: MfmInline[];
};

export type MfmInlineCode = {
	type: 'inlineCode';
	props: {
		code: string;
	};
	children: [];
};

export type MfmMathInline = {
	type: 'mathInline';
	props: {
		formula: string;
	};
	children: [];
};

export type MfmMention = {
	type: 'mention';
	props: {
		username: string;
		host: string | null;
		acct: string;
	};
	children: [];
};

export type MfmHashtag = {
	type: 'hashtag';
	props: {
		hashtag: string;
	};
	children: [];
};

export type MfmUrl = {
	type: 'url';
	props: {
		url: string;
	};
	children: [];
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
	children: [];
};
