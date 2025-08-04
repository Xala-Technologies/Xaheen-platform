/**
 * ORM Technology Options
 * Single Responsibility: Define Object-Relational Mapping options
 */

import { TechStackOption } from "../models";

export const ORM_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		"drizzle",
		"Drizzle ORM",
		"TypeScript ORM that is production ready",
		"/icon/drizzle.svg",
		"from-green-400 to-green-600",
		true,
	),
	new TechStackOption(
		"prisma",
		"Prisma",
		"Next-generation Node.js and TypeScript ORM",
		"/icon/prisma.svg",
		"from-blue-500 to-blue-700",
	),
	new TechStackOption(
		"typeorm",
		"TypeORM",
		"ORM for TypeScript and JavaScript",
		"/icon/typeorm.svg",
		"from-red-500 to-red-700",
	),
	new TechStackOption(
		"entity-framework",
		"Entity Framework",
		"Microsoft's object-database mapper for .NET",
		"/icon/entity-framework.svg",
		"from-purple-500 to-purple-700",
	),
	new TechStackOption(
		"eloquent",
		"Eloquent ORM",
		"Laravel's built-in ORM",
		"/icon/laravel.svg",
		"from-red-500 to-red-700",
	),
	new TechStackOption(
		"django-orm",
		"Django ORM",
		"Django's built-in ORM",
		"/icon/django.svg",
		"from-green-600 to-green-800",
	),
	new TechStackOption(
		"none",
		"No ORM",
		"Raw SQL queries or no database",
		"",
		"from-gray-400 to-gray-600",
	),
];
