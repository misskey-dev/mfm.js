import { MfmCenter, MfmEmoji, MfmFn, MfmHashtag, MfmInline, MfmMention, MfmText, MfmUrl } from '../built';

export const TEXT = (value: string): MfmText => { return { type:'text', props: { text: value }, children: [] }; };
export const CUSTOM_EMOJI = (name: string): MfmEmoji => { return { type:'emoji', props: { name: name }, children: [] }; };
export const UNI_EMOJI = (value: string): MfmEmoji => { return { type:'emoji', props: { emoji: value }, children: [] }; };
export const HASHTAG = (value: string): MfmHashtag => { return { type:'hashtag', props: { hashtag: value }, children: [] }; };
export const N_URL = (value: string): MfmUrl => { return { type:'url', props: { url: value }, children: [] }; };
export const CENTER = (children: MfmInline[]): MfmCenter => { return { type:'center', props: { }, children }; };
export const FN = (name: string, args: MfmFn['props']['args'], children: MfmFn['children']): MfmFn => { return { type:'fn', props: { name, args }, children }; };
export const MENTION = (username: string, host: string | null, acct: string): MfmMention => { return { type:'mention', props: { username, host, acct }, children: [] }; };
