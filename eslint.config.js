import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config([
    globalIgnores(['dist']),
    {
        files: ['**/*.{ts,tsx}'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            reactHooks.configs['recommended-latest'],
            reactRefresh.configs.vite,
            prettier
        ],
        rules: {
            'react-refresh/only-export-components': ['off'],
            'no-unused-vars': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn'
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser
        }
    }
]);
