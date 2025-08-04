#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find all TypeScript files in src directory
const files = glob.sync("src/**/*.ts", { cwd: __dirname });

console.log(`Found ${files.length} TypeScript files to fix...`);

for (const file of files) {
	const filePath = join(__dirname, file);
	let content = readFileSync(filePath, "utf8");

	// First, revert any .json.js back to .json
	content = content.replace(/\.json\.js/g, ".json");

	// Fix relative imports that don't end with .js (but exclude .json files)
	content = content.replace(
		/from\s+['"](\.\/.+?)(?<!\.json)(?<!\.js)['"];/g,
		"from '$1.js';",
	);

	// Fix relative imports in import statements (but exclude .json files)
	content = content.replace(
		/import\s+(.+?)\s+from\s+['"](\.\/.+?)(?<!\.json)(?<!\.js)['"];/g,
		"import $1 from '$2.js';",
	);

	writeFileSync(filePath, content);
	console.log(`Fixed imports in ${file}`);
}

console.log("All imports fixed correctly!");
