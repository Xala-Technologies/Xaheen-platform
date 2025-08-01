# @xaheen/types

Shared TypeScript types and interfaces for Xaheen Enterprise applications.

## Installation

```bash
bun add @xaheen/types
```

## Usage

### Common Types

```typescript
import type { UUID, Email, Result, DeepPartial } from '@xaheen/types';

// Use branded types for type safety
const userId: UUID = "123e4567-e89b-12d3-a456-426614174000" as UUID;
const email: Email = "user@example.com" as Email;

// Result type for error handling
function divide(a: number, b: number): Result<number> {
  if (b === 0) {
    return { success: false, error: new Error("Division by zero") };
  }
  return { success: true, data: a / b };
}
```

### API Types

```typescript
import type { ApiResponse, HttpStatus, PaginatedResponse } from '@xaheen/types/api';

const response: ApiResponse<User> = {
  success: true,
  data: user,
  timestamp: new Date().toISOString() as ISO8601DateTime,
  requestId: generateUUID() as UUID
};

const paginatedUsers: PaginatedResponse<User> = {
  data: users,
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasNext: true,
    hasPrevious: false
  }
};
```

### Database Types

```typescript
import type { Repository, QueryOptions, BaseEntity } from '@xaheen/types/database';

interface UserRepository extends Repository<User> {
  findByEmail(email: Email): Promise<User | null>;
}

const queryOptions: QueryOptions = {
  select: ['id', 'name', 'email'],
  where: { active: true },
  orderBy: [{ field: 'createdAt', direction: 'desc' }],
  limit: 10
};
```

### Authentication Types

```typescript
import type { User, JWTPayload, AuthResult } from '@xaheen/types/auth';

const jwtPayload: JWTPayload = {
  sub: userId,
  email: userEmail,
  role: UserRole.USER,
  iat: Date.now() / 1000,
  exp: Date.now() / 1000 + 3600
};

const authResult: AuthResult = {
  user,
  accessToken: token,
  refreshToken,
  expiresIn: 3600,
  tokenType: "Bearer"
};
```

### UI Types

```typescript
import type { ComponentSize, ThemeConfig, FlexProps } from '@xaheen/types/ui';

const buttonSize: ComponentSize = "md";

const flexProps: FlexProps = {
  direction: "row",
  align: "center",
  justify: "between",
  gap: "4"
};
```

## Type Categories

### Common
- Utility types (DeepPartial, DeepReadonly, etc.)
- Branded types (UUID, Email, URL)
- Result and Maybe types
- Pagination types
- Base entity types

### API
- HTTP types and status codes
- Request/Response interfaces
- Webhook and versioning types
- OpenAPI specification types
- Health check types

### Database
- Connection configuration
- Query builder types
- Repository pattern interfaces
- Migration and transaction types
- Audit logging types

### Authentication
- User and account entities
- JWT and OAuth types
- Norwegian auth (BankID, ID-porten)
- Security events and MFA types
- Permission system types

### UI
- Component props interfaces
- Theme configuration
- Layout and grid types
- Animation types
- Accessibility types

## Benefits

- **Type Safety**: Shared types ensure consistency across packages
- **IntelliSense**: Full IDE support with autocompletion
- **Documentation**: Types serve as documentation
- **Maintainability**: Single source of truth for types
- **Tree-shaking**: Import only what you need

## License

MIT