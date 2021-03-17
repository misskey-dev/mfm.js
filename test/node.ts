import { createNode } from '../built/mfm-node';

export const TEXT = (value: string) => createNode('text', { text: value });
export const EMOJI = (name: string) => createNode('emoji', { name: name });
export const UNI_EMOJI = (value: string) => createNode('emoji', { emoji: value });
export const HASHTAG = (value: string) => createNode('hashtag', { hashtag: value });
