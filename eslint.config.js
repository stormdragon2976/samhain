import js from '@eslint/js'
import globals from 'globals'
import svelte from 'eslint-plugin-svelte'

export default [
  js.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    ignores: [
      '.svelte-kit/**',
      'bin/**',
      'build/**',
      'node_modules/**',
      'src/legacy-service-worker.js',
      'src/routes/_*/**',
      'src/routes/**/*.html',
      'tests/**',
      'webpack/**'
    ]
  },
  {
    rules: {
      'svelte/no-navigation-without-resolve': 'off'
    }
  }
]
