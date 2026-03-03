# Aether Testing Guide

This directory contains all tests for the Aether AI application.

## Test Structure

```
tests/
├── setup.js                    # Global test setup
├── __mocks__/                  # Mock files
│   └── fileMock.js            # Asset mocks
├── unit/                       # Unit tests
│   ├── components/            # Component tests
│   ├── hooks/                 # Hook tests
│   └── lib/                   # Utility tests
└── integration/               # Integration tests
    ├── form-interaction.test.jsx
    └── responsive-layout.test.jsx
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Writing Tests

### Component Tests

Component tests should verify:
- Rendering with different props
- User interactions
- State changes
- Accessibility

Example:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../src/design-system/primitives/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Hook Tests

Hook tests use `renderHook` from React Testing Library:

```javascript
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '../../../src/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  it('returns correct value', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together:

```javascript
describe('Login Flow', () => {
  it('completes full login process', async () => {
    render(<LoginForm onSubmit={mockSubmit} />);

    await userEvent.type(screen.getByLabelText('Email'), 'test@test.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });
});
```

## Coverage Requirements

We aim for:
- **80%** line coverage
- **70%** branch coverage
- **70%** function coverage
- **80%** statement coverage

## Best Practices

1. **Test behavior, not implementation** - Focus on what the component does, not how
2. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test accessibility** - Ensure components are keyboard and screen reader friendly
4. **Mock external dependencies** - Use mocks for API calls, timers, etc.
5. **Keep tests focused** - One assertion per test when possible
6. **Use descriptive test names** - Name tests clearly to explain what they verify

## Common Testing Utilities

- `screen.getByRole()` - Find by ARIA role
- `screen.getByLabelText()` - Find by label text
- `screen.getByText()` - Find by text content
- `screen.getByPlaceholderText()` - Find by placeholder
- `screen.queryBy*()` - Returns null if not found (for asserting non-existence)
- `waitFor()` - Wait for async changes
- `fireEvent.*()` - Trigger DOM events
- `userEvent.*()` - Simulate user interactions (preferred over fireEvent)

## Debugging Tests

```bash
# Run specific test file
npm test -- Button.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="renders with text"

# Update snapshots
npm test -- -u

# Show which tests are slow
npm test -- --verbose
```

## Mocking

### Mocking Framer Motion

```javascript
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
  },
  AnimatePresence: ({ children }) => children,
}));
```

### Mocking Hooks

```javascript
jest.mock('../../../src/hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn(),
}));
```

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
