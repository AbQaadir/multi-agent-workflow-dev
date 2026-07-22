from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import TRACKING_AGENT_INSTRUCTION
from .mcp_tools import get_kapruka_mcp_toolset
from config import MODEL_NAME

tracking_agent = LlmAgent(
    model=MODEL_NAME,
    name="TrackingAgent",
    description="Tracks Kapruka order status using order reference numbers.",
    instruction=TRACKING_AGENT_INSTRUCTION,
    tools=[
        get_kapruka_mcp_toolset(
            tool_filter=["kapruka_track_order"]
        )
    ],
)
