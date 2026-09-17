from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import DELIVERY_AGENT_INSTRUCTION
from .mcp_tools import get_workflow_mcp_toolset
from config import MODEL_NAME

delivery_agent = LlmAgent(
    model=MODEL_NAME,
    name="DeliveryAgent",
    description="Checks delivery availability, supported cities, and delivery fees.",
    instruction=DELIVERY_AGENT_INSTRUCTION,
    tools=[
        get_workflow_mcp_toolset(
            tool_filter=["list_delivery_cities", "check_delivery"]
        )
    ],
)
