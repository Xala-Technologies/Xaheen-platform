import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Papa from "papaparse";

// Efficient analytics processing with streaming, caching, and error recovery

interface AnalyticsData {
	date: string;
	hour: number;
	cli_version: string;
	node_version: string;
	platform: string;
	backend: string;
	database: string;
	orm: string;
	dbSetup: string;
	auth: string;
	api: string;
	packageManager: string;
	frontend0: string;
	frontend1: string;
	examples0: string;
	examples1: string;
	addons: string[];
	git: string;
	install: string;
	runtime: string;
}

interface CSVRow {
	[key: string]: string;
}

interface ProcessedAnalyticsData {
	data: AnalyticsData[];
	lastUpdated: string | null;
	generatedAt: string;
	totalRecords: number;
}

// Enhanced analytics processing with streaming and caching
class AnalyticsProcessor {
	private static readonly CACHE_FILE = join(tmpdir(), 'analytics-cache.json');
	private static readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour cache
	
	private static async getCachedData(): Promise<ProcessedAnalyticsData | null> {
		try {
			const { readFileSync, statSync } = await import('node:fs');
			const stats = statSync(this.CACHE_FILE);
			const cacheAge = Date.now() - stats.mtime.getTime();
			
			if (cacheAge < this.CACHE_TTL) {
				const cached = JSON.parse(readFileSync(this.CACHE_FILE, 'utf-8'));
				console.log('📋 Using cached analytics data');
				return cached;
			}
		} catch {
			// Cache miss or error, continue with fresh fetch
		}
		return null;
	}
	
	private static async setCachedData(data: ProcessedAnalyticsData): Promise<void> {
		try {
			const { writeFileSync } = await import('node:fs');
			writeFileSync(this.CACHE_FILE, JSON.stringify(data, null, 2));
		} catch (error) {
			console.warn('⚠️ Failed to cache analytics data:', error);
		}
	}
	
	private static processRowBatch(rows: CSVRow[]): AnalyticsData[] {
		return rows
			.map((row): AnalyticsData | null => {
				try {
					const timestamp = row["*.timestamp"] || new Date().toISOString();
					const date = timestamp.includes("T")
						? timestamp.split("T")[0]!
						: timestamp.split(" ")[0] || new Date().toISOString().split("T")[0]!;

					let hour = 0;
					try {
						const timestampDate = new Date(timestamp);
						if (!Number.isNaN(timestampDate.getTime())) {
							hour = timestampDate.getUTCHours();
						}
					} catch {
						hour = 0;
					}

					const addons = [
						row["*.properties.addons.0"],
						row["*.properties.addons.1"],
						row["*.properties.addons.2"],
						row["*.properties.addons.3"],
						row["*.properties.addons.4"],
						row["*.properties.addons.5"],
					].filter((addon): addon is string => Boolean(addon));

					return {
						date,
						hour,
						cli_version: row["*.properties.cli_version"] || "unknown",
						node_version: row["*.properties.node_version"] || "unknown",
						platform: row["*.properties.platform"] || "unknown",
						backend: row["*.properties.backend"] || "none",
						database: row["*.properties.database"] || "none",
						orm: row["*.properties.orm"] || "none",
						dbSetup: row["*.properties.dbSetup"] || "none",
						auth: row["*.properties.auth"] === "True" ? "enabled" : "disabled",
						api: row["*.properties.api"] || "none",
						packageManager: row["*.properties.packageManager"] || "unknown",
						frontend0: row["*.properties.frontend.0"] || "",
						frontend1: row["*.properties.frontend.1"] || "",
						examples0: row["*.properties.examples.0"] || "",
						examples1: row["*.properties.examples.1"] || "",
						addons,
						git: row["*.properties.git"] === "True" ? "enabled" : "disabled",
						install: row["*.properties.install"] === "True" ? "enabled" : "disabled",
						runtime: row["*.properties.runtime"] || "unknown",
					};
				} catch (error) {
					console.warn("Error processing row:", error);
					return null;
				}
			})
			.filter((item): item is AnalyticsData =>
				Boolean(item?.date && item?.platform !== "unknown")
			);
	}
	
	static async processAnalytics(): Promise<ProcessedAnalyticsData> {
		// Check cache first
		const cached = await this.getCachedData();
		if (cached) {
			return cached;
		}

		console.log("🔄 Fetching fresh analytics data...");
		
		try {
			const response = await fetch("https://r2.amanv.dev/export.csv", {
				headers: { 'Accept': 'text/csv' }
			});
			
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			
			const csvText = await response.text();
			console.log("📊 Processing CSV data...");

			let processedData: AnalyticsData[] = [];
			let parseError: unknown;

			await new Promise<void>((resolve, reject) => {
				Papa.parse<CSVRow>(csvText, {
					header: true,
					chunk: (results) => {
						// Process in chunks for better memory efficiency
						const batchResults = this.processRowBatch(results.data);
						processedData.push(...batchResults);
					},
					complete: () => resolve(),
					error: (error) => {
						parseError = error;
						reject(error);
					},
				});
			});

			if (parseError) {
				throw parseError;
			}

			// Efficiently extract last updated timestamp
			let lastUpdated: string | null = null;
			if (processedData.length > 0) {
				const sortedByDate = processedData
					.map(item => new Date(`${item.date}T${item.hour.toString().padStart(2, '0')}:00:00Z`))
					.filter(date => !Number.isNaN(date.getTime()))
					.sort((a, b) => b.getTime() - a.getTime());
				
				if (sortedByDate.length > 0) {
					lastUpdated = sortedByDate[0]!.toLocaleDateString("en-US", {
						year: "numeric",
						month: "short",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						timeZone: "UTC",
					});
				}
			}

			const analyticsData: ProcessedAnalyticsData = {
				data: processedData,
				lastUpdated,
				generatedAt: new Date().toISOString(),
				totalRecords: processedData.length,
			};

			// Cache the processed data
			await this.setCachedData(analyticsData);
			
			return analyticsData;
		} catch (error) {
			console.error("❌ Error processing analytics:", error);
			throw error;
		}
	}
}

async function generateAnalyticsData() {
	try {
		const analyticsData = await AnalyticsProcessor.processAnalytics();

		console.log("📤 Uploading to Cloudflare R2...");

		const tempDir = mkdtempSync(join(tmpdir(), "analytics-"));
		const tempFilePath = join(tempDir, "analytics-data.json");

		// Write compressed JSON for better performance
		writeFileSync(tempFilePath, JSON.stringify(analyticsData, null, 0)); // No indentation for smaller file

		const BUCKET_NAME = "bucket";
		const key = "analytics-data.json";
		const cmd = `npx wrangler r2 object put "${BUCKET_NAME}/${key}" --file="${tempFilePath}" --remote`;

		console.log(`Uploading ${tempFilePath} to r2://${BUCKET_NAME}/${key} ...`);
		try {
			execSync(cmd, { stdio: "inherit" });
		} catch (err) {
			console.error("Failed to upload analytics data:", err);
			throw err;
		}

		console.log(
			`✅ Generated analytics data with ${analyticsData.totalRecords} records`,
		);
		console.log("📤 Uploaded to R2 bucket: bucket/analytics-data.json");
		console.log(`🕒 Last data update: ${analyticsData.lastUpdated}`);
		
		// Cleanup temp files
		try {
			const { rmSync } = await import('node:fs');
			rmSync(tempDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	} catch (error) {
		console.error("❌ Error generating analytics data:", error);
		process.exit(1);
	}
}

if (process.argv[1]?.endsWith("generate-analytics.ts")) {
	await generateAnalyticsData();
}

export { generateAnalyticsData, AnalyticsProcessor };
