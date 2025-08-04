/**
 * Observability Dashboard Generator for Prometheus/Grafana Integration
 * Automatically generates comprehensive dashboards and monitoring configurations
 * Part of EPIC 8 Story 8.6: Enhanced Observability & Monitoring
 */

export interface DashboardGeneratorConfig {
	readonly projectName: string;
	readonly framework: "nestjs" | "express" | "fastify" | "hono" | "nextjs" | "react";
	readonly environment: "development" | "staging" | "production";
	readonly services: readonly ServiceConfig[];
	readonly dashboards: readonly DashboardConfig[];
	readonly alerts: readonly AlertConfig[];
	readonly datasources: readonly DatasourceConfig[];
	readonly compliance: ComplianceConfig;
	readonly sli: readonly SLIConfig[];
	readonly slo: readonly SLOConfig[];
	readonly errorBudget: ErrorBudgetConfig;
}

export interface ServiceConfig {
	readonly name: string;
	readonly type: "web" | "api" | "worker" | "database" | "cache" | "queue";
	readonly metrics: readonly MetricConfig[];
	readonly healthCheck: HealthCheckConfig;
	readonly dependencies: readonly string[];
	readonly criticality: "critical" | "high" | "medium" | "low";
}

export interface MetricConfig {
	readonly name: string;
	readonly type: "counter" | "gauge" | "histogram" | "summary";
	readonly description: string;
	readonly labels: readonly string[];
	readonly unit?: string;
	readonly help?: string;
}

export interface HealthCheckConfig {
	readonly enabled: boolean;
	readonly endpoint: string;
	readonly interval: string;
	readonly timeout: string;
	readonly expectedStatus: number;
}

export interface DashboardConfig {
	readonly name: string;
	readonly title: string;
	readonly description: string;
	readonly tags: readonly string[];
	readonly panels: readonly PanelConfig[];
	readonly variables: readonly VariableConfig[];
	readonly refresh: string;
	readonly timeRange: TimeRangeConfig;
	readonly annotations?: readonly AnnotationConfig[];
}

export interface PanelConfig {
	readonly id: number;
	readonly title: string;
	readonly type: "graph" | "stat" | "gauge" | "table" | "heatmap" | "logs" | "traces" | "worldmap" | "piechart" | "bargauge";
	readonly datasource: string;
	readonly targets: readonly QueryConfig[];
	readonly gridPos: GridPosition;
	readonly options?: Record<string, any>;
	readonly fieldConfig?: FieldConfig;
	readonly alert?: AlertRule;
	readonly transformations?: readonly TransformationConfig[];
}

export interface QueryConfig {
	readonly expr: string;
	readonly legendFormat?: string;
	readonly refId: string;
	readonly interval?: string;
	readonly format?: "time_series" | "table" | "heatmap";
	readonly instantQuery?: boolean;
	readonly exemplar?: boolean;
}

export interface VariableConfig {
	readonly name: string;
	readonly type: "query" | "constant" | "datasource" | "interval" | "custom" | "textbox";
	readonly query?: string;
	readonly datasource?: string;
	readonly options?: readonly string[];
	readonly current?: string;
	readonly multi?: boolean;
	readonly includeAll?: boolean;
	readonly allValue?: string;
	readonly refresh?: "never" | "onDashboardLoad" | "onTimeRangeChanged";
}

export interface GridPosition {
	readonly x: number;
	readonly y: number;
	readonly w: number;
	readonly h: number;
}

export interface FieldConfig {
	readonly defaults: {
		readonly unit?: string;
		readonly min?: number;
		readonly max?: number;
		readonly decimals?: number;
		readonly displayName?: string;
		readonly thresholds?: ThresholdConfig;
		readonly mappings?: readonly MappingConfig[];
		readonly custom?: Record<string, any>;
	};
	readonly overrides?: readonly OverrideConfig[];
}

export interface ThresholdConfig {
	readonly mode: "absolute" | "percentage";
	readonly steps: readonly ThresholdStep[];
}

export interface ThresholdStep {
	readonly color: string;
	readonly value: number | null;
}

export interface MappingConfig {
	readonly type: "value" | "range" | "regex" | "special";
	readonly options: Record<string, any>;
}

export interface OverrideConfig {
	readonly matcher: {
		readonly id: string;
		readonly options: string;
	};
	readonly properties: readonly OverrideProperty[];
}

export interface OverrideProperty {
	readonly id: string;
	readonly value: any;
}

export interface TimeRangeConfig {
	readonly from: string;
	readonly to: string;
}

export interface AnnotationConfig {
	readonly name: string;
	readonly datasource: string;
	readonly enable: boolean;
	readonly query: string;
	readonly textFormat?: string;
	readonly tagsFormat?: string;
}

export interface AlertConfig {
	readonly name: string;
	readonly message: string;
	readonly frequency: string;
	readonly conditions: readonly AlertCondition[];
	readonly executionErrorState: "alerting" | "keep_state" | "ok";
	readonly noDataState: "no_data" | "alerting" | "keep_state" | "ok";
	readonly for: string;
	readonly notifications: readonly string[];
}

export interface AlertCondition {
	readonly query: QueryConfig;
	readonly reducer: {
		readonly type: "avg" | "min" | "max" | "sum" | "count" | "last" | "median" | "diff" | "percent_diff" | "count_non_null";
		readonly params?: readonly any[];
	};
	readonly evaluator: {
		readonly params: readonly number[];
		readonly type: "gt" | "lt" | "within_range" | "outside_range" | "no_value";
	};
}

export interface AlertRule {
	readonly name: string;
	readonly message: string;
	readonly frequency: string;
	readonly conditions: readonly AlertCondition[];
	readonly executionErrorState: string;
	readonly noDataState: string;
	readonly for: string;
}

export interface TransformationConfig {
	readonly id: string;
	readonly options: Record<string, any>;
}

export interface DatasourceConfig {
	readonly name: string;
	readonly type: "prometheus" | "loki" | "tempo" | "jaeger" | "elasticsearch" | "influxdb";
	readonly url: string;
	readonly access: "proxy" | "direct";
	readonly basicAuth?: boolean;
	readonly basicAuthUser?: string;
	readonly withCredentials?: boolean;
	readonly isDefault?: boolean;
	readonly jsonData?: Record<string, any>;
	readonly secureJsonData?: Record<string, any>;
}

export interface ComplianceConfig {
	readonly gdprCompliant: boolean;
	readonly norwegianCompliant: boolean;
	readonly dataRetention: string;
	readonly personalDataMasking: boolean;
	readonly auditLogging: boolean;
}

export interface SLIConfig {
	readonly name: string;
	readonly description: string;
	readonly query: string;
	readonly goodEventQuery: string;
	readonly totalEventQuery: string;
	readonly threshold: number;
	readonly unit: string;
}

export interface SLOConfig {
	readonly name: string;
	readonly description: string;
	readonly sli: string;
	readonly target: number;
	readonly timeWindow: string;
	readonly alerting: {
		readonly burnRate: number;
		readonly shortWindow: string;
		readonly longWindow: string;
	};
}

export interface ErrorBudgetConfig {
	readonly enabled: boolean;
	readonly timeWindow: string;
	readonly target: number;
	readonly alertThreshold: number;
}

export class ObservabilityDashboardGenerator {
	/**
	 * Generate complete observability stack with dashboards, alerts, and SLOs
	 */
	public async generateObservabilityStack(
		config: DashboardGeneratorConfig
	): Promise<{
		dashboards: Record<string, string>;
		alerts: string;
		datasources: string;
		prometheusRules: string;
		sloConfig: string;
		grafanaConfig: string;
	}> {
		const dashboards: Record<string, string> = {};
		
		// Generate default dashboards
		const defaultDashboards = this.generateDefaultDashboards(config);
		for (const [name, dashboard] of Object.entries(defaultDashboards)) {
			dashboards[name] = dashboard;
		}
		
		// Generate custom dashboards
		for (const dashboardConfig of config.dashboards) {
			dashboards[dashboardConfig.name] = this.generateDashboard(dashboardConfig, config);
		}

		return {
			dashboards,
			alerts: this.generateAlertRules(config),
			datasources: this.generateDatasources(config),
			prometheusRules: this.generatePrometheusRules(config),
			sloConfig: this.generateSLOConfiguration(config),
			grafanaConfig: this.generateGrafanaConfiguration(config),
		};
	}

	private generateDefaultDashboards(config: DashboardGeneratorConfig): Record<string, string> {
		const dashboards: Record<string, string> = {};

		// Application Overview Dashboard
		dashboards["application-overview"] = this.generateApplicationOverviewDashboard(config);
		
		// Infrastructure Dashboard
		dashboards["infrastructure"] = this.generateInfrastructureDashboard(config);
		
		// SLO Dashboard
		dashboards["slo-overview"] = this.generateSLODashboard(config);
		
		// Error Tracking Dashboard
		dashboards["error-tracking"] = this.generateErrorTrackingDashboard(config);
		
		// Performance Dashboard
		dashboards["performance"] = this.generatePerformanceDashboard(config);

		// Framework-specific dashboards
		switch (config.framework) {
			case "nestjs":
				dashboards["nestjs-monitoring"] = this.generateNestJSDashboard(config);
				break;
			case "express":
				dashboards["express-monitoring"] = this.generateExpressDashboard(config);
				break;
			case "fastify":
				dashboards["fastify-monitoring"] = this.generateFastifyDashboard(config);
				break;
			case "hono":
				dashboards["hono-monitoring"] = this.generateHonoDashboard(config);
				break;
			case "nextjs":
				dashboards["nextjs-monitoring"] = this.generateNextJSDashboard(config);
				break;
			case "react":
				dashboards["react-monitoring"] = this.generateReactDashboard(config);
				break;
		}

		return dashboards;
	}

	private generateApplicationOverviewDashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - Application Overview`,
			tags: ["application", "overview", config.framework],
			style: "dark",
			timezone: "Europe/Oslo", // Norwegian timezone
			refresh: "30s",
			time: {
				from: "now-1h",
				to: "now"
			},
			templating: {
				list: [
					{
						name: "service",
						type: "query",
						query: `label_values(up{job=~"${config.projectName}.*"}, job)`,
						refresh: 1,
						includeAll: true,
						multi: true,
						datasource: "Prometheus"
					},
					{
						name: "environment",
						type: "query",
						query: `label_values(up{job=~"${config.projectName}.*"}, environment)`,
						refresh: 1,
						includeAll: false,
						multi: false,
						datasource: "Prometheus",
						current: {
							value: config.environment,
							text: config.environment
						}
					}
				]
			},
			panels: [
				// Service Health Overview
				{
					id: 1,
					title: "Service Health",
					type: "stat",
					targets: [{
						expr: `up{job=~"$service"}`,
						legendFormat: "{{job}}",
						refId: "A"
					}],
					gridPos: { x: 0, y: 0, w: 6, h: 4 },
					fieldConfig: {
						defaults: {
							mappings: [
								{ type: "value", options: { "0": { text: "Down", color: "red" } } },
								{ type: "value", options: { "1": { text: "Up", color: "green" } } }
							],
							noValue: "No data"
						}
					}
				},

				// Request Rate
				{
					id: 2,
					title: "Request Rate (req/s)",
					type: "graph",
					targets: [{
						expr: `sum(rate(http_requests_total{job=~"$service", environment="$environment"}[5m]))`,
						legendFormat: "Total Requests/s",
						refId: "A"
					}],
					gridPos: { x: 6, y: 0, w: 6, h: 4 },
					yAxes: [{
						unit: "reqps"
					}]
				},

				// Response Time
				{
					id: 3,
					title: "Response Time (95th percentile)",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job=~"$service", environment="$environment"}[5m])) by (le))`,
						legendFormat: "95th percentile",
						refId: "A"
					}, {
						expr: `histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket{job=~"$service", environment="$environment"}[5m])) by (le))`,
						legendFormat: "50th percentile",
						refId: "B"
					}],
					gridPos: { x: 12, y: 0, w: 6, h: 4 },
					yAxes: [{
						unit: "s"
					}]
				},

				// Error Rate
				{
					id: 4,
					title: "Error Rate (%)",
					type: "graph",
					targets: [{
						expr: `(sum(rate(http_requests_total{job=~"$service", environment="$environment", status_code=~"5.."}[5m])) / sum(rate(http_requests_total{job=~"$service", environment="$environment"}[5m]))) * 100`,
						legendFormat: "Error Rate %",
						refId: "A"
					}],
					gridPos: { x: 18, y: 0, w: 6, h: 4 },
					yAxes: [{
						unit: "percent",
						max: 100,
						min: 0
					}],
					alert: {
						name: "High Error Rate",
						message: "Error rate is above 5% for more than 5 minutes",
						frequency: "1m",
						conditions: [{
							query: { refId: "A" },
							reducer: { type: "last" },
							evaluator: { params: [5], type: "gt" }
						}],
						executionErrorState: "alerting",
						noDataState: "no_data",
						for: "5m"
					}
				},

				// Top Endpoints by Request Count
				{
					id: 5,
					title: "Top Endpoints by Request Count",
					type: "table",
					targets: [{
						expr: `topk(10, sum by (method, handler) (rate(http_requests_total{job=~"$service", environment="$environment"}[5m])))`,
						format: "table",
						refId: "A"
					}],
					gridPos: { x: 0, y: 4, w: 12, h: 8 },
					transformations: [{
						id: "organize",
						options: {
							excludeByName: { Time: true },
							renameByName: {
								method: "Method",
								handler: "Endpoint",
								Value: "Requests/s"
							}
						}
					}]
				},

				// Memory Usage
				{
					id: 6,
					title: "Memory Usage",
					type: "graph",
					targets: [{
						expr: `process_resident_memory_bytes{job=~"$service", environment="$environment"}`,
						legendFormat: "{{job}}",
						refId: "A"
					}],
					gridPos: { x: 12, y: 4, w: 6, h: 4 },
					yAxes: [{
						unit: "bytes"
					}]
				},

				// CPU Usage
				{
					id: 7,
					title: "CPU Usage",
					type: "graph",
					targets: [{
						expr: `rate(process_cpu_seconds_total{job=~"$service", environment="$environment"}[5m]) * 100`,
						legendFormat: "{{job}}",
						refId: "A"
					}],
					gridPos: { x: 18, y: 4, w: 6, h: 4 },
					yAxes: [{
						unit: "percent",
						max: 100,
						min: 0
					}]
				},

				// Active Database Connections
				{
					id: 8,
					title: "Active Database Connections",
					type: "stat",
					targets: [{
						expr: `sum(database_connections_active{job=~"$service", environment="$environment"})`,
						refId: "A"
					}],
					gridPos: { x: 12, y: 8, w: 6, h: 4 },
					fieldConfig: {
						defaults: {
							unit: "short",
							thresholds: {
								mode: "absolute",
								steps: [
									{ color: "green", value: null },
									{ color: "yellow", value: 50 },
									{ color: "red", value: 80 }
								]
							}
						}
					}
				},

				// Recent Logs (if Loki is available)
				{
					id: 9,
					title: "Recent Error Logs",
					type: "logs",
					targets: [{
						expr: `{job=~"$service", environment="$environment"} |= "ERROR"`,
						refId: "A"
					}],
					datasource: "Loki",
					gridPos: { x: 0, y: 12, w: 24, h: 8 },
					options: {
						showTime: true,
						showLabels: true,
						showCommonLabels: false,
						wrapLogMessage: true,
						sortOrder: "Descending"
					}
				}
			],
			annotations: {
				list: [
					{
						name: "Deployments",
						datasource: "Prometheus",
						enable: true,
						query: `changes(process_start_time_seconds{job=~"$service", environment="$environment"}[1h])`,
						textFormat: "Deployment: {{job}}",
						tagsFormat: "deployment"
					}
				]
			}
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateSLODashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - SLO Overview`,
			tags: ["slo", "sli", "reliability"],
			refresh: "1m",
			time: {
				from: "now-7d",
				to: "now"
			},
			panels: config.slo.map((slo, index) => ({
				id: index + 1,
				title: `SLO: ${slo.name}`,
				type: "stat",
				targets: [{
					expr: `(${slo.sli}) * 100`,
					legendFormat: slo.name,
					refId: "A"
				}],
				gridPos: {
					x: (index % 4) * 6,
					y: Math.floor(index / 4) * 4,
					w: 6,
					h: 4
				},
				fieldConfig: {
					defaults: {
						unit: "percent",
						min: 0,
						max: 100,
						thresholds: {
							mode: "absolute",
							steps: [
								{ color: "red", value: null },
								{ color: "yellow", value: slo.target * 0.9 },
								{ color: "green", value: slo.target }
							]
						}
					}
				}
			}))
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateNestJSDashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - NestJS Monitoring`,
			tags: ["nestjs", "nodejs", "api"],
			refresh: "30s",
			panels: [
				{
					id: 1,
					title: "HTTP Requests by Controller",
					type: "graph",
					targets: [{
						expr: `sum by (controller, method) (rate(nestjs_http_requests_total{job=~"${config.projectName}.*"}[5m]))`,
						legendFormat: "{{controller}}.{{method}}",
						refId: "A"
					}],
					gridPos: { x: 0, y: 0, w: 12, h: 8 }
				},
				{
					id: 2,
					title: "Guard Execution Time",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(nestjs_guard_duration_seconds_bucket[5m])) by (le, guard))`,
						legendFormat: "{{guard}} (95th)",
						refId: "A"
					}],
					gridPos: { x: 12, y: 0, w: 12, h: 8 }
				},
				{
					id: 3,
					title: "Interceptor Metrics",
					type: "table",
					targets: [{
						expr: `sum by (interceptor) (rate(nestjs_interceptor_duration_seconds_sum[5m])) / sum by (interceptor) (rate(nestjs_interceptor_duration_seconds_count[5m]))`,
						format: "table",
						refId: "A"
					}],
					gridPos: { x: 0, y: 8, w: 24, h: 8 }
				}
			]
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateExpressDashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - Express Monitoring`,
			tags: ["express", "nodejs", "api"],
			refresh: "30s",
			panels: [
				{
					id: 1,
					title: "Express Route Performance",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(express_http_request_duration_seconds_bucket{job=~"${config.projectName}.*"}[5m])) by (le, route))`,
						legendFormat: "{{route}} (95th)",
						refId: "A"
					}],
					gridPos: { x: 0, y: 0, w: 12, h: 8 }
				},
				{
					id: 2,
					title: "Middleware Execution Time",
					type: "graph",
					targets: [{
						expr: `sum by (middleware) (rate(express_middleware_duration_seconds_sum[5m])) / sum by (middleware) (rate(express_middleware_duration_seconds_count[5m]))`,
						legendFormat: "{{middleware}}",
						refId: "A"
					}],
					gridPos: { x: 12, y: 0, w: 12, h: 8 }
				}
			]
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateFastifyDashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - Fastify Monitoring`,
			tags: ["fastify", "nodejs", "api"],
			refresh: "30s",
			panels: [
				{
					id: 1,
					title: "Fastify Route Performance",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(fastify_request_duration_seconds_bucket{job=~"${config.projectName}.*"}[5m])) by (le, route))`,
						legendFormat: "{{route}} (95th)",
						refId: "A"
					}],
					gridPos: { x: 0, y: 0, w: 12, h: 8 }
				},
				{
					id: 2,
					title: "Plugin Performance",
					type: "graph",
					targets: [{
						expr: `sum by (plugin) (rate(fastify_plugin_duration_seconds_sum[5m])) / sum by (plugin) (rate(fastify_plugin_duration_seconds_count[5m]))`,
						legendFormat: "{{plugin}}",
						refId: "A"
					}],
					gridPos: { x: 12, y: 0, w: 12, h: 8 }
				}
			]
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateHonoDashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - Hono Monitoring`,
			tags: ["hono", "edge", "api"],
			refresh: "30s",
			panels: [
				{
					id: 1,
					title: "Hono Route Performance",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(hono_request_duration_seconds_bucket{job=~"${config.projectName}.*"}[5m])) by (le, path))`,
						legendFormat: "{{path}} (95th)",
						refId: "A"
					}],
					gridPos: { x: 0, y: 0, w: 12, h: 8 }
				},
				{
					id: 2,
					title: "Edge Runtime Metrics",
					type: "graph",
					targets: [{
						expr: `sum by (runtime) (rate(hono_runtime_invocations_total[5m]))`,
						legendFormat: "{{runtime}}",
						refId: "A"
					}],
					gridPos: { x: 12, y: 0, w: 12, h: 8 }
				}
			]
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateNextJSDashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - Next.js Monitoring`,
			tags: ["nextjs", "react", "ssr"],
			refresh: "30s",
			panels: [
				{
					id: 1,
					title: "Page Load Performance",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(nextjs_page_load_duration_seconds_bucket{job=~"${config.projectName}.*"}[5m])) by (le, page))`,
						legendFormat: "{{page}} (95th)",
						refId: "A"
					}],
					gridPos: { x: 0, y: 0, w: 12, h: 8 }
				},
				{
					id: 2,
					title: "API Route Performance",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(nextjs_api_duration_seconds_bucket{job=~"${config.projectName}.*"}[5m])) by (le, route))`,
						legendFormat: "{{route}} (95th)",
						refId: "A"
					}],
					gridPos: { x: 12, y: 0, w: 12, h: 8 }
				},
				{
					id: 3,
					title: "SSR vs Client-side Rendering",
					type: "stat",
					targets: [{
						expr: `sum(rate(nextjs_render_type_total{type="ssr"}[5m])) / sum(rate(nextjs_render_type_total[5m])) * 100`,
						legendFormat: "SSR %",
						refId: "A"
					}],
					gridPos: { x: 0, y: 8, w: 6, h: 4 }
				}
			]
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateReactDashboard(config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: `${config.projectName} - React Monitoring`,
			tags: ["react", "frontend", "spa"],
			refresh: "30s",
			panels: [
				{
					id: 1,
					title: "Component Render Performance",
					type: "graph",
					targets: [{
						expr: `histogram_quantile(0.95, sum(rate(react_component_render_duration_seconds_bucket{job=~"${config.projectName}.*"}[5m])) by (le, component))`,
						legendFormat: "{{component}} (95th)",
						refId: "A"
					}],
					gridPos: { x: 0, y: 0, w: 12, h: 8 }
				},
				{
					id: 2,
					title: "User Interactions",
					type: "graph",
					targets: [{
						expr: `sum by (interaction_type) (rate(react_user_interactions_total[5m]))`,
						legendFormat: "{{interaction_type}}",
						refId: "A"
					}],
					gridPos: { x: 12, y: 0, w: 12, h: 8 }
				},
				{
					id: 3,
					title: "Bundle Size Impact",
					type: "stat",
					targets: [{
						expr: `react_bundle_size_bytes{job=~"${config.projectName}.*"}`,
						legendFormat: "Bundle Size",
						refId: "A"
					}],
					gridPos: { x: 0, y: 8, w: 6, h: 4 },
					fieldConfig: {
						defaults: {
							unit: "bytes"
						}
					}
				}
			]
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateInfrastructureDashboard(config: DashboardGeneratorConfig): string {
		// Infrastructure dashboard implementation
		return JSON.stringify({
			id: null,
			title: `${config.projectName} - Infrastructure`,
			tags: ["infrastructure", "kubernetes", "docker"],
			// ... implementation
		}, null, 2);
	}

	private generateErrorTrackingDashboard(config: DashboardGeneratorConfig): string {
		// Error tracking dashboard implementation
		return JSON.stringify({
			id: null,
			title: `${config.projectName} - Error Tracking`,
			tags: ["errors", "exceptions", "debugging"],
			// ... implementation
		}, null, 2);
	}

	private generatePerformanceDashboard(config: DashboardGeneratorConfig): string {
		// Performance dashboard implementation
		return JSON.stringify({
			id: null,
			title: `${config.projectName} - Performance`,
			tags: ["performance", "optimization", "metrics"],
			// ... implementation
		}, null, 2);
	}

	private generateDashboard(dashboardConfig: DashboardConfig, config: DashboardGeneratorConfig): string {
		const dashboard = {
			id: null,
			title: dashboardConfig.title,
			description: dashboardConfig.description,
			tags: dashboardConfig.tags,
			refresh: dashboardConfig.refresh,
			time: dashboardConfig.timeRange,
			templating: {
				list: dashboardConfig.variables.map(variable => ({
					name: variable.name,
					type: variable.type,
					query: variable.query,
					datasource: variable.datasource,
					refresh: variable.refresh,
					includeAll: variable.includeAll,
					multi: variable.multi,
					current: variable.current ? { value: variable.current, text: variable.current } : undefined
				}))
			},
			panels: dashboardConfig.panels.map(panel => ({
				id: panel.id,
				title: panel.title,
				type: panel.type,
				datasource: panel.datasource,
				targets: panel.targets,
				gridPos: panel.gridPos,
				options: panel.options,
				fieldConfig: panel.fieldConfig,
				alert: panel.alert,
				transformations: panel.transformations
			})),
			annotations: {
				list: dashboardConfig.annotations?.map(annotation => ({
					name: annotation.name,
					datasource: annotation.datasource,
					enable: annotation.enable,
					query: annotation.query,
					textFormat: annotation.textFormat,
					tagsFormat: annotation.tagsFormat
				})) || []
			}
		};

		return JSON.stringify(dashboard, null, 2);
	}

	private generateAlertRules(config: DashboardGeneratorConfig): string {
		const alertRules = {
			groups: config.alerts.map(alert => ({
				name: `${config.projectName}.${alert.name}`,
				rules: [{
					alert: alert.name,
					expr: alert.conditions[0]?.query.expr || "",
					for: alert.for,
					labels: {
						severity: "warning",
						service: config.projectName,
						environment: config.environment
					},
					annotations: {
						summary: alert.name,
						description: alert.message
					}
				}]
			}))
		};

		return `# Prometheus Alert Rules for ${config.projectName}
${JSON.stringify(alertRules, null, 2)}`;
	}

	private generateDatasources(config: DashboardGeneratorConfig): string {
		const datasources = {
			apiVersion: 1,
			datasources: config.datasources.map(ds => ({
				name: ds.name,
				type: ds.type,
				url: ds.url,
				access: ds.access,
				basicAuth: ds.basicAuth,
				basicAuthUser: ds.basicAuthUser,
				withCredentials: ds.withCredentials,
				isDefault: ds.isDefault,
				jsonData: {
					...ds.jsonData,
					...(config.compliance.norwegianCompliant && {
						customQueryParameters: "region=norway",
						timeInterval: "15s"
					})
				},
				secureJsonData: ds.secureJsonData
			}))
		};

		return JSON.stringify(datasources, null, 2);
	}

	private generatePrometheusRules(config: DashboardGeneratorConfig): string {
		return `# Prometheus recording and alerting rules for ${config.projectName}
groups:
  - name: ${config.projectName}.sli
    interval: 30s
    rules:
${config.sli.map(sli => `      - record: sli:${sli.name}
        expr: ${sli.query}
        labels:
          service: ${config.projectName}
          sli_name: ${sli.name}`).join('\n')}

  - name: ${config.projectName}.slo
    interval: 1m
    rules:
${config.slo.map(slo => `      - record: slo:${slo.name}:error_budget
        expr: (1 - ${slo.target}/100) * ${slo.timeWindow}
        labels:
          service: ${config.projectName}
          slo_name: ${slo.name}`).join('\n')}

  - name: ${config.projectName}.alerts
    rules:
${config.alerts.map(alert => `      - alert: ${alert.name}
        expr: ${alert.conditions[0]?.query.expr || ""}
        for: ${alert.for}
        labels:
          severity: warning
          service: ${config.projectName}
        annotations:
          summary: ${alert.name}
          description: ${alert.message}`).join('\n')}`;
	}

	private generateSLOConfiguration(config: DashboardGeneratorConfig): string {
		return `# SLO Configuration for ${config.projectName}
slos:
${config.slo.map(slo => `  - name: ${slo.name}
    description: ${slo.description}
    service: ${config.projectName}
    sli:
      query: ${slo.sli}
    objectives:
      - target: ${slo.target}
        timeWindow: ${slo.timeWindow}
    alerting:
      burn_rate: ${slo.alerting.burnRate}
      short_window: ${slo.alerting.shortWindow}
      long_window: ${slo.alerting.longWindow}`).join('\n')}

error_budget:
  enabled: ${config.errorBudget.enabled}
  time_window: ${config.errorBudget.timeWindow}
  target: ${config.errorBudget.target}
  alert_threshold: ${config.errorBudget.alertThreshold}`;
	}

	private generateGrafanaConfiguration(config: DashboardGeneratorConfig): string {
		return `# Grafana Configuration for ${config.projectName}
[server]
domain = ${config.projectName}.grafana.local
root_url = https://%(domain)s/
serve_from_sub_path = true

[security]
admin_user = admin
admin_password = \${GRAFANA_ADMIN_PASSWORD}
${config.compliance.gdprCompliant ? `
disable_gravatar = true
cookie_secure = true
cookie_samesite = strict` : ''}

[analytics]
reporting_enabled = ${!config.compliance.gdprCompliant}
check_for_updates = ${!config.compliance.gdprCompliant}

[users]
allow_sign_up = false
allow_org_create = false
auto_assign_org = true
auto_assign_org_id = 1
auto_assign_org_role = Viewer

[auth.anonymous]
enabled = false

[log]
mode = console
level = info

[metrics]
enabled = true
interval_seconds = 10

[unified_alerting]
enabled = true
ha_listen_address = "0.0.0.0:9094"
ha_advertise_address = "grafana:9094"
ha_peers = "grafana:9094"

[alerting]
enabled = false

[explore]
enabled = true

[feature_toggles]
enable = ngalert prometheusAzureOverrideAudience

${config.compliance.norwegianCompliant ? `
[date_formats]
default_timezone = Europe/Oslo
full_date = DD.MM.YYYY HH:mm:ss
interval_second = HH:mm:ss
interval_minute = HH:mm
interval_hour = DD.MM HH:mm
interval_day = DD.MM
interval_month = MM-YYYY
interval_year = YYYY` : ''}`;
	}
}