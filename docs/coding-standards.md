# Coding Standards

## General Principles

### Code Quality
- Write clean, readable, and maintainable code
- Follow DRY (Don't Repeat Yourself) principle
- Keep functions small and focused
- Use meaningful variable and function names
- Add comments only when necessary

### TypeScript Best Practices
- Use strict TypeScript mode
- Avoid `any` type - use `unknown` when type is unknown
- Use interfaces for object shapes
- Use type aliases for unions and primitives
- Prefer `const` over `let`
- Use template literals for string concatenation

## File Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `Button.tsx`)
- Utilities: `kebab-case.ts` (e.g., `api-client.ts`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Types: `kebab-case.types.ts` (e.g., `user.types.ts`)
- Constants: `UPPER_SNAKE_CASE.ts` (e.g., `API_ENDPOINTS.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

### Directories
- Use `kebab-case` for directory names
- Group related files together
- Keep directory structure shallow

## Code Organization

### Imports
```typescript
// 1. External libraries
import React from 'react';
import { useState } from 'react';
import axios from 'axios';

// 2. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';

// 3. Type imports
import type { User } from '@/types/user';
```

### Component Structure
```typescript
// 1. Imports
import React from 'react';

// 2. Types/Interfaces
interface Props {
  // props definition
}

// 3. Component
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Event handlers
  const handleClick = () => {
    // handler logic
  };

  // 6. Effects
  useEffect(() => {
    // effect logic
  }, []);

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

### Service Structure
```typescript
// 1. Imports
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/user';

// 2. Types
interface UserService {
  getUserById: (id: string) => Promise<User>;
  // other methods
}

// 3. Implementation
export const userService: UserService = {
  getUserById: async (id: string) => {
    // implementation
  },
};
```

## TypeScript Guidelines

### Type Definitions
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type aliases for unions and primitives
type Status = 'active' | 'inactive' | 'pending';
type ID = string | number;

// Use generics for reusable types
interface ApiResponse<T> {
  data: T;
  status: number;
}

// Avoid optional properties when possible
interface User {
  id: string;
  name: string;
  email: string; // not email?: string
}
```

### Type Guards
```typescript
// Use type guards for runtime type checking
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}
```

### Utility Types
```typescript
// Use built-in utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;

// Create custom utility types when needed
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

## React Best Practices

### Component Design
- Keep components small and focused
- Use functional components with hooks
- Avoid class components (unless necessary)
- Use composition over inheritance
- Extract reusable logic into custom hooks

### Hooks Usage
```typescript
// Custom hook naming: use + camelCase
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  // hook logic

  return { user, setUser };
};
```

### State Management
- Use local state for component-specific state
- Use Zustand for global state
- Use TanStack Query for server state
- Avoid prop drilling when possible

### Performance
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers
- Lazy load heavy components

## CSS/Styling Guidelines

### Tailwind CSS
- Use Tailwind utility classes
- Create reusable components in `src/components/ui/`
- Use design tokens from `globals.css`
- Follow mobile-first approach

### CSS Organization
```css
/* globals.css structure */
@import "tailwindcss";

:root {
  /* Design tokens */
}

@theme inline {
  /* Tailwind theme customization */
}

/* Global styles */
body {
  /* base styles */
}
```

## Error Handling

### Error Types
```typescript
// Use custom error types
import { ApiError, ValidationError } from '@/types/errors';

// Throw specific errors
throw new ValidationError('Invalid email address');

// Handle errors appropriately
try {
  // code that might throw
} catch (error) {
  if (error instanceof ApiError) {
    // handle API error
  } else {
    // handle other errors
  }
}
```

### Error Boundaries
- Use ErrorBoundary components for error isolation
- Provide user-friendly error messages
- Log errors for debugging
- Offer recovery options

## Testing Guidelines

### Test Structure
```typescript
describe('ComponentName', () => {
  describe('when condition', () => {
    it('should do something', () => {
      // arrange
      // act
      // assert
    });
  });
});
```

### Test Coverage
- Aim for high test coverage
- Test critical paths
- Test edge cases
- Test error scenarios

## Git Workflow

### Commit Messages
```
feat: add user authentication feature
fix: resolve login bug
docs: update API documentation
style: format code with prettier
refactor: simplify user service
test: add unit tests for utils
chore: update dependencies
```

### Branch Naming
- `feature/feature-name`
- `bugfix/bug-description`
- `hotfix/critical-fix`
- `docs/documentation-update`

## Security Best Practices

### Input Validation
- Validate all user inputs
- Use Zod schemas for validation
- Sanitize data before use
- Never trust client-side validation

### Environment Variables
- Never commit `.env` files
- Use `.env.example` for documentation
- Validate environment variables on startup
- Use type-safe environment access

### API Security
- Use HTTPS in production
- Implement rate limiting
- Validate API responses
- Handle sensitive data carefully

## Performance Guidelines

### Code Splitting
- Use dynamic imports for heavy components
- Split code by route
- Lazy load non-critical features
- Optimize bundle size

### Image Optimization
- Use Next.js Image component
- Use appropriate image formats
- Implement lazy loading
- Use responsive images

### Caching
- Implement appropriate caching strategies
- Use TanStack Query for server state caching
- Cache API responses when appropriate
- Implement cache invalidation

## Documentation

### Code Comments
- Add comments only when necessary
- Explain why, not what
- Keep comments up to date
- Use JSDoc for public APIs

### README
- Keep README up to date
- Include setup instructions
- Document API endpoints
- Provide examples

## Code Review Guidelines

### Review Checklist
- [ ] Code follows project standards
- [ ] TypeScript types are correct
- [ ] Tests are included and passing
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Code is readable and maintainable
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Documentation is updated

### Review Process
- Be constructive and respectful
- Provide specific feedback
- Suggest improvements
- Explain reasoning
- Be open to discussion
