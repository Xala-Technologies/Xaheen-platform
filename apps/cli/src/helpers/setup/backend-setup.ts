import path from "node:path";
import type { AvailableDependencies } from "../../constants";
import type { ProjectConfig } from "../../types";
import { addPackageDependency } from "../../utils/add-package-deps";

export async function setupBackendDependencies(config: ProjectConfig) {
	const { backend, runtime, api, projectDir } = config;

	if (backend === "convex") {
		return;
	}

	const framework = backend;
	const serverDir = path.join(projectDir, "apps/server");

	const dependencies: AvailableDependencies[] = [];
	const devDependencies: AvailableDependencies[] = [];

	if (framework === "hono") {
		dependencies.push("hono");
		if (api === "trpc") {
			dependencies.push("@hono/trpc-server");
		}

		if (runtime === "node") {
			dependencies.push("@hono/node-server");
			devDependencies.push("tsx", "@types/node");
		}
	} else if (framework === "elysia") {
		dependencies.push("elysia", "@elysiajs/cors");
		if (api === "trpc") {
			dependencies.push("@elysiajs/trpc");
		}
		if (runtime === "node") {
			dependencies.push("@elysiajs/node");
			devDependencies.push("tsx", "@types/node");
		}
	} else if (framework === "express") {
		dependencies.push("express", "cors");
		devDependencies.push("@types/express", "@types/cors");

		if (runtime === "node") {
			devDependencies.push("tsx", "@types/node");
		}
	} else if (framework === "fastify") {
		dependencies.push("fastify", "@fastify/cors");

		if (runtime === "node") {
			devDependencies.push("tsx", "@types/node");
		}
	} else if (framework === "dotnet") {
		// .NET dependencies are handled via NuGet, not npm
		// These will be configured in the template's csproj file
		return;
	} else if (framework === "laravel") {
		// Laravel dependencies are handled via Composer, not npm
		// These will be configured in the template's composer.json file
		return;
	} else if (framework === "django") {
		// Django dependencies are handled via pip/requirements.txt
		// These will be configured in the template's requirements.txt file
		return;
	}

	if (runtime === "bun") {
		devDependencies.push("@types/bun");
	}

	if (dependencies.length > 0 || devDependencies.length > 0) {
		await addPackageDependency({
			dependencies,
			devDependencies,
			projectDir: serverDir,
		});
	}
}
