/**
 * Health Check Generator
 * Generates health check endpoints and monitoring for microservices
 */

import {
	GeneratedFile,
	MicroserviceOptions,
	ServiceHealthCheck,
} from "./types.js";

export class HealthCheckGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		switch (options.framework) {
			case "nestjs":
				files.push(...this.generateNestJSHealthChecks(options));
				break;
			case "express":
				files.push(...this.generateExpressHealthChecks(options));
				break;
			case "fastify":
				files.push(...this.generateFastifyHealthChecks(options));
				break;
			case "hono":
				files.push(...this.generateHonoHealthChecks(options));
				break;
		}

		return files;
	}

	private generateNestJSHealthChecks(
		options: MicroserviceOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		// Health module
		files.push({
			path: `${options.name}/src/health/health.module.ts`,
			content: `import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
${options.database === "postgresql" ? "import { TypeOrmHealthIndicator } from '@nestjs/terminus';" : ""}
${options.database === "mongodb" ? "import { MongooseHealthIndicator } from '@nestjs/terminus';" : ""}
${options.database === "redis" ? "import { RedisHealthIndicator } from './redis.health';" : ""}
${options.messaging === "rabbitmq" ? "import { RabbitMQHealthIndicator } from './rabbitmq.health';" : ""}

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [
    ${options.database === "postgresql" ? "TypeOrmHealthIndicator," : ""}
    ${options.database === "mongodb" ? "MongooseHealthIndicator," : ""}
    ${options.database === "redis" ? "RedisHealthIndicator," : ""}
    ${options.messaging === "rabbitmq" ? "RabbitMQHealthIndicator," : ""}
  ],
})
export class HealthModule {}`,
			type: "source",
		});

		// Health controller
		files.push({
			path: `${options.name}/src/health/health.controller.ts`,
			content: `import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
${options.database === "redis" ? "import { RedisHealthIndicator } from './redis.health';" : ""}
${options.messaging === "rabbitmq" ? "import { RabbitMQHealthIndicator } from './rabbitmq.health';" : ""}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    ${options.database === "postgresql" ? "private db: TypeOrmHealthIndicator," : ""}
    ${options.database === "mongodb" ? "private db: MongooseHealthIndicator," : ""}
    ${options.database === "redis" ? "private redis: RedisHealthIndicator," : ""}
    ${options.messaging === "rabbitmq" ? "private rabbitmq: RabbitMQHealthIndicator," : ""}
  ) {}

  @Get('liveness')
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  checkLiveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  async checkReadiness() {
    const checks = [
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ];

    ${options.database === "postgresql" ? "checks.push(() => this.db.pingCheck('database'));" : ""}
    ${options.database === "mongodb" ? "checks.push(() => this.db.pingCheck('database'));" : ""}
    ${options.database === "redis" ? "checks.push(() => this.redis.isHealthy('redis'));" : ""}
    ${options.messaging === "rabbitmq" ? "checks.push(() => this.rabbitmq.isHealthy('rabbitmq'));" : ""}

    return this.health.check(checks);
  }

  @Get('startup')
  @HealthCheck()
  @ApiOperation({ summary: 'Startup probe for Kubernetes' })
  checkStartup() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: '${options.name}',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}`,
			type: "source",
		});

		// Redis health indicator if needed
		if (options.database === "redis") {
			files.push({
				path: `${options.name}/src/health/redis.health.ts`,
				content: `import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { Redis } from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private redis: Redis;

  constructor() {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
    }
  }
}`,
				type: "source",
			});
		}

		// RabbitMQ health indicator if needed
		if (options.messaging === "rabbitmq") {
			files.push({
				path: `${options.name}/src/health/rabbitmq.health.ts`,
				content: `import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
      await connection.close();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError('RabbitMQ check failed', this.getStatus(key, false));
    }
  }
}`,
				type: "source",
			});
		}

		return files;
	}

	private generateExpressHealthChecks(
		options: MicroserviceOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/routes/health.ts`,
			content: `import { Router } from 'express';
${options.database === "postgresql" ? "import { Pool } from 'pg';" : ""}
${options.database === "mongodb" ? "import mongoose from 'mongoose';" : ""}
${options.database === "redis" ? "import Redis from 'ioredis';" : ""}
${options.messaging === "rabbitmq" ? "import * as amqp from 'amqplib';" : ""}

export const healthRouter = Router();

// Liveness probe
healthRouter.get('/liveness', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness probe
healthRouter.get('/readiness', async (req, res) => {
  const checks: Record<string, boolean> = {};
  
  try {
    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = memUsage.heapUsed < 150 * 1024 * 1024;

    ${
			options.database === "postgresql"
				? `
    // Database check
    const pool = new Pool({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    try {
      await pool.query('SELECT 1');
      checks.database = true;
    } catch {
      checks.database = false;
    } finally {
      await pool.end();
    }`
				: ""
		}

    ${
			options.database === "mongodb"
				? `
    // MongoDB check
    checks.database = mongoose.connection.readyState === 1;`
				: ""
		}

    ${
			options.database === "redis"
				? `
    // Redis check
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
    try {
      await redis.ping();
      checks.redis = true;
    } catch {
      checks.redis = false;
    } finally {
      redis.disconnect();
    }`
				: ""
		}

    ${
			options.messaging === "rabbitmq"
				? `
    // RabbitMQ check
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URI || 'amqp://localhost');
      await connection.close();
      checks.rabbitmq = true;
    } catch {
      checks.rabbitmq = false;
    }`
				: ""
		}

    const allHealthy = Object.values(checks).every(check => check);
    
    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Startup probe
healthRouter.get('/startup', (req, res) => {
  res.json({
    status: 'ok',
    service: '${options.name}',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});`,
			type: "source",
		});

		return files;
	}

	private generateFastifyHealthChecks(
		options: MicroserviceOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/routes/health.ts`,
			content: `import { FastifyPluginAsync } from 'fastify';
${options.database === "postgresql" ? "import { Pool } from 'pg';" : ""}
${options.database === "mongodb" ? "import mongoose from 'mongoose';" : ""}
${options.database === "redis" ? "import Redis from 'ioredis';" : ""}

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Liveness probe
  fastify.get('/liveness', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // Readiness probe
  fastify.get('/readiness', async () => {
    const checks: Record<string, boolean> = {};
    
    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = memUsage.heapUsed < 150 * 1024 * 1024;

    ${
			options.database === "postgresql"
				? `
    // Database check
    const pool = new Pool({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    try {
      await pool.query('SELECT 1');
      checks.database = true;
    } catch {
      checks.database = false;
    } finally {
      await pool.end();
    }`
				: ""
		}

    const allHealthy = Object.values(checks).every(check => check);
    
    return {
      status: allHealthy ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    };
  });

  // Startup probe
  fastify.get('/startup', async () => {
    return {
      status: 'ok',
      service: '${options.name}',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
    };
  });
};`,
			type: "source",
		});

		return files;
	}

	private generateHonoHealthChecks(
		options: MicroserviceOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		files.push({
			path: `${options.name}/src/routes/health.ts`,
			content: `import { Hono } from 'hono';
${options.database === "postgresql" ? "import { Pool } from 'pg';" : ""}

export const healthRoutes = new Hono();

// Liveness probe
healthRoutes.get('/liveness', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Readiness probe
healthRoutes.get('/readiness', async (c) => {
  const checks: Record<string, boolean> = {};
  
  // Memory check
  const memUsage = process.memoryUsage();
  checks.memory = memUsage.heapUsed < 150 * 1024 * 1024;

  ${
		options.database === "postgresql"
			? `
  // Database check
  const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });
  try {
    await pool.query('SELECT 1');
    checks.database = true;
  } catch {
    checks.database = false;
  } finally {
    await pool.end();
  }`
			: ""
	}

  const allHealthy = Object.values(checks).every(check => check);
  
  return c.json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  }, allHealthy ? 200 : 503);
});

// Startup probe
healthRoutes.get('/startup', (c) => {
  return c.json({
    status: 'ok',
    service: '${options.name}',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});`,
			type: "source",
		});

		return files;
	}
}
