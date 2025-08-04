/**
 * WebSocket Service - Real-time communication with MCP server
 *
 * FEATURES:
 * - Real-time agent communication
 * - Stream progress updates
 * - Error handling and reconnection
 * - TypeScript strict typing
 * - Event-driven architecture
 */

interface AgentMessage {
	readonly id: string;
	readonly type: "command" | "progress" | "result" | "error";
	readonly agentId: string;
	readonly payload: any;
	readonly timestamp: number;
}

interface AgentStatus {
	readonly id: string;
	readonly name: string;
	readonly status: "idle" | "processing" | "error" | "offline";
	readonly currentTask?: string;
	readonly progress?: number;
	readonly lastActivity: number;
}

interface WebSocketConfig {
	readonly url: string;
	readonly reconnectAttempts: number;
	readonly reconnectDelay: number;
	readonly heartbeatInterval: number;
}

type MessageHandler = (message: AgentMessage) => void;
type StatusHandler = (status: AgentStatus[]) => void;
type ConnectionHandler = (connected: boolean) => void;

export class WebSocketService {
	private socket: WebSocket | null = null;
	private config: WebSocketConfig;
	private messageHandlers: Set<MessageHandler> = new Set();
	private statusHandlers: Set<StatusHandler> = new Set();
	private connectionHandlers: Set<ConnectionHandler> = new Set();
	private reconnectTimeoutId: NodeJS.Timeout | null = null;
	private heartbeatIntervalId: NodeJS.Timeout | null = null;
	private isReconnecting = false;
	private currentReconnectAttempts = 0;

	constructor(config: Partial<WebSocketConfig> = {}) {
		this.config = {
			url: config.url || "ws://localhost:3001/agent-ws",
			reconnectAttempts: config.reconnectAttempts || 5,
			reconnectDelay: config.reconnectDelay || 2000,
			heartbeatInterval: config.heartbeatInterval || 30000,
		};
	}

	public connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.socket = new WebSocket(this.config.url);

				this.socket.onopen = () => {
					console.log("WebSocket connected to MCP server");
					this.isReconnecting = false;
					this.currentReconnectAttempts = 0;
					this.startHeartbeat();
					this.notifyConnectionHandlers(true);
					resolve();
				};

				this.socket.onmessage = (event) => {
					try {
						const message: AgentMessage = JSON.parse(event.data);
						this.handleMessage(message);
					} catch (error) {
						console.error("Failed to parse WebSocket message:", error);
					}
				};

				this.socket.onclose = (event) => {
					console.log("WebSocket connection closed:", event.code, event.reason);
					this.stopHeartbeat();
					this.notifyConnectionHandlers(false);

					if (
						!this.isReconnecting &&
						this.currentReconnectAttempts < this.config.reconnectAttempts
					) {
						this.attemptReconnect();
					}
				};

				this.socket.onerror = (error) => {
					console.error("WebSocket error:", error);
					reject(error);
				};
			} catch (error) {
				console.error("Failed to create WebSocket connection:", error);
				reject(error);
			}
		});
	}

	public disconnect(): void {
		this.isReconnecting = false;
		this.currentReconnectAttempts = this.config.reconnectAttempts;

		if (this.reconnectTimeoutId) {
			clearTimeout(this.reconnectTimeoutId);
			this.reconnectTimeoutId = null;
		}

		this.stopHeartbeat();

		if (this.socket) {
			this.socket.close(1000, "Client disconnect");
			this.socket = null;
		}
	}

	public sendCommand(agentId: string, command: string, params: any = {}): void {
		const message: AgentMessage = {
			id: this.generateMessageId(),
			type: "command",
			agentId,
			payload: { command, params },
			timestamp: Date.now(),
		};

		this.sendMessage(message);
	}

	public sendMessage(message: AgentMessage): void {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			try {
				this.socket.send(JSON.stringify(message));
			} catch (error) {
				console.error("Failed to send WebSocket message:", error);
			}
		} else {
			console.warn("WebSocket not connected, message queued:", message);
			// TODO: Implement message queuing for offline mode
		}
	}

	public onMessage(handler: MessageHandler): () => void {
		this.messageHandlers.add(handler);
		return () => this.messageHandlers.delete(handler);
	}

	public onStatusUpdate(handler: StatusHandler): () => void {
		this.statusHandlers.add(handler);
		return () => this.statusHandlers.delete(handler);
	}

	public onConnectionChange(handler: ConnectionHandler): () => void {
		this.connectionHandlers.add(handler);
		return () => this.connectionHandlers.delete(handler);
	}

	public isConnected(): boolean {
		return this.socket?.readyState === WebSocket.OPEN;
	}

	private handleMessage(message: AgentMessage): void {
		if (message.type === "progress") {
			// Handle agent status updates
			this.handleStatusUpdate(message);
		}

		// Notify all message handlers
		this.messageHandlers.forEach((handler) => {
			try {
				handler(message);
			} catch (error) {
				console.error("Error in message handler:", error);
			}
		});
	}

	private handleStatusUpdate(message: AgentMessage): void {
		// Extract status information from progress messages
		// This would be expanded based on actual MCP server message format
		const status: AgentStatus = {
			id: message.agentId,
			name: message.payload.agentName || message.agentId,
			status: message.payload.status || "processing",
			currentTask: message.payload.currentTask,
			progress: message.payload.progress,
			lastActivity: message.timestamp,
		};

		// Notify status handlers
		this.statusHandlers.forEach((handler) => {
			try {
				handler([status]); // In real implementation, maintain full status list
			} catch (error) {
				console.error("Error in status handler:", error);
			}
		});
	}

	private attemptReconnect(): void {
		if (
			this.isReconnecting ||
			this.currentReconnectAttempts >= this.config.reconnectAttempts
		) {
			return;
		}

		this.isReconnecting = true;
		this.currentReconnectAttempts++;

		const delay =
			this.config.reconnectDelay *
			Math.pow(2, this.currentReconnectAttempts - 1);

		console.log(
			`Attempting to reconnect (${this.currentReconnectAttempts}/${this.config.reconnectAttempts}) in ${delay}ms`,
		);

		this.reconnectTimeoutId = setTimeout(() => {
			this.connect().catch((error) => {
				console.error("Reconnection attempt failed:", error);
				if (this.currentReconnectAttempts < this.config.reconnectAttempts) {
					this.attemptReconnect();
				} else {
					console.error("Max reconnection attempts reached");
					this.isReconnecting = false;
				}
			});
		}, delay);
	}

	private startHeartbeat(): void {
		this.heartbeatIntervalId = setInterval(() => {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.send(
					JSON.stringify({ type: "ping", timestamp: Date.now() }),
				);
			}
		}, this.config.heartbeatInterval);
	}

	private stopHeartbeat(): void {
		if (this.heartbeatIntervalId) {
			clearInterval(this.heartbeatIntervalId);
			this.heartbeatIntervalId = null;
		}
	}

	private notifyConnectionHandlers(connected: boolean): void {
		this.connectionHandlers.forEach((handler) => {
			try {
				handler(connected);
			} catch (error) {
				console.error("Error in connection handler:", error);
			}
		});
	}

	private generateMessageId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}

// Singleton instance for global access
export const webSocketService = new WebSocketService();

// React Hook for easy component integration
export const useWebSocket = () => {
	return webSocketService;
};
