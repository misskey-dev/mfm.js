import pluginMisskey from '@misskey-dev/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

//@ts-check
/** @type {import('eslint').Linter.Config[]}  */
export default [ // eslint-disable-line import/no-default-export
	...pluginMisskey.configs['recommended'],
	{
		ignores: [
			'**/node_modules',
			'src/@types/package.json.d.ts',
			'built',
			'vitest.config.ts',
			'test',
			'test-d',
		],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				parser: tsParser,
				project: ['./tsconfig.json', './test/tsconfig.json'],
				sourceType: 'module',
				tsConfigRootDir: import.meta.dirname,	
			},
		},
	},
	{
		files: ['**/*.js', '**/*.cjs'],
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
		},
	},
];
