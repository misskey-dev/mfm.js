/**
 * Unit testing TypeScript types.
 * with https://github.com/SamVerschueren/tsd
 */

import { expectType } from 'tsd';
import { getNodeByType, MfmUrl } from '../built';

describe('#getNodeByType', () => {
	it('returns node that has sprcified type', () => {
		const x = null as unknown as getNodeByType<'url'>;
		expectType<MfmUrl>(x);
	})
});
