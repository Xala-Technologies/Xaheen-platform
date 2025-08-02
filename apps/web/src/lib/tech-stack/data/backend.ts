/**
 * Backend Technology Options
 * Single Responsibility: Define backend-related technology options
 */

import { TechStackOption } from '../models';

export const BACKEND_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		'hono',
		'Hono',
		'Ultrafast web framework',
		'/icon/hono.svg',
		'from-orange-400 to-orange-600',
		true
	),
	new TechStackOption(
		'next-api',
		'Next.js API Routes',
		'Built-in API routes with Next.js',
		'/icon/next.svg',
		'from-gray-800 to-black'
	),
	new TechStackOption(
		'express',
		'Express.js',
		'Fast, unopinionated web framework for Node.js',
		'/icon/express.svg',
		'from-gray-600 to-gray-800'
	),
	new TechStackOption(
		'fastify',
		'Fastify',
		'Fast and low overhead web framework for Node.js',
		'/icon/fastify.svg',
		'from-green-400 to-green-600'
	),
	new TechStackOption(
		'nestjs',
		'NestJS',
		'Progressive Node.js framework for scalable server-side applications',
		'/icon/nestjs.svg',
		'from-red-500 to-red-700'
	),
	new TechStackOption(
		'koa',
		'Koa.js',
		'Expressive middleware for Node.js',
		'/icon/koa.svg',
		'from-blue-400 to-blue-600'
	),
	new TechStackOption(
		'elysia',
		'Elysia',
		'Fast and friendly Bun web framework',
		'/icon/elysia.svg',
		'from-purple-400 to-purple-600'
	),
	new TechStackOption(
		'dotnet',
		'.NET Core',
		'Cross-platform .NET framework',
		'/icon/dotnet.svg',
		'from-purple-600 to-purple-800'
	),
	new TechStackOption(
		'django',
		'Django',
		'High-level Python web framework',
		'/icon/django.svg',
		'from-green-600 to-green-800'
	),
	new TechStackOption(
		'flask',
		'Flask',
		'Lightweight Python web framework',
		'/icon/flask.svg',
		'from-blue-500 to-blue-700'
	),
	new TechStackOption(
		'laravel',
		'Laravel',
		'PHP framework for web artisans',
		'/icon/laravel.svg',
		'from-red-500 to-red-700'
	),
	new TechStackOption(
		'spring-boot',
		'Spring Boot',
		'Java framework for microservices',
		'/icon/spring.svg',
		'from-green-500 to-green-700'
	),
	new TechStackOption(
		'go-gin',
		'Go + Gin',
		'HTTP web framework written in Go',
		'/icon/go.svg',
		'from-blue-400 to-blue-600'
	),
	new TechStackOption(
		'rust-axum',
		'Rust + Axum',
		'Ergonomic and modular web framework for Rust',
		'/icon/rust.svg',
		'from-orange-600 to-orange-800'
	),
	new TechStackOption(
		'none',
		'No Backend',
		'Frontend-only application',
		'',
		'from-gray-400 to-gray-600'
	),
] as const;
