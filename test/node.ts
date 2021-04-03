import {
	MfmFn, MfmInline, MfmNode, NodeType
} from '../built';
 
export const QUOTE = (children: MfmNode[]): NodeType<'quote'> => { return { type:'quote', children }; };
export const SEARCH = (query: string, content: string): NodeType<'search'> => { return { type:'search', props: { query, content } }; };
export const CODE_BLOCK = (code: string, lang: string | null): NodeType<'blockCode'> => { return { type:'blockCode', props: { code, lang } }; };
export const MATH_BLOCK = (formula: string): NodeType<'mathBlock'> => { return { type:'mathBlock', props: { formula } }; };
export const CENTER = (children: MfmInline[]): NodeType<'center'> => { return { type:'center', children }; };

export const BOLD = (children: MfmInline[]): NodeType<'bold'> => { return { type:'bold', children }; };
export const SMALL = (children: MfmInline[]): NodeType<'small'> => { return { type:'small', children }; };
export const ITALIC = (children: MfmInline[]): NodeType<'italic'> => { return { type:'italic', children }; };
export const STRIKE = (children: MfmInline[]): NodeType<'strike'> => { return { type:'strike', children }; };
export const INLINE_CODE = (code: string): NodeType<'inlineCode'> => { return { type:'inlineCode', props: { code } }; };
export const MATH_INLINE = (formula: string): NodeType<'mathInline'> => { return { type:'mathInline', props: { formula } }; };
export const MENTION = (username: string, host: string | null, acct: string): NodeType<'mention'> => { return { type:'mention', props: { username, host, acct } }; };
export const HASHTAG = (value: string): NodeType<'hashtag'> => { return { type:'hashtag', props: { hashtag: value } }; };
export const N_URL = (value: string): NodeType<'url'> => { return { type:'url', props: { url: value } }; };
export const LINK = (silent: boolean, url: string, children: MfmInline[]): NodeType<'link'> => { return { type:'link', props: { silent, url }, children }; };
export const EMOJI_CODE = (name: string): NodeType<'emojiCode'> => { return { type:'emojiCode', props: { name: name } }; };
export const FN = (name: string, args: MfmFn['props']['args'], children: MfmFn['children']): NodeType<'fn'> => { return { type:'fn', props: { name, args }, children }; };
export const UNI_EMOJI = (value: string): NodeType<'unicodeEmoji'> => { return { type:'unicodeEmoji', props: { emoji: value } }; };
export const TEXT = (value: string): NodeType<'text'> => { return { type:'text', props: { text: value } }; };
