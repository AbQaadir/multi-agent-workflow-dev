from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import TRACKING_AGENT_INSTRUCTION
from .mcp_tools import get_workflow_mcp_toolset
from config import MODEL_NAME

tracking_agent = LlmAgent(
    model=MODEL_NAME,
    name="TrackingAgent",
    description="Tracks order status using order reference numbers.",
    instruction=TRACKING_AGENT_INSTRUCTION,
    tools=[
        get_workflow_mcp_toolset(
            tool_filter=["track_order"]
        )
    ],
)
