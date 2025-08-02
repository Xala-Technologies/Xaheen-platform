/**
 * Database Setup Technology Options
 * Single Responsibility: Database setup and migration tools
 */

import { TechStackOption } from '../models';

export const DBSETUP_OPTIONS = [
	new TechStackOption('drizzle-kit', 'Drizzle Kit', 'Database migrations and introspection for Drizzle ORM', '/icon/drizzle.svg', 'from-green-500 to-green-700', true),
	new TechStackOption('prisma-migrate', 'Prisma Migrate', 'Database schema migration tool for Prisma', '/icon/prisma.svg', 'from-blue-500 to-blue-700'),
	new TechStackOption('knex-migrations', 'Knex Migrations', 'SQL query builder with migrations', '/icon/knex.svg', 'from-orange-500 to-orange-700'),
	new TechStackOption('typeorm-migrations', 'TypeORM Migrations', 'Database migrations for TypeORM', '/icon/typeorm.svg', 'from-red-500 to-red-700'),
	new TechStackOption('sequelize-migrations', 'Sequelize Migrations', 'Database migrations for Sequelize', '/icon/sequelize.svg', 'from-blue-400 to-blue-600'),
	new TechStackOption('flyway', 'Flyway', 'Database migration tool', '/icon/flyway.svg', 'from-purple-500 to-purple-700'),
	new TechStackOption('liquibase', 'Liquibase', 'Database schema change management', '/icon/liquibase.svg', 'from-indigo-500 to-indigo-700'),
	new TechStackOption('none', 'No Database Setup', 'Skip database setup and migrations', '', 'from-gray-400 to-gray-600'),
];
