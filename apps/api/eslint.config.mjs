// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'prisma/migrations/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Clean Code: sin `any`, sin variables muertas, funciones cortas y con pocos argumentos.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      'max-lines-per-function': ['warn', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', 3],
      'max-depth': ['warn', 3],
      complexity: ['warn', 8],
      eqeqeq: ['error', 'always'],
      'no-console': 'warn',
    },
  },
  {
    // El dominio no conoce frameworks. dependency-cruiser lo verifica también (pnpm arch).
    files: ['src/modules/*/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@nestjs/*', '@prisma/*', 'class-validator', 'class-transformer', 'express'],
              message: 'El dominio no puede depender de frameworks ni de infraestructura.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*-spec.ts', 'test/**/*.ts', 'prisma/seed.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'no-console': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
