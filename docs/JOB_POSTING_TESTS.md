# Job Posting Feature Test Suite

This document describes the comprehensive test suite for the job posting feature, including both unit tests and integration tests.

## Overview

The job posting feature test suite covers:

1. **Feature Tests** (`/src/__tests__/job-posting-feature.test.ts`) - Core business logic tests
2. **React Component Tests** (`/src/components/__tests__/job-post-form.test.tsx`) - UI component tests
3. **API Route Tests** (Can be added as needed for specific API testing)

## Test Structure

### 1. Feature Tests

**File:** `/src/__tests__/job-posting-feature.test.ts`

**Purpose:** Tests the core business logic and data validation for job posting

**Test Categories:**
- Form validation
- Salary formatting
- City and category resolution
- Job data structure
- Error scenarios
- User authentication
- Feature integration

**Key Test Cases:**
```typescript
// Authentication
✓ Returns 401 if user is not authenticated
✓ Returns 401 if session exists but user ID is missing

// Validation
✓ Returns 400 if required fields are missing
✓ Returns 400 if city is not found
✓ Returns 400 if category is not found
✓ Returns 400 if start date is in the past

// Category Resolution
✓ Resolves category by ID first
✓ Falls back to category key if ID lookup fails

// Salary Formatting
✓ Formats hourly salary correctly (25 - 35 BAM per hour)
✓ Formats fixed salary correctly (1000 - 1500 BAM)
✓ Handles single minimum salary (From 2000 BAM per month)

// Success Cases
✓ Creates job successfully with all fields
✓ Creates job successfully with minimal data

// Error Handling
✓ Handles database errors gracefully
✓ Disconnects Prisma client even on error
```

### 2. React Component Tests

**File:** `/src/components/__tests__/job-post-form.test.tsx`

**Purpose:** Tests the JobPostForm React component

**Test Categories:**
- Component rendering
- Form validation
- User interactions
- Form submission
- Error handling
- Accessibility

**Key Test Cases:**
```typescript
// Rendering
✓ Renders all required form fields
✓ Renders optional fields
✓ Shows category selection when parent category is selected

// Validation
✓ Shows error when required fields are missing
✓ Shows error when category is not selected
✓ Validates start date is not in the past

// Form Submission
✓ Submits form with valid data
✓ Shows success message on successful submission
✓ Handles API errors gracefully
✓ Disables submit button during submission
✓ Resets form after successful submission

// User Experience
✓ Loads cities and categories on component mount
✓ Handles location picker functionality

// Accessibility
✓ Has proper form labels and structure
✓ Provides appropriate ARIA attributes
```

### 3. Integration Tests

**File:** `/src/__tests__/job-posting-integration.test.ts`

**Purpose:** Tests the complete job posting workflow end-to-end

**Test Categories:**
- Complete workflow testing
- Error scenario handling
- Salary formatting integration
- Date and location handling
- Authentication flows
- Data consistency

**Key Test Cases:**
```typescript
// Complete Workflows
✓ Handles complete job posting workflow successfully
✓ Handles quick job posting with minimal data

// Error Scenarios
✓ Handles non-existent city gracefully
✓ Handles database connection errors
✓ Handles category not found by ID or key

// Salary Formatting
✓ Formats hourly salary range correctly
✓ Formats fixed price correctly
✓ Handles daily rate (dnevnica) correctly

// Date and Location
✓ Handles future start dates correctly
✓ Rejects past start dates
✓ Handles job location coordinates correctly

// Authentication
✓ Rejects unauthenticated requests
✓ Rejects requests with incomplete session

// Data Consistency
✓ Ensures all job types are supported
✓ Ensures proper field mapping between form and database
```

## Running the Tests

### Prerequisites

Ensure you have the following packages installed:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Running All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Running Specific Test Suites

```bash
# Run only API tests
npm test -- api/jobs/create

# Run only component tests
npm test -- job-post-form.test

# Run only integration tests
npm test -- job-posting-integration
```

### Running Tests by Pattern

```bash
# Run all job posting related tests
npm test -- --testNamePattern="Job"

# Run only validation tests
npm test -- --testNamePattern="validation"

# Run only error handling tests
npm test -- --testNamePattern="error"
```

## Test Configuration

### Jest Configuration

The tests use the following Jest configuration (in `jest.config.js`):

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
}
```

### Test Setup

The tests mock the following dependencies:
- `@/contexts/prisma-auth-context` - Authentication context
- `sonner` - Toast notifications
- `next-auth` - Authentication
- `@prisma/client` - Database client
- UI components from `@/components/ui/*`

## Test Data

### Mock Data Used in Tests

```typescript
// Mock User
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'employer'
}

// Mock City
const mockCity = {
  id: 'city-sarajevo-123',
  key: 'sarajevo',
  nameEN: 'Sarajevo',
  nameBS: 'Sarajevo'
}

// Mock Category
const mockCategory = {
  id: 'cat-construction-123',
  key: 'construction',
  nameEN: 'Construction',
  nameBS: 'Građevinarstvo'
}

// Valid Job Data
const validJobData = {
  title: 'Test Job',
  company: 'Test Company',
  description: 'This is a test job description',
  type: 'quick_job',
  city_id: 'sarajevo',
  category_id: 'construction',
  email: 'contact@example.com',
  salary: '1000 BAM per month'
}
```

## Coverage Goals

The test suite aims for:
- **Line Coverage:** > 90%
- **Function Coverage:** > 95%
- **Branch Coverage:** > 85%
- **Statement Coverage:** > 90%

## Continuous Integration

### GitHub Actions

Add this workflow to `.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test -- --coverage --watchAll=false
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
```

## Best Practices

### Writing New Tests

1. **Follow the AAA Pattern:** Arrange, Act, Assert
2. **Use descriptive test names:** Test names should clearly describe what is being tested
3. **Mock external dependencies:** Keep tests isolated and fast
4. **Test both happy path and error cases:** Ensure robust error handling
5. **Use TypeScript:** Leverage type safety in tests

### Test Organization

```typescript
describe('Feature Name', () => {
  describe('Specific Functionality', () => {
    beforeEach(() => {
      // Setup common to all tests in this group
    })

    it('should handle specific case correctly', () => {
      // Test implementation
    })
  })
})
```

### Mock Best Practices

1. **Reset mocks between tests:** Use `jest.clearAllMocks()` in `beforeEach`
2. **Mock at the right level:** Mock external APIs, not internal functions
3. **Verify mock calls:** Ensure mocks are called with expected parameters
4. **Use type-safe mocks:** Leverage TypeScript for mock type safety

## Debugging Tests

### Common Issues

1. **Tests timing out:** Increase timeout or check for unresolved promises
2. **Mocks not working:** Verify mock setup and import paths
3. **DOM not available:** Ensure `jsdom` test environment is configured
4. **Async operations:** Use `waitFor` for async operations

### Debugging Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file with debug info
npm test -- --verbose job-post-form.test.tsx

# Run with Node.js debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Maintenance

### Regular Maintenance Tasks

1. **Update test data:** Keep mock data relevant to current schema
2. **Review test coverage:** Identify and test uncovered code paths
3. **Update mocks:** Ensure mocks match real API behavior
4. **Performance review:** Keep tests fast and efficient

### Adding New Test Cases

When adding new features to the job posting functionality:

1. Add unit tests for new API endpoints
2. Add component tests for new UI elements
3. Add integration tests for new workflows
4. Update this documentation

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Events](https://testing-library.com/docs/user-event/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Support

For questions about the test suite or help with writing tests, please:

1. Review this documentation
2. Check existing test examples
3. Create an issue in the project repository
4. Ask in the development team chat
