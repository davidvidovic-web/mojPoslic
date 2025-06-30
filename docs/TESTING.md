# Testing Documentation

This document outlines the testing strategy, patterns, and best practices used in the project.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [Component Testing](#component-testing)
- [Best Practices](#best-practices)
- [Running Tests](#running-tests)

## Overview

Our testing strategy focuses on user-centric testing that ensures components work correctly from the user's perspective. We prioritize testing behavior over implementation details, following the testing philosophy of React Testing Library.

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: Realistic user interaction simulation
- **@testing-library/jest-dom**: Additional Jest matchers for DOM elements
- **jsdom**: DOM environment for Node.js testing

## Test Structure

### Configuration

Tests are configured with Jest and Next.js integration:

```javascript
// jest.config.js
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  // ...
}
```

### File Organization

```
src/
  components/
    __tests__/
      component-name.test.tsx
```

## Component Testing

### Example: JobPostForm Component

The `JobPostForm` test suite demonstrates comprehensive component testing patterns:

#### Test Categories

1. **Basic Rendering Tests**
   - Verify essential UI elements are present
   - Test component initialization

2. **Form Interaction Tests**
   - User input handling
   - Form field validation
   - Interactive element behavior

3. **Form Validation Tests**
   - Required field validation
   - Error message display
   - Validation logic

4. **Accessibility Tests**
   - Proper labeling
   - ARIA attributes
   - Keyboard navigation

5. **Error Handling Tests**
   - API error responses
   - Network failures
   - Graceful degradation

6. **Integration Tests**
   - End-to-end user workflows
   - Callback function execution
   - Success scenarios

#### Mocking Strategy

The test suite uses comprehensive mocking to isolate the component under test:

```typescript
// Mock external dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

// Mock authentication context
jest.mock('@/contexts/prisma-auth-context', () => ({
  useAuth: jest.fn(() => ({
    user: {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'employer' as const,
    },
    loading: false,
  })),
}))

// Mock complex components with simplified implementations
jest.mock('@/components/cities-filter', () => ({
  CitiesFilter: ({ onCityChange, value }: { 
    onCityChange?: (value: string) => void; 
    value?: string 
  }) => (
    <select 
      data-testid="cities-filter"
      value={value || ''}
      onChange={(e) => onCityChange?.(e.target.value)}
      aria-label="Select city"
    >
      <option value="">Select a city</option>
      <option value="sarajevo">Sarajevo</option>
      <option value="banja-luka">Banja Luka</option>
    </select>
  ),
}))
```

#### API Mocking

Realistic API responses are mocked to test various scenarios:

```typescript
// Setup default fetch responses
mockFetch.mockImplementation((url: string) => {
  if (url.includes('/api/cities')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        cities: [
          { id: 1, key: 'sarajevo', nameEN: 'Sarajevo', nameBS: 'Sarajevo' },
          { id: 2, key: 'banja-luka', nameEN: 'Banja Luka', nameBS: 'Banja Luka' },
        ],
      }),
    })
  }
  // ... other endpoints
})
```

#### Test Examples

**Basic Rendering:**
```typescript
it('renders the form with essential fields', async () => {
  render(<JobPostForm onJobPosted={mockOnJobPosted} />)

  await waitFor(() => {
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
  })

  expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
  expect(screen.getByLabelText('Company *')).toBeInTheDocument()
  expect(screen.getByTestId('cities-filter')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /post job/i })).toBeInTheDocument()
})
```

**User Interactions:**
```typescript
it('allows user to fill in basic job information', async () => {
  const user = userEvent.setup()
  render(<JobPostForm onJobPosted={mockOnJobPosted} />)

  await waitFor(() => {
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument()
  })

  await user.type(screen.getByLabelText(/job title/i), 'Senior Frontend Developer')
  await user.type(screen.getByLabelText('Company *'), 'Tech Innovations Ltd')

  expect(screen.getByLabelText(/job title/i)).toHaveValue('Senior Frontend Developer')
  expect(screen.getByLabelText('Company *')).toHaveValue('Tech Innovations Ltd')
})
```

**Error Handling:**
```typescript
it('handles API errors gracefully', async () => {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/api/jobs/create')) {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error occurred' }),
      })
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  })

  const user = userEvent.setup()
  render(<JobPostForm onJobPosted={mockOnJobPosted} />)

  // ... fill form and submit

  await waitFor(() => {
    expect(mockToast.error).toHaveBeenCalled()
  })
})
```

## Best Practices

### 1. Test User Behavior, Not Implementation

- Use `getByLabelText`, `getByRole`, `getByText` to query elements
- Simulate real user interactions with `userEvent`
- Test what users see and do, not internal component state

### 2. Effective Mocking

- Mock external dependencies and complex child components
- Keep mocks simple but realistic
- Use `jest.requireMock` to access mock functions in tests

### 3. Async Testing

- Always use `waitFor` for async operations
- Set appropriate timeouts for slow operations
- Clear mocks between tests with `jest.clearAllMocks()`

### 4. Accessibility Testing

- Include accessibility checks in component tests
- Verify proper labeling and ARIA attributes
- Test keyboard navigation where applicable

### 5. Error Scenarios

- Test both validation errors and API failures
- Ensure graceful error handling
- Verify user feedback mechanisms

### 6. Test Organization

- Group related tests with `describe` blocks
- Use descriptive test names that explain the behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 7. Test Data

- Use realistic test data that matches production scenarios
- Keep test data minimal but sufficient
- Use factories or fixtures for complex data structures

## Test Examples in the Codebase

### JobPostForm Test Suite

For a complete, real-world example of the testing patterns described in this document, see:

**`src/components/__tests__/job-post-form.test.tsx`**

This test file demonstrates:
- Comprehensive mocking strategies for external dependencies
- User-centric testing approaches with realistic interactions
- Proper async testing with `waitFor` and `userEvent`
- Form validation testing with both success and error scenarios
- API integration testing with various response types
- Accessibility testing with proper ARIA labels and keyboard navigation
- Error handling for both validation and network failures

The test suite covers 15+ test cases including:
- Basic component rendering and initialization
- User form interactions and input handling
- Form validation (required fields, error messages)
- Successful job posting workflow
- API error handling and user feedback
- Accessibility compliance

This serves as the reference implementation for component testing best practices in the project.

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- job-post-form.test.tsx

# Run tests matching a pattern
npm test -- --testPathPatterns=components
```

### Environment Setup

Ensure your test environment includes:

1. **jest.setup.js** - Global test configuration
2. **@jest-environment jsdom** - DOM environment
3. **Proper TypeScript configuration** - Type safety in tests

### Debugging Tests

- Use `screen.debug()` to see the rendered DOM
- Add `console.log` statements for debugging
- Use Jest's `--verbose` flag for detailed output
- Use browser devtools with `--inspect-brk` for debugging

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 70%
- **Functions**: > 80%
- **Lines**: > 80%

Focus on meaningful coverage rather than just hitting percentage targets.

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Main branch commits
- Nightly builds

Failed tests block deployments to ensure code quality.

---

For questions about testing practices or to suggest improvements to this documentation, please reach out to the development team.
