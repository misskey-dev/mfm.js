import { MfmNode } from '../../../node';

export type CacheItem<T extends MfmNode> = {
	pos: number;
	result: T;
};
