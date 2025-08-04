/**
 * WebSocket Integration Generator
 * Generates WebSocket servers with real-time notifications, chat systems, and live updates
 */

import type { GeneratedFile } from "../types.js";

export interface WebSocketOptions {
	readonly name: string;
	readonly port?: number;
	readonly features: readonly WebSocketFeature[];
	readonly authentication?: "jwt" | "session" | "none";
	readonly scaling?: "redis" | "cluster" | "single";
	readonly security?: {
		readonly cors?: string[];
		readonly rateLimit?: {
			readonly windowMs: number;
			readonly maxRequests: number;
		};
	};
}

export type WebSocketFeature =
	| "chat"
	| "notifications"
	| "live-updates"
	| "presence"
	| "typing-indicators"
	| "file-sharing"
	| "video-call"
	| "screen-share";

export class WebSocketGenerator {
	async generate(options: WebSocketOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Core WebSocket server
		files.push(this.generateWebSocketServer(options));
		files.push(this.generateWebSocketModule(options));
		files.push(this.generateWebSocketService(options));

		// Feature-specific implementations
		for (const feature of options.features) {
			files.push(...this.generateFeatureImplementation(feature, options));
		}

		// Scaling implementations
		if (options.scaling === "redis") {
			files.push(...this.generateRedisScaling(options));
		} else if (options.scaling === "cluster") {
			files.push(...this.generateClusterScaling(options));
		}

		// Security and middleware
		files.push(...this.generateSecurityMiddleware(options));

		// Configuration and types
		files.push(this.generateTypes(options));
		files.push(this.generateConfiguration(options));

		// Client-side utilities
		files.push(...this.generateClientUtils(options));

		// Testing utilities
		files.push(...this.generateTestFiles(options));

		return files;
	}

	private generateWebSocketServer(options: WebSocketOptions): GeneratedFile {
		const content = `import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
${options.authentication === "jwt" ? "import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';" : ""}
import { RateLimitGuard } from './guards/rate-limit.guard';
import { WebSocketService } from './websocket.service';
import { 
  WebSocketMessage, 
  WebSocketResponse, 
  ClientEvents, 
  ServerEvents,
  AuthenticatedSocket 
} from './types/websocket.types';

@WebSocketGateway(${options.port || 3001}, {
  cors: {
    origin: ${JSON.stringify(options.security?.cors || ["http://localhost:3000"])},
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class WebSocketGateway 
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(private readonly websocketService: WebSocketService) {}

  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway initialized');
    this.websocketService.setServer(server);
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      this.logger.log(\`Client connected: \${client.id}\`);
      
      ${
				options.authentication !== "none"
					? `
      // Authentication
      const user = await this.websocketService.authenticateSocket(client);
      if (!user) {
        client.disconnect(true);
        return;
      }
      
      (client as AuthenticatedSocket).user = user;
      `
					: ""
			}
      
      // Join client to personal room
      client.join(\`user_\${client.id}\`);
      
      await this.websocketService.onClientConnect(client as AuthenticatedSocket);
      
      // Emit connection success
      client.emit('connected', {
        clientId: client.id,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(\`Client disconnected: \${client.id}\`);
    await this.websocketService.onClientDisconnect(client as AuthenticatedSocket);
  }

  @UseGuards(RateLimitGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: WebSocketMessage,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<WebSocketResponse> {
    try {
      const response = await this.websocketService.handleMessage(data, client);
      return response;
    } catch (error) {
      this.logger.error('Message handling error:', error);
      return {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  ${
		options.features.includes("chat")
			? `
  @UseGuards(RateLimitGuard)
  @SubscribeMessage('chat:send')
  async handleChatMessage(
    @MessageBody() data: { roomId: string; message: string; type?: 'text' | 'image' | 'file' },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.handleChatMessage(data, client);
  }

  @SubscribeMessage('chat:join')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.joinChatRoom(data.roomId, client);
  }

  @SubscribeMessage('chat:leave')
  async handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.leaveChatRoom(data.roomId, client);
  }
  `
			: ""
	}

  ${
		options.features.includes("typing-indicators")
			? `
  @SubscribeMessage('typing:start')
  async handleTypingStart(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.handleTypingStart(data.roomId, client);
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.handleTypingStop(data.roomId, client);
  }
  `
			: ""
	}

  ${
		options.features.includes("presence")
			? `
  @SubscribeMessage('presence:update')
  async handlePresenceUpdate(
    @MessageBody() data: { status: 'online' | 'away' | 'busy' | 'offline' },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.updatePresence(client, data.status);
  }
  `
			: ""
	}

  ${
		options.features.includes("live-updates")
			? `
  @SubscribeMessage('subscribe:updates')
  async handleSubscribeUpdates(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.subscribeToUpdates(client, data.channels);
  }

  @SubscribeMessage('unsubscribe:updates')
  async handleUnsubscribeUpdates(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    await this.websocketService.unsubscribeFromUpdates(client, data.channels);
  }
  `
			: ""
	}
}`;

		return {
			path: `${options.name}/src/websocket/websocket.gateway.ts`,
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateWebSocketModule(options: WebSocketOptions): GeneratedFile {
		const content = `import { Module } from '@nestjs/common';
import { WebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
${options.scaling === "redis" ? "import { RedisModule } from '../redis/redis.module';" : ""}
${options.authentication === "jwt" ? "import { AuthModule } from '../auth/auth.module';" : ""}
import { RateLimitGuard } from './guards/rate-limit.guard';
${options.features.includes("chat") ? "import { ChatService } from './services/chat.service';" : ""}
${options.features.includes("notifications") ? "import { NotificationService } from './services/notification.service';" : ""}
${options.features.includes("presence") ? "import { PresenceService } from './services/presence.service';" : ""}

@Module({
  imports: [
    ${options.scaling === "redis" ? "RedisModule," : ""}
    ${options.authentication === "jwt" ? "AuthModule," : ""}
  ],
  providers: [
    WebSocketGateway,
    WebSocketService,
    RateLimitGuard,
    ${options.features.includes("chat") ? "ChatService," : ""}
    ${options.features.includes("notifications") ? "NotificationService," : ""}
    ${options.features.includes("presence") ? "PresenceService," : ""}
  ],
  exports: [
    WebSocketService,
    ${options.features.includes("chat") ? "ChatService," : ""}
    ${options.features.includes("notifications") ? "NotificationService," : ""}
    ${options.features.includes("presence") ? "PresenceService," : ""}
  ],
})
export class WebSocketModule {}`;

		return {
			path: `${options.name}/src/websocket/websocket.module.ts`,
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateWebSocketService(options: WebSocketOptions): GeneratedFile {
		const content = `import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
${options.scaling === "redis" ? "import { RedisService } from '../redis/redis.service';" : ""}
import { 
  WebSocketMessage, 
  WebSocketResponse, 
  AuthenticatedSocket,
  UserPresence 
} from './types/websocket.types';
${options.features.includes("chat") ? "import { ChatService } from './services/chat.service';" : ""}
${options.features.includes("notifications") ? "import { NotificationService } from './services/notification.service';" : ""}
${options.features.includes("presence") ? "import { PresenceService } from './services/presence.service';" : ""}

@Injectable()
export class WebSocketService {
  private server: Server;
  private readonly logger = new Logger(WebSocketService.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(
    ${options.scaling === "redis" ? "private readonly redisService: RedisService," : ""}
    ${options.features.includes("chat") ? "private readonly chatService: ChatService," : ""}
    ${options.features.includes("notifications") ? "private readonly notificationService: NotificationService," : ""}
    ${options.features.includes("presence") ? "private readonly presenceService: PresenceService," : ""}
  ) {}

  setServer(server: Server): void {
    this.server = server;
  }

  async authenticateSocket(socket: any): Promise<any> {
    try {
      ${
				options.authentication === "jwt"
					? `
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        throw new Error('No authentication token provided');
      }
      
      // Verify JWT token
      const user = await this.verifyJwtToken(token);
      return user;
      `
					: options.authentication === "session"
						? `
      const sessionId = socket.handshake.auth.sessionId;
      if (!sessionId) {
        throw new Error('No session ID provided');
      }
      
      // Verify session
      const user = await this.verifySession(sessionId);
      return user;
      `
						: `
      // No authentication required
      return { id: socket.id, anonymous: true };
      `
			}
    } catch (error) {
      this.logger.error('Socket authentication failed:', error);
      return null;
    }
  }

  ${
		options.authentication === "jwt"
			? `
  private async verifyJwtToken(token: string): Promise<any> {
    // Implement JWT verification logic
    // This should integrate with your auth service
    return { id: 'user-id', email: 'user@example.com' };
  }
  `
			: ""
	}

  ${
		options.authentication === "session"
			? `
  private async verifySession(sessionId: string): Promise<any> {
    // Implement session verification logic
    return { id: 'user-id', email: 'user@example.com' };
  }
  `
			: ""
	}

  async onClientConnect(client: AuthenticatedSocket): Promise<void> {
    this.connectedClients.set(client.id, client);
    
    ${
			options.features.includes("presence")
				? `
    // Update user presence
    if (client.user && !client.user.anonymous) {
      await this.presenceService.setUserOnline(client.user.id, client.id);
      
      // Broadcast presence update
      this.server.emit('presence:update', {
        userId: client.user.id,
        status: 'online',
        timestamp: new Date().toISOString(),
      });
    }
    `
				: ""
		}
    
    this.logger.log(\`Client \${client.id} connected successfully\`);
  }

  async onClientDisconnect(client: AuthenticatedSocket): Promise<void> {
    this.connectedClients.delete(client.id);
    
    ${
			options.features.includes("presence")
				? `
    // Update user presence
    if (client.user && !client.user.anonymous) {
      await this.presenceService.setUserOffline(client.user.id, client.id);
      
      // Broadcast presence update
      this.server.emit('presence:update', {
        userId: client.user.id,
        status: 'offline',
        timestamp: new Date().toISOString(),
      });
    }
    `
				: ""
		}
    
    this.logger.log(\`Client \${client.id} disconnected\`);
  }

  async handleMessage(
    data: WebSocketMessage,
    client: AuthenticatedSocket,
  ): Promise<WebSocketResponse> {
    try {
      // Process the message based on type
      switch (data.type) {
        case 'ping':
          return {
            success: true,
            data: { type: 'pong', timestamp: new Date().toISOString() },
            timestamp: new Date().toISOString(),
          };
        
        case 'echo':
          return {
            success: true,
            data: { ...data, echo: true },
            timestamp: new Date().toISOString(),
          };
        
        default:
          throw new Error(\`Unknown message type: \${data.type}\`);
      }
    } catch (error) {
      this.logger.error('Message handling error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  ${
		options.features.includes("chat")
			? `
  async handleChatMessage(
    data: { roomId: string; message: string; type?: 'text' | 'image' | 'file' },
    client: AuthenticatedSocket,
  ): Promise<void> {
    const message = await this.chatService.createMessage({
      roomId: data.roomId,
      senderId: client.user.id,
      content: data.message,
      type: data.type || 'text',
    });

    // Broadcast to room
    this.server.to(data.roomId).emit('chat:message', message);
  }

  async joinChatRoom(roomId: string, client: AuthenticatedSocket): Promise<void> {
    await client.join(roomId);
    
    // Notify room members
    client.to(roomId).emit('chat:user-joined', {
      userId: client.user.id,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }

  async leaveChatRoom(roomId: string, client: AuthenticatedSocket): Promise<void> {
    await client.leave(roomId);
    
    // Notify room members
    client.to(roomId).emit('chat:user-left', {
      userId: client.user.id,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }
  `
			: ""
	}

  ${
		options.features.includes("typing-indicators")
			? `
  async handleTypingStart(roomId: string, client: AuthenticatedSocket): Promise<void> {
    client.to(roomId).emit('typing:start', {
      userId: client.user.id,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }

  async handleTypingStop(roomId: string, client: AuthenticatedSocket): Promise<void> {
    client.to(roomId).emit('typing:stop', {
      userId: client.user.id,
      roomId,
      timestamp: new Date().toISOString(),
    });
  }
  `
			: ""
	}

  ${
		options.features.includes("presence")
			? `
  async updatePresence(
    client: AuthenticatedSocket,
    status: 'online' | 'away' | 'busy' | 'offline',
  ): Promise<void> {
    if (client.user && !client.user.anonymous) {
      await this.presenceService.updateUserStatus(client.user.id, status);
      
      // Broadcast status update
      this.server.emit('presence:update', {
        userId: client.user.id,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }
  `
			: ""
	}

  ${
		options.features.includes("live-updates")
			? `
  async subscribeToUpdates(client: AuthenticatedSocket, channels: string[]): Promise<void> {
    for (const channel of channels) {
      await client.join(\`updates_\${channel}\`);
    }
    
    client.emit('subscribed:updates', {
      channels,
      timestamp: new Date().toISOString(),
    });
  }

  async unsubscribeFromUpdates(client: AuthenticatedSocket, channels: string[]): Promise<void> {
    for (const channel of channels) {
      await client.leave(\`updates_\${channel}\`);
    }
    
    client.emit('unsubscribed:updates', {
      channels,
      timestamp: new Date().toISOString(),
    });
  }

  async broadcastUpdate(channel: string, data: any): Promise<void> {
    this.server.to(\`updates_\${channel}\`).emit('live:update', {
      channel,
      data,
      timestamp: new Date().toISOString(),
    });
  }
  `
			: ""
	}

  ${
		options.features.includes("notifications")
			? `
  async sendNotification(userId: string, notification: any): Promise<void> {
    // Find user's connected sockets
    const userSockets = Array.from(this.connectedClients.values())
      .filter(client => client.user && client.user.id === userId);
    
    for (const socket of userSockets) {
      socket.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async broadcastNotification(notification: any): Promise<void> {
    this.server.emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }
  `
			: ""
	}

  // Utility methods
  getConnectedClients(): Map<string, AuthenticatedSocket> {
    return this.connectedClients;
  }

  getClientCount(): number {
    return this.connectedClients.size;
  }

  async disconnectUser(userId: string): Promise<void> {
    const userSockets = Array.from(this.connectedClients.values())
      .filter(client => client.user && client.user.id === userId);
    
    for (const socket of userSockets) {
      socket.disconnect(true);
    }
  }
}`;

		return {
			path: `${options.name}/src/websocket/websocket.service.ts`,
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateFeatureImplementation(
		feature: WebSocketFeature,
		options: WebSocketOptions,
	): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		switch (feature) {
			case "chat":
				files.push(...this.generateChatService(options));
				break;
			case "notifications":
				files.push(...this.generateNotificationService(options));
				break;
			case "presence":
				files.push(...this.generatePresenceService(options));
				break;
			case "file-sharing":
				files.push(...this.generateFileSharingService(options));
				break;
		}

		return files;
	}

	private generateChatService(options: WebSocketOptions): GeneratedFile[] {
		const chatService = `import { Injectable, Logger } from '@nestjs/common';
${options.scaling === "redis" ? "import { RedisService } from '../../redis/redis.service';" : ""}

export interface ChatMessage {
  readonly id: string;
  readonly roomId: string;
  readonly senderId: string;
  readonly content: string;
  readonly type: 'text' | 'image' | 'file';
  readonly timestamp: string;
  readonly metadata?: Record<string, any>;
}

export interface ChatRoom {
  readonly id: string;
  readonly name: string;
  readonly type: 'public' | 'private' | 'direct';
  readonly participants: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly messages = new Map<string, ChatMessage[]>();
  private readonly rooms = new Map<string, ChatRoom>();

  constructor(
    ${options.scaling === "redis" ? "private readonly redisService: RedisService," : ""}
  ) {}

  async createMessage(data: {
    roomId: string;
    senderId: string;
    content: string;
    type?: 'text' | 'image' | 'file';
    metadata?: Record<string, any>;
  }): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.generateId(),
      roomId: data.roomId,
      senderId: data.senderId,
      content: data.content,
      type: data.type || 'text',
      timestamp: new Date().toISOString(),
      metadata: data.metadata,
    };

    ${
			options.scaling === "redis"
				? `
    // Store in Redis
    await this.redisService.hset(
      \`chat:messages:\${data.roomId}\`,
      message.id,
      JSON.stringify(message)
    );
    
    // Add to sorted set for ordering
    await this.redisService.zadd(
      \`chat:timeline:\${data.roomId}\`,
      Date.now(),
      message.id
    );
    `
				: `
    // Store in memory
    if (!this.messages.has(data.roomId)) {
      this.messages.set(data.roomId, []);
    }
    this.messages.get(data.roomId)!.push(message);
    `
		}

    this.logger.log(\`Message created in room \${data.roomId}\`);
    return message;
  }

  async getMessages(roomId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
    ${
			options.scaling === "redis"
				? `
    // Get message IDs from sorted set
    const messageIds = await this.redisService.zrevrange(
      \`chat:timeline:\${roomId}\`,
      offset,
      offset + limit - 1
    );
    
    if (messageIds.length === 0) {
      return [];
    }
    
    // Get message data
    const messages = await this.redisService.hmget(
      \`chat:messages:\${roomId}\`,
      ...messageIds
    );
    
    return messages
      .filter(Boolean)
      .map(msg => JSON.parse(msg));
    `
				: `
    const roomMessages = this.messages.get(roomId) || [];
    return roomMessages
      .slice(offset, offset + limit)
      .reverse();
    `
		}
  }

  async createRoom(data: {
    name: string;
    type: 'public' | 'private' | 'direct';
    participants: string[];
  }): Promise<ChatRoom> {
    const room: ChatRoom = {
      id: this.generateId(),
      name: data.name,
      type: data.type,
      participants: data.participants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    ${
			options.scaling === "redis"
				? `
    await this.redisService.hset(
      'chat:rooms',
      room.id,
      JSON.stringify(room)
    );
    
    // Index participants
    for (const participantId of data.participants) {
      await this.redisService.sadd(
        \`chat:user_rooms:\${participantId}\`,
        room.id
      );
    }
    `
				: `
    this.rooms.set(room.id, room);
    `
		}

    this.logger.log(\`Chat room created: \${room.id}\`);
    return room;
  }

  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    ${
			options.scaling === "redis"
				? `
    const roomIds = await this.redisService.smembers(\`chat:user_rooms:\${userId}\`);
    
    if (roomIds.length === 0) {
      return [];
    }
    
    const rooms = await this.redisService.hmget('chat:rooms', ...roomIds);
    
    return rooms
      .filter(Boolean)
      .map(room => JSON.parse(room));
    `
				: `
    return Array.from(this.rooms.values())
      .filter(room => room.participants.includes(userId));
    `
		}
  }

  async joinRoom(roomId: string, userId: string): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    const roomData = await this.redisService.hget('chat:rooms', roomId);
    if (!roomData) {
      throw new Error('Room not found');
    }
    
    const room = JSON.parse(roomData);
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      room.updatedAt = new Date().toISOString();
      
      await this.redisService.hset('chat:rooms', roomId, JSON.stringify(room));
      await this.redisService.sadd(\`chat:user_rooms:\${userId}\`, roomId);
    }
    `
				: `
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
    }
    `
		}
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    const roomData = await this.redisService.hget('chat:rooms', roomId);
    if (!roomData) {
      throw new Error('Room not found');
    }
    
    const room = JSON.parse(roomData);
    room.participants = room.participants.filter(id => id !== userId);
    room.updatedAt = new Date().toISOString();
    
    await this.redisService.hset('chat:rooms', roomId, JSON.stringify(room));
    await this.redisService.srem(\`chat:user_rooms:\${userId}\`, roomId);
    `
				: `
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(id => id !== userId);
    }
    `
		}
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}`;

		return [
			{
				path: `${options.name}/src/websocket/services/chat.service.ts`,
				content: chatService,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateNotificationService(
		options: WebSocketOptions,
	): GeneratedFile[] {
		const notificationService = `import { Injectable, Logger } from '@nestjs/common';
${options.scaling === "redis" ? "import { RedisService } from '../../redis/redis.service';" : ""}

export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly type: 'info' | 'warning' | 'error' | 'success';
  readonly title: string;
  readonly message: string;
  readonly data?: Record<string, any>;
  readonly read: boolean;
  readonly createdAt: string;
  readonly expiresAt?: string;
}

export interface NotificationPreferences {
  readonly userId: string;
  readonly enablePush: boolean;
  readonly enableEmail: boolean;
  readonly enableSms: boolean;
  readonly categories: Record<string, boolean>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly notifications = new Map<string, Notification[]>();
  private readonly preferences = new Map<string, NotificationPreferences>();

  constructor(
    ${options.scaling === "redis" ? "private readonly redisService: RedisService," : ""}
  ) {}

  async createNotification(data: {
    userId: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    data?: Record<string, any>;
    expiresAt?: Date;
  }): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      read: false,
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt?.toISOString(),
    };

    ${
			options.scaling === "redis"
				? `
    // Store in Redis
    await this.redisService.hset(
      \`notifications:\${data.userId}\`,
      notification.id,
      JSON.stringify(notification)
    );
    
    // Add to sorted set for ordering
    await this.redisService.zadd(
      \`notifications:timeline:\${data.userId}\`,
      Date.now(),
      notification.id
    );
    
    // Set expiration if specified
    if (data.expiresAt) {
      await this.redisService.expireat(
        \`notifications:\${data.userId}:\${notification.id}\`,
        Math.floor(data.expiresAt.getTime() / 1000)
      );
    }
    `
				: `
    // Store in memory
    if (!this.notifications.has(data.userId)) {
      this.notifications.set(data.userId, []);
    }
    this.notifications.get(data.userId)!.push(notification);
    `
		}

    this.logger.log(\`Notification created for user \${data.userId}\`);
    return notification;
  }

  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
    } = {}
  ): Promise<Notification[]> {
    const { limit = 50, offset = 0, unreadOnly = false } = options;

    ${
			options.scaling === "redis"
				? `
    // Get notification IDs from sorted set
    const notificationIds = await this.redisService.zrevrange(
      \`notifications:timeline:\${userId}\`,
      offset,
      offset + limit - 1
    );
    
    if (notificationIds.length === 0) {
      return [];
    }
    
    // Get notification data
    const notifications = await this.redisService.hmget(
      \`notifications:\${userId}\`,
      ...notificationIds
    );
    
    let result = notifications
      .filter(Boolean)
      .map(notif => JSON.parse(notif));
    `
				: `
    let result = this.notifications.get(userId) || [];
    result = result.slice(offset, offset + limit);
    `
		}

    if (unreadOnly) {
      result = result.filter(notif => !notif.read);
    }

    return result;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    const notificationData = await this.redisService.hget(
      \`notifications:\${userId}\`,
      notificationId
    );
    
    if (notificationData) {
      const notification = JSON.parse(notificationData);
      notification.read = true;
      
      await this.redisService.hset(
        \`notifications:\${userId}\`,
        notificationId,
        JSON.stringify(notification)
      );
    }
    `
				: `
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      (notification as any).read = true;
    }
    `
		}
  }

  async markAllAsRead(userId: string): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    const notificationIds = await this.redisService.zrange(
      \`notifications:timeline:\${userId}\`,
      0,
      -1
    );
    
    for (const notificationId of notificationIds) {
      const notificationData = await this.redisService.hget(
        \`notifications:\${userId}\`,
        notificationId
      );
      
      if (notificationData) {
        const notification = JSON.parse(notificationData);
        notification.read = true;
        
        await this.redisService.hset(
          \`notifications:\${userId}\`,
          notificationId,
          JSON.stringify(notification)
        );
      }
    }
    `
				: `
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(notif => {
      (notif as any).read = true;
    });
    `
		}
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    await this.redisService.hdel(\`notifications:\${userId}\`, notificationId);
    await this.redisService.zrem(\`notifications:timeline:\${userId}\`, notificationId);
    `
				: `
    const userNotifications = this.notifications.get(userId) || [];
    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
    }
    `
		}
  }

  async getUnreadCount(userId: string): Promise<number> {
    ${
			options.scaling === "redis"
				? `
    const notificationIds = await this.redisService.zrange(
      \`notifications:timeline:\${userId}\`,
      0,
      -1
    );
    
    let unreadCount = 0;
    for (const notificationId of notificationIds) {
      const notificationData = await this.redisService.hget(
        \`notifications:\${userId}\`,
        notificationId
      );
      
      if (notificationData) {
        const notification = JSON.parse(notificationData);
        if (!notification.read) {
          unreadCount++;
        }
      }
    }
    
    return unreadCount;
    `
				: `
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(notif => !notif.read).length;
    `
		}
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const current = this.preferences.get(userId) || {
      userId,
      enablePush: true,
      enableEmail: true,
      enableSms: false,
      categories: {},
    };

    const updated = { ...current, ...preferences };
    this.preferences.set(userId, updated);

    ${
			options.scaling === "redis"
				? `
    await this.redisService.hset(
      'notification:preferences',
      userId,
      JSON.stringify(updated)
    );
    `
				: ""
		}

    return updated;
  }

  async getPreferences(userId: string): Promise<NotificationPreferences> {
    ${
			options.scaling === "redis"
				? `
    const data = await this.redisService.hget('notification:preferences', userId);
    if (data) {
      return JSON.parse(data);
    }
    `
				: ""
		}

    return this.preferences.get(userId) || {
      userId,
      enablePush: true,
      enableEmail: true,
      enableSms: false,
      categories: {},
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}`;

		return [
			{
				path: `${options.name}/src/websocket/services/notification.service.ts`,
				content: notificationService,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generatePresenceService(options: WebSocketOptions): GeneratedFile[] {
		const presenceService = `import { Injectable, Logger } from '@nestjs/common';
${options.scaling === "redis" ? "import { RedisService } from '../../redis/redis.service';" : ""}

export interface UserPresence {
  readonly userId: string;
  readonly status: 'online' | 'away' | 'busy' | 'offline';
  readonly lastSeen: string;
  readonly socketIds: string[];
  readonly metadata?: Record<string, any>;
}

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private readonly presence = new Map<string, UserPresence>();

  constructor(
    ${options.scaling === "redis" ? "private readonly redisService: RedisService," : ""}
  ) {}

  async setUserOnline(userId: string, socketId: string): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    const presenceKey = \`presence:\${userId}\`;
    const currentData = await this.redisService.hget('user:presence', userId);
    
    let presence: UserPresence;
    if (currentData) {
      presence = JSON.parse(currentData);
      if (!presence.socketIds.includes(socketId)) {
        presence.socketIds.push(socketId);
      }
    } else {
      presence = {
        userId,
        status: 'online',
        lastSeen: new Date().toISOString(),
        socketIds: [socketId],
      };
    }
    
    presence.status = 'online';
    presence.lastSeen = new Date().toISOString();
    
    await this.redisService.hset('user:presence', userId, JSON.stringify(presence));
    await this.redisService.sadd('online:users', userId);
    `
				: `
    let presence = this.presence.get(userId);
    if (presence) {
      if (!presence.socketIds.includes(socketId)) {
        presence.socketIds.push(socketId);
      }
    } else {
      presence = {
        userId,
        status: 'online',
        lastSeen: new Date().toISOString(),
        socketIds: [socketId],
      };
    }
    
    (presence as any).status = 'online';
    (presence as any).lastSeen = new Date().toISOString();
    this.presence.set(userId, presence);
    `
		}

    this.logger.log(\`User \${userId} is now online\`);
  }

  async setUserOffline(userId: string, socketId: string): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    const currentData = await this.redisService.hget('user:presence', userId);
    if (!currentData) return;
    
    const presence = JSON.parse(currentData);
    presence.socketIds = presence.socketIds.filter(id => id !== socketId);
    
    if (presence.socketIds.length === 0) {
      presence.status = 'offline';
      presence.lastSeen = new Date().toISOString();
      
      await this.redisService.srem('online:users', userId);
    }
    
    await this.redisService.hset('user:presence', userId, JSON.stringify(presence));
    `
				: `
    const presence = this.presence.get(userId);
    if (presence) {
      (presence as any).socketIds = presence.socketIds.filter(id => id !== socketId);
      
      if (presence.socketIds.length === 0) {
        (presence as any).status = 'offline';
        (presence as any).lastSeen = new Date().toISOString();
      }
      
      this.presence.set(userId, presence);
    }
    `
		}

    this.logger.log(\`User \${userId} socket \${socketId} disconnected\`);
  }

  async updateUserStatus(
    userId: string,
    status: 'online' | 'away' | 'busy' | 'offline'
  ): Promise<void> {
    ${
			options.scaling === "redis"
				? `
    const currentData = await this.redisService.hget('user:presence', userId);
    if (!currentData) return;
    
    const presence = JSON.parse(currentData);
    presence.status = status;
    presence.lastSeen = new Date().toISOString();
    
    await this.redisService.hset('user:presence', userId, JSON.stringify(presence));
    
    if (status === 'offline') {
      await this.redisService.srem('online:users', userId);
    } else {
      await this.redisService.sadd('online:users', userId);
    }
    `
				: `
    const presence = this.presence.get(userId);
    if (presence) {
      (presence as any).status = status;
      (presence as any).lastSeen = new Date().toISOString();
      this.presence.set(userId, presence);
    }
    `
		}
  }

  async getUserPresence(userId: string): Promise<UserPresence | null> {
    ${
			options.scaling === "redis"
				? `
    const data = await this.redisService.hget('user:presence', userId);
    return data ? JSON.parse(data) : null;
    `
				: `
    return this.presence.get(userId) || null;
    `
		}
  }

  async getOnlineUsers(): Promise<string[]> {
    ${
			options.scaling === "redis"
				? `
    return await this.redisService.smembers('online:users');
    `
				: `
    return Array.from(this.presence.entries())
      .filter(([_, presence]) => presence.status !== 'offline')
      .map(([userId, _]) => userId);
    `
		}
  }

  async getUsersByStatus(status: 'online' | 'away' | 'busy' | 'offline'): Promise<string[]> {
    ${
			options.scaling === "redis"
				? `
    const allUsers = await this.redisService.hkeys('user:presence');
    const usersWithStatus: string[] = [];
    
    for (const userId of allUsers) {
      const data = await this.redisService.hget('user:presence', userId);
      if (data) {
        const presence = JSON.parse(data);
        if (presence.status === status) {
          usersWithStatus.push(userId);
        }
      }
    }
    
    return usersWithStatus;
    `
				: `
    return Array.from(this.presence.entries())
      .filter(([_, presence]) => presence.status === status)
      .map(([userId, _]) => userId);
    `
		}
  }

  async cleanupOfflineUsers(olderThanMinutes = 30): Promise<void> {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    
    ${
			options.scaling === "redis"
				? `
    const allUsers = await this.redisService.hkeys('user:presence');
    
    for (const userId of allUsers) {
      const data = await this.redisService.hget('user:presence', userId);
      if (data) {
        const presence = JSON.parse(data);
        const lastSeen = new Date(presence.lastSeen);
        
        if (presence.status === 'offline' && lastSeen < cutoffTime) {
          await this.redisService.hdel('user:presence', userId);
          await this.redisService.srem('online:users', userId);
        }
      }
    }
    `
				: `
    for (const [userId, presence] of this.presence.entries()) {
      const lastSeen = new Date(presence.lastSeen);
      
      if (presence.status === 'offline' && lastSeen < cutoffTime) {
        this.presence.delete(userId);
      }
    }
    `
		}

    this.logger.log(\`Cleaned up offline users older than \${olderThanMinutes} minutes\`);
  }
}`;

		return [
			{
				path: `${options.name}/src/websocket/services/presence.service.ts`,
				content: presenceService,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateFileSharingService(
		options: WebSocketOptions,
	): GeneratedFile[] {
		const fileSharingService = `import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileTransfer {
  readonly id: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly mimeType: string;
  readonly senderId: string;
  readonly receiverId?: string;
  readonly roomId?: string;
  readonly chunks: number;
  readonly uploadedChunks: number;
  readonly status: 'pending' | 'uploading' | 'completed' | 'failed';
  readonly createdAt: string;
  readonly completedAt?: string;
}

export interface FileChunk {
  readonly transferId: string;
  readonly chunkIndex: number;
  readonly data: Buffer;
  readonly isLastChunk: boolean;
}

@Injectable()
export class FileSharingService {
  private readonly logger = new Logger(FileSharingService.name);
  private readonly transfers = new Map<string, FileTransfer>();
  private readonly uploadDirectory = './uploads';
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json',
    'application/zip',
  ];

  constructor() {
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDirectory);
    } catch {
      await fs.mkdir(this.uploadDirectory, { recursive: true });
    }
  }

  async initiateFileTransfer(data: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    senderId: string;
    receiverId?: string;
    roomId?: string;
    chunkSize?: number;
  }): Promise<FileTransfer> {
    // Validate file
    if (data.fileSize > this.maxFileSize) {
      throw new Error(\`File size exceeds maximum allowed size of \${this.maxFileSize} bytes\`);
    }

    if (!this.allowedMimeTypes.includes(data.mimeType)) {
      throw new Error(\`File type \${data.mimeType} is not allowed\`);
    }

    const chunkSize = data.chunkSize || 64 * 1024; // 64KB chunks
    const chunks = Math.ceil(data.fileSize / chunkSize);

    const transfer: FileTransfer = {
      id: uuidv4(),
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      senderId: data.senderId,
      receiverId: data.receiverId,
      roomId: data.roomId,
      chunks,
      uploadedChunks: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.transfers.set(transfer.id, transfer);
    
    // Create file path
    const filePath = path.join(this.uploadDirectory, \`\${transfer.id}_\${transfer.fileName}\`);
    
    // Create empty file
    await fs.writeFile(filePath, '');

    this.logger.log(\`File transfer initiated: \${transfer.id}\`);
    return transfer;
  }

  async uploadChunk(chunk: FileChunk): Promise<{ success: boolean; progress: number }> {
    const transfer = this.transfers.get(chunk.transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.status === 'completed' || transfer.status === 'failed') {
      throw new Error('Transfer is no longer active');
    }

    try {
      const filePath = path.join(this.uploadDirectory, \`\${transfer.id}_\${transfer.fileName}\`);
      
      // Append chunk to file
      const fileHandle = await fs.open(filePath, 'a');
      await fileHandle.write(chunk.data, 0, chunk.data.length, chunk.chunkIndex * 64 * 1024);
      await fileHandle.close();

      // Update transfer status
      (transfer as any).uploadedChunks++;
      (transfer as any).status = 'uploading';

      const progress = (transfer.uploadedChunks / transfer.chunks) * 100;

      if (chunk.isLastChunk || transfer.uploadedChunks === transfer.chunks) {
        (transfer as any).status = 'completed';
        (transfer as any).completedAt = new Date().toISOString();
        
        this.logger.log(\`File transfer completed: \${transfer.id}\`);
      }

      return { success: true, progress };
    } catch (error) {
      this.logger.error(\`Chunk upload failed for transfer \${chunk.transferId}:\`, error);
      (transfer as any).status = 'failed';
      throw error;
    }
  }

  async getFileTransfer(transferId: string): Promise<FileTransfer | null> {
    return this.transfers.get(transferId) || null;
  }

  async getFileStream(transferId: string): Promise<{ filePath: string; transfer: FileTransfer }> {
    const transfer = this.transfers.get(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    if (transfer.status !== 'completed') {
      throw new Error('File transfer is not completed');
    }

    const filePath = path.join(this.uploadDirectory, \`\${transfer.id}_\${transfer.fileName}\`);
    
    try {
      await fs.access(filePath);
      return { filePath, transfer };
    } catch {
      throw new Error('File not found on disk');
    }
  }

  async deleteFile(transferId: string): Promise<void> {
    const transfer = this.transfers.get(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    const filePath = path.join(this.uploadDirectory, \`\${transfer.id}_\${transfer.fileName}\`);
    
    try {
      await fs.unlink(filePath);
      this.transfers.delete(transferId);
      this.logger.log(\`File deleted: \${transferId}\`);
    } catch (error) {
      this.logger.error(\`Failed to delete file \${transferId}:\`, error);
      throw error;
    }
  }

  async getUserTransfers(userId: string): Promise<FileTransfer[]> {
    return Array.from(this.transfers.values())
      .filter(transfer => 
        transfer.senderId === userId || transfer.receiverId === userId
      );
  }

  async getRoomTransfers(roomId: string): Promise<FileTransfer[]> {
    return Array.from(this.transfers.values())
      .filter(transfer => transfer.roomId === roomId);
  }

  async cleanupExpiredTransfers(olderThanHours = 24): Promise<void> {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const expiredTransfers: string[] = [];

    for (const [transferId, transfer] of this.transfers.entries()) {
      const createdAt = new Date(transfer.createdAt);
      
      if (createdAt < cutoffTime) {
        expiredTransfers.push(transferId);
      }
    }

    for (const transferId of expiredTransfers) {
      try {
        await this.deleteFile(transferId);
      } catch (error) {
        this.logger.error(\`Failed to cleanup expired transfer \${transferId}:\`, error);
      }
    }

    this.logger.log(\`Cleaned up \${expiredTransfers.length} expired file transfers\`);
  }

  getTransferStats(): {
    totalTransfers: number;
    activeTransfers: number;
    completedTransfers: number;
    failedTransfers: number;
  } {
    const transfers = Array.from(this.transfers.values());
    
    return {
      totalTransfers: transfers.length,
      activeTransfers: transfers.filter(t => t.status === 'uploading' || t.status === 'pending').length,
      completedTransfers: transfers.filter(t => t.status === 'completed').length,
      failedTransfers: transfers.filter(t => t.status === 'failed').length,
    };
  }
}`;

		return [
			{
				path: `${options.name}/src/websocket/services/file-sharing.service.ts`,
				content: fileSharingService,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateRedisScaling(options: WebSocketOptions): GeneratedFile[] {
		const redisAdapter = `import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { INestApplication } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ 
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}`;

		const redisModule = `import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}`;

		const redisService = `import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  // String operations
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return this.client.expire(key, seconds);
  }

  async expireat(key: string, timestamp: number): Promise<boolean> {
    return this.client.expireAt(key, timestamp);
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hSet(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | undefined> {
    return this.client.hGet(key, field);
  }

  async hmget(key: string, ...fields: string[]): Promise<(string | undefined)[]> {
    return this.client.hmGet(key, fields);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.client.hDel(key, field);
  }

  async hkeys(key: string): Promise<string[]> {
    return this.client.hKeys(key);
  }

  async hvals(key: string): Promise<string[]> {
    return this.client.hVals(key);
  }

  // Set operations
  async sadd(key: string, member: string): Promise<number> {
    return this.client.sAdd(key, member);
  }

  async srem(key: string, member: string): Promise<number> {
    return this.client.sRem(key, member);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.sMembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return this.client.sIsMember(key, member);
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.client.zAdd(key, { score, value: member });
  }

  async zrem(key: string, member: string): Promise<number> {
    return this.client.zRem(key, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zRange(key, start, stop);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zRevRange(key, start, stop);
  }

  async zcard(key: string): Promise<number> {
    return this.client.zCard(key);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  // List operations
  async lpush(key: string, element: string): Promise<number> {
    return this.client.lPush(key, element);
  }

  async rpush(key: string, element: string): Promise<number> {
    return this.client.rPush(key, element);
  }

  async lpop(key: string): Promise<string | null> {
    return this.client.lPop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.client.rPop(key);
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lRange(key, start, stop);
  }

  async llen(key: string): Promise<number> {
    return this.client.lLen(key);
  }

  // Generic operations
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async flushall(): Promise<string> {
    return this.client.flushAll();
  }

  // Pipeline operations
  pipeline(): any {
    return this.client.multi();
  }
}`;

		return [
			{
				path: `${options.name}/src/websocket/adapters/redis-io.adapter.ts`,
				content: redisAdapter,
				type: "source",
				language: "typescript",
			},
			{
				path: `${options.name}/src/redis/redis.module.ts`,
				content: redisModule,
				type: "source",
				language: "typescript",
			},
			{
				path: `${options.name}/src/redis/redis.service.ts`,
				content: redisService,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateClusterScaling(options: WebSocketOptions): GeneratedFile[] {
		const clusterAdapter = `import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/cluster-adapter';
import { setupMaster, setupWorker } from '@socket.io/sticky';
import cluster from 'cluster';
import { INestApplication } from '@nestjs/common';

export class ClusterIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    if (cluster.isMaster) {
      // Setup master process
      setupMaster({
        port,
        ...options,
      });
      
      return null; // Master doesn't create server
    } else {
      // Setup worker process
      const server = super.createIOServer(port, {
        ...options,
        adapter: createAdapter(),
      });
      
      setupWorker(server);
      return server;
    }
  }
}`;

		const clusterSetup = `import cluster from 'cluster';
import { cpus } from 'os';
import { Logger } from '@nestjs/common';

const logger = new Logger('Cluster');

export function setupCluster(): void {
  if (cluster.isMaster) {
    const numCPUs = cpus().length;
    logger.log(\`Master process \${process.pid} is running\`);
    logger.log(\`Forking \${numCPUs} workers\`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      logger.warn(
        \`Worker \${worker.process.pid} died with code \${code} and signal \${signal}\`
      );
      logger.log('Starting a new worker');
      cluster.fork();
    });

    cluster.on('online', (worker) => {
      logger.log(\`Worker \${worker.process.pid} is online\`);
    });
  }
}`;

		return [
			{
				path: `${options.name}/src/websocket/adapters/cluster-io.adapter.ts`,
				content: clusterAdapter,
				type: "source",
				language: "typescript",
			},
			{
				path: `${options.name}/src/cluster/cluster.setup.ts`,
				content: clusterSetup,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateSecurityMiddleware(
		options: WebSocketOptions,
	): GeneratedFile[] {
		const rateLimitGuard = `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
${options.scaling === "redis" ? "import { RedisService } from '../../redis/redis.service';" : ""}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
	private readonly windowMs: number;
	private readonly maxRequests: number;
	private readonly store = new Map<string, RateLimitEntry>();

	constructor(
		${options.scaling === "redis" ? "private readonly redisService?: RedisService," : ""}
	) {
		this.windowMs = ${options.security?.rateLimit?.windowMs || 60000}; // 1 minute
		this.maxRequests = ${options.security?.rateLimit?.maxRequests || 100}; // 100 requests per window
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs().getClient<Socket>();
		const key = this.getClientKey(client);
		
		${
			options.scaling === "redis"
				? `
		if (this.redisService) {
			return this.checkRateLimitRedis(key);
		}
		`
				: ""
		}
		
		return this.checkRateLimitMemory(key);
	}

	private getClientKey(client: Socket): string {
		// Use IP address and user ID if available
		const ip = client.handshake.address;
		const userId = (client as any).user?.id;
		return userId ? \`user:\${userId}\` : \`ip:\${ip}\`;
	}

	${
		options.scaling === "redis"
			? `
	private async checkRateLimitRedis(key: string): Promise<boolean> {
		const redisKey = \`rate_limit:\${key}\`;
		const current = await this.redisService!.get(redisKey);
		const now = Date.now();
		
		if (!current) {
			// First request
			await this.redisService!.set(redisKey, '1', Math.ceil(this.windowMs / 1000));
			return true;
		}
		
		const count = parseInt(current, 10);
		
		if (count >= this.maxRequests) {
			return false;
		}
		
		// Increment counter
		await this.redisService!.set(
			redisKey,
			(count + 1).toString(),
			Math.ceil(this.windowMs / 1000)
		);
		
		return true;
	}
	`
			: ""
	}

	private checkRateLimitMemory(key: string): boolean {
		const now = Date.now();
		const entry = this.store.get(key);
		
		if (!entry || now > entry.resetTime) {
			// First request or window expired
			this.store.set(key, {
				count: 1,
				resetTime: now + this.windowMs,
			});
			return true;
		}
		
		if (entry.count >= this.maxRequests) {
			return false;
		}
		
		// Increment counter
		entry.count++;
		return true;
	}

	// Cleanup expired entries periodically
	private cleanupExpiredEntries(): void {
		const now = Date.now();
		
		for (const [key, entry] of this.store.entries()) {
			if (now > entry.resetTime) {
				this.store.delete(key);
			}
		}
	}
}`;

		const corsMiddleware = `import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class CorsMiddleware {
	private readonly allowedOrigins: string[];

	constructor() {
		this.allowedOrigins = ${JSON.stringify(options.security?.cors || ["http://localhost:3000"])};
	}

	validate(socket: Socket): boolean {
		const origin = socket.handshake.headers.origin;
		
		if (!origin) {
			return false;
		}
		
		// Check if origin is allowed
		if (this.allowedOrigins.includes('*')) {
			return true;
		}
		
		return this.allowedOrigins.includes(origin);
	}

	middleware() {
		return (socket: Socket, next: (err?: Error) => void) => {
			if (this.validate(socket)) {
				next();
			} else {
				next(new Error('CORS: Origin not allowed'));
			}
		};
	}
}`;

		return [
			{
				path: `${options.name}/src/websocket/guards/rate-limit.guard.ts`,
				content: rateLimitGuard,
				type: "source",
				language: "typescript",
			},
			{
				path: `${options.name}/src/websocket/middleware/cors.middleware.ts`,
				content: corsMiddleware,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateTypes(options: WebSocketOptions): GeneratedFile {
		const content = `import { Socket } from 'socket.io';

// Basic WebSocket message types
export interface WebSocketMessage {
	readonly type: string;
	readonly data?: any;
	readonly timestamp?: string;
	readonly id?: string;
}

export interface WebSocketResponse {
	readonly success: boolean;
	readonly data?: any;
	readonly error?: string;
	readonly timestamp: string;
}

// Authentication types
export interface User {
	readonly id: string;
	readonly email?: string;
	readonly name?: string;
	readonly role?: string;
	readonly anonymous?: boolean;
}

export interface AuthenticatedSocket extends Socket {
	user: User;
}

// Event types
export interface ClientEvents {
	message: (data: WebSocketMessage) => void;
	${
		options.features.includes("chat")
			? `
	'chat:send': (data: { roomId: string; message: string; type?: 'text' | 'image' | 'file' }) => void;
	'chat:join': (data: { roomId: string }) => void;
	'chat:leave': (data: { roomId: string }) => void;
	`
			: ""
	}
	${
		options.features.includes("typing-indicators")
			? `
	'typing:start': (data: { roomId: string }) => void;
	'typing:stop': (data: { roomId: string }) => void;
	`
			: ""
	}
	${
		options.features.includes("presence")
			? `
	'presence:update': (data: { status: 'online' | 'away' | 'busy' | 'offline' }) => void;
	`
			: ""
	}
	${
		options.features.includes("live-updates")
			? `
	'subscribe:updates': (data: { channels: string[] }) => void;
	'unsubscribe:updates': (data: { channels: string[] }) => void;
	`
			: ""
	}
	${
		options.features.includes("file-sharing")
			? `
	'file:upload-start': (data: { fileName: string; fileSize: number; mimeType: string }) => void;
	'file:upload-chunk': (data: { transferId: string; chunk: Buffer; chunkIndex: number; isLastChunk: boolean }) => void;
	'file:download': (data: { transferId: string }) => void;
	`
			: ""
	}
}

export interface ServerEvents {
	connected: (data: { clientId: string; timestamp: string }) => void;
	notification: (data: any) => void;
	${
		options.features.includes("chat")
			? `
	'chat:message': (data: any) => void;
	'chat:user-joined': (data: { userId: string; roomId: string; timestamp: string }) => void;
	'chat:user-left': (data: { userId: string; roomId: string; timestamp: string }) => void;
	`
			: ""
	}
	${
		options.features.includes("typing-indicators")
			? `
	'typing:start': (data: { userId: string; roomId: string; timestamp: string }) => void;
	'typing:stop': (data: { userId: string; roomId: string; timestamp: string }) => void;
	`
			: ""
	}
	${
		options.features.includes("presence")
			? `
	'presence:update': (data: { userId: string; status: string; timestamp: string }) => void;
	`
			: ""
	}
	${
		options.features.includes("live-updates")
			? `
	'subscribed:updates': (data: { channels: string[]; timestamp: string }) => void;
	'unsubscribed:updates': (data: { channels: string[]; timestamp: string }) => void;
	'live:update': (data: { channel: string; data: any; timestamp: string }) => void;
	`
			: ""
	}
	${
		options.features.includes("file-sharing")
			? `
	'file:upload-progress': (data: { transferId: string; progress: number }) => void;
	'file:upload-complete': (data: { transferId: string; fileUrl: string }) => void;
	'file:upload-error': (data: { transferId: string; error: string }) => void;
	`
			: ""
	}
}

// Feature-specific types
${
	options.features.includes("presence")
		? `
export interface UserPresence {
	readonly userId: string;
	readonly status: 'online' | 'away' | 'busy' | 'offline';
	readonly lastSeen: string;
	readonly socketIds: string[];
	readonly metadata?: Record<string, any>;
}
`
		: ""
}

${
	options.features.includes("chat")
		? `
export interface ChatRoom {
	readonly id: string;
	readonly name: string;
	readonly type: 'public' | 'private' | 'direct';
	readonly participants: string[];
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface ChatMessage {
	readonly id: string;
	readonly roomId: string;
	readonly senderId: string;
	readonly content: string;
	readonly type: 'text' | 'image' | 'file';
	readonly timestamp: string;
	readonly metadata?: Record<string, any>;
}
`
		: ""
}

${
	options.features.includes("notifications")
		? `
export interface Notification {
	readonly id: string;
	readonly userId: string;
	readonly type: 'info' | 'warning' | 'error' | 'success';
	readonly title: string;
	readonly message: string;
	readonly data?: Record<string, any>;
	readonly read: boolean;
	readonly createdAt: string;
	readonly expiresAt?: string;
}
`
		: ""
}

// Configuration types
export interface WebSocketConfig {
	readonly port: number;
	readonly cors: {
		readonly origin: string[];
		readonly credentials: boolean;
	};
	readonly rateLimit?: {
		readonly windowMs: number;
		readonly maxRequests: number;
	};
	readonly redis?: {
		readonly url: string;
		readonly keyPrefix?: string;
	};
	readonly cluster?: {
		readonly enabled: boolean;
		readonly workers?: number;
	};
}`;

		return {
			path: `${options.name}/src/websocket/types/websocket.types.ts`,
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateConfiguration(options: WebSocketOptions): GeneratedFile {
		const content = `import { WebSocketConfig } from './types/websocket.types';

export const websocketConfig: WebSocketConfig = {
	port: ${options.port || 3001},
	cors: {
		origin: ${JSON.stringify(options.security?.cors || ["http://localhost:3000"])},
		credentials: true,
	},
	${
		options.security?.rateLimit
			? `
	rateLimit: {
		windowMs: ${options.security.rateLimit.windowMs},
		maxRequests: ${options.security.rateLimit.maxRequests},
	},
	`
			: ""
	}
	${
		options.scaling === "redis"
			? `
	redis: {
		url: process.env.REDIS_URL || 'redis://localhost:6379',
		keyPrefix: 'websocket:',
	},
	`
			: ""
	}
	${
		options.scaling === "cluster"
			? `
	cluster: {
		enabled: true,
		workers: process.env.CLUSTER_WORKERS ? parseInt(process.env.CLUSTER_WORKERS) : undefined,
	},
	`
			: ""
	}
};

export const getWebSocketConfig = (): WebSocketConfig => {
	return {
		...websocketConfig,
		port: process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : websocketConfig.port,
	};
};`;

		return {
			path: `${options.name}/src/websocket/websocket.config.ts`,
			content,
			type: "source",
			language: "typescript",
		};
	}

	private generateClientUtils(options: WebSocketOptions): GeneratedFile[] {
		const clientTypes = `// Client-side TypeScript definitions
export interface WebSocketClientOptions {
	readonly url: string;
	readonly auth?: {
		readonly token?: string;
		readonly sessionId?: string;
	};
	readonly reconnection?: boolean;
	readonly reconnectionAttempts?: number;
	readonly reconnectionDelay?: number;
}

export interface WebSocketClient {
	connect(): Promise<void>;
	disconnect(): void;
	emit(event: string, data?: any): void;
	on(event: string, callback: (data: any) => void): void;
	off(event: string, callback?: (data: any) => void): void;
	isConnected(): boolean;
}`;

		const clientSDK = `import { io, Socket } from 'socket.io-client';
import { WebSocketClient, WebSocketClientOptions } from './client.types';

export class XaheenWebSocketClient implements WebSocketClient {
	private socket: Socket | null = null;
	private options: WebSocketClientOptions;
	private reconnectTimer: NodeJS.Timeout | null = null;
	private reconnectAttempts = 0;

	constructor(options: WebSocketClientOptions) {
		this.options = {
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			...options,
		};
	}

	async connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			const auth: any = {};
			
			if (this.options.auth?.token) {
				auth.token = this.options.auth.token;
			}
			
			if (this.options.auth?.sessionId) {
				auth.sessionId = this.options.auth.sessionId;
			}

			this.socket = io(this.options.url, {
				auth,
				transports: ['websocket', 'polling'],
				autoConnect: false,
			});

			this.socket.on('connect', () => {
				console.log('Connected to WebSocket server');
				this.reconnectAttempts = 0;
				resolve();
			});

			this.socket.on('disconnect', (reason) => {
				console.log('Disconnected from WebSocket server:', reason);
				
				if (this.options.reconnection && reason === 'io server disconnect') {
					this.scheduleReconnect();
				}
			});

			this.socket.on('connect_error', (error) => {
				console.error('Connection error:', error);
				
				if (this.options.reconnection) {
					this.scheduleReconnect();
				} else {
					reject(error);
				}
			});

			this.socket.connect();
		});
	}

	disconnect(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}

	emit(event: string, data?: any): void {
		if (!this.socket) {
			throw new Error('WebSocket not connected');
		}
		
		this.socket.emit(event, data);
	}

	on(event: string, callback: (data: any) => void): void {
		if (!this.socket) {
			throw new Error('WebSocket not connected');
		}
		
		this.socket.on(event, callback);
	}

	off(event: string, callback?: (data: any) => void): void {
		if (!this.socket) {
			throw new Error('WebSocket not connected');
		}
		
		if (callback) {
			this.socket.off(event, callback);
		} else {
			this.socket.off(event);
		}
	}

	isConnected(): boolean {
		return this.socket?.connected || false;
	}

	private scheduleReconnect(): void {
		if (this.reconnectAttempts >= (this.options.reconnectionAttempts || 5)) {
			console.error('Max reconnection attempts reached');
			return;
		}

		const delay = (this.options.reconnectionDelay || 1000) * Math.pow(2, this.reconnectAttempts);
		
		this.reconnectTimer = setTimeout(() => {
			console.log(\`Attempting to reconnect... (attempt \${this.reconnectAttempts + 1})\`);
			this.reconnectAttempts++;
			this.connect().catch(() => {
				// Reconnection will be scheduled again on connect_error
			});
		}, delay);
	}

	${
		options.features.includes("chat")
			? `
	// Chat methods
	sendChatMessage(roomId: string, message: string, type: 'text' | 'image' | 'file' = 'text'): void {
		this.emit('chat:send', { roomId, message, type });
	}

	joinChatRoom(roomId: string): void {
		this.emit('chat:join', { roomId });
	}

	leaveChatRoom(roomId: string): void {
		this.emit('chat:leave', { roomId });
	}

	onChatMessage(callback: (message: any) => void): void {
		this.on('chat:message', callback);
	}
	`
			: ""
	}

	${
		options.features.includes("presence")
			? `
	// Presence methods
	updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
		this.emit('presence:update', { status });
	}

	onPresenceUpdate(callback: (data: { userId: string; status: string; timestamp: string }) => void): void {
		this.on('presence:update', callback);
	}
	`
			: ""
	}

	${
		options.features.includes("notifications")
			? `
	// Notification methods
	onNotification(callback: (notification: any) => void): void {
		this.on('notification', callback);
	}
	`
			: ""
	}

	${
		options.features.includes("live-updates")
			? `
	// Live updates methods
	subscribeToUpdates(channels: string[]): void {
		this.emit('subscribe:updates', { channels });
	}

	unsubscribeFromUpdates(channels: string[]): void {
		this.emit('unsubscribe:updates', { channels });
	}

	onLiveUpdate(callback: (data: { channel: string; data: any; timestamp: string }) => void): void {
		this.on('live:update', callback);
	}
	`
			: ""
	}
}

// Factory function
export function createWebSocketClient(options: WebSocketClientOptions): XaheenWebSocketClient {
	return new XaheenWebSocketClient(options);
}`;

		const reactHook = `import { useEffect, useRef, useState } from 'react';
import { XaheenWebSocketClient, WebSocketClientOptions } from './websocket-client';

export interface UseWebSocketReturn {
	readonly client: XaheenWebSocketClient | null;
	readonly connected: boolean;
	readonly connecting: boolean;
	readonly error: Error | null;
	readonly connect: () => Promise<void>;
	readonly disconnect: () => void;
}

export function useWebSocket(options: WebSocketClientOptions): UseWebSocketReturn {
	const clientRef = useRef<XaheenWebSocketClient | null>(null);
	const [connected, setConnected] = useState(false);
	const [connecting, setConnecting] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!clientRef.current) {
			clientRef.current = new XaheenWebSocketClient(options);
		}

		const client = clientRef.current;

		client.on('connect', () => {
			setConnected(true);
			setConnecting(false);
			setError(null);
		});

		client.on('disconnect', () => {
			setConnected(false);
			setConnecting(false);
		});

		client.on('connect_error', (err: Error) => {
			setError(err);
			setConnecting(false);
		});

		return () => {
			client.disconnect();
		};
	}, []);

	const connect = async (): Promise<void> => {
		if (!clientRef.current) return;
		
		try {
			setConnecting(true);
			setError(null);
			await clientRef.current.connect();
		} catch (err) {
			setError(err as Error);
			setConnecting(false);
		}
	};

	const disconnect = (): void => {
		if (clientRef.current) {
			clientRef.current.disconnect();
		}
	};

	return {
		client: clientRef.current,
		connected,
		connecting,
		error,
		connect,
		disconnect,
	};
}

${
	options.features.includes("chat")
		? `
export interface UseChatReturn {
	readonly messages: any[];
	readonly sendMessage: (roomId: string, message: string, type?: 'text' | 'image' | 'file') => void;
	readonly joinRoom: (roomId: string) => void;
	readonly leaveRoom: (roomId: string) => void;
}

export function useChat(client: XaheenWebSocketClient | null): UseChatReturn {
	const [messages, setMessages] = useState<any[]>([]);

	useEffect(() => {
		if (!client) return;

		const handleMessage = (message: any) => {
			setMessages(prev => [...prev, message]);
		};

		client.onChatMessage(handleMessage);

		return () => {
			client.off('chat:message', handleMessage);
		};
	}, [client]);

	const sendMessage = (roomId: string, message: string, type: 'text' | 'image' | 'file' = 'text') => {
		if (client) {
			client.sendChatMessage(roomId, message, type);
		}
	};

	const joinRoom = (roomId: string) => {
		if (client) {
			client.joinChatRoom(roomId);
		}
	};

	const leaveRoom = (roomId: string) => {
		if (client) {
			client.leaveChatRoom(roomId);
		}
	};

	return {
		messages,
		sendMessage,
		joinRoom,
		leaveRoom,
	};
}
`
		: ""
}

${
	options.features.includes("presence")
		? `
export interface UsePresenceReturn {
	readonly status: string;
	readonly updateStatus: (status: 'online' | 'away' | 'busy' | 'offline') => void;
	readonly userPresence: Record<string, { status: string; timestamp: string }>;
}

export function usePresence(client: XaheenWebSocketClient | null): UsePresenceReturn {
	const [status, setStatus] = useState<string>('offline');
	const [userPresence, setUserPresence] = useState<Record<string, { status: string; timestamp: string }>>({});

	useEffect(() => {
		if (!client) return;

		const handlePresenceUpdate = (data: { userId: string; status: string; timestamp: string }) => {
			setUserPresence(prev => ({
				...prev,
				[data.userId]: {
					status: data.status,
					timestamp: data.timestamp,
				},
			}));
		};

		client.onPresenceUpdate(handlePresenceUpdate);

		return () => {
			client.off('presence:update', handlePresenceUpdate);
		};
	}, [client]);

	const updateStatus = (newStatus: 'online' | 'away' | 'busy' | 'offline') => {
		if (client) {
			client.updatePresence(newStatus);
			setStatus(newStatus);
		}
	};

	return {
		status,
		updateStatus,
		userPresence,
	};
}
`
		: ""
}`;

		return [
			{
				path: `${options.name}/src/websocket/client/client.types.ts`,
				content: clientTypes,
				type: "source",
				language: "typescript",
			},
			{
				path: `${options.name}/src/websocket/client/websocket-client.ts`,
				content: clientSDK,
				type: "source",
				language: "typescript",
			},
			{
				path: `${options.name}/src/websocket/client/react-hooks.ts`,
				content: reactHook,
				type: "source",
				language: "typescript",
			},
		];
	}

	private generateTestFiles(options: WebSocketOptions): GeneratedFile[] {
		const gatewayTest = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket, io as ioc } from 'socket.io-client';
import { WebSocketGateway } from '../websocket.gateway';
import { WebSocketService } from '../websocket.service';

describe('WebSocketGateway', () => {
	let app: INestApplication;
	let gateway: WebSocketGateway;
	let service: WebSocketService;
	let clientSocket: Socket;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				WebSocketGateway,
				{
					provide: WebSocketService,
					useValue: {
						setServer: jest.fn(),
						authenticateSocket: jest.fn().mockResolvedValue({ id: 'test-user', email: 'test@example.com' }),
						onClientConnect: jest.fn(),
						onClientDisconnect: jest.fn(),
						handleMessage: jest.fn().mockResolvedValue({ success: true, data: { type: 'pong' }, timestamp: new Date().toISOString() }),
						${
							options.features.includes("chat")
								? `
						handleChatMessage: jest.fn(),
						joinChatRoom: jest.fn(),
						leaveChatRoom: jest.fn(),
						`
								: ""
						}
					},
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		gateway = moduleFixture.get<WebSocketGateway>(WebSocketGateway);
		service = moduleFixture.get<WebSocketService>(WebSocketService);

		await app.listen(0);
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		const address = app.getHttpServer().address();
		const port = typeof address === 'string' ? 0 : address?.port || 0;
		
		clientSocket = ioc(\`http://localhost:\${port}\`, {
			autoConnect: false,
			transports: ['websocket'],
		});

		return new Promise<void>((resolve) => {
			clientSocket.connect();
			clientSocket.on('connect', resolve);
		});
	});

	afterEach(() => {
		if (clientSocket.connected) {
			clientSocket.disconnect();
		}
	});

	describe('Connection', () => {
		it('should connect successfully', (done) => {
			clientSocket.on('connected', (data) => {
				expect(data).toHaveProperty('clientId');
				expect(data).toHaveProperty('timestamp');
				done();
			});
		});

		it('should handle disconnection', (done) => {
			clientSocket.disconnect();
			
			setTimeout(() => {
				expect(service.onClientDisconnect).toHaveBeenCalled();
				done();
			}, 100);
		});
	});

	describe('Message Handling', () => {
		it('should handle ping message', (done) => {
			const testMessage = { type: 'ping', data: 'test' };
			
			clientSocket.emit('message', testMessage, (response: any) => {
				expect(response.success).toBe(true);
				expect(response.data.type).toBe('pong');
				done();
			});
		});

		it('should handle echo message', (done) => {
			const testMessage = { type: 'echo', data: 'hello world' };
			
			clientSocket.emit('message', testMessage, (response: any) => {
				expect(response.success).toBe(true);
				expect(response.data.echo).toBe(true);
				done();
			});
		});
	});

	${
		options.features.includes("chat")
			? `
	describe('Chat Features', () => {
		it('should handle chat message', (done) => {
			const chatData = { roomId: 'test-room', message: 'Hello, world!' };
			
			clientSocket.emit('chat:send', chatData);
			
			setTimeout(() => {
				expect(service.handleChatMessage).toHaveBeenCalledWith(chatData, expect.any(Object));
				done();
			}, 100);
		});

		it('should join chat room', (done) => {
			const roomData = { roomId: 'test-room' };
			
			clientSocket.emit('chat:join', roomData);
			
			setTimeout(() => {
				expect(service.joinChatRoom).toHaveBeenCalledWith('test-room', expect.any(Object));
				done();
			}, 100);
		});
	});
	`
			: ""
	}
});`;

		const serviceTest = `import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketService } from '../websocket.service';
${options.scaling === "redis" ? "import { RedisService } from '../../redis/redis.service';" : ""}

describe('WebSocketService', () => {
	let service: WebSocketService;
	${options.scaling === "redis" ? "let redisService: RedisService;" : ""}

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				WebSocketService,
				${
					options.scaling === "redis"
						? `
				{
					provide: RedisService,
					useValue: {
						set: jest.fn(),
						get: jest.fn(),
						del: jest.fn(),
						hset: jest.fn(),
						hget: jest.fn(),
					},
				},
				`
						: ""
				}
			],
		}).compile();

		service = module.get<WebSocketService>(WebSocketService);
		${options.scaling === "redis" ? "redisService = module.get<RedisService>(RedisService);" : ""}
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('Authentication', () => {
		it('should authenticate socket with valid token', async () => {
			const mockSocket = {
				handshake: {
					auth: { token: 'valid-token' },
					headers: {},
				},
			};

			const user = await service.authenticateSocket(mockSocket);
			
			${
				options.authentication === "jwt"
					? `
			expect(user).toBeDefined();
			expect(user.id).toBeDefined();
			`
					: options.authentication === "none"
						? `
			expect(user).toEqual({ id: mockSocket.id, anonymous: true });
			`
						: ""
			}
		});

		it('should reject socket with invalid token', async () => {
			const mockSocket = {
				handshake: {
					auth: {},
					headers: {},
				},
			};

			const user = await service.authenticateSocket(mockSocket);
			
			${
				options.authentication !== "none"
					? `
			expect(user).toBeNull();
			`
					: `
			expect(user).toBeDefined();
			`
			}
		});
	});

	describe('Message Handling', () => {
		const mockClient = {
			id: 'test-client',
			user: { id: 'test-user', email: 'test@example.com' },
		};

		it('should handle ping message', async () => {
			const message = { type: 'ping' };
			const response = await service.handleMessage(message, mockClient as any);
			
			expect(response.success).toBe(true);
			expect(response.data.type).toBe('pong');
		});

		it('should handle echo message', async () => {
			const message = { type: 'echo', data: 'test-data' };
			const response = await service.handleMessage(message, mockClient as any);
			
			expect(response.success).toBe(true);
			expect(response.data.echo).toBe(true);
			expect(response.data.data).toBe('test-data');
		});

		it('should handle unknown message type', async () => {
			const message = { type: 'unknown' };
			const response = await service.handleMessage(message, mockClient as any);
			
			expect(response.success).toBe(false);
			expect(response.error).toContain('Unknown message type');
		});
	});

	describe('Client Management', () => {
		const mockClient = {
			id: 'test-client',
			user: { id: 'test-user', email: 'test@example.com' },
			join: jest.fn(),
			emit: jest.fn(),
		};

		it('should track connected clients', async () => {
			await service.onClientConnect(mockClient as any);
			
			expect(service.getConnectedClients().has('test-client')).toBe(true);
			expect(service.getClientCount()).toBe(1);
		});

		it('should remove disconnected clients', async () => {
			await service.onClientConnect(mockClient as any);
			await service.onClientDisconnect(mockClient as any);
			
			expect(service.getConnectedClients().has('test-client')).toBe(false);
			expect(service.getClientCount()).toBe(0);
		});
	});
});`;

		const e2eTest = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Socket, io as ioc } from 'socket.io-client';
import { WebSocketModule } from '../websocket.module';

describe('WebSocket E2E', () => {
	let app: INestApplication;
	let clientSocket: Socket;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [WebSocketModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.listen(0);
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		const address = app.getHttpServer().address();
		const port = typeof address === 'string' ? 0 : address?.port || 0;
		
		clientSocket = ioc(\`http://localhost:\${port}\`, {
			autoConnect: false,
			transports: ['websocket'],
		});

		return new Promise<void>((resolve) => {
			clientSocket.connect();
			clientSocket.on('connect', resolve);
		});
	});

	afterEach(() => {
		if (clientSocket.connected) {
			clientSocket.disconnect();
		}
	});

	it('should establish connection', (done) => {
		clientSocket.on('connected', (data) => {
			expect(data).toHaveProperty('clientId');
			expect(data).toHaveProperty('timestamp');
			done();
		});
	});

	it('should handle rate limiting', (done) => {
		let messageCount = 0;
		const maxMessages = 10; // Adjust based on rate limit settings

		const sendMessage = () => {
			if (messageCount < maxMessages + 5) { // Send more than allowed
				clientSocket.emit('message', { type: 'ping' });
				messageCount++;
				setTimeout(sendMessage, 10);
			}
		};

		clientSocket.on('disconnect', (reason) => {
			if (reason === 'server-side disconnect') {
				// Rate limit exceeded
				expect(messageCount).toBeGreaterThan(maxMessages);
				done();
			}
		});

		sendMessage();
	});

	${
		options.features.includes("chat")
			? `
	it('should handle chat flow', (done) => {
		const roomId = 'test-room';
		const message = 'Hello, WebSocket!';

		// Join room
		clientSocket.emit('chat:join', { roomId });

		// Listen for chat messages
		clientSocket.on('chat:message', (data) => {
			expect(data.content).toBe(message);
			expect(data.roomId).toBe(roomId);
			done();
		});

		// Send message after joining
		setTimeout(() => {
			clientSocket.emit('chat:send', { roomId, message });
		}, 100);
	});
	`
			: ""
	}

	${
		options.features.includes("presence")
			? `
	it('should handle presence updates', (done) => {
		clientSocket.on('presence:update', (data) => {
			expect(data).toHaveProperty('userId');
			expect(data).toHaveProperty('status');
			expect(data).toHaveProperty('timestamp');
			done();
		});

		clientSocket.emit('presence:update', { status: 'online' });
	});
	`
			: ""
	}
});`;

		return [
			{
				path: `${options.name}/test/websocket/websocket.gateway.spec.ts`,
				content: gatewayTest,
				type: "test",
				language: "typescript",
			},
			{
				path: `${options.name}/test/websocket/websocket.service.spec.ts`,
				content: serviceTest,
				type: "test",
				language: "typescript",
			},
			{
				path: `${options.name}/test/websocket/websocket.e2e-spec.ts`,
				content: e2eTest,
				type: "test",
				language: "typescript",
			},
		];
	}
}
