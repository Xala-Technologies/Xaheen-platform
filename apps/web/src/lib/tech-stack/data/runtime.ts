/**
 * Runtime Technology Options
 * Single Responsibility: Define runtime environment options
 */

import { TechStackOption } from '../models';

export const RUNTIME_OPTIONS: readonly TechStackOption[] = [
	new TechStackOption(
		'node',
		'Node.js',
		'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
		'/icon/nodejs.svg',
		'from-green-500 to-green-700',
		true
	),
	new TechStackOption(
		'bun',
		'Bun',
		'Fast all-in-one JavaScript runtime',
		'/icon/bun.svg',
		'from-yellow-400 to-yellow-600'
	),
	new TechStackOption(
		'deno',
		'Deno',
		'Secure runtime for JavaScript and TypeScript',
		'/icon/deno.svg',
		'from-blue-500 to-blue-700'
	),
	new TechStackOption(
		'dotnet',
		'.NET',
		'Microsoft\'s developer platform',
		'/icon/dotnet.svg',
		'from-purple-500 to-purple-700'
	),
	new TechStackOption(
		'php',
		'PHP',
		'Popular general-purpose scripting language',
		'/icon/php.svg',
		'from-indigo-500 to-indigo-700'
	),
	new TechStackOption(
		'python',
		'Python',
		'High-level programming language',
		'/icon/python.svg',
		'from-blue-400 to-blue-600'
	)
];
