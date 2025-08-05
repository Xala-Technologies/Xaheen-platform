#!/usr/bin/env node

/**
 * Xala UI System MCP Server v6.3.0
 * Streamlined multi-platform component generation server
 * Refactored to follow SOLID principles with 6 core tools
 */

import { XalaUISystemServer } from "./server/XalaUISystemServer.js";

// Start MCP server
const server = new XalaUISystemServer();
server.run().catch(console.error);
