import {
	MfmBold, MfmCenter, MfmCodeBlock, MfmEmoji, MfmFn, MfmHashtag, MfmInline,
	MfmInlineCode, MfmItalic, MfmLink, MfmMathBlock, MfmMathInline, MfmMention,
	MfmNode, MfmQuote, MfmSearch, MfmSmall, MfmStrike, MfmText, MfmUrl
} from '../built';

export const QUOTE = (children: MfmNode[]): MfmQuote => { return { type:'quote', props: { }, children }; };
export const SEARCH = (q: string, content: string): MfmSearch => { return { type:'search', props: { q, content }, children: [] }; };
export const CODE_BLOCK = (code: string, lang: string | null): MfmCodeBlock => { return { type:'blockCode', props: { code, lang }, children: [] }; };
export const MATH_BLOCK = (formula: string): MfmMathBlock => { return { type:'mathBlock', props: { formula }, children: [] }; };
export const CENTER = (children: MfmInline[]): MfmCenter => { return { type:'center', props: { }, children }; };

export const BOLD = (children: MfmInline[]): MfmBold => { return { type:'bold', props: { }, children }; };
export const SMALL = (children: MfmInline[]): MfmSmall => { return { type:'small', props: { }, children }; };
export const ITALIC = (children: MfmInline[]): MfmItalic => { return { type:'italic', props: { }, children }; };
export const STRIKE = (children: MfmInline[]): MfmStrike => { return { type:'strike', props: { }, children }; };
export const INLINE_CODE = (code: string): MfmInlineCode => { return { type:'inlineCode', props: { code }, children: [] }; };
export const MATH_INLINE = (formula: string): MfmMathInline => { return { type:'mathInline', props: { formula }, children: [] }; };
export const MENTION = (username: string, host: string | null, acct: string): MfmMention => { return { type:'mention', props: { username, host, acct }, children: [] }; };
export const HASHTAG = (value: string): MfmHashtag => { return { type:'hashtag', props: { hashtag: value }, children: [] }; };
export const N_URL = (value: string): MfmUrl => { return { type:'url', props: { url: value }, children: [] }; };
export const LINK = (silent: boolean, url: string, children: MfmInline[]): MfmLink => { return { type:'link', props: { silent, url }, children }; };
export const CUSTOM_EMOJI = (name: string): MfmEmoji => { return { type:'emoji', props: { name: name }, children: [] }; };
export const FN = (name: string, args: MfmFn['props']['args'], children: MfmFn['children']): MfmFn => { return { type:'fn', props: { name, args }, children }; };
export const UNI_EMOJI = (value: string): MfmEmoji => { return { type:'emoji', props: { emoji: value }, children: [] }; };
export const TEXT = (value: string): MfmText => { return { type:'text', props: { text: value }, children: [] }; };
