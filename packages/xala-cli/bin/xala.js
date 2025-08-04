#!/usr/bin/env node

import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Import and run the CLI
const { run } = await import(join(__dirname, "../dist/index.js"));
await run();
