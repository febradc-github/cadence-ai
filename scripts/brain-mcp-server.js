#!/usr/bin/env node
// MCP entry point for hosts that load plugin scripts with require() instead
// of executing them directly (kimi-code's __plugin_run_node shim does), where
// the require.main === module guard in brain-mcp.js never fires.
require('./brain-mcp.js').main();
