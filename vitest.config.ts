import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		globals    : true,
		environment: 'node',
		coverage   : {
			provider: 'v8',
			include : ['src/**/*.ts'],
			exclude : [
				'examples/**',
				'src/lib/**',
				'dist/**',
				'coverage/**',
				'tests/**',
				'**/*.test.ts',
				'defs/**',
				'vitest.config.ts',
				'webpack.config.js'
			],
			reportsDirectory: './coverage'
		},
	},
});