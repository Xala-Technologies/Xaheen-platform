/**
 * Database Technology Options
 * Single Responsibility: Define database-related technology options
 */

import { TechStackOption } from '../models';

export const DATABASE_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		'sqlite',
		'SQLite',
		'Lightweight, serverless SQL database',
		'/icon/sqlite.svg',
		'from-blue-400 to-blue-600',
		true
	),
	new TechStackOption(
		'postgresql',
		'PostgreSQL',
		'Advanced open-source relational database',
		'/icon/postgresql.svg',
		'from-blue-600 to-blue-800'
	),
	new TechStackOption(
		'mysql',
		'MySQL',
		'Popular open-source relational database',
		'/icon/mysql.svg',
		'from-orange-500 to-orange-700'
	),
	new TechStackOption(
		'mongodb',
		'MongoDB',
		'Document-oriented NoSQL database',
		'/icon/mongodb.svg',
		'from-green-500 to-green-700'
	),
	new TechStackOption(
		'redis',
		'Redis',
		'In-memory data structure store',
		'/icon/redis.svg',
		'from-red-500 to-red-700'
	),
	new TechStackOption(
		'supabase',
		'Supabase',
		'Open-source Firebase alternative with PostgreSQL',
		'/icon/supabase.svg',
		'from-green-400 to-green-600'
	),
	new TechStackOption(
		'planetscale',
		'PlanetScale',
		'Serverless MySQL platform',
		'/icon/planetscale.svg',
		'from-purple-500 to-purple-700'
	),
	new TechStackOption(
		'neon',
		'Neon',
		'Serverless PostgreSQL',
		'/icon/neon.svg',
		'from-green-400 to-green-600'
	),
	new TechStackOption(
		'turso',
		'Turso',
		'Edge SQLite database',
		'/icon/turso.svg',
		'from-teal-400 to-teal-600'
	),
	new TechStackOption(
		'mssql',
		'SQL Server',
		'Microsoft SQL Server database',
		'/icon/mssql.svg',
		'from-blue-600 to-blue-800'
	),
	new TechStackOption(
		'none',
		'No Database',
		'No database (static or external data)',
		'',
		'from-gray-400 to-gray-600'
	),
] as const;

export const ORM_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		'drizzle',
		'Drizzle ORM',
		'TypeScript ORM with SQL-like syntax',
		'/icon/drizzle.svg',
		'from-green-400 to-green-600',
		true
	),
	new TechStackOption(
		'prisma',
		'Prisma',
		'Next-generation ORM for Node.js and TypeScript',
		'/icon/prisma.svg',
		'from-blue-500 to-blue-700'
	),
	new TechStackOption(
		'typeorm',
		'TypeORM',
		'ORM for TypeScript and JavaScript',
		'/icon/typeorm.svg',
		'from-orange-500 to-orange-700'
	),
	new TechStackOption(
		'sequelize',
		'Sequelize',
		'Promise-based Node.js ORM',
		'/icon/sequelize.svg',
		'from-blue-400 to-blue-600'
	),
	new TechStackOption(
		'mongoose',
		'Mongoose',
		'MongoDB object modeling for Node.js',
		'/icon/mongoose.svg',
		'from-red-500 to-red-700'
	),
	new TechStackOption(
		'entity-framework',
		'Entity Framework',
		'Object-relational mapper for .NET',
		'/icon/entity-framework.svg',
		'from-purple-600 to-purple-800'
	),
	new TechStackOption(
		'none',
		'No ORM',
		'Raw SQL queries or no database',
		'',
		'from-gray-400 to-gray-600'
	),
] as const;
