# Xala MCP Server - Cursor Setup Guide

## Quick Setup

The xala-mcp server is working and all 10 tools are functional. To connect it to Cursor:

### 1. Install and Build
```bash
cd packages/mcp
pnpm install
pnpm build
```

### 2. Cursor Configuration

Add this to your Cursor settings (`settings.json`):

```json
{
  "mcp": {
    "mcpServers": {
      "xala-ui-system": {
        "command": "node",
        "args": ["/Volumes/Development/Xaheen Enterprise/xaheen/packages/mcp/dist/index.js"],
        "env": {}
      }
    }
  }
}
```

### 3. Alternative: Global Installation

```bash
# Install globally
cd packages/mcp
npm link

# Then use in Cursor settings:
{
  "mcp": {
    "mcpServers": {
      "xala-ui-system": {
        "command": "xala-ui-mcp",
        "args": [],
        "env": {}
      }
    }
  }
}
```

## Available Tools (10 total)

✅ **All tools are working and tested:**

1. **get_components** - Retrieve UI components with variants
2. **get_blocks** - Get pre-built UI blocks and layouts  
3. **get_rules** - Access design system rules and best practices
4. **generate_component** - Generate new components
5. **generate_page** - Create complete pages
6. **norwegian_compliance** - Validate Norwegian regulatory compliance
7. **gdpr_compliance** - Validate GDPR compliance
8. **transform_code** - Transform code between platforms
9. **analyse_code** - Analyze code for performance/security
10. **init_project** - Initialize new projects

## Test Server Status

✅ **Server Status: WORKING**
- ✅ Server starts successfully
- ✅ Protocol initialization works  
- ✅ All 10 tools registered
- ✅ Tool execution tested and working
- ✅ Enhanced prompts and guidance included

## Troubleshooting

### If Cursor shows 0 tools:

1. **Check server path** - Ensure the path in Cursor settings is correct
2. **Verify build** - Run `pnpm build` in packages/mcp
3. **Test manually**:
   ```bash
   cd packages/mcp
   node test-server-simple.js
   ```
4. **Check Cursor logs** - Look for MCP connection errors in Cursor's output

### Manual Test
```bash
cd packages/mcp
echo '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}' | node dist/index.js
```

Should return all 10 tools in the response.

## Next Steps

1. Update Cursor settings with the configuration above
2. Restart Cursor
3. Check if tools appear in Cursor's MCP tools panel
4. Test tool usage in Cursor chat

## Support

- Server version: 6.5.0
- Protocol version: 2024-11-05
- All tools tested and functional