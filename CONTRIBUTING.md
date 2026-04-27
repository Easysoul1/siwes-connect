# Contributing to SIWES Connect

This document provides guidelines for contributing to the SIWES Connect MVP project.

## Code Quality Standards

### TypeScript
- All code must be written in TypeScript with strict mode enabled
- Use explicit types; avoid `any`
- Keep functions small and focused (max 30 lines)
- Comment only complex logic; code should be self-documenting

### Error Handling
- Always use try-catch for async operations
- Return meaningful error messages
- Use appropriate HTTP status codes
- Log errors with context (user ID, action, etc.)

Example:
```typescript
try {
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  return { success: true, data: user };
} catch (error) {
  logger.error("Failed to fetch user", { userId: id, error });
  throw new HttpError(404, "User not found");
}
```

### API Responses
Maintain consistent response structure:
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "message", code: "ERROR_CODE" }

// Paginated
{ success: true, data: [...], pagination: { page, limit, total, totalPages } }
```

## File Structure

### Backend
```
backend/src/
├── controllers/     # Request handlers (30-40 lines each)
├── services/        # Business logic (reusable across controllers)
├── middleware/      # Request/response interceptors
├── sockets/         # WebSocket event handlers
├── jobs/            # Scheduled tasks (cron)
├── routes/          # Express route definitions
├── models/          # Type definitions (for API contracts)
├── utils/           # Helper functions
├── config/          # Configuration (env, constants)
└── shared/          # Types shared with frontend
```

### Frontend
```
frontend/src/
├── app/             # Next.js pages and layouts
├── components/      # Reusable React components
├── lib/             # Utilities (API client, helpers)
├── styles/          # Global styles and Tailwind config
├── shared/          # Enums and types (duplicated from backend)
└── types/           # Additional TypeScript interfaces
```

## Development Workflow

### 1. Branch Naming
```
feature/endpoint-name        # New feature
bugfix/issue-description     # Bug fix
refactor/component-name      # Code refactoring
docs/what-changed           # Documentation updates
```

### 2. Commit Messages
```
format: [TYPE] Scope: Description

Types: feat, fix, refactor, docs, chore, test
Example: [feat] auth: Add email verification flow
```

Follow conventional commits for consistency.

### 3. Pull Request Process
1. Create feature branch from `develop`
2. Make focused changes (one feature per PR)
3. Test locally: `npm run build && npm --workspace @siwes/backend run test`
4. Update documentation if needed
5. Request review from team members
6. Address review comments
7. Squash commits and merge to `develop`
8. Deploy to staging for QA

### 4. Testing Requirements
Before submitting PR:
- [ ] Code builds successfully (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm run test`)
- [ ] No console errors in browser
- [ ] Tested in supported browsers
- [ ] Tested on mobile viewport

## Database Changes

### Adding a New Field
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_field_name`
3. Update related models/types
4. Update API endpoint if exposed
5. Update frontend types if needed
6. Test with both empty and populated data

### Creating a New Table
1. Add model to `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name create_table_name`
3. Add relations to existing models if needed
4. Update Prisma client in services
5. Create API endpoints following REST conventions

## API Endpoint Guidelines

### Naming Conventions
- Use lowercase, kebab-case for endpoints: `/user-profiles`, `/placement-applications`
- Resources are plural: `/students`, `/organizations`
- Sub-resources: `/students/:id/applications`
- Actions use verbs: `/students/:id/suspend`, `/placements/:id/confirm`

### HTTP Methods
```
GET    /resource        # List (paginated)
GET    /resource/:id    # Detail
POST   /resource        # Create
PUT    /resource/:id    # Replace (full update)
PATCH  /resource/:id    # Partial update
DELETE /resource/:id    # Delete
```

### Status Codes
```
200 OK                 # Successful GET/PATCH/DELETE
201 Created            # Successful POST
204 No Content         # Successful DELETE (no body)
400 Bad Request        # Invalid input
401 Unauthorized       # Missing/invalid authentication
403 Forbidden          # Authenticated but not authorized
404 Not Found          # Resource doesn't exist
409 Conflict           # Duplicate/constraint violation
422 Unprocessable      # Validation failed
429 Too Many Requests  # Rate limited
500 Server Error       # Unexpected error
```

## Frontend Components

### Component Structure
```typescript
// Functional component with TypeScript
interface Props {
  userId: string;
  onSuccess?: () => void;
}

export function UserProfile({ userId, onSuccess }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

### Styling
- Use Tailwind CSS for utility classes
- Keep inline styles minimal
- Create reusable component styles in CSS modules if needed
- Responsive design: mobile-first approach

### Forms & Validation
- Use HTML5 validation for basic checks
- Show inline error messages
- Disable submit button while processing
- Clear errors on input change

## Authentication & Authorization

### Backend
- All protected routes require JWT token
- Check token validity and expiration
- Verify user permissions/role for resource
- Log failed auth attempts

### Frontend
- Store JWT in secure cookie (not localStorage for security)
- Refresh token automatically before expiry
- Redirect to login on 401
- Show role-appropriate UI

## Performance Considerations

### Database
- Use `.select()` to fetch only needed fields
- Use `.include()` for relationships, not multiple queries
- Index frequently queried fields
- Monitor slow queries

### API
- Paginate large result sets
- Cache static data (institutions, states)
- Compress responses (gzip)
- Use conditional requests (ETags, If-Modified-Since)

### Frontend
- Code split by route
- Lazy load non-critical components
- Optimize images (next/image component)
- Use React.memo for expensive components
- Minimize bundle size

## Security Best Practices

### Input Validation
- Validate all user input on backend
- Use Zod for schema validation
- Sanitize string inputs
- Whitelist allowed values

### Authentication
- Hash passwords with bcrypt
- Use strong JWT secrets
- Implement token refresh rotation
- Invalidate tokens on logout

### Authorization
- Check permissions for every resource access
- Never trust client-side role indicators
- Log authorization failures
- Rate limit failed attempts

### Data Protection
- Use HTTPS only
- Enable CORS appropriately
- Don't expose sensitive data in logs
- Follow data minimization principle

## Debugging Tips

### Backend Debugging
```bash
# Enable verbose logging
export DEBUG=siwes:*
npm run dev:backend

# Debug with Node inspector
node --inspect-brk=0.0.0.0:9229 dist/server.js
# Visit chrome://inspect in Chrome
```

### Database Debugging
```bash
# View Prisma query logs
export DEBUG=prisma:*
npm run dev:backend

# Generate and view Prisma schema diagram
npx prisma studio
```

### Frontend Debugging
- Use React DevTools browser extension
- Use Next.js DevTools
- Check Console for client errors
- Use Network tab for API debugging

## Documentation

### Code Comments
- Explain "why", not "what" (code shows what)
- Comment complex algorithms
- Document non-obvious behavior
- Keep comments updated with code

### API Documentation
- Describe endpoint purpose and behavior
- List parameters with types and defaults
- Document response structure
- Include example requests/responses
- Document error cases

### Commit Messages
```
[feat] user: Add email verification

- Add EmailVerificationToken model to schema
- Implement token generation and validation
- Create /auth/verify-email endpoint
- Update frontend to wire email verification flow

Closes #123
```

## Release Process

### Version Numbering
Use semantic versioning: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

### Release Steps
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
4. Push tag: `git push origin v0.1.0`
5. GitHub Actions builds and deploys
6. Create release notes on GitHub

## Getting Help

- Check existing issues/PRs for similar questions
- Review documentation and code comments
- Ask in team chat for quick questions
- Create GitHub issue for bugs/features
- Include error logs and reproduction steps

## Code Review Guidelines

When reviewing:
- [ ] Code follows style guide
- [ ] Error handling is complete
- [ ] No hardcoded values or secrets
- [ ] Tests cover happy and error paths
- [ ] Documentation is updated
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] No unnecessary complexity

When requesting changes:
- Be respectful and constructive
- Explain "why" for significant requests
- Suggest solutions, not just problems
- Approve when satisfied
