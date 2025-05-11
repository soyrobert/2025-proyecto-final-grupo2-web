module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '.*\\.e2e\\.spec\\.ts$',
        '.*\\.functional\\.spec\\.ts$',
    ],
    globalSetup: 'jest-preset-angular/global-setup',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: 75
        }
    },
    coveragePathIgnorePatterns: [
        "<rootDir>/src/app/shared/icon/"
    ]
}
