/**
 * Unit testing TypeScript types.
 * with https://github.com/SamVerschueren/tsd
 */

import { expectType } from 'tsd';
import { NodeType, MfmUrl } from '../built';

describe('#NodeType', () => {
	it('returns node that has sprcified type', () => {
		const x = null as unknown as NodeType<'url'>;
		expectType<MfmUrl>(x);
	});
});
