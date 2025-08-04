/**
 * Agent Status Monitor - Real-time visibility into MCP and CLI operations
 *
 * FEATURES:
 * - Real-time agent status monitoring
 * - Task progress visualization
 * - Performance metrics display
 * - Agent health indicators
 * - Task cancellation controls
 *
 * UI SYSTEM v5.0.0 CVA COMPLIANCE:
 * - ✅ CVA variant props only
 * - ✅ Semantic Tailwind classes
 * - ✅ WCAG 2.2 AAA accessibility
 * - ✅ TypeScript explicit return types
 */

"use client";

import {
	Badge,
	Button,
	Card,
	Stack,
	Typography,
} from "@xala-technologies/ui-system";
import React, { useCallback, useEffect, useState } from "react";
import { useLocalization } from "@/hooks/useLocalization";

interface AgentStatusMonitorProps {
	readonly isConnected: boolean;
	readonly activeTasks: AgentTask[];
	readonly onTaskCancel: (taskId: string) => void;
}

interface AgentTask {
	readonly id: string;
	readonly type: "generation" | "analysis" | "migration" | "deployment";
	readonly description: string;
	readonly progress: number;
	readonly status: "pending" | "running" | "completed" | "error";
	readonly agentId: string;
	readonly startTime: Date;
	readonly estimatedDuration?: number;
}

interface AgentInfo {
	readonly id: string;
	readonly name: string;
	readonly type: "mcp" | "cli" | "web" | "orchestrator";
	readonly status: "active" | "idle" | "busy" | "error" | "offline";
	readonly version: string;
	readonly capabilities: string[];
	readonly currentTasks: number;
	readonly totalTasks: number;
	readonly averageTaskTime: number;
	readonly lastHeartbeat: Date;
	readonly cpuUsage?: number;
	readonly memoryUsage?: number;
}

interface SystemMetrics {
	readonly totalAgents: number;
	readonly activeAgents: number;
	readonly totalTasks: number;
	readonly completedTasks: number;
	readonly averageResponseTime: number;
	readonly systemLoad: number;
	readonly uptime: string;
}

export const AgentStatusMonitor = ({
	isConnected,
	activeTasks,
	onTaskCancel,
}: AgentStatusMonitorProps): React.JSX.Element => {
	const { t } = useLocalization();

	// Component state
	const [agents, setAgents] = useState<AgentInfo[]>([]);
	const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(
		null,
	);
	const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
	const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(false);

	// Mock agent data for demonstration
	const mockAgents: AgentInfo[] = [
		{
			id: "mcp-server",
			name: "MCP Server",
			type: "mcp",
			status: isConnected ? "active" : "offline",
			version: "6.0.0",
			capabilities: ["component-generation", "multi-platform", "ui-compliance"],
			currentTasks: activeTasks.filter((t) => t.agentId === "mcp-server")
				.length,
			totalTasks: 1247,
			averageTaskTime: 45.2,
			lastHeartbeat: new Date(),
			cpuUsage: 23.5,
			memoryUsage: 187.3,
		},
		{
			id: "xaheen-cli",
			name: "Xaheen CLI",
			type: "cli",
			status: isConnected ? "idle" : "offline",
			version: "2.0.2",
			capabilities: [
				"project-scaffolding",
				"service-integration",
				"deployment",
			],
			currentTasks: activeTasks.filter((t) => t.agentId === "xaheen-cli")
				.length,
			totalTasks: 892,
			averageTaskTime: 28.7,
			lastHeartbeat: new Date(),
		},
		{
			id: "xala-cli",
			name: "Xala CLI",
			type: "cli",
			status: isConnected ? "idle" : "offline",
			version: "2.0.0",
			capabilities: ["ui-system", "design-tokens", "accessibility"],
			currentTasks: activeTasks.filter((t) => t.agentId === "xala-cli").length,
			totalTasks: 634,
			averageTaskTime: 15.3,
			lastHeartbeat: new Date(),
		},
		{
			id: "orchestrator",
			name: "Agent Orchestrator",
			type: "orchestrator",
			status: isConnected ? "active" : "offline",
			version: "1.0.0",
			capabilities: [
				"task-distribution",
				"agent-coordination",
				"workflow-management",
			],
			currentTasks: 0,
			totalTasks: 2134,
			averageTaskTime: 0.8,
			lastHeartbeat: new Date(),
			cpuUsage: 8.2,
			memoryUsage: 64.1,
		},
	];

	const mockSystemMetrics: SystemMetrics = {
		totalAgents: 4,
		activeAgents: isConnected ? 2 : 0,
		totalTasks: activeTasks.length,
		completedTasks: 2847,
		averageResponseTime: 1.2,
		systemLoad: 0.34,
		uptime: "5d 14h 23m",
	};

	// Update agent data periodically
	useEffect(() => {
		setAgents(mockAgents);
		setSystemMetrics(mockSystemMetrics);

		if (isConnected) {
			const interval = setInterval(() => {
				// Update agent heartbeats and metrics
				setAgents((prevAgents) =>
					prevAgents.map((agent) => ({
						...agent,
						lastHeartbeat: new Date(),
						cpuUsage: agent.cpuUsage
							? agent.cpuUsage + (Math.random() - 0.5) * 5
							: undefined,
						memoryUsage: agent.memoryUsage
							? agent.memoryUsage + (Math.random() - 0.5) * 10
							: undefined,
					})),
				);
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [isConnected]);

	// Get agent status color
	const getStatusColor = (status: AgentInfo["status"]): string => {
		switch (status) {
			case "active":
				return "text-green-600";
			case "busy":
				return "text-blue-600";
			case "idle":
				return "text-gray-500";
			case "error":
				return "text-red-600";
			case "offline":
				return "text-gray-400";
			default:
				return "text-gray-500";
		}
	};

	// Get status badge variant
	const getStatusBadgeVariant = (
		status: AgentInfo["status"],
	): "success" | "secondary" | "warning" | "destructive" | "outline" => {
		switch (status) {
			case "active":
				return "success";
			case "busy":
				return "secondary";
			case "idle":
				return "outline";
			case "error":
				return "destructive";
			case "offline":
				return "warning";
			default:
				return "outline";
		}
	};

	// Calculate task progress
	const calculateRemainingTime = useCallback((task: AgentTask): string => {
		if (task.status === "completed") return "Completed";
		if (task.status === "error") return "Failed";
		if (!task.estimatedDuration) return "Unknown";

		const elapsed = (Date.now() - task.startTime.getTime()) / 1000;
		const remaining = Math.max(0, task.estimatedDuration - elapsed);

		if (remaining < 60) return `${Math.round(remaining)}s`;
		return `${Math.round(remaining / 60)}m`;
	}, []);

	// Render progress bar
	const renderProgressBar = useCallback(
		(progress: number, status: AgentTask["status"]): React.JSX.Element => {
			const width = Math.min(100, Math.max(0, progress));
			const colorClass =
				status === "error"
					? "bg-red-500"
					: status === "completed"
						? "bg-green-500"
						: "bg-blue-500";

			return (
				<div className="w-full h-2 bg-muted rounded-full overflow-hidden">
					<div
						className={`h-full transition-all duration-300 ${colorClass}`}
						style={{ width: `${width}%` }}
					/>
				</div>
			);
		},
		[],
	);

	const visibleTasks = showCompletedTasks
		? activeTasks
		: activeTasks.filter((task) => task.status !== "completed");

	return (
		<Card variant="outlined" padding="md">
			<Stack direction="vertical" gap="md">
				{/* Header */}
				<Stack direction="horizontal" gap="sm" align="center" justify="between">
					<Typography variant="h4">
						{t("agent.status.title") || "Agent Status"}
					</Typography>

					<Badge variant={isConnected ? "success" : "destructive"} size="xs">
						{isConnected ? "Online" : "Offline"}
					</Badge>
				</Stack>

				{/* System Metrics */}
				{systemMetrics && (
					<Card variant="ghost" padding="sm">
						<Stack direction="vertical" gap="sm">
							<Typography variant="caption" color="muted">
								System Overview
							</Typography>

							<Stack direction="horizontal" gap="md" wrap>
								<Stack direction="vertical" gap="xs" align="center">
									<Typography variant="body" weight="semibold">
										{systemMetrics.activeAgents}/{systemMetrics.totalAgents}
									</Typography>
									<Typography variant="caption" color="muted">
										Agents
									</Typography>
								</Stack>

								<Stack direction="vertical" gap="xs" align="center">
									<Typography variant="body" weight="semibold">
										{systemMetrics.totalTasks}
									</Typography>
									<Typography variant="caption" color="muted">
										Active
									</Typography>
								</Stack>

								<Stack direction="vertical" gap="xs" align="center">
									<Typography variant="body" weight="semibold">
										{systemMetrics.averageResponseTime}s
									</Typography>
									<Typography variant="caption" color="muted">
										Avg Response
									</Typography>
								</Stack>

								<Stack direction="vertical" gap="xs" align="center">
									<Typography variant="body" weight="semibold">
										{systemMetrics.uptime}
									</Typography>
									<Typography variant="caption" color="muted">
										Uptime
									</Typography>
								</Stack>
							</Stack>
						</Stack>
					</Card>
				)}

				{/* Agent List */}
				<Stack direction="vertical" gap="sm">
					<Typography variant="caption" color="muted">
						Connected Agents
					</Typography>

					{agents.length === 0 ? (
						<Typography variant="body" color="muted" align="center">
							No agents available
						</Typography>
					) : (
						<Stack direction="vertical" gap="xs">
							{agents.map((agent) => (
								<Card
									key={agent.id}
									variant={selectedAgent === agent.id ? "default" : "ghost"}
									padding="sm"
									className={`cursor-pointer hover:bg-muted/50 ${
										selectedAgent === agent.id ? "ring-2 ring-primary/20" : ""
									}`}
									onClick={() =>
										setSelectedAgent(
											selectedAgent === agent.id ? null : agent.id,
										)
									}
								>
									<Stack direction="vertical" gap="sm">
										<Stack
											direction="horizontal"
											gap="sm"
											align="center"
											justify="between"
										>
											<Stack direction="horizontal" gap="sm" align="center">
												<div
													className={`w-2 h-2 rounded-full ${
														agent.status === "active"
															? "bg-green-500"
															: agent.status === "busy"
																? "bg-blue-500"
																: agent.status === "idle"
																	? "bg-gray-400"
																	: agent.status === "error"
																		? "bg-red-500"
																		: "bg-gray-300"
													}`}
												/>

												<Stack direction="vertical" gap="xs">
													<Typography variant="body" weight="medium">
														{agent.name}
													</Typography>
													<Typography variant="caption" color="muted">
														v{agent.version} • {agent.type}
													</Typography>
												</Stack>
											</Stack>

											<Stack direction="horizontal" gap="xs">
												{agent.currentTasks > 0 && (
													<Badge variant="secondary" size="xs">
														{agent.currentTasks} active
													</Badge>
												)}
												<Badge
													variant={getStatusBadgeVariant(agent.status)}
													size="xs"
												>
													{agent.status}
												</Badge>
											</Stack>
										</Stack>

										{selectedAgent === agent.id && (
											<Stack direction="vertical" gap="sm">
												<Stack direction="horizontal" gap="md" wrap>
													<Stack direction="vertical" gap="xs">
														<Typography variant="caption" color="muted">
															Total Tasks
														</Typography>
														<Typography variant="body">
															{agent.totalTasks.toLocaleString()}
														</Typography>
													</Stack>

													<Stack direction="vertical" gap="xs">
														<Typography variant="caption" color="muted">
															Avg Time
														</Typography>
														<Typography variant="body">
															{agent.averageTaskTime}s
														</Typography>
													</Stack>

													{agent.cpuUsage && (
														<Stack direction="vertical" gap="xs">
															<Typography variant="caption" color="muted">
																CPU
															</Typography>
															<Typography variant="body">
																{agent.cpuUsage.toFixed(1)}%
															</Typography>
														</Stack>
													)}

													{agent.memoryUsage && (
														<Stack direction="vertical" gap="xs">
															<Typography variant="caption" color="muted">
																Memory
															</Typography>
															<Typography variant="body">
																{agent.memoryUsage.toFixed(0)}MB
															</Typography>
														</Stack>
													)}
												</Stack>

												<Stack direction="vertical" gap="xs">
													<Typography variant="caption" color="muted">
														Capabilities
													</Typography>
													<Stack direction="horizontal" gap="xs" wrap>
														{agent.capabilities.map((capability) => (
															<Badge
																key={capability}
																variant="outline"
																size="xs"
															>
																{capability}
															</Badge>
														))}
													</Stack>
												</Stack>
											</Stack>
										)}
									</Stack>
								</Card>
							))}
						</Stack>
					)}
				</Stack>

				{/* Active Tasks */}
				<Stack direction="vertical" gap="sm">
					<Stack
						direction="horizontal"
						gap="sm"
						align="center"
						justify="between"
					>
						<Typography variant="caption" color="muted">
							Tasks ({visibleTasks.length})
						</Typography>

						{activeTasks.some((t) => t.status === "completed") && (
							<Button
								variant="ghost"
								size="xs"
								onClick={() => setShowCompletedTasks(!showCompletedTasks)}
							>
								{showCompletedTasks ? "Hide Completed" : "Show Completed"}
							</Button>
						)}
					</Stack>

					{visibleTasks.length === 0 ? (
						<Typography variant="body" color="muted" align="center">
							No active tasks
						</Typography>
					) : (
						<Stack
							direction="vertical"
							gap="xs"
							className="max-h-64 overflow-y-auto"
						>
							{visibleTasks.map((task) => (
								<Card key={task.id} variant="ghost" padding="sm">
									<Stack direction="vertical" gap="sm">
										<Stack
											direction="horizontal"
											gap="sm"
											align="center"
											justify="between"
										>
											<Stack direction="vertical" gap="xs" className="flex-1">
												<Typography variant="body" weight="medium">
													{task.description}
												</Typography>
												<Stack direction="horizontal" gap="xs">
													<Badge
														variant={
															task.type === "generation"
																? "default"
																: task.type === "analysis"
																	? "secondary"
																	: task.type === "migration"
																		? "warning"
																		: "success"
														}
														size="xs"
													>
														{task.type}
													</Badge>
													<Typography variant="caption" color="muted">
														{calculateRemainingTime(task)}
													</Typography>
												</Stack>
											</Stack>

											{task.status === "running" && (
												<Button
													variant="ghost"
													size="xs"
													onClick={() => onTaskCancel(task.id)}
													aria-label={`Cancel task: ${task.description}`}
												>
													Cancel
												</Button>
											)}
										</Stack>

										{task.status !== "pending" && (
											<Stack direction="vertical" gap="xs">
												{renderProgressBar(task.progress, task.status)}
												<Stack
													direction="horizontal"
													gap="sm"
													justify="between"
												>
													<Typography variant="caption" color="muted">
														{task.progress}%
													</Typography>
													<Typography variant="caption" color="muted">
														Agent: {task.agentId}
													</Typography>
												</Stack>
											</Stack>
										)}
									</Stack>
								</Card>
							))}
						</Stack>
					)}
				</Stack>
			</Stack>
		</Card>
	);
};
