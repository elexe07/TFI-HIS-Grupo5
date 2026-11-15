import pluginVue from 'eslint-plugin-vue';
import vueTsConfigs from '@vue/eslint-config-typescript';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/*.d.ts'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsConfigs(),
  skipFormatting,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'off',
      'prefer-const': 'warn',
    },
  },
];
