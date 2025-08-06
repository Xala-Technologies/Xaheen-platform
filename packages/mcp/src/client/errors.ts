/**
 * MCP Error Classes
 * For client-side error handling when interacting with MCP servers
 */

/**
 * Base MCP Error class
 */
export class MCPError extends Error {
  public readonly code: string;
  public readonly data?: unknown;

  constructor(message: string, code: string = 'MCP_ERROR', data?: unknown) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.data = data;
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPError);
    }
  }
}

/**
 * MCP Connection Error
 * Thrown when there are issues connecting to or communicating with the MCP server
 */
export class MCPConnectionError extends MCPError {
  constructor(message: string, data?: unknown) {
    super(message, 'MCP_CONNECTION_ERROR', data);
    this.name = 'MCPConnectionError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPConnectionError);
    }
  }
}

/**
 * MCP Tool Error
 * Thrown when there are issues with tool execution
 */
export class MCPToolError extends MCPError {
  public readonly toolName: string;

  constructor(message: string, toolName: string, data?: unknown) {
    super(message, 'MCP_TOOL_ERROR', data);
    this.name = 'MCPToolError';
    this.toolName = toolName;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPToolError);
    }
  }
}

/**
 * MCP Validation Error
 * Thrown when there are validation issues with requests or responses
 */
export class MCPValidationError extends MCPError {
  public readonly field?: string;

  constructor(message: string, field?: string, data?: unknown) {
    super(message, 'MCP_VALIDATION_ERROR', data);
    this.name = 'MCPValidationError';
    this.field = field;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPValidationError);
    }
  }
}

/**
 * MCP Timeout Error
 * Thrown when operations timeout
 */
export class MCPTimeoutError extends MCPError {
  public readonly timeout: number;

  constructor(message: string, timeout: number, data?: unknown) {
    super(message, 'MCP_TIMEOUT_ERROR', data);
    this.name = 'MCPTimeoutError';
    this.timeout = timeout;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MCPTimeoutError);
    }
  }
}