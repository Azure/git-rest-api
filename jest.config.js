// @ts-check

/** @type {jest.InitialOptions} */
const config = {
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {},
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!**/node_modules/**"],
  coverageReporters: ["json", "lcov", "cobertura", "text", "html", "clover"],
  coveragePathIgnorePatterns: ["/node_modules/", ".*/test/.*"],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
    },
  },
  setupFiles: ["<rootDir>/test/jest-setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  verbose: true,
  testEnvironment: "node",
};

module.exports = config;
