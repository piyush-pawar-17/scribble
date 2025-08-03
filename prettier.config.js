export default {
    arrowParens: 'always',
    bracketSpacing: true,
    jsxSingleQuote: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    printWidth: 120,
    trailingComma: 'none',
    useTabs: false,
    importOrder: [
        '^react$',
        '<BUILTIN_MODULES>',
        '<THIRD_PARTY_MODULES>',
        '@/components$',
        '^@/components\\/(?!.*\\.(?:scss|css)$).*$',
        '^@/lib(.*)$',
        '^@/hooks(.*)$',
        '^@/utils(.*)$',
        '^@/assets(.*)$',
        '^[./]',
        '^import\\s+type.*$',
        '\\.scss$',
        '\\.css$'
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
    plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss']
};
