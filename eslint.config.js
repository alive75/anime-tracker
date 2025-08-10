
"use strict";

const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const reactRefreshPlugin = require("eslint-plugin-react-refresh");
const eslintConfigPrettier = require("eslint-config-prettier");

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
    // Global ignores
    {
        ignores: [
            "**/dist/",
            "**/node_modules/",
            "coverage/",
            ".wrangler/",
        ],
    },

    // Base configuration for all TypeScript files
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                // Pointing to both tsconfig files is important for type-aware rules
                project: [
                    "./packages/api/tsconfig.json",
                    "./packages/web/tsconfig.json",
                ],
                tsconfigRootDir: __dirname,
            },
            globals: {
                ...globals.es2021,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            ...eslintConfigPrettier.rules, // Make sure this is last to override other configs
        },
    },

    // Backend (NestJS) specific configuration
    {
        files: ["packages/api/**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            // from old .eslintrc.js
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },

    // Frontend (React) specific configuration
    {
        files: ["packages/web/**/*.ts", "packages/web/**/*.tsx", "index.tsx", "types.ts", "services/**/*.ts"],
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
            },
        },
        plugins: {
            "react-hooks": reactHooksPlugin,
            "react-refresh": reactRefreshPlugin,
        },
        settings: {
            react: {
                version: "detect", // Automatically detect the React version
            },
        },
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
    },
];
