// @ts-check

const mainConfig = require("../jest.config");

/** @type {jest.InitialOptions} */
const config = {
  ...mainConfig,
  testMatch: ["<rootDir>/src/**/*.e2e.ts"],
  rootDir: "../",
  collectCoverage: false,
};

module.exports = config;
