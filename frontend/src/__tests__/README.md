# Frontend Test Structure

This directory contains the test files for the frontend application.

## Current Test Setup

The test infrastructure is configured using:
- **Jest**: JavaScript testing framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements

## Test Files

- `src/app/__tests__/page.test.tsx`: Basic smoke tests for the application
- `src/components/__tests__/TagSelector.test.tsx`: Basic tests for components

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Adding New Tests

When adding new tests:
1. Create test files in `__tests__` directories within the relevant feature folders
2. Use the `.test.tsx` or `.test.ts` naming convention
3. Import required testing utilities and the component/function being tested
4. Write descriptive test names that explain what is being tested

## Notes

- Tests require MantineProvider wrapper for component testing
- Next.js navigation hooks need to be mocked for page components
- These basic tests ensure CI/CD pipeline doesn't fail when no tests exist