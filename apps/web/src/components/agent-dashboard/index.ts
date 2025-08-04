/**
 * Agent Dashboard Components - Export Index
 *
 * Centralized exports for all Agent Dashboard components
 * following the full-stack development ecosystem architecture
 */

// Export the WebSocket service for external use
export {
	useWebSocket,
	webSocketService,
} from "../../lib/services/websocket-service";
export { AgentDashboard } from "./AgentDashboard";
export { AgentStatusMonitor } from "./AgentStatusMonitor";
export { CommandCenter } from "./CommandCenter";
export { ContextSidebar } from "./ContextSidebar";
export { ProjectExplorer } from "./ProjectExplorer";
export { ResultsVisualization } from "./ResultsVisualization";
