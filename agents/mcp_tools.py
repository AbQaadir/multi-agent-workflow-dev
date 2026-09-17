import os
from typing import Optional, List
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters

WORKFLOW_MCP_ENDPOINT = os.getenv("MCP_ENDPOINT", "https://mcp.multiagentworkflow.com/mcp")

def get_workflow_mcp_toolset(tool_filter: Optional[List[str]] = None) -> McpToolset:
    """Instantiate McpToolset connected to the Multi-Agent Workflow remote MCP server over npx mcp-remote."""
    connection_params = StdioConnectionParams(
        server_params=StdioServerParameters(
            command="npx",
            args=["-y", "mcp-remote", WORKFLOW_MCP_ENDPOINT],
        ),
        timeout=15,
    )
    if tool_filter:
        return McpToolset(connection_params=connection_params, tool_filter=tool_filter)
    return McpToolset(connection_params=connection_params)
