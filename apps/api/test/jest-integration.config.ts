import type { Config } from 'jest';

// Tests de integración y end-to-end: necesitan Postgres levantado y migrado.
//   pnpm db:up && pnpm db:migrate && pnpm test:integration
const config: Config = {
  rootDir: '..',
  testEnvironment: 'node',
  testRegex: '.*\\.(int|e2e)-spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }] },
  testTimeout: 30000,
  clearMocks: true,
};

export default config;
