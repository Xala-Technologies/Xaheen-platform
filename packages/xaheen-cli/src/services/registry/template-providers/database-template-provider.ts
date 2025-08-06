/**
 * Database Template Provider
 *
 * Provides templates for database ORMs and systems.
 * Single Responsibility: Database and ORM templates only.
 */

import type { ServiceTemplate } from "../../../types/index";
import { BaseTemplateProvider } from "./base-template-provider";

export class PrismaTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("database", "prisma", "5.20.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"prisma",
			"Prisma next-generation ORM for Node.js and TypeScript",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"prisma/schema.prisma",
					`// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

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
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}`,
					100,
				),
				this.createFileInjectionPoint(
					"src/lib/prisma.ts",
					`import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;`,
					50,
				),
			],
		};
	}
}

export class DrizzleTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("database", "drizzle", "0.36.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"drizzle",
			"Drizzle ORM - TypeScript ORM for SQL databases",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/db/schema.ts",
					`import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});`,
					100,
				),
				this.createFileInjectionPoint(
					"src/db/index.ts",
					`import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);`,
					50,
				),
			],
		};
	}
}

export class MongooseTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("database", "mongoose", "8.8.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"mongoose",
			"Mongoose elegant MongoDB object modeling for Node.js",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/models/User.ts",
					`import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);`,
					100,
				),
			],
		};
	}
}