import type { BaseEntity, SoftDeletableEntity, UUID } from "../common";

/**
 * Database connection config
 */
export interface DatabaseConfig {
	type: "postgres" | "mysql" | "sqlite" | "mongodb";
	host?: string;
	port?: number;
	database: string;
	username?: string;
	password?: string;
	url?: string;
	ssl?: boolean | DatabaseSSLConfig;
	pool?: DatabasePoolConfig;
	logging?: boolean | string[];
}

export interface DatabaseSSLConfig {
	rejectUnauthorized?: boolean;
	ca?: string;
	cert?: string;
	key?: string;
}

export interface DatabasePoolConfig {
	min?: number;
	max?: number;
	idleTimeoutMillis?: number;
	connectionTimeoutMillis?: number;
}

/**
 * Query builder types
 */
export interface QueryOptions {
	select?: string[];
	where?: WhereCondition;
	orderBy?: OrderByCondition[];
	limit?: number;
	offset?: number;
	include?: IncludeOptions;
	transaction?: unknown;
}

export type WhereCondition =
	| Record<string, any>
	| { AND: WhereCondition[] }
	| { OR: WhereCondition[] }
	| { NOT: WhereCondition };

export interface OrderByCondition {
	field: string;
	direction: "asc" | "desc";
}

export interface IncludeOptions {
	[relation: string]: boolean | QueryOptions;
}

/**
 * Transaction types
 */
export interface Transaction {
	id: string;
	commit(): Promise<void>;
	rollback(): Promise<void>;
	isActive(): boolean;
}

export type TransactionCallback<T> = (tx: Transaction) => Promise<T>;

/**
 * Migration types
 */
export interface Migration {
	id: string;
	name: string;
	timestamp: number;
	up(): Promise<void>;
	down(): Promise<void>;
}

export interface MigrationRecord {
	id: string;
	name: string;
	executedAt: Date;
	duration: number;
}

/**
 * Repository pattern types
 */
export interface Repository<T extends BaseEntity> {
	findById(id: UUID): Promise<T | null>;
	findOne(options: QueryOptions): Promise<T | null>;
	findMany(options?: QueryOptions): Promise<T[]>;
	count(where?: WhereCondition): Promise<number>;
	create(data: Omit<T, keyof BaseEntity>): Promise<T>;
	update(id: UUID, data: Partial<Omit<T, keyof BaseEntity>>): Promise<T>;
	delete(id: UUID): Promise<boolean>;
	exists(where: WhereCondition): Promise<boolean>;
}

export interface SoftDeletableRepository<T extends SoftDeletableEntity>
	extends Repository<T> {
	softDelete(id: UUID): Promise<boolean>;
	restore(id: UUID): Promise<boolean>;
	findDeleted(options?: QueryOptions): Promise<T[]>;
	permanentlyDelete(id: UUID): Promise<boolean>;
}

/**
 * Unit of Work pattern
 */
export interface UnitOfWork {
	registerNew<T extends BaseEntity>(entity: T): void;
	registerDirty<T extends BaseEntity>(entity: T): void;
	registerDeleted<T extends BaseEntity>(entity: T): void;
	commit(): Promise<void>;
	rollback(): Promise<void>;
	clear(): void;
}

/**
 * Database events
 */
export interface DatabaseEvent {
	type: "insert" | "update" | "delete";
	table: string;
	entity: BaseEntity;
	changes?: Record<string, { old: any; new: any }>;
	timestamp: Date;
	userId?: string;
}

/**
 * Audit log types
 */
export interface AuditLog {
	id: UUID;
	entityType: string;
	entityId: UUID;
	action: "create" | "update" | "delete" | "restore";
	changes?: Record<string, { old: any; new: any }>;
	userId: UUID;
	userEmail?: string;
	ipAddress?: string;
	userAgent?: string;
	timestamp: Date;
	metadata?: Record<string, any>;
}

/**
 * Database statistics
 */
export interface DatabaseStats {
	connectionCount: number;
	activeQueries: number;
	slowQueries: QueryStats[];
	tableStats: TableStats[];
	cacheHitRate?: number;
}

export interface QueryStats {
	query: string;
	duration: number;
	timestamp: Date;
	parameters?: any[];
}

export interface TableStats {
	name: string;
	rowCount: number;
	sizeBytes: number;
	indexCount: number;
	lastAnalyzed?: Date;
}

/**
 * Seeder types
 */
export interface Seeder {
	name: string;
	run(): Promise<void>;
	dependencies?: string[];
}

/**
 * Database indexes
 */
export interface IndexDefinition {
	name: string;
	table: string;
	columns: string[];
	unique?: boolean;
	type?: "btree" | "hash" | "gin" | "gist";
	where?: string;
}

/**
 * Foreign key constraints
 */
export interface ForeignKeyConstraint {
	name: string;
	table: string;
	column: string;
	referencedTable: string;
	referencedColumn: string;
	onDelete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
	onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
}