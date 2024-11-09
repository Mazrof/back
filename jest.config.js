module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,

  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },

  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/prisma/client.ts',
    'src/utility/appError',
  ],
};
