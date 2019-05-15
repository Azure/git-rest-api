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
  testMatch: ["**/*.test.ts"],
  verbose: true,
  testEnvironment: "node",
};

module.exports = config;
