from typing import Optional, List
from google.adk.tools.mcp_tool import McpToolset
from google.adk.tools.mcp_tool.mcp_session_manager import StdioConnectionParams
from mcp import StdioServerParameters

KAPRUKA_MCP_ENDPOINT = "https://mcp.kapruka.com/mcp"

def get_kapruka_mcp_toolset(tool_filter: Optional[List[str]] = None) -> McpToolset:
    """Instantiate McpToolset connected to the Kapruka remote MCP server over npx mcp-remote."""
    connection_params = StdioConnectionParams(
        server_params=StdioServerParameters(
            command="npx",
            args=["-y", "mcp-remote", KAPRUKA_MCP_ENDPOINT],
        ),
        timeout=15,
    )
    if tool_filter:
        return McpToolset(connection_params=connection_params, tool_filter=tool_filter)
    return McpToolset(connection_params=connection_params)
