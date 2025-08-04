/**
 * @fileoverview Comprehensive Tests for ReportingEngine
 * @description Tests for report generation, health metrics, and analytics
 * @version 1.0.0
 */

import { ReportingEngine } from "../../engines/ReportingEngine.js";
import { sampleReportingContext } from "../fixtures/sample-specs.js";
import {
	createMockFileSystem,
	createMockProject,
	mockAnalysisResults,
} from "../utils/test-helpers.js";

// Mock fs module
jest.mock("fs", () => ({
	writeFileSync: jest.fn(),
	existsSync: jest.fn(),
	mkdirSync: jest.fn(),
}));

describe("ReportingEngine", () => {
	let engine: ReportingEngine;
	let mockProject: ReturnType<typeof createMockProject>;
	let reportingContext: typeof sampleReportingContext;

	beforeEach(() => {
		jest.clearAllMocks();
		mockProject = createMockProject("test-reporting-project");
		reportingContext = {
			...sampleReportingContext,
			projectPath: mockProject.root,
		};
		engine = new ReportingEngine(reportingContext);
	});

	afterEach(() => {
		mockProject.cleanup();
	});

	describe("Constructor", () => {
		it("should initialize with reporting context", () => {
			expect(engine).toBeInstanceOf(ReportingEngine);
		});

		it("should load report templates", () => {
			const templates = (engine as any).templates;
			expect(templates).toBeInstanceOf(Map);
		});
	});

	describe("generateHealthReport", () => {
		it("should generate comprehensive health report", async () => {
			const analysisResult = {
				projectStructure: {
					name: "TestProject",
					version: "1.0.0",
					framework: "React",
				},
				components: [
					{
						name: "Button",
						type: "component",
						complexity: "low",
						dependencies: ["react"],
					},
					{
						name: "DataTable",
						type: "component",
						complexity: "high",
						dependencies: ["react", "lodash"],
					},
				],
				dependencies: [{ isDev: false }, { isDev: true }, { isDev: false }],
			};

			const mockFs = createMockFileSystem();
			require("fs").writeFileSync.mockImplementation(mockFs.writeFileSync);
			require("fs").existsSync.mockImplementation(() => true);
			require("fs").mkdirSync.mockImplementation(mockFs.mkdirSync);

			const report = await engine.generateHealthReport(analysisResult);

			expect(report).toContain("Health Report");
			expect(report).toContain("TestProject");
			expect(report).toContain("Component Analysis");
			expect(report).toContain("Dependency Analysis");
			expect(report).toContain("Security Assessment");
			expect(report).toContain("Performance Metrics");
			expect(report).toContain("Accessibility Score");

			// Should include component information
			expect(report).toContain("Button");
			expect(report).toContain("DataTable");
			expect(report).toContain("2 components analyzed");

			// Should include dependency statistics
			expect(report).toContain("Total Dependencies: 3");
			expect(report).toContain("Production Dependencies: 2");
			expect(report).toContain("Development Dependencies: 1");
		});

		it("should handle HTML output format", async () => {
			const htmlContext = {
				...reportingContext,
				outputFormat: "html" as const,
			};
			const htmlEngine = new ReportingEngine(htmlContext);

			const analysisResult = {
				projectStructure: {
					name: "Test",
					version: "1.0.0",
					framework: "React",
				},
				components: [],
				dependencies: [],
			};

			const report = await htmlEngine.generateHealthReport(analysisResult);

			expect(report).toContain("<!DOCTYPE html>");
			expect(report).toContain("<html");
			expect(report).toContain("<head>");
			expect(report).toContain("<body>");
			expect(report).toContain("</html>");
			expect(report).toContain('<div class="health-report">');
		});

		it("should handle markdown output format", async () => {
			const markdownContext = {
				...reportingContext,
				outputFormat: "markdown" as const,
			};
			const markdownEngine = new ReportingEngine(markdownContext);

			const analysisResult = {
				projectStructure: {
					name: "Test",
					version: "1.0.0",
					framework: "React",
				},
				components: [],
				dependencies: [],
			};

			const report = await markdownEngine.generateHealthReport(analysisResult);

			expect(report).toContain("# Health Report");
			expect(report).toContain("## Component Analysis");
			expect(report).toContain("## Dependency Analysis");
			expect(report).toContain("### Security Assessment");
			expect(report).toContain("- Total Components:");
			expect(report).toContain("- Framework:");
		});

		it("should handle JSON output format", async () => {
			const jsonContext = {
				...reportingContext,
				outputFormat: "json" as const,
			};
			const jsonEngine = new ReportingEngine(jsonContext);

			const analysisResult = {
				projectStructure: {
					name: "Test",
					version: "1.0.0",
					framework: "React",
				},
				components: [
					{
						name: "Button",
						type: "component",
						complexity: "low",
						dependencies: [],
					},
				],
				dependencies: [{ isDev: false }],
			};

			const report = await jsonEngine.generateHealthReport(analysisResult);
			const parsedReport = JSON.parse(report);

			expect(parsedReport).toHaveProperty("title", "Health Report");
			expect(parsedReport).toHaveProperty("project");
			expect(parsedReport).toHaveProperty("summary");
			expect(parsedReport).toHaveProperty("components");
			expect(parsedReport).toHaveProperty("dependencies");
			expect(parsedReport).toHaveProperty("security");
			expect(parsedReport).toHaveProperty("performance");
			expect(parsedReport).toHaveProperty("accessibility");

			expect(parsedReport.project.name).toBe("Test");
			expect(parsedReport.components.total).toBe(1);
			expect(parsedReport.dependencies.total).toBe(1);
		});

		it("should include charts when requested", async () => {
			const chartContext = {
				...reportingContext,
				includeCharts: true,
			};
			const chartEngine = new ReportingEngine(chartContext);

			const analysisResult = {
				projectStructure: {
					name: "Test",
					version: "1.0.0",
					framework: "React",
				},
				components: [
					{
						name: "Button",
						type: "component",
						complexity: "low",
						dependencies: [],
					},
					{
						name: "Modal",
						type: "component",
						complexity: "high",
						dependencies: [],
					},
				],
				dependencies: [],
			};

			const report = await chartEngine.generateHealthReport(analysisResult);

			expect(report).toContain("chart");
			expect(report).toContain("complexity-distribution");
			expect(report).toContain("component-types");
		});

		it("should include custom branding", async () => {
			const brandedContext = {
				...reportingContext,
				customBranding: {
					logo: "/assets/company-logo.png",
					colors: {
						primary: "#007acc",
						secondary: "#f0f0f0",
					},
					companyName: "Acme Corp",
					reportTitle: "Acme Code Quality Report",
				},
			};
			const brandedEngine = new ReportingEngine(brandedContext);

			const analysisResult = {
				projectStructure: {
					name: "Test",
					version: "1.0.0",
					framework: "React",
				},
				components: [],
				dependencies: [],
			};

			const report = await brandedEngine.generateHealthReport(analysisResult);

			expect(report).toContain("Acme Corp");
			expect(report).toContain("Acme Code Quality Report");
			expect(report).toContain("/assets/company-logo.png");
			expect(report).toContain("#007acc");
		});
	});

	describe("generateMigrationReport", () => {
		it("should generate detailed migration report", async () => {
			const migrationResult = {
				success: true,
				completedPhases: ["analysis", "component-migration", "testing"],
				failedPhases: [],
				modifiedFiles: [
					"/src/components/Button.tsx",
					"/src/components/Input.tsx",
					"/src/components/Modal.tsx",
				],
				backupLocation: "/backup/migration-20231201",
				rollbackInstructions: [
					"To rollback: cp -r /backup/migration-20231201/* ./",
					"Run: npm install",
					"Run: npm test",
				],
				warnings: [
					"Some TypeScript types may need manual adjustment",
					"Check component imports after migration",
				],
				errors: [],
			};

			const phases = [
				{
					id: "analysis",
					name: "Project Analysis",
					description: "Analyze project structure and dependencies",
					priority: 1,
					dependencies: [],
					estimatedTime: "5 minutes",
					riskLevel: "low" as const,
					components: ["*"],
					transformations: [],
				},
				{
					id: "component-migration",
					name: "Component Migration",
					description: "Migrate React components to Vue",
					priority: 2,
					dependencies: ["analysis"],
					estimatedTime: "30 minutes",
					riskLevel: "medium" as const,
					components: ["Button", "Input", "Modal"],
					transformations: [
						{
							id: "react-to-vue",
							type: "replace" as const,
							source: "React.FC",
							target: "defineComponent",
						},
					],
				},
			];

			const report = await engine.generateMigrationReport(
				migrationResult,
				phases,
			);

			expect(report).toContain("Migration Report");
			expect(report).toContain("Migration Status: Success");
			expect(report).toContain("Completed Phases: 3");
			expect(report).toContain("Failed Phases: 0");
			expect(report).toContain("Modified Files: 3");

			// Should include phase details
			expect(report).toContain("Project Analysis");
			expect(report).toContain("Component Migration");
			expect(report).toContain("Risk Level: low");
			expect(report).toContain("Risk Level: medium");

			// Should include file details
			expect(report).toContain("Button.tsx");
			expect(report).toContain("Input.tsx");
			expect(report).toContain("Modal.tsx");

			// Should include warnings
			expect(report).toContain("TypeScript types may need manual adjustment");
			expect(report).toContain("Check component imports");

			// Should include rollback instructions
			expect(report).toContain("Rollback Instructions");
			expect(report).toContain("/backup/migration-20231201");
			expect(report).toContain("npm install");
		});

		it("should handle failed migration report", async () => {
			const failedMigrationResult = {
				success: false,
				completedPhases: ["analysis"],
				failedPhases: ["component-migration", "testing"],
				modifiedFiles: [],
				backupLocation: "/backup/migration-20231201",
				rollbackInstructions: ["Rollback recommended due to failures"],
				warnings: [],
				errors: [
					"Failed to parse component: ComplexComponent.tsx",
					"Transformation validation failed for Modal.tsx",
					"TypeScript compilation errors after migration",
				],
			};

			const phases = [
				{
					id: "analysis",
					name: "Project Analysis",
					description: "Analyze project structure",
					priority: 1,
					dependencies: [],
					estimatedTime: "5 minutes",
					riskLevel: "low" as const,
					components: [],
					transformations: [],
				},
			];

			const report = await engine.generateMigrationReport(
				failedMigrationResult,
				phases,
			);

			expect(report).toContain("Migration Status: Failed");
			expect(report).toContain("Completed Phases: 1");
			expect(report).toContain("Failed Phases: 2");
			expect(report).toContain("Errors Encountered: 3");

			// Should include error details
			expect(report).toContain(
				"Failed to parse component: ComplexComponent.tsx",
			);
			expect(report).toContain("Transformation validation failed");
			expect(report).toContain("TypeScript compilation errors");

			// Should recommend rollback
			expect(report).toContain("Rollback recommended");
		});

		it("should include migration timeline", async () => {
			const migrationResult = {
				success: true,
				completedPhases: ["phase1", "phase2"],
				failedPhases: [],
				modifiedFiles: [],
				rollbackInstructions: [],
				warnings: [],
				errors: [],
				timeline: [
					{
						phase: "phase1",
						startTime: "2023-12-01T10:00:00Z",
						endTime: "2023-12-01T10:05:00Z",
					},
					{
						phase: "phase2",
						startTime: "2023-12-01T10:05:00Z",
						endTime: "2023-12-01T10:35:00Z",
					},
				],
			};

			const phases = [
				{
					id: "phase1",
					name: "Phase 1",
					description: "First phase",
					priority: 1,
					dependencies: [],
					estimatedTime: "5 minutes",
					riskLevel: "low" as const,
					components: [],
					transformations: [],
				},
			];

			const report = await engine.generateMigrationReport(
				migrationResult,
				phases,
			);

			expect(report).toContain("Migration Timeline");
			expect(report).toContain("phase1: 5 minutes");
			expect(report).toContain("phase2: 30 minutes");
			expect(report).toContain("Total Duration: 35 minutes");
		});
	});

	describe("generateArchitectureReport", () => {
		it("should generate architecture analysis report", async () => {
			const analysisResult = {
				projectStructure: {
					name: "ArchitectureTest",
					version: "2.0.0",
					framework: "Next.js",
				},
				components: [
					{
						name: "Button",
						type: "component",
						complexity: "low",
						dependencies: ["react", "styled-components"],
					},
					{
						name: "UserDashboard",
						type: "page",
						complexity: "high",
						dependencies: ["react", "react-query", "recharts", "formik"],
					},
					{
						name: "useAuth",
						type: "hook",
						complexity: "medium",
						dependencies: ["react", "jwt-decode"],
					},
				],
				dependencies: [
					{ isDev: false, name: "react" },
					{ isDev: false, name: "next" },
					{ isDev: true, name: "typescript" },
				],
			};

			const report = await engine.generateArchitectureReport(analysisResult);

			expect(report).toContain("Architecture Report");
			expect(report).toContain("ArchitectureTest");
			expect(report).toContain("Next.js");

			// Should analyze component architecture
			expect(report).toContain("Component Architecture");
			expect(report).toContain("3 components analyzed");
			expect(report).toContain("Component Types:");
			expect(report).toContain("- Components: 1");
			expect(report).toContain("- Pages: 1");
			expect(report).toContain("- Hooks: 1");

			// Should analyze complexity distribution
			expect(report).toContain("Complexity Distribution");
			expect(report).toContain("- Low: 1");
			expect(report).toContain("- Medium: 1");
			expect(report).toContain("- High: 1");

			// Should include dependency analysis
			expect(report).toContain("Dependency Graph");
			expect(report).toContain("react");
			expect(report).toContain("styled-components");
			expect(report).toContain("react-query");

			// Should include architectural patterns
			expect(report).toContain("Architectural Patterns");
			expect(report).toContain("Hooks Pattern");
			expect(report).toContain("Page-based Routing");
		});

		it("should identify architectural smells", async () => {
			const analysisResult = {
				projectStructure: {
					name: "SmellTest",
					version: "1.0.0",
					framework: "React",
				},
				components: [
					{
						name: "GodComponent",
						type: "component",
						complexity: "high",
						dependencies: [
							"react",
							"lodash",
							"moment",
							"axios",
							"formik",
							"recharts",
						],
					},
					{
						name: "TightlyCoupled1",
						type: "component",
						complexity: "medium",
						dependencies: ["./TightlyCoupled2", "./TightlyCoupled3"],
					},
					{
						name: "TightlyCoupled2",
						type: "component",
						complexity: "medium",
						dependencies: ["./TightlyCoupled1", "./TightlyCoupled3"],
					},
				],
				dependencies: [],
			};

			const report = await engine.generateArchitectureReport(analysisResult);

			expect(report).toContain("Architectural Issues");
			expect(report).toContain("God Components");
			expect(report).toContain("GodComponent");
			expect(report).toContain("6 dependencies"); // High dependency count
			expect(report).toContain("Tight Coupling");
			expect(report).toContain("Circular Dependencies");
		});

		it("should provide architectural recommendations", async () => {
			const analysisResult = {
				projectStructure: {
					name: "RecommendationTest",
					version: "1.0.0",
					framework: "React",
				},
				components: [
					{
						name: "LargeComponent",
						type: "component",
						complexity: "high",
						dependencies: ["react", "many", "too", "many", "deps"],
					},
				],
				dependencies: [],
			};

			const report = await engine.generateArchitectureReport(analysisResult);

			expect(report).toContain("Recommendations");
			expect(report).toContain("Break down large components");
			expect(report).toContain("Reduce component dependencies");
			expect(report).toContain("Implement dependency injection");
			expect(report).toContain("Consider architectural patterns");
		});
	});

	describe("generateExecutiveSummary", () => {
		it("should generate executive summary", async () => {
			const analysisResult = {
				projectStructure: {
					name: "ExecutiveTest",
					version: "1.0.0",
					framework: "React",
				},
				components: [
					{
						name: "Button",
						type: "component",
						complexity: "low",
						dependencies: [],
					},
					{
						name: "DataGrid",
						type: "component",
						complexity: "high",
						dependencies: [],
					},
				],
				dependencies: [{ isDev: false }, { isDev: false }, { isDev: true }],
			};

			const summary = await engine.generateExecutiveSummary(analysisResult);

			expect(summary).toContain("Executive Summary");
			expect(summary).toContain("ExecutiveTest");
			expect(summary).toContain("Project Overview");
			expect(summary).toContain("Key Metrics");
			expect(summary).toContain("Health Score");
			expect(summary).toContain("Risk Assessment");
			expect(summary).toContain("Recommendations");

			// Should include high-level metrics
			expect(summary).toContain("Total Components: 2");
			expect(summary).toContain("Framework: React");
			expect(summary).toContain("Dependencies: 3");

			// Should include risk factors
			expect(summary).toContain("High Complexity Components: 1");
			expect(summary).toContain("Security Vulnerabilities: 0");
			expect(summary).toContain("Technical Debt: Low");

			// Should be concise and executive-friendly
			expect(summary.length).toBeLessThan(2000); // Executive summaries should be brief
		});

		it("should calculate overall health score", async () => {
			const healthyProjectResult = {
				projectStructure: {
					name: "Healthy",
					version: "1.0.0",
					framework: "React",
				},
				components: [
					{
						name: "Button",
						type: "component",
						complexity: "low",
						dependencies: ["react"],
					},
					{
						name: "Input",
						type: "component",
						complexity: "low",
						dependencies: ["react"],
					},
				],
				dependencies: [{ isDev: false }],
				quality: {
					overall: 95,
					security: 98,
					performance: 92,
					maintainability: 94,
				},
			};

			const summary =
				await engine.generateExecutiveSummary(healthyProjectResult);

			expect(summary).toContain("Health Score: Excellent");
			expect(summary).toContain("95/100");
			expect(summary).toContain("Security: 98/100");
			expect(summary).toContain("Performance: 92/100");
		});
	});

	describe("exportReport", () => {
		it("should export report to file system", async () => {
			const mockFs = createMockFileSystem();
			require("fs").writeFileSync.mockImplementation(mockFs.writeFileSync);
			require("fs").existsSync.mockImplementation(() => true);
			require("fs").mkdirSync.mockImplementation(mockFs.mkdirSync);

			const reportContent = "<html><body>Test Report</body></html>";
			const fileName = "health-report.html";

			await engine.exportReport(reportContent, fileName);

			expect(require("fs").writeFileSync).toHaveBeenCalledWith(
				`${mockProject.root}/${fileName}`,
				reportContent,
				"utf-8",
			);
		});

		it("should create output directory if it does not exist", async () => {
			const mockFs = createMockFileSystem();
			require("fs").writeFileSync.mockImplementation(mockFs.writeFileSync);
			require("fs").existsSync.mockImplementation(() => false);
			require("fs").mkdirSync.mockImplementation(mockFs.mkdirSync);

			const reportContent = "Test Report";
			const fileName = "reports/health-report.html";

			await engine.exportReport(reportContent, fileName);

			expect(require("fs").mkdirSync).toHaveBeenCalledWith(
				`${mockProject.root}/reports`,
				{ recursive: true },
			);
		});

		it("should handle different file formats", async () => {
			const mockFs = createMockFileSystem();
			require("fs").writeFileSync.mockImplementation(mockFs.writeFileSync);

			// Test PDF export (placeholder)
			await engine.exportReport("PDF content", "report.pdf");
			expect(require("fs").writeFileSync).toHaveBeenCalledWith(
				`${mockProject.root}/report.pdf`,
				"PDF content",
				"utf-8",
			);

			// Test JSON export
			const jsonReport = JSON.stringify({ title: "Test Report" });
			await engine.exportReport(jsonReport, "report.json");
			expect(require("fs").writeFileSync).toHaveBeenCalledWith(
				`${mockProject.root}/report.json`,
				jsonReport,
				"utf-8",
			);
		});
	});

	describe("Template Processing", () => {
		it("should process report templates correctly", () => {
			const template = `
        # {{title}}
        
        Project: {{project.name}}
        Framework: {{project.framework}}
        
        ## Components ({{components.length}})
        {{#each components}}
        - {{name}} ({{type}}, complexity: {{complexity}})
        {{/each}}
        
        ## Summary
        Total components: {{components.length}}
        Average complexity: {{averageComplexity}}
      `;

			const data = {
				title: "Test Report",
				project: {
					name: "MyApp",
					framework: "React",
				},
				components: [
					{ name: "Button", type: "component", complexity: "low" },
					{ name: "Modal", type: "component", complexity: "high" },
				],
				averageComplexity: "medium",
			};

			const processed = (engine as any).processTemplate(template, data);

			expect(processed).toContain("# Test Report");
			expect(processed).toContain("Project: MyApp");
			expect(processed).toContain("Framework: React");
			expect(processed).toContain("## Components (2)");
			expect(processed).toContain("- Button (component, complexity: low)");
			expect(processed).toContain("- Modal (component, complexity: high)");
			expect(processed).toContain("Total components: 2");
			expect(processed).toContain("Average complexity: medium");
		});

		it("should handle missing template data gracefully", () => {
			const template =
				"Project: {{project.name}} - Version: {{project.version}}";
			const data = { project: { name: "MyApp" } }; // Missing version

			const processed = (engine as any).processTemplate(template, data);

			expect(processed).toContain("Project: MyApp");
			expect(processed).toContain("{{project.version}}"); // Unprocessed
		});
	});

	describe("Chart Generation", () => {
		it("should generate component complexity chart data", () => {
			const components = [
				{ name: "Button", complexity: "low" },
				{ name: "Modal", complexity: "high" },
				{ name: "Form", complexity: "medium" },
				{ name: "Table", complexity: "high" },
			];

			const chartData = (engine as any).generateComplexityChart(components);

			expect(chartData).toEqual({
				labels: ["Low", "Medium", "High"],
				data: [1, 1, 2],
				colors: ["#28a745", "#ffc107", "#dc3545"],
			});
		});

		it("should generate dependency chart data", () => {
			const dependencies = [
				{ isDev: false, name: "react" },
				{ isDev: false, name: "lodash" },
				{ isDev: true, name: "jest" },
				{ isDev: true, name: "typescript" },
			];

			const chartData = (engine as any).generateDependencyChart(dependencies);

			expect(chartData).toEqual({
				labels: ["Production", "Development"],
				data: [2, 2],
				colors: ["#007bff", "#6c757d"],
			});
		});
	});

	describe("Error Handling", () => {
		it("should handle template processing errors", async () => {
			// Mock template processing to throw error
			const originalProcessTemplate = (engine as any).processTemplate;
			(engine as any).processTemplate = jest.fn(() => {
				throw new Error("Template processing failed");
			});

			const analysisResult = {
				projectStructure: {
					name: "Test",
					version: "1.0.0",
					framework: "React",
				},
				components: [],
				dependencies: [],
			};

			const report = await engine.generateHealthReport(analysisResult);

			expect(report).toContain("Error generating report");
			expect(report).toContain("Template processing failed");

			// Restore original method
			(engine as any).processTemplate = originalProcessTemplate;
		});

		it("should handle file export errors", async () => {
			require("fs").writeFileSync.mockImplementation(() => {
				throw new Error("Write permission denied");
			});

			const reportContent = "Test Report";

			await expect(
				engine.exportReport(reportContent, "report.html"),
			).rejects.toThrow("Write permission denied");
		});

		it("should handle malformed analysis data", async () => {
			const malformedResult = {
				// Missing required fields
				components: null,
				dependencies: undefined,
			};

			const report = await engine.generateHealthReport(malformedResult as any);

			expect(report).toContain("Error");
			expect(report).toContain("Invalid analysis data");
		});
	});

	describe("Performance", () => {
		it("should handle large datasets efficiently", async () => {
			const largeAnalysisResult = {
				projectStructure: {
					name: "LargeProject",
					version: "1.0.0",
					framework: "React",
				},
				components: Array.from({ length: 1000 }, (_, i) => ({
					name: `Component${i}`,
					type: "component",
					complexity: i % 3 === 0 ? "high" : i % 2 === 0 ? "medium" : "low",
					dependencies: [`dep${i}`, `dep${i + 1}`],
				})),
				dependencies: Array.from({ length: 500 }, (_, i) => ({
					isDev: i % 2 === 0,
					name: `dep${i}`,
				})),
			};

			const startTime = Date.now();
			const report = await engine.generateHealthReport(largeAnalysisResult);
			const endTime = Date.now();

			expect(report).toContain("1000 components analyzed");
			expect(report).toContain("Total Dependencies: 500");
			expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
		});

		it("should optimize report size for large projects", async () => {
			const largeResult = {
				projectStructure: {
					name: "Large",
					version: "1.0.0",
					framework: "React",
				},
				components: Array.from({ length: 100 }, (_, i) => ({
					name: `Component${i}`,
					type: "component",
					complexity: "medium",
					dependencies: [],
				})),
				dependencies: [],
			};

			const report = await engine.generateHealthReport(largeResult);

			// Should summarize rather than list all components
			expect(report).toContain("100 components");
			expect(report).not.toContain("Component99"); // Should not list every component
			expect(report.length).toBeLessThan(10000); // Reasonable report size
		});
	});

	describe("Integration", () => {
		it("should integrate with different output formats", async () => {
			const analysisResult = {
				projectStructure: {
					name: "Integration",
					version: "1.0.0",
					framework: "Vue",
				},
				components: [
					{
						name: "Button",
						type: "component",
						complexity: "low",
						dependencies: [],
					},
				],
				dependencies: [],
			};

			// Test all supported formats
			const formats = ["html", "markdown", "json"] as const;

			for (const format of formats) {
				const contextWithFormat = { ...reportingContext, outputFormat: format };
				const engineWithFormat = new ReportingEngine(contextWithFormat);

				const report =
					await engineWithFormat.generateHealthReport(analysisResult);

				switch (format) {
					case "html":
						expect(report).toContain("<html");
						break;
					case "markdown":
						expect(report).toContain("# Health Report");
						break;
					case "json":
						expect(() => JSON.parse(report)).not.toThrow();
						break;
				}
			}
		});

		it("should work with real project analysis data", async () => {
			const realProjectResult = mockAnalysisResults();

			const mockFs = createMockFileSystem();
			require("fs").writeFileSync.mockImplementation(mockFs.writeFileSync);
			require("fs").existsSync.mockImplementation(() => true);

			const healthReport = await engine.generateHealthReport(realProjectResult);
			await engine.exportReport(healthReport, "health-report.html");

			expect(healthReport).toContain("Health Report");
			expect(healthReport).toContain("Button"); // From mock data
			expect(healthReport).toContain("react"); // Dependencies
			expect(healthReport).toContain("Next.js"); // Framework

			expect(require("fs").writeFileSync).toHaveBeenCalledWith(
				expect.stringContaining("health-report.html"),
				expect.stringContaining("Health Report"),
				"utf-8",
			);
		});
	});
});
