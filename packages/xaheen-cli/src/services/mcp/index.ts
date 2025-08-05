/**
 * @fileoverview MCP Services Index
 * @description Export all MCP-related services and utilities
 * @version 1.0.0
 * @compliance Norwegian Enterprise Standards, MCP Protocol, Audit Trail
 */

// Core MCP Client Service
export { MCPClientService, mcpClientService } from "./mcp-client.service";

// EPIC 13 Story 13.6.8 & EPIC 14 Story 14.2.3 - MCP Execution Logging
export { 
	MCPExecutionLogger, 
	mcpExecutionLogger,
	type LogLevel,
	type LogCategory,
	type ExecutionContext,
	type MCPOperation,
	type SecurityContext,
	type ComplianceMetadata,
	type LogEntry,
	type SearchQuery,
	type LogStorageOptions,
	type LogAnalytics
} from "./mcp-execution-logger.service";

// EPIC 13 Story 13.6.9 - MCP Log Analysis
export {
	MCPLogAnalyzer,
	mcpLogAnalyzer,
	type PerformanceMetrics,
	type SlowOperation,
	type TimeSeriesPoint,
	type ErrorAnalysis,
	type CriticalError,
	type ErrorPattern,
	type RecoveryAnalysis,
	type ComplianceReport,
	type ComplianceMetrics,
	type ComplianceViolation,
	type AuditTrailAnalysis,
	type AuditGap,
	type IntegrityCheck,
	type AccessPattern,
	type DataRetentionAnalysis,
	type CleanupTask,
	type SecurityEventSummary,
	type ComplianceRecommendation,
	type DebugSession
} from "./mcp-log-analyzer.service";

// Context Indexer Service (if exists)
export * from "./mcp-context-indexer.service";

// Generation Orchestrator (if exists)
export * from "./mcp-generation-orchestrator";