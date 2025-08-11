module.exports = {
	root          : true,
	parser        : '@typescript-eslint/parser',
	plugins       : [
		'@typescript-eslint',
		'smarter-tabs'
	],
	extends       : [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parserOptions : {
		ecmaVersion: 2020,
		sourceType : 'module'
		// Remove project reference to avoid parsing issues
	},
	env           : {
		node  : true,
		es2020: true
	},
	rules         : {
		// ===== INDENTATION & TABS =====
		'indent'                  : 'off', // Disable base rule
		'no-tabs'                 : 'off', // Allow tabs
		'no-mixed-spaces-and-tabs': 'off', // Allow mixed for alignment
		// Disable smarter-tabs for now to preserve existing formatting
		// 'smarter-tabs/smarter-tabs': 'error',

		// ===== SPACING & ALIGNMENT =====
		'key-spacing'    : 'off', // Disable to allow custom alignment
		'no-multi-spaces': 'off', // Allow multiple spaces for alignment

		// ===== LINE LENGTH =====
		'max-len': [
			'warn', {
				code                  : 200,
				tabWidth              : 4,
				ignoreUrls            : true,
				ignoreStrings         : true,
				ignoreTemplateLiterals: true,
				ignoreRegExpLiterals  : true,
				ignoreComments        : true
			}
		],

		// ===== SEMICOLONS =====
		'semi': ['error', 'always'],

		// ===== QUOTES =====
		'quotes': [
			'error', 'single', {
				avoidEscape          : true,
				allowTemplateLiterals: true
			}
		],

		// ===== COMMAS =====
		'comma-dangle': 'off', // Allow trailing commas for imports

		// ===== BRACES =====
		'brace-style': ['error', '1tbs', {allowSingleLine: true}],
		'curly'      : ['error', 'multi-line'],

		// ===== FUNCTIONS =====
		'space-before-function-paren': [
			'error', {
				anonymous : 'never',
				named     : 'never',
				asyncArrow: 'always'
			}
		],

		// ===== OBJECTS =====
		'object-curly-spacing': ['error', 'never'],

		// ===== ARRAYS =====
		'array-bracket-spacing': ['error', 'never'],

		// ===== TYPESCRIPT SPECIFIC =====
		'@typescript-eslint/no-explicit-any'               : 'off',
		'@typescript-eslint/no-unused-vars'                : [
			'error', {
				argsIgnorePattern : '^_',
				varsIgnorePattern : '^_',
				ignoreRestSiblings: true,
				// Allow unused type parameters
				args: 'after-used'
			}
		],
		'@typescript-eslint/explicit-function-return-type' : 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-non-null-assertion'         : 'off',
		'@typescript-eslint/ban-ts-comment'                : 'off',
		'@typescript-eslint/no-empty-function'             : 'off',
		'@typescript-eslint/no-namespace'                  : 'off',
		'@typescript-eslint/no-unsafe-function-type'       : 'off',
		'@typescript-eslint/no-require-imports'            : 'off',

		// ===== GENERAL CODE QUALITY =====
		'no-console'        : 'off',
		'no-debugger'       : 'warn',
		'no-unused-vars'    : 'off',
		'prefer-const'      : 'error',
		'no-var'            : 'error',
		'eqeqeq'            : ['error', 'always'],
		'no-trailing-spaces': 'error',
		'eol-last'          : ['error', 'always'],

		// ===== IMPORTS =====
		'sort-imports': 'off', // Disable import sorting to preserve current order

		// ===== WHITESPACE =====
		'no-multiple-empty-lines': ['error', {max: 2, maxEOF: 1}],
		'padded-blocks'          : 'off', // Allow padded blocks
		'space-infix-ops'        : 'error',
		'keyword-spacing'        : 'error',

		// ===== SPECIFIC OVERRIDES FOR CURRENT CODE STYLE =====
		'no-constant-condition'    : ['error', {checkLoops: false}], // Allow while(true)
		'no-async-promise-executor': 'off', // Allow async promise executors

		// Allow ternary operators to be formatted as in the current code
		'multiline-ternary': 'off',

		// Allow current function call formatting
		'function-call-argument-newline': 'off',
		'function-paren-newline'        : 'off'
	},
	overrides     : [
		{
			files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
			rules: {
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unused-vars' : 'off', // Disable completely for tests
				'max-len'                           : 'off'
			}
		},
		{
			// Special rules for type definitions
			files: ['src/**/*.ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': [
					'error', {
						argsIgnorePattern : '^_',
						varsIgnorePattern : '^_',
						args              : 'none', // Don't check type parameters
						ignoreRestSiblings: true
					}
				]
			}
		},
		{
			// Special rules for JSON files to preserve custom formatting
			files: ['*.json', '**/*.json'],
			rules: {
				// Disable all formatting-related rules for JSON
				'indent'              : 'off',
				'key-spacing'         : 'off',
				'no-multi-spaces'     : 'off',
				'object-curly-spacing': 'off',
				'comma-dangle'        : 'off',
				'quotes'              : 'off',
				'semi'                : 'off',
				'max-len'             : 'off',
				'no-trailing-spaces'  : 'off',
				'eol-last'            : 'off'
			}
		}
	],
	ignorePatterns: [
		'dist/',
		'node_modules/',
		'*.js',
		'*.d.ts',
		'*.json',
		'coverage/',
		'.qodo/',
		'webpack.config.js',
		'.eslintrc.js'
	]
};