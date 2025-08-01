/**
 * Common utility types
 */

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = T extends object
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = T extends object
	? {
			[P in keyof T]-?: DeepRequired<T[P]>;
		}
	: T;

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = T extends object
	? {
			readonly [P in keyof T]: DeepReadonly<T[P]>;
		}
	: T;

/**
 * Extract keys of type T that have values of type U
 */
export type KeysOfType<T, U> = {
	[K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Omit properties with undefined values
 */
export type NonNullableKeys<T> = {
	[K in keyof T]-?: NonNullable<T[K]>;
};

/**
 * Merge two types, with properties from B overriding A
 */
export type Merge<A, B> = Omit<A, keyof B> & B;

/**
 * Make specified keys optional
 */
export type PartialKeys<T, K extends keyof T> = Merge<
	Omit<T, K>,
	Partial<Pick<T, K>>
>;

/**
 * Make specified keys required
 */
export type RequiredKeys<T, K extends keyof T> = Merge<
	Omit<T, K>,
	Required<Pick<T, K>>
>;

/**
 * Extract the type of array elements
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Convert union to intersection
 */
export type UnionToIntersection<U> = (
	U extends any ? (k: U) => void : never
) extends (k: infer I) => void
	? I
	: never;

/**
 * Get the return type of an async function
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
	T extends (...args: any) => Promise<infer R> ? R : never;

/**
 * Branded types for type safety
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Common branded types
 */
export type UUID = Brand<string, "UUID">;
export type Email = Brand<string, "Email">;
export type URL = Brand<string, "URL">;
export type ISO8601DateTime = Brand<string, "ISO8601DateTime">;

/**
 * Result type for error handling
 */
export type Result<T, E = Error> =
	| { success: true; data: T }
	| { success: false; error: E };

/**
 * Maybe type (similar to Option in other languages)
 */
export type Maybe<T> = T | null | undefined;

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Pagination types
 */
export interface PaginationParams {
	page: number;
	limit: number;
	sort?: string;
	order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
}

/**
 * Common response types
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: ApiError;
	timestamp: ISO8601DateTime;
	requestId: UUID;
}

export interface ApiError {
	code: string;
	message: string;
	details?: Record<string, any>;
	stack?: string;
}

/**
 * Timestamp types
 */
export interface Timestamps {
	createdAt: ISO8601DateTime;
	updatedAt: ISO8601DateTime;
}

export interface SoftDeletable {
	deletedAt?: ISO8601DateTime | null;
}

/**
 * Entity base types
 */
export interface BaseEntity extends Timestamps {
	id: UUID;
}

export interface SoftDeletableEntity extends BaseEntity, SoftDeletable {}

/**
 * JSON types
 */
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/**
 * Function types
 */
export type AsyncFunction<T extends any[] = any[], R = any> = (
	...args: T
) => Promise<R>;
export type SyncFunction<T extends any[] = any[], R = any> = (
	...args: T
) => R;
export type AnyFunction = AsyncFunction | SyncFunction;

/**
 * Constructor type
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Mixin type
 */
export type Mixin<T extends Constructor[]> = Constructor<
	UnionToIntersection<InstanceType<T[number]>>
>;