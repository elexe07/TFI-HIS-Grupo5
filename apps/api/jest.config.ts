import type { Config } from 'jest';

// Tests unitarios: viven junto al código como *.spec.ts. No tocan base de datos.
const config: Config = {
  rootDir: 'src',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }] },
  collectCoverageFrom: [
    'building-blocks/**/*.ts',
    'modules/**/domain/**/*.ts',
    'modules/**/application/**/*.ts',
    '!**/*.module.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  clearMocks: true,
};

export default config;
