/** @type {import('jest').Config} */
export default {
	preset: "ts-jest/presets/default-esm",
	extensionsToTreatAsEsm: [".ts"],
	testEnvironment: "node",
	testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				useESM: true,
				tsconfig: {
					module: "ESNext",
					target: "ES2022",
					moduleResolution: "node",
					allowSyntheticDefaultImports: true,
					esModuleInterop: true,
				},
			},
		],
	},
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
	collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/index.ts"],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
	testTimeout: 30000,
	verbose: true,
};
