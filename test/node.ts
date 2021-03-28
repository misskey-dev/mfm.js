import {
	MfmBold, MfmCenter, MfmCodeBlock, MfmCustomEmoji, MfmFn, MfmHashtag, MfmInline,
	MfmInlineCode, MfmItalic, MfmLink, MfmMathBlock, MfmMathInline, MfmMention,
	MfmNode, MfmQuote, MfmSearch, MfmSmall, MfmStrike, MfmText, MfmUnicodeEmoji, MfmUrl
} from '../built';

export const QUOTE = (children: MfmNode[]): MfmQuote => { return { type:'quote', children }; };
export const SEARCH = (query: string, content: string): MfmSearch => { return { type:'search', props: { query, content } }; };
export const CODE_BLOCK = (code: string, lang: string | null): MfmCodeBlock => { return { type:'blockCode', props: { code, lang } }; };
export const MATH_BLOCK = (formula: string): MfmMathBlock => { return { type:'mathBlock', props: { formula } }; };
export const CENTER = (children: MfmInline[]): MfmCenter => { return { type:'center', children }; };

export const BOLD = (children: MfmInline[]): MfmBold => { return { type:'bold', children }; };
export const SMALL = (children: MfmInline[]): MfmSmall => { return { type:'small', children }; };
export const ITALIC = (children: MfmInline[]): MfmItalic => { return { type:'italic', children }; };
export const STRIKE = (children: MfmInline[]): MfmStrike => { return { type:'strike', children }; };
export const INLINE_CODE = (code: string): MfmInlineCode => { return { type:'inlineCode', props: { code } }; };
export const MATH_INLINE = (formula: string): MfmMathInline => { return { type:'mathInline', props: { formula } }; };
export const MENTION = (username: string, host: string | null, acct: string): MfmMention => { return { type:'mention', props: { username, host, acct } }; };
export const HASHTAG = (value: string): MfmHashtag => { return { type:'hashtag', props: { hashtag: value } }; };
export const N_URL = (value: string): MfmUrl => { return { type:'url', props: { url: value } }; };
export const LINK = (silent: boolean, url: string, children: MfmInline[]): MfmLink => { return { type:'link', props: { silent, url }, children }; };
export const CUSTOM_EMOJI = (name: string): MfmCustomEmoji => { return { type:'customEmoji', props: { name: name } }; };
export const FN = (name: string, args: MfmFn['props']['args'], children: MfmFn['children']): MfmFn => { return { type:'fn', props: { name, args }, children }; };
export const UNI_EMOJI = (value: string): MfmUnicodeEmoji => { return { type:'unicodeEmoji', props: { emoji: value } }; };
export const TEXT = (value: string): MfmText => { return { type:'text', props: { text: value } }; };
