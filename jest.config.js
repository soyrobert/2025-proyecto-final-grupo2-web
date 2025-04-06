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
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    coveragePathIgnorePatterns: [
        "<rootDir>/src/app/shared/icon/"
    ]
}