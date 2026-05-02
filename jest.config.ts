export default {
  testTimeout: 30000,
  modulePathIgnorePatterns: ['<rootDir>/.serverless/'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/**/*.test.ts'],
      testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
      transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
      testEnvironment: 'node',
    },
    {
      displayName: 'e2e',
      testMatch: ['<rootDir>/tests/e2e/**/*.e2e.test.ts'],
      transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'commonjs' } }] },
      testEnvironment: 'node',
    },
  ],
};
