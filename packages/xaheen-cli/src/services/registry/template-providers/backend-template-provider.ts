/**
 * Backend Template Provider
 *
 * Provides templates for backend frameworks.
 * Single Responsibility: Backend framework templates only.
 */

import type { ServiceTemplate } from "../../../types/index";
import { BaseTemplateProvider } from "./base-template-provider";

export class ExpressTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("backend", "express", "4.19.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"express",
			"Express.js Node.js web framework",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/server.ts",
					`import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});

export default app;`,
					100,
				),
				this.createFileInjectionPoint(
					"package.json",
					`{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.19.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "tsx": "^4.19.1",
    "typescript": "^5.7.2"
  }
}`,
					50,
				),
			],
		};
	}
}

export class FastifyTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("backend", "fastify", "4.28.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"fastify",
			"Fastify fast and low overhead web framework",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/server.ts",
					`import Fastify from 'fastify';

const fastify = Fastify({
  logger: true
});

fastify.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

export default fastify;`,
					100,
				),
			],
		};
	}
}

export class NestJSTemplateProvider extends BaseTemplateProvider {
	constructor() {
		super("backend", "nestjs", "10.0.0");
	}

	createTemplate(): ServiceTemplate {
		const base = this.createBaseTemplate(
			"nestjs",
			"NestJS progressive Node.js framework",
		);

		return {
			...base,
			injectionPoints: [
				this.createFileInjectionPoint(
					"src/main.ts",
					`import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();`,
					100,
				),
			],
		};
	}
}