import type { Config } from "jest";
import { createDefaultPreset } from "ts-jest";

const config: Config = {
  ...createDefaultPreset(),
  moduleFileExtensions: ["ts", "js", "json"],
  rootDir: ".",
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: ["**/*.spec.ts", "**/*.ti.spec.ts", "**/*.e2e-spec.ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};

export default config;
