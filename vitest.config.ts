import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['test/**/*.ts'],
        coverage: {
            exclude: [
                ...configDefaults.coverage.exclude!,
                'src/cli/**/*',
                'built/**/*',
                'test-d/**/*',
            ],
        }
    },
});
