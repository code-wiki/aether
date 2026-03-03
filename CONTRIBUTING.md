# Contributing to Aether AI

Thank you for your interest in contributing to Aether AI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Convention](#commit-convention)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aether.git
   cd aether
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/code-wiki/aether.git
   ```

## Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Google Cloud Platform account** (for GCP Vertex AI features)
- **Git** 2.x or higher

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up GCP credentials (see [QUICKSTART.md](QUICKSTART.md)):
   ```bash
   # Install gcloud CLI
   # Authenticate with your GCP account
   gcloud auth application-default login

   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. The app will open at `http://localhost:5173` (React) and launch Electron

### Verify Setup

Run tests to ensure everything is working:
```bash
npm test
npm run lint
```

## Project Structure

```
aether/
├── src/
│   ├── components/         # React components
│   │   ├── Chat/          # Chat interface components
│   │   ├── Sidebar/       # Sidebar navigation
│   │   ├── Settings/      # Settings panel
│   │   └── CommandPalette/ # Command palette
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── design-system/     # Design system primitives
│   │   ├── primitives/    # Button, Input, Card, etc.
│   │   └── motion.js      # Framer Motion animations
│   ├── services/          # AI provider services
│   ├── lib/               # Utility functions
│   └── main.jsx           # React entry point
├── electron/              # Electron main process
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── docs/                  # Documentation
│   └── adr/              # Architecture Decision Records
└── public/               # Static assets
```

## Development Workflow

### Creating a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/amazing-feature

# Or for bug fixes
git checkout -b fix/bug-description
```

### Making Changes

1. **Write code** following our [coding standards](#coding-standards)
2. **Write tests** for new features (minimum 80% coverage)
3. **Update documentation** if needed
4. **Run tests** locally:
   ```bash
   npm test
   npm run test:coverage
   ```
5. **Lint your code**:
   ```bash
   npm run lint
   npm run format
   ```

### Keeping Your Branch Updated

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# If conflicts occur, resolve them and continue
git rebase --continue
```

## Coding Standards

### JavaScript/JSX

- **ES6+ syntax** - Use modern JavaScript features
- **Functional components** - Prefer function components over class components
- **Hooks** - Use React Hooks for state and side effects
- **Prop validation** - Define PropTypes for component props
- **Destructuring** - Destructure props and state for clarity

### Style Guide

We use ESLint and Prettier to enforce consistent code style:

- **Single quotes** for strings
- **Semicolons** required
- **2-space indentation**
- **100 character line width**
- **Trailing commas** in multiline objects/arrays

**Pre-commit hooks automatically format your code**, but you can run manually:

```bash
npm run format      # Format all files
npm run lint:fix    # Fix linting issues
```

### Naming Conventions

- **Components**: PascalCase (`MessageBubble.jsx`)
- **Hooks**: camelCase with `use` prefix (`useMediaQuery.js`)
- **Utilities**: camelCase (`cn.js`, `formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Files**: Match component name (`Button.jsx`, `useResponsive.js`)

### Component Guidelines

```jsx
import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Component description
 *
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant
 * @param {boolean} props.disabled - Disabled state
 */
const Button = ({ variant = 'primary', disabled = false, children, ...props }) => {
  return (
    <button
      className={cn(
        'base-classes',
        variant === 'primary' && 'primary-classes',
        disabled && 'disabled-classes'
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

### Responsive Design

Use the `useResponsive` hook for responsive behavior:

```jsx
import { useResponsive } from '../../hooks/useResponsive';

const MyComponent = () => {
  const { isMobile, isDesktop } = useResponsive();

  return (
    <div className={cn(
      'base-class',
      isMobile ? 'mobile-classes' : 'desktop-classes'
    )}>
      {/* Content */}
    </div>
  );
};
```

## Testing Guidelines

### Test Requirements

- **Unit tests** for all new components and utilities
- **Integration tests** for user flows
- **Minimum 80% code coverage** for new code
- **All tests must pass** before submitting PR

### Writing Tests

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../src/design-system/primitives/Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
npm run test:ci         # CI mode
```

See [tests/README.md](tests/README.md) for detailed testing guide.

## Pull Request Process

### Before Submitting

1. ✅ **Tests pass** (`npm test`)
2. ✅ **Linting passes** (`npm run lint`)
3. ✅ **Code is formatted** (`npm run format`)
4. ✅ **Coverage is sufficient** (`npm run test:coverage`)
5. ✅ **Documentation updated** (if needed)
6. ✅ **Commit messages follow convention** (see below)

### Submitting PR

1. **Push your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```

2. **Create Pull Request** on GitHub

3. **Fill out PR template** completely:
   - Clear description of changes
   - Link to related issues
   - Screenshots/videos if UI changes
   - Test plan

4. **Wait for CI checks** to pass

5. **Request review** from maintainers

6. **Address feedback** if requested

### PR Review Criteria

Reviewers will check:

- ✅ Code quality and style
- ✅ Test coverage and quality
- ✅ Documentation completeness
- ✅ No breaking changes (or properly documented)
- ✅ Performance impact
- ✅ Accessibility compliance
- ✅ Security considerations

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, tooling, dependencies

### Examples

```bash
# Feature
git commit -m "feat(chat): add message export functionality"

# Bug fix
git commit -m "fix(sidebar): correct conversation card hover state"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change model selection API

BREAKING CHANGE: Model selection now requires provider parameter"
```

### Scope

Use the component/feature being changed:
- `chat`, `sidebar`, `settings`, `command-palette`
- `design-system`, `hooks`, `context`
- `ai`, `providers`, `services`

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Creating a Release

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create git tag: `git tag v1.2.3`
4. Push tag: `git push origin v1.2.3`
5. CI creates release build automatically
6. Create GitHub Release with notes

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas, general discussion
- **Pull Requests**: Code review, technical discussion

### Issue Templates

When creating issues, use the provided templates:

- **Bug Report**: For reporting bugs
- **Feature Request**: For suggesting new features
- **Question**: For asking questions

### Questions?

- Check existing [Issues](https://github.com/code-wiki/aether/issues)
- Check [Discussions](https://github.com/code-wiki/aether/discussions)
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
- Ask in GitHub Discussions

## Recognition

Contributors are recognized in:

- Release notes
- GitHub contributors page
- Project README

Thank you for contributing to Aether AI! 🚀

---

**First time contributing?** Look for issues labeled [`good first issue`](https://github.com/code-wiki/aether/labels/good%20first%20issue) or [`help wanted`](https://github.com/code-wiki/aether/labels/help%20wanted).
