/**
 * CLI v2 Command Generator
 * 
 * Generates commands for the new Xaheen CLI v2 with service-based architecture
 */

import type { StackState } from "@/lib/types/index";

export interface CLIv2Options {
  preset?: string;
  framework?: string;
  backend?: string;
  database?: string;
  auth?: string;
  payments?: string;
  services?: string[];
  packageManager?: string;
  git?: boolean;
  install?: boolean;
  dryRun?: boolean;
}

/**
 * Map old stack builder options to new CLI v2 services
 */
export const mapStackToServices = (stackState: StackState): CLIv2Options => {
  const options: CLIv2Options = {
    packageManager: stackState.packageManager,
    git: stackState.git === "true",
    install: true,
  };

  // Map frontend frameworks
  const frontends = [...stackState.webFrontend, ...stackState.nativeFrontend].filter(
    (f) => f !== "none"
  );
  
  if (frontends.includes("next")) {
    options.framework = "next";
  } else if (frontends.includes("nuxt")) {
    options.framework = "nuxt";
  } else if (frontends.includes("remix")) {
    options.framework = "remix";
  } else if (frontends.includes("svelte")) {
    options.framework = "sveltekit";
  } else if (frontends.includes("angular")) {
    options.framework = "angular";
  } else if (frontends.includes("react")) {
    options.framework = "react";
  } else if (frontends.includes("vue")) {
    options.framework = "vue";
  }

  // Map backend
  if (stackState.backend === "hono") {
    options.backend = "hono";
  } else if (stackState.backend === "bun") {
    options.backend = "hono"; // Hono works great with Bun
  } else if (stackState.backend === "express") {
    options.backend = "express";
  } else if (stackState.backend === "fastify") {
    options.backend = "fastify";
  } else if (stackState.backend === "nestjs") {
    options.backend = "nest";
  }

  // Map database
  if (stackState.database === "postgres") {
    options.database = "postgresql";
  } else if (stackState.database === "mysql") {
    options.database = "mysql";
  } else if (stackState.database === "mongodb") {
    options.database = "mongodb";
  } else if (stackState.database === "redis") {
    options.database = "redis";
  }

  // Map auth
  if (stackState.auth === "clerk") {
    options.auth = "clerk";
  } else if (stackState.auth === "auth0") {
    options.auth = "auth0";
  } else if (stackState.auth === "better-auth") {
    options.auth = "better-auth";
  }

  // Determine preset based on combination
  if (stackState.auth && stackState.database && stackState.backend) {
    // Full stack app - suggest a preset
    if (stackState.auth === "clerk" || stackState.auth === "better-auth") {
      options.preset = "saas-starter";
    }
  }

  return options;
};

/**
 * Generate CLI v2 command from options
 */
export const generateCLIv2Command = (
  projectName: string,
  options: CLIv2Options
): string => {
  const parts: string[] = [];

  // Base command based on package manager
  switch (options.packageManager) {
    case "npm":
      parts.push("npx xaheen@latest create");
      break;
    case "pnpm":
      parts.push("pnpm dlx xaheen@latest create");
      break;
    case "yarn":
      parts.push("yarn dlx xaheen@latest create");
      break;
    default:
      parts.push("bunx xaheen@latest create");
      break;
  }

  // Add project name
  parts.push(projectName);

  // Add preset if specified
  if (options.preset) {
    parts.push(`--preset ${options.preset}`);
  } else {
    // Add individual options if no preset
    if (options.framework) {
      parts.push(`--framework ${options.framework}`);
    }
    if (options.backend) {
      parts.push(`--backend ${options.backend}`);
    }
    if (options.database) {
      parts.push(`--database ${options.database}`);
    }
  }

  // Add auth if specified and no preset
  if (options.auth && !options.preset) {
    parts.push(`--bundles auth:${options.auth}`);
  }

  // Add payments if specified
  if (options.payments) {
    parts.push(`--bundles payments:${options.payments}`);
  }

  // Add additional services
  if (options.services && options.services.length > 0) {
    parts.push(`--bundles ${options.services.join(" ")}`);
  }

  // Add flags
  if (!options.git) {
    parts.push("--no-git");
  }
  if (!options.install) {
    parts.push("--no-install");
  }
  if (options.dryRun) {
    parts.push("--dry-run");
  }

  return parts.join(" ");
};

/**
 * Generate command from stack state (compatibility layer)
 */
export const generateCommandFromStack = (stackState: StackState): string => {
  const projectName = stackState.projectName || "my-xaheen-app";
  const options = mapStackToServices(stackState);
  return generateCLIv2Command(projectName, options);
};

/**
 * Suggest a preset based on stack selection
 */
export const suggestPreset = (stackState: StackState): string | null => {
  const hasAuth = stackState.auth !== "false";
  const hasDatabase = stackState.database !== "none";
  const hasBackend = stackState.backend !== "none";
  
  // SaaS starter conditions
  if (hasAuth && hasDatabase && hasBackend) {
    if (stackState.auth === "clerk" || stackState.auth === "better-auth") {
      return "saas-starter";
    }
  }

  // Enterprise app conditions
  if (stackState.backend === "nestjs" || stackState.backend === "dotnet") {
    return "enterprise-app";
  }

  // Mobile app conditions
  if (stackState.nativeFrontend.includes("react-native") || 
      stackState.nativeFrontend.includes("expo")) {
    return "mobile-app";
  }

  // API only
  if (hasBackend && !stackState.webFrontend.length && !stackState.nativeFrontend.length) {
    return "rest-api";
  }

  // Landing page
  if (stackState.webFrontend.length && !hasBackend && !hasDatabase) {
    return "marketing-site";
  }

  return null;
};