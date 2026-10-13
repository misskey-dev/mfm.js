import { defineMisskeyDevOxlintConfig } from '@misskey-dev/oxlint-fmt-config';

export default defineMisskeyDevOxlintConfig({
	overrides: {
		ignorePatterns: [
			'src/@types/package.json.d.ts',
			'built',
			'test',
			'test-d',
		],
	},
});

