# Full-Stack Architecture Hook

This hook ensures all generated full-stack code follows enterprise architecture patterns and the "Rails of TypeScript" philosophy.

## Full-Stack Generator Standards

### Rails-Inspired Command Structure

All full-stack generators must follow the Rails-inspired command structure:

```bash
# Complete application generation
xaheen generate app MyApp --framework nextjs --backend nestjs --database postgresql

# API generation with full stack
xaheen generate api UserAPI --crud --auth --validation --swagger

# Microservice generation
xaheen generate service UserService --database mongodb --queue redis --monitoring

# Database schema generation
xaheen generate database ecommerce --tables users,products,orders --relations

# Full-stack feature generation  
xaheen generate scaffold Product --frontend --backend --database --tests
```

### Multi-Layer Architecture

All generated applications must follow layered architecture:

```
project/
├── apps/
│   ├── web/                    # Frontend application
│   ├── api/                    # Backend API
│   ├── admin/                  # Admin dashboard
│   └── mobile/                 # Mobile application
├── packages/
│   ├── shared/                 # Shared utilities
│   ├── ui/                     # UI components
│   ├── database/               # Database schemas
│   └── types/                  # TypeScript types
├── services/
│   ├── auth/                   # Authentication service
│   ├── notifications/          # Notification service
│   └── analytics/              # Analytics service
├── infrastructure/
│   ├── docker/                 # Docker configurations
│   ├── kubernetes/             # K8s manifests
│   └── terraform/              # Infrastructure as code
└── docs/                       # Documentation
```

## Backend Framework Standards

### NestJS Patterns

Generated NestJS applications must follow these patterns:

```typescript
// Module Generation
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }
    })
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService]
})
export class UserModule {}

// Controller Generation
@Controller('users')
@ApiTags('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() query: GetUsersDto): Promise<User[]> {
    return this.userService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @UsePipes(new ValidationPipe())
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}

// Service Generation
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: Logger
  ) {}

  async findAll(query: GetUsersDto): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: this.buildWhereClause(query),
        order: { createdAt: 'DESC' },
        take: query.limit || 10,
        skip: query.offset || 0
      });
    } catch (error) {
      this.logger.error('Failed to fetch users', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
}
```

### Express.js Patterns

Generated Express applications must include:

```typescript
// App Generation with TypeScript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import { userRoutes } from './routes/user.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Authentication
app.use('/api', authMiddleware);

// Routes
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

export { app };

// Route Generation
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateSchema } from '../middleware/validation';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const router = Router();
const userController = new UserController();

router.get('/', userController.findAll);
router.get('/:id', userController.findById);
router.post('/', validateSchema(createUserSchema), userController.create);
router.put('/:id', validateSchema(updateUserSchema), userController.update);
router.delete('/:id', userController.delete);

export { router as userRoutes };
```

## Database Integration Standards

### Prisma Integration

Generated Prisma schemas must follow these patterns:

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("posts")
}

enum Role {
  USER
  ADMIN
}
```

### Repository Pattern

All database access must use repository patterns:

```typescript
// Base Repository
export abstract class BaseRepository<T> {
  constructor(protected readonly prisma: PrismaClient) {}

  abstract findAll(query?: any): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: any): Promise<T>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<void>;
}

// User Repository
@Injectable()
export class UserRepository extends BaseRepository<User> {
  async findAll(query: GetUsersQuery): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        email: query.email ? { contains: query.email } : undefined,
        role: query.role,
      },
      include: {
        profile: true,
        posts: query.includePosts ? true : false,
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        posts: true,
      },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        ...data,
        profile: data.profile ? {
          create: data.profile
        } : undefined,
      },
      include: {
        profile: true,
      },
    });
  }
}
```

## Microservices Architecture

### Service Generation

Each microservice must include:

```typescript
// Service Structure
src/
├── controllers/           # HTTP controllers
├── services/             # Business logic
├── repositories/         # Data access
├── models/              # Domain models
├── dto/                 # Data transfer objects
├── middleware/          # Custom middleware
├── config/             # Configuration
├── utils/              # Utilities
├── tests/              # Test files
└── main.ts             # Entry point

// Health Check Controller
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check(): Promise<HealthResponse> {
    return this.healthService.check();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async ready(): Promise<HealthResponse> {
    return this.healthService.ready();
  }
}

// Docker Configuration
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --chown=nestjs:nodejs . .

USER nestjs
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

## API Design Standards

### OpenAPI Specification

All APIs must include complete OpenAPI documentation:

```typescript
// Swagger Configuration
const config = new DocumentBuilder()
  .setTitle('User API')
  .setDescription('User management API with authentication')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token',
  )
  .addTag('users')
  .build();

// DTO with Validation
export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    default: Role.USER
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.USER;
}
```

## Norwegian Enterprise Integration

### BankID Authentication

Generated BankID integration must include:

```typescript
// BankID Service
@Injectable()
export class BankIdService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: Logger
  ) {}

  async initiateAuth(personalNumber?: string): Promise<BankIdAuthResponse> {
    const endpoint = this.configService.get('BANKID_ENDPOINT');
    const certificate = this.configService.get('BANKID_CERTIFICATE');
    
    try {
      const response = await this.httpService.post(`${endpoint}/auth`, {
        personalNumber,
        requirement: {
          cardReader: 'class1',
          certificatePolicies: ['1.2.752.78.1.5']
        }
      }, {
        httpsAgent: new https.Agent({
          cert: certificate,
          key: this.configService.get('BANKID_PRIVATE_KEY')
        })
      }).toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('BankID authentication failed', error);
      throw new BadRequestException('Authentication failed');
    }
  }

  async collectAuth(orderRef: string): Promise<BankIdCollectResponse> {
    // Implementation for collecting authentication result
  }
}

// Authentication Guard
@Injectable()
export class BankIdAuthGuard implements CanActivate {
  constructor(private readonly bankIdService: BankIdService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      const result = await this.bankIdService.validateToken(token);
      request.user = result.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }
}
```

## Infrastructure as Code

### Kubernetes Manifests

Generated K8s manifests must include:

```yaml
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

## Quality Standards

### Testing Requirements

All generated services must include:

1. **Unit Tests**: Service and repository layer tests
2. **Integration Tests**: API endpoint tests with test database
3. **Contract Tests**: API contract validation
4. **E2E Tests**: Full application workflow tests
5. **Performance Tests**: Load and stress testing

### Monitoring and Observability

All services must include:

1. **Health Checks**: Liveness and readiness probes
2. **Metrics**: Prometheus metrics endpoints
3. **Logging**: Structured logging with correlation IDs
4. **Tracing**: OpenTelemetry distributed tracing
5. **Alerting**: Error rate and performance alerts

## Validation Rules

Before generating any full-stack component:

1. **Architecture Compliance**: Follows layered architecture patterns
2. **Security Standards**: Includes authentication and authorization
3. **Norwegian Compliance**: Meets NSM and GDPR requirements
4. **API Documentation**: Complete OpenAPI specifications
5. **Testing Coverage**: Comprehensive test suites
6. **Monitoring Integration**: Health checks and observability
7. **Infrastructure Ready**: Docker and K8s configurations