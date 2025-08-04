/**
 * gRPC Service Generator
 * Generates gRPC service definitions and implementations
 */

import type { GeneratedFile, MicroserviceOptions } from "./types.js";

export class GrpcGenerator {
	async generate(options: MicroserviceOptions): Promise<GeneratedFile[]> {
		const files: GeneratedFile[] = [];

		// Generate proto file
		files.push(this.generateProtoFile(options));

		// Generate gRPC server implementation
		files.push(...this.generateGrpcServer(options));

		// Generate gRPC client
		files.push(this.generateGrpcClient(options));

		// Generate gRPC configuration
		files.push(this.generateGrpcConfig(options));

		return files;
	}

	private generateProtoFile(options: MicroserviceOptions): GeneratedFile {
		const content = `syntax = "proto3";

package ${options.name};

option go_package = "github.com/${options.name}/proto";

// Service definition
service ${this.capitalize(options.name)}Service {
  // Health check
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  
  // Get service info
  rpc GetInfo(Empty) returns (ServiceInfo);
  
  // Create resource
  rpc Create(CreateRequest) returns (CreateResponse);
  
  // Get resource
  rpc Get(GetRequest) returns (GetResponse);
  
  // Update resource
  rpc Update(UpdateRequest) returns (UpdateResponse);
  
  // Delete resource
  rpc Delete(DeleteRequest) returns (DeleteResponse);
  
  // List resources
  rpc List(ListRequest) returns (ListResponse);
  
  // Stream resources
  rpc Stream(StreamRequest) returns (stream StreamResponse);
  
  // Bidirectional streaming
  rpc Chat(stream ChatRequest) returns (stream ChatResponse);
}

// Common messages
message Empty {}

message ServiceInfo {
  string name = 1;
  string version = 2;
  string status = 3;
  int64 uptime = 4;
}

// Health check messages
message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
  }
  ServingStatus status = 1;
}

// Resource messages
message Resource {
  string id = 1;
  string name = 2;
  string description = 3;
  map<string, string> metadata = 4;
  int64 created_at = 5;
  int64 updated_at = 6;
}

// CRUD messages
message CreateRequest {
  Resource resource = 1;
}

message CreateResponse {
  Resource resource = 1;
}

message GetRequest {
  string id = 1;
}

message GetResponse {
  Resource resource = 1;
}

message UpdateRequest {
  Resource resource = 1;
}

message UpdateResponse {
  Resource resource = 1;
}

message DeleteRequest {
  string id = 1;
}

message DeleteResponse {
  bool success = 1;
}

message ListRequest {
  int32 page = 1;
  int32 page_size = 2;
  string filter = 3;
  string sort = 4;
}

message ListResponse {
  repeated Resource resources = 1;
  int32 total = 2;
  int32 page = 3;
  int32 page_size = 4;
}

// Streaming messages
message StreamRequest {
  string filter = 1;
}

message StreamResponse {
  Resource resource = 1;
  string event_type = 2;
  int64 timestamp = 3;
}

// Chat messages
message ChatRequest {
  string message = 1;
  string user_id = 2;
  int64 timestamp = 3;
}

message ChatResponse {
  string message = 1;
  string user_id = 2;
  int64 timestamp = 3;
}`;

		return {
			path: `${options.name}/proto/${options.name}.proto`,
			content,
			type: "config",
		};
	}

	private generateGrpcServer(options: MicroserviceOptions): GeneratedFile[] {
		const files: GeneratedFile[] = [];

		if (options.framework === "nestjs") {
			files.push(this.generateNestJSGrpcServer(options));
		} else {
			files.push(this.generateNodeGrpcServer(options));
		}

		return files;
	}

	private generateNestJSGrpcServer(
		options: MicroserviceOptions,
	): GeneratedFile {
		const content = `import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';
import { Metadata, ServerUnaryCall, ServerWritableStream } from '@grpc/grpc-js';

interface HealthCheckRequest {
  service: string;
}

interface HealthCheckResponse {
  status: 'UNKNOWN' | 'SERVING' | 'NOT_SERVING';
}

interface Resource {
  id: string;
  name: string;
  description: string;
  metadata: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

@Controller()
export class ${this.capitalize(options.name)}GrpcController {
  private resources: Map<string, Resource> = new Map();

  @GrpcMethod('${this.capitalize(options.name)}Service', 'Check')
  check(data: HealthCheckRequest, metadata: Metadata, call: ServerUnaryCall<any, any>): HealthCheckResponse {
    return { status: 'SERVING' };
  }

  @GrpcMethod('${this.capitalize(options.name)}Service', 'GetInfo')
  getInfo(): any {
    return {
      name: '${options.name}',
      version: process.env.npm_package_version || '1.0.0',
      status: 'operational',
      uptime: process.uptime()
    };
  }

  @GrpcMethod('${this.capitalize(options.name)}Service', 'Create')
  create(data: { resource: Resource }): { resource: Resource } {
    const resource = {
      ...data.resource,
      id: this.generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.resources.set(resource.id, resource);
    return { resource };
  }

  @GrpcMethod('${this.capitalize(options.name)}Service', 'Get')
  get(data: { id: string }): { resource: Resource | null } {
    const resource = this.resources.get(data.id);
    return { resource: resource || null };
  }

  @GrpcMethod('${this.capitalize(options.name)}Service', 'Update')
  update(data: { resource: Resource }): { resource: Resource } {
    const existing = this.resources.get(data.resource.id);
    if (!existing) {
      throw new Error('Resource not found');
    }
    const updated = {
      ...existing,
      ...data.resource,
      updatedAt: Date.now()
    };
    this.resources.set(updated.id, updated);
    return { resource: updated };
  }

  @GrpcMethod('${this.capitalize(options.name)}Service', 'Delete')
  delete(data: { id: string }): { success: boolean } {
    const success = this.resources.delete(data.id);
    return { success };
  }

  @GrpcMethod('${this.capitalize(options.name)}Service', 'List')
  list(data: { page: number; pageSize: number; filter?: string; sort?: string }): any {
    const resources = Array.from(this.resources.values());
    const page = data.page || 1;
    const pageSize = data.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      resources: resources.slice(start, end),
      total: resources.length,
      page,
      pageSize
    };
  }

  @GrpcStreamMethod('${this.capitalize(options.name)}Service', 'Stream')
  stream(data: Observable<any>, metadata: Metadata): Observable<any> {
    const subject = new Subject();
    
    // Simulate streaming data
    const interval = setInterval(() => {
      const resources = Array.from(this.resources.values());
      if (resources.length > 0) {
        const randomResource = resources[Math.floor(Math.random() * resources.length)];
        subject.next({
          resource: randomResource,
          eventType: 'update',
          timestamp: Date.now()
        });
      }
    }, 1000);
    
    // Clean up on completion
    data.subscribe({
      complete: () => {
        clearInterval(interval);
        subject.complete();
      }
    });
    
    return subject.asObservable();
  }

  @GrpcStreamMethod('${this.capitalize(options.name)}Service', 'Chat')
  chat(data: Observable<any>, metadata: Metadata): Observable<any> {
    const subject = new Subject();
    
    data.subscribe({
      next: (message) => {
        // Echo back the message with a response
        subject.next({
          message: \`Echo: \${message.message}\`,
          userId: 'server',
          timestamp: Date.now()
        });
      },
      error: (err) => subject.error(err),
      complete: () => subject.complete()
    });
    
    return subject.asObservable();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}`;

		return {
			path: `${options.name}/src/grpc/${options.name}.grpc.controller.ts`,
			content,
			type: "source",
		};
	}

	private generateNodeGrpcServer(options: MicroserviceOptions): GeneratedFile {
		const content = `import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

// Load proto file
const PROTO_PATH = path.join(__dirname, '../../proto/${options.name}.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).${options.name} as any;

// In-memory storage
const resources = new Map();

// Service implementation
const serviceImpl = {
  check: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    callback(null, { status: 'SERVING' });
  },

  getInfo: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    callback(null, {
      name: '${options.name}',
      version: process.env.npm_package_version || '1.0.0',
      status: 'operational',
      uptime: process.uptime()
    });
  },

  create: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const resource = {
      ...call.request.resource,
      id: Math.random().toString(36).substr(2, 9),
      created_at: Date.now(),
      updated_at: Date.now()
    };
    resources.set(resource.id, resource);
    callback(null, { resource });
  },

  get: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const resource = resources.get(call.request.id);
    if (!resource) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Resource not found'
      } as any, null);
    } else {
      callback(null, { resource });
    }
  },

  update: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const existing = resources.get(call.request.resource.id);
    if (!existing) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Resource not found'
      } as any, null);
    } else {
      const updated = {
        ...existing,
        ...call.request.resource,
        updated_at: Date.now()
      };
      resources.set(updated.id, updated);
      callback(null, { resource: updated });
    }
  },

  delete: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const success = resources.delete(call.request.id);
    callback(null, { success });
  },

  list: (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const allResources = Array.from(resources.values());
    const page = call.request.page || 1;
    const pageSize = call.request.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    callback(null, {
      resources: allResources.slice(start, end),
      total: allResources.length,
      page,
      page_size: pageSize
    });
  },

  stream: (call: grpc.ServerWritableStream<any, any>) => {
    // Send updates every second
    const interval = setInterval(() => {
      const allResources = Array.from(resources.values());
      if (allResources.length > 0) {
        const randomResource = allResources[Math.floor(Math.random() * allResources.length)];
        call.write({
          resource: randomResource,
          event_type: 'update',
          timestamp: Date.now()
        });
      }
    }, 1000);

    // Clean up on cancel
    call.on('cancelled', () => {
      clearInterval(interval);
    });
  },

  chat: (call: grpc.ServerDuplexStream<any, any>) => {
    call.on('data', (data) => {
      // Echo back the message
      call.write({
        message: \`Echo: \${data.message}\`,
        user_id: 'server',
        timestamp: Date.now()
      });
    });

    call.on('end', () => {
      call.end();
    });
  }
};

// Start gRPC server
export function startGrpcServer(port = 50051) {
  const server = new grpc.Server();
  
  server.addService(proto.${this.capitalize(options.name)}Service.service, serviceImpl);
  
  server.bindAsync(
    \`0.0.0.0:\${port}\`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error('Failed to start gRPC server:', err);
        return;
      }
      console.log(\`gRPC server running on port \${port}\`);
      server.start();
    }
  );
  
  return server;
}`;

		return {
			path: `${options.name}/src/grpc/server.ts`,
			content,
			type: "source",
		};
	}

	private generateGrpcClient(options: MicroserviceOptions): GeneratedFile {
		const content = `import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';

// Load proto file
const PROTO_PATH = path.join(__dirname, '../../proto/${options.name}.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const proto = grpc.loadPackageDefinition(packageDefinition).${options.name} as any;

export class ${this.capitalize(options.name)}GrpcClient {
  private client: any;

  constructor(address: string = 'localhost:50051', credentials?: grpc.ChannelCredentials) {
    this.client = new proto.${this.capitalize(options.name)}Service(
      address,
      credentials || grpc.credentials.createInsecure()
    );
  }

  check(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.check({ service: '${options.name}' }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  getInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getInfo({}, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  create(resource: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.create({ resource }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  get(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get({ id }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  update(resource: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.update({ resource }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  delete(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.delete({ id }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  list(page = 1, pageSize = 10, filter?: string, sort?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.list({ page, page_size: pageSize, filter, sort }, (err: any, response: any) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  }

  stream(filter?: string): grpc.ClientReadableStream<any> {
    return this.client.stream({ filter });
  }

  chat(): grpc.ClientDuplexStream<any, any> {
    return this.client.chat();
  }

  close() {
    grpc.closeClient(this.client);
  }
}

// Example usage
export async function exampleUsage() {
  const client = new ${this.capitalize(options.name)}GrpcClient();

  try {
    // Check health
    const health = await client.check();
    console.log('Health:', health);

    // Get service info
    const info = await client.getInfo();
    console.log('Info:', info);

    // Create a resource
    const created = await client.create({
      name: 'Test Resource',
      description: 'A test resource',
      metadata: { key: 'value' }
    });
    console.log('Created:', created);

    // Stream updates
    const stream = client.stream();
    stream.on('data', (data) => {
      console.log('Stream data:', data);
    });

    // Chat (bidirectional streaming)
    const chat = client.chat();
    chat.write({ message: 'Hello', user_id: 'client', timestamp: Date.now() });
    chat.on('data', (data) => {
      console.log('Chat response:', data);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}`;

		return {
			path: `${options.name}/src/grpc/client.ts`,
			content,
			type: "source",
		};
	}

	private generateGrpcConfig(options: MicroserviceOptions): GeneratedFile {
		const content = `# gRPC Configuration

## Proto File Location
The proto file is located at: \`proto/${options.name}.proto\`

## Code Generation

### Install dependencies:
\`\`\`bash
npm install --save-dev @grpc/proto-loader grpc-tools
\`\`\`

### Generate TypeScript types (optional):
\`\`\`bash
npx proto-loader-gen-types --grpcLib=@grpc/grpc-js --outDir=src/grpc/types proto/${options.name}.proto
\`\`\`

## Server Configuration

- Default port: 50051
- TLS: Disabled (for development)
- Max message size: 4MB

## Client Configuration

- Default address: localhost:50051
- Timeout: 5 seconds
- Retry policy: 3 retries with exponential backoff

## Service Methods

1. **Check** - Health check
2. **GetInfo** - Get service information
3. **Create** - Create a new resource
4. **Get** - Get a resource by ID
5. **Update** - Update an existing resource
6. **Delete** - Delete a resource
7. **List** - List resources with pagination
8. **Stream** - Server streaming of resource updates
9. **Chat** - Bidirectional streaming for real-time communication

## Testing

Use grpcurl to test the service:

\`\`\`bash
# List services
grpcurl -plaintext localhost:50051 list

# Call health check
grpcurl -plaintext localhost:50051 ${options.name}.${this.capitalize(options.name)}Service/Check

# Get service info
grpcurl -plaintext -d '{}' localhost:50051 ${options.name}.${this.capitalize(options.name)}Service/GetInfo
\`\`\``;

		return {
			path: `${options.name}/grpc-config.md`,
			content,
			type: "documentation",
		};
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
