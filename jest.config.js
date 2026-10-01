const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");

const createsJestConfig = nextJest({
  dir: ".",
});

const jestConfig = createsJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});

module.exports = jestConfig;
