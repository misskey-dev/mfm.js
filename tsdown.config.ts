import { defineConfig } from 'tsdown';

export default defineConfig([{
	entry: './src/index.ts',
	outDir: './built',
	clean: true,
	tsconfig: true,
	format: {
		esm: {
			dts: {
				tsconfig: true,
			},
		},
		cjs: {
			dts: false,
		},
	},
	outExtensions: (ctx) => ctx.format === 'es' ? { js: '.mjs', dts: '.d.ts' } : { js: '.cjs' },
}, {
	entry: './src/cli/*.ts',
	outDir: './built/cli',
	tsconfig: true,
	format: 'cjs',
	dts: false,
}]);
