// @ts-check

const mainConfig = require("../jest.config");

/** @type {jest.InitialOptions} */
const config = {
  ...mainConfig,
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
      diagnostics: { warnOnly: true } // Make typescript show errors as warning while writing test. This is specially for noUnusedLocals which is always preventing test to run.
    }
  },
  rootDir: "../",
  verbose: false
};

module.exports = config;
