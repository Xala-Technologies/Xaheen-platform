# Database Providers

## Purpose

The database providers module manages connections and operations across multiple database systems with Norwegian enterprise compliance, data residency requirements, and high-availability patterns for mission-critical applications.

## Architecture

```
database/
├── PostgreSQLProvider.ts     # Primary relational database
├── MongoDBProvider.ts        # Document database support
├── RedisProvider.ts          # Caching and session storage
├── SQLiteProvider.ts         # Development and testing
├── AzureSQLProvider.ts       # Azure SQL Database
├── DatabaseProviderManager.ts # Database orchestration
├── migrations/               # Database migration system
│   ├── MigrationManager.ts   # Migration orchestration
│   ├── PostgreSQLMigrator.ts # PostgreSQL migrations
│   └── MongoDBMigrator.ts    # MongoDB migrations
├── connectors/              # Connection management
│   ├── ConnectionPool.ts    # Connection pooling
│   ├── HealthMonitor.ts     # Database health monitoring
│   └── FailoverManager.ts   # High availability
├── types.ts                 # Database types and interfaces
└── utils.ts                 # Database utilities
```

### Key Features

- **Multi-Database Support**: PostgreSQL, MongoDB, Redis, SQLite
- **Norwegian Compliance**: Data residency and GDPR compliance
- **High Availability**: Failover and load balancing
- **Migration System**: Schema versioning and evolution
- **Connection Pooling**: Optimized connection management

## Dependencies

- `pg`: PostgreSQL client
- `mongodb`: MongoDB driver
- `redis`: Redis client
- `sqlite3`: SQLite database
- `@azure/mssql`: Azure SQL integration
- `typeorm`: Object-relational mapping
- `prisma`: Modern database toolkit

## Usage Examples

### PostgreSQL Provider

```typescript
import { PostgreSQLProvider } from './PostgreSQLProvider';

const postgres = new PostgreSQLProvider({
  host: 'postgres.norwayeast.azure.com',
  port: 5432,
  database: 'xaheen_production',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: process.env.DB_SSL_CA
  },
  pool: {
    max: 20,
    min: 5,
    idle: 10000,
    acquire: 60000
  },
  dataResidency: 'norway',
  compliance: ['gdpr', 'nsm']
});

// Execute queries
const users = await postgres.query(
  'SELECT * FROM users WHERE country = $1',
  ['Norway']
);

// Transaction support
await postgres.transaction(async (client) => {
  await client.query('INSERT INTO audit_log (action, user_id) VALUES ($1, $2)', 
    ['user_login', userId]);
  await client.query('UPDATE users SET last_login = NOW() WHERE id = $1', 
    [userId]);
});
```

### MongoDB Provider

```typescript
import { MongoDBProvider } from './MongoDBProvider';

const mongodb = new MongoDBProvider({
  uri: 'mongodb://mongo.norwayeast.azure.com:27017/xaheen',
  options: {
    ssl: true,
    sslCA: process.env.MONGO_SSL_CA,
    authSource: 'admin',
    replicaSet: 'xaheen-replica',
    readPreference: 'secondaryPreferred'
  },
  dataClassification: 'RESTRICTED',
  encryptionKey: process.env.MONGO_ENCRYPTION_KEY
});

// Document operations
const collection = mongodb.collection('projects');

await collection.insertOne({
  name: 'Norwegian Government Portal',
  classification: 'CONFIDENTIAL',
  createdAt: new Date(),
  compliance: {
    gdpr: true,
    nsm: 'RESTRICTED'
  }
});

// Aggregation pipeline
const stats = await collection.aggregate([
  { $match: { classification: 'RESTRICTED' } },
  { $group: { _id: '$department', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).toArray();
```

### Redis Provider

```typescript
import { RedisProvider } from './RedisProvider';

const redis = new RedisProvider({
  host: 'redis.norwayeast.azure.com',
  port: 6379,
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: true
  },
  cluster: {
    enabled: true,
    nodes: [
      { host: 'redis-1.norway.azure.com', port: 6379 },
      { host: 'redis-2.norway.azure.com', port: 6379 },
      { host: 'redis-3.norway.azure.com', port: 6379 }
    ]
  },
  encryption: true,
  dataRetention: '30d' // Norwegian data retention requirements
});

// Caching operations
await redis.set('user:session:' + sessionId, userSession, 'EX', 3600);
const session = await redis.get('user:session:' + sessionId);

// Pub/Sub for real-time features
await redis.subscribe('notifications:' + userId);
await redis.publish('notifications:' + userId, {
  type: 'security_alert',
  message: 'Unusual login detected'
});
```

## Provider Implementations

### PostgreSQL Provider

**Features:**
- ACID compliance for critical data
- Advanced indexing and query optimization
- Full-text search capabilities
- JSON/JSONB support for flexible schemas
- Row-level security for multi-tenant applications

**Configuration:**
```typescript
interface PostgreSQLConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: SSLConfig;
  pool: PoolConfig;
  dataResidency: 'norway' | 'eu' | 'global';
  compliance: ComplianceRequirement[];
  backup: BackupConfig;
  monitoring: MonitoringConfig;
}
```

**Norwegian Compliance Features:**
```typescript
class NorwegianCompliantPostgreSQL extends PostgreSQLProvider {
  async storePersonalData(
    data: PersonalData,
    consent: ConsentRecord
  ): Promise<void> {
    // Validate consent before storing
    if (!this.consentValidator.validate(consent)) {
      throw new Error('Valid consent required for personal data storage');
    }
    
    // Encrypt sensitive data
    const encryptedData = await this.encryptPersonalData(data);
    
    // Store with audit trail
    await this.transaction(async (client) => {
      await client.query(
        'INSERT INTO personal_data (user_id, data, consent_id, created_at) VALUES ($1, $2, $3, $4)',
        [data.userId, encryptedData, consent.id, new Date()]
      );
      
      await client.query(
        'INSERT INTO audit_log (action, table_name, record_id, user_id) VALUES ($1, $2, $3, $4)',
        ['INSERT', 'personal_data', data.userId, data.userId]
      );
    });
  }
}
```

### MongoDB Provider

**Features:**
- Document-oriented flexible schemas
- Horizontal scaling with sharding
- Rich query language and aggregation
- GridFS for large file storage
- Field-level encryption

**Configuration:**
```typescript
interface MongoDBConfig {
  uri: string;
  options: MongoClientOptions;
  dataClassification: NSMClassification;
  encryptionKey: string;
  sharding: ShardingConfig;
  replication: ReplicationConfig;
}
```

**Data Classification:**
```typescript
class ClassifiedMongoDBProvider extends MongoDBProvider {
  async insertDocument(
    collection: string,
    document: any,
    classification: NSMClassification
  ): Promise<any> {
    // Apply classification metadata
    const classifiedDocument = {
      ...document,
      _metadata: {
        classification,
        createdAt: new Date(),
        createdBy: this.getCurrentUser(),
        dataResidency: 'norway'
      }
    };
    
    // Encrypt if required
    if (classification === 'SECRET' || classification === 'CONFIDENTIAL') {
      classifiedDocument._encrypted = true;
      classifiedDocument.data = await this.encrypt(document);
    }
    
    return this.collection(collection).insertOne(classifiedDocument);
  }
}
```

### Azure SQL Provider

**Features:**
- Enterprise-grade SQL database
- Built-in high availability
- Advanced security features
- Intelligent performance optimization
- European data residency

```typescript
class AzureSQLProvider implements DatabaseProvider {
  constructor(private config: AzureSQLConfig) {
    this.connection = new ConnectionPool({
      server: config.server,
      database: config.database,
      authentication: {
        type: 'azure-active-directory-msi-managed-identity'
      },
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    });
  }
  
  async executeStoredProcedure(
    procedureName: string,
    parameters: any[]
  ): Promise<any> {
    const request = this.connection.request();
    
    parameters.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
    
    return request.execute(procedureName);
  }
}
```

## Norwegian Enterprise Features

### Data Residency Compliance

```typescript
class DataResidencyManager {
  private residencyRules = {
    'OPEN': ['norway', 'eu', 'global'],
    'RESTRICTED': ['norway', 'eu'],
    'CONFIDENTIAL': ['norway'],
    'SECRET': ['norway']
  };
  
  async validateDataResidency(
    data: any,
    classification: NSMClassification,
    targetLocation: string
  ): Promise<boolean> {
    const allowedLocations = this.residencyRules[classification];
    
    if (!allowedLocations.includes(targetLocation)) {
      throw new DataResidencyViolationError(
        `Data classified as ${classification} cannot be stored in ${targetLocation}`
      );
    }
    
    return true;
  }
  
  async migrateDataForCompliance(
    sourceProvider: DatabaseProvider,
    targetProvider: DatabaseProvider,
    classification: NSMClassification
  ): Promise<MigrationResult> {
    // Validate target location compliance
    await this.validateDataResidency(null, classification, targetProvider.location);
    
    // Perform secure data migration
    const migrationPlan = await this.createMigrationPlan(sourceProvider, targetProvider);
    
    return this.executeMigration(migrationPlan);
  }
}
```

### GDPR Implementation

```typescript
class GDPRCompliantDatabase {
  async processDataSubjectRequest(
    request: DataSubjectRequest
  ): Promise<DataSubjectResponse> {
    switch (request.type) {
      case 'access':
        return this.handleDataAccess(request);
      case 'rectification':
        return this.handleDataRectification(request);
      case 'erasure':
        return this.handleDataErasure(request);
      case 'portability':
        return this.handleDataPortability(request);
      default:
        throw new Error(`Unsupported request type: ${request.type}`);
    }
  }
  
  private async handleDataErasure(request: DataSubjectRequest): Promise<DataSubjectResponse> {
    const userId = request.subjectId;
    
    // Find all personal data
    const tables = await this.getTablesWithPersonalData();
    
    // Soft delete or anonymize data
    for (const table of tables) {
      if (table.deletionPolicy === 'soft') {
        await this.query(
          `UPDATE ${table.name} SET deleted_at = NOW(), data_status = 'erased' WHERE user_id = $1`,
          [userId]
        );
      } else if (table.deletionPolicy === 'anonymize') {
        await this.anonymizeUserData(table.name, userId);
      }
    }
    
    // Log erasure for audit
    await this.auditLogger.logDataErasure({
      userId,
      requestId: request.id,
      timestamp: new Date(),
      tablesAffected: tables.map(t => t.name)
    });
    
    return {
      success: true,
      message: 'Personal data has been erased',
      completedAt: new Date()
    };
  }
}
```

## High Availability and Disaster Recovery

### Connection Pool Management

```typescript
class AdvancedConnectionPool {
  private pools = new Map<string, Pool>();
  private healthChecker: HealthChecker;
  
  constructor(private config: PoolConfig) {
    this.healthChecker = new HealthChecker(config.healthCheck);
    this.initializePools();
  }
  
  async getConnection(
    database: string,
    options: ConnectionOptions = {}
  ): Promise<Connection> {
    const pool = this.pools.get(database);
    
    if (!pool || !await this.healthChecker.isHealthy(pool)) {
      // Attempt failover
      const failoverPool = await this.getFailoverPool(database);
      if (failoverPool) {
        this.pools.set(database, failoverPool);
        return failoverPool.connect();
      }
      
      throw new DatabaseConnectionError(`No healthy connections available for ${database}`);
    }
    
    return pool.connect();
  }
  
  private async getFailoverPool(database: string): Promise<Pool | null> {
    const failoverConfigs = this.config.failover[database];
    
    for (const config of failoverConfigs) {
      try {
        const pool = new Pool(config);
        await pool.query('SELECT 1'); // Health check
        return pool;
      } catch (error) {
        console.warn(`Failover option ${config.host} is not available`);
      }
    }
    
    return null;
  }
}
```

### Backup and Recovery

```typescript
class DatabaseBackupManager {
  async createBackup(
    provider: DatabaseProvider,
    options: BackupOptions
  ): Promise<BackupResult> {
    const backup: BackupMetadata = {
      id: generateId(),
      provider: provider.name,
      type: options.type,
      encryption: options.encryption,
      location: options.location,
      startTime: new Date(),
      classification: options.classification
    };
    
    try {
      // Create encrypted backup
      const backupData = await provider.exportData(options.tables);
      const encryptedBackup = await this.encryptBackup(backupData, options.encryptionKey);
      
      // Store in Norwegian-compliant location
      const storageLocation = await this.selectCompliantStorage(backup.classification);
      await storageLocation.store(backup.id, encryptedBackup);
      
      backup.endTime = new Date();
      backup.status = 'completed';
      backup.size = encryptedBackup.length;
      
      // Log backup for audit
      await this.auditLogger.logBackup(backup);
      
      return {
        success: true,
        backup,
        location: storageLocation.path
      };
    } catch (error) {
      backup.status = 'failed';
      backup.error = error.message;
      
      await this.auditLogger.logBackupFailure(backup, error);
      throw error;
    }
  }
  
  async restoreBackup(
    backupId: string,
    targetProvider: DatabaseProvider
  ): Promise<RestoreResult> {
    const backup = await this.getBackupMetadata(backupId);
    
    // Validate restoration permissions
    await this.validateRestorePermissions(backup, targetProvider);
    
    // Decrypt and restore data
    const encryptedData = await this.retrieveBackup(backupId);
    const decryptedData = await this.decryptBackup(encryptedData, backup.encryptionKey);
    
    return targetProvider.importData(decryptedData);
  }
}
```

## Migration System

### Schema Migrations

```typescript
class DatabaseMigrationManager {
  async runMigrations(
    provider: DatabaseProvider,
    targetVersion?: string
  ): Promise<MigrationResult> {
    const currentVersion = await this.getCurrentVersion(provider);
    const migrations = await this.getPendingMigrations(currentVersion, targetVersion);
    
    const results: MigrationStepResult[] = [];
    
    for (const migration of migrations) {
      try {
        await provider.transaction(async (client) => {
          // Run migration
          await this.executeMigration(client, migration);
          
          // Update version
          await this.updateVersion(client, migration.version);
          
          // Log migration
          await this.logMigration(client, migration);
        });
        
        results.push({
          version: migration.version,
          success: true,
          duration: migration.duration
        });
      } catch (error) {
        results.push({
          version: migration.version,
          success: false,
          error: error.message
        });
        
        // Stop on first failure
        break;
      }
    }
    
    return {
      success: results.every(r => r.success),
      migrations: results
    };
  }
}
```

### Data Migrations

```typescript
class DataMigrationManager {
  async migrateUserData(
    sourceProvider: DatabaseProvider,
    targetProvider: DatabaseProvider,
    userConsent: ConsentRecord[]
  ): Promise<DataMigrationResult> {
    const migrationPlan = await this.createDataMigrationPlan(
      sourceProvider,
      targetProvider,
      userConsent
    );
    
    // Validate GDPR compliance
    await this.validateGDPRCompliance(migrationPlan, userConsent);
    
    // Execute migration
    return this.executeDataMigration(migrationPlan);
  }
}
```

## Testing

### Unit Tests

```typescript
describe('PostgreSQLProvider', () => {
  let provider: PostgreSQLProvider;
  let testDatabase: TestDatabase;
  
  beforeEach(async () => {
    testDatabase = await createTestDatabase();
    provider = new PostgreSQLProvider(testDatabase.config);
  });
  
  afterEach(async () => {
    await testDatabase.cleanup();
  });
  
  it('should handle Norwegian personal data with proper encryption', async () => {
    const personalData = {
      userId: 'test-user',
      personalNumber: '12345678901',
      name: 'Test User'
    };
    
    const consent = createTestConsent('test-user');
    
    await provider.storePersonalData(personalData, consent);
    
    const stored = await provider.query('SELECT * FROM personal_data WHERE user_id = $1', ['test-user']);
    expect(stored[0].data).not.toContain('12345678901'); // Should be encrypted
  });
});
```

### Integration Tests

```typescript
describe('Database Failover', () => {
  it('should failover to secondary database when primary fails', async () => {
    const manager = new DatabaseProviderManager({
      primary: primaryConfig,
      secondary: secondaryConfig
    });
    
    // Simulate primary failure
    await manager.primary.disconnect();
    
    // Should automatically use secondary
    const result = await manager.query('SELECT 1');
    expect(result).toBeDefined();
    expect(manager.activeProvider).toBe(manager.secondary);
  });
});
```

## Performance Optimization

### Query Optimization

```typescript
class QueryOptimizer {
  async analyzeQuery(sql: string, parameters: any[]): Promise<QueryPlan> {
    const plan = await this.database.query(`EXPLAIN ANALYZE ${sql}`, parameters);
    
    return {
      estimatedCost: this.extractCost(plan),
      actualTime: this.extractTime(plan),
      indexUsage: this.extractIndexUsage(plan),
      recommendations: this.generateRecommendations(plan)
    };
  }
  
  async optimizeQuery(sql: string): Promise<OptimizedQuery> {
    const analysis = await this.analyzeQuery(sql, []);
    
    if (analysis.estimatedCost > this.costThreshold) {
      // Suggest index creation
      const suggestedIndexes = this.suggestIndexes(sql);
      
      return {
        originalQuery: sql,
        optimizedQuery: this.rewriteQuery(sql),
        suggestedIndexes,
        expectedImprovement: this.estimateImprovement(analysis)
      };
    }
    
    return { originalQuery: sql };
  }
}
```

## Contributing

### Adding New Database Providers

1. **Implement Provider Interface**:
   ```typescript
   export class NewDatabaseProvider implements DatabaseProvider {
     async query(sql: string, params: any[]): Promise<any[]> {
       // Implementation
     }
   }
   ```

2. **Add Configuration Schema**:
   ```typescript
   interface NewDatabaseConfig extends DatabaseConfig {
     // Provider-specific configuration
   }
   ```

3. **Register Provider**:
   ```typescript
   databaseManager.register('new-database', NewDatabaseProvider);
   ```

### Development Guidelines

- Implement proper connection pooling
- Add comprehensive error handling
- Include health monitoring
- Follow Norwegian data protection laws
- Implement proper backup and recovery
- Add migration support
- Provide performance monitoring
- Include security best practices