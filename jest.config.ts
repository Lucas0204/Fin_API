/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  bail: true,
  clearMocks: true,
  restoreMocks: true,
//   collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: [
    "text-summary",
    "lcov"
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  preset: "ts-jest",
  testMatch: ["**/*.spec.ts"],
  collectCoverageFrom: [
    "<rootDir>/src/modules/**/useCases/**/*.ts"
  ]
};
