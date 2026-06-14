# Development Guide

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Initial Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd gova
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical production fixes

### Feature Development

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the coding standards

3. Test your changes:
```bash
npm run lint
npm run typecheck
npm run test
```

4. Commit your changes:
```bash
git add .
git commit -m "feat: add your feature description"
```

5. Push and create a pull request

### Code Quality Checks

Before committing, ensure:
- All tests pass: `npm run test`
- No linting errors: `npm run lint`
- No TypeScript errors: `npm run typecheck`
- Code is formatted: `npm run lint:fix`

## Project Structure Overview

### Adding a New Component

1. Create component file in appropriate directory:
```bash
# UI component
src/components/ui/button.tsx

# Feature component
src/features/auth/components/login-form.tsx
```

2. Follow component structure:
```typescript
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};
```

3. Export from index file if needed:
```typescript
// src/components/ui/index.ts
export { Button } from './button';
```

### Adding a New Page

1. Create page in `src/app`:
```bash
src/app/about/page.tsx
```

2. Implement page component:
```typescript
export default function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      {/* page content */}
    </div>
  );
}
```

3. Add metadata:
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'About page',
};
```

### Adding a New Service

1. Create service file:
```bash
src/services/user.service.ts
```

2. Implement service:
```typescript
import { apiClient } from '@/lib/api-client';
import type { User } from '@/types/user';

export const userService = {
  async getUserById(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`);
  },

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    return apiClient.post<User>('/users', data);
  },
};
```

### Adding a New Hook

1. Create hook file:
```bash
src/hooks/useAuth.ts
```

2. Implement hook:
```typescript
import { useState, useEffect } from 'react';
import type { User } from '@/types/user';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch user logic
  }, []);

  return { user, loading };
}
```

### Adding a New Store

1. Create store file:
```bash
src/store/auth-store.ts
```

2. Implement store:
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        setUser: (user) => set({ user }),
        logout: () => set({ user: null }),
      }),
      { name: 'auth-storage' }
    )
  )
);
```

## Testing

### Writing Unit Tests

```typescript
import { describe, it, expect } from '@jest/globals';
import { sanitizeInput } from '@/lib/security';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>');
    expect(result).toBe('alert("xss")');
  });

  it('should trim whitespace', () => {
    const result = sanitizeInput('  test  ');
    expect(result).toBe('test');
  });
});
```

### Writing Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.test.ts
```

## Debugging

### Using VS Code Debugger

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

2. Set breakpoints in your code
3. Press F5 to start debugging

### Console Logging

Use structured logging:
```typescript
console.log('[ComponentName]', { data, error });
console.error('[ServiceName]', error);
console.warn('[HookName]', warning);
```

### Error Handling

Always handle errors appropriately:
```typescript
try {
  const result = await apiClient.get('/endpoint');
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

## Performance Optimization

### Code Splitting

Use dynamic imports for heavy components:
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <div>Loading...</div> }
);
```

### Image Optimization

Use Next.js Image component:
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority
/>
```

### Memoization

Use React.memo for expensive components:
```typescript
export const ExpensiveComponent = React.memo(({ data }) => {
  // component logic
});
```

## Deployment

### Building for Production

```bash
npm run build
```

### Environment Variables

Ensure all required environment variables are set:
```bash
# .env.production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
# ... other variables
```

### Deployment Platforms

#### Vercel
```bash
vercel deploy
```

#### Docker
```bash
docker build -t gova .
docker run -p 3000:3000 gova
```

#### Manual
```bash
npm run build
npm run start
```

## Troubleshooting

### Common Issues

#### Build Errors
- Check TypeScript errors: `npm run typecheck`
- Check linting errors: `npm run lint`
- Clear Next.js cache: `rm -rf .next`

#### Dependency Issues
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall dependencies: `npm install`

#### Port Already in Use
```bash
# Find process using port 3000
npx kill-port 3000
# or use different port
npm run dev -- -p 3001
```

## Best Practices

### Code Organization
- Keep related files together
- Use barrel exports for cleaner imports
- Follow the established folder structure
- Keep components small and focused

### Performance
- Use dynamic imports for code splitting
- Optimize images
- Implement caching strategies
- Monitor bundle size

### Security
- Validate all inputs
- Use environment variables for secrets
- Implement proper error handling
- Keep dependencies updated

### Testing
- Write tests for critical functionality
- Aim for high test coverage
- Test edge cases
- Keep tests fast and reliable

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)
- [Jest](https://jestjs.io)
- [Testing Library](https://testing-library.com)

### Community
- [Next.js GitHub](https://github.com/vercel/next.js)
- [React GitHub](https://github.com/facebook/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
