/**
 * Agent Dashboard Components - Export Index
 * 
 * Centralized exports for all Agent Dashboard components
 * following the full-stack development ecosystem architecture
 */

export { AgentDashboard } from './AgentDashboard';
export { ProjectExplorer } from './ProjectExplorer';
export { CommandCenter } from './CommandCenter';
export { AgentStatusMonitor } from './AgentStatusMonitor';
export { ResultsVisualization } from './ResultsVisualization';
export { ContextSidebar } from './ContextSidebar';

// Export the WebSocket service for external use
export { webSocketService, useWebSocket } from '../../lib/services/websocket-service';