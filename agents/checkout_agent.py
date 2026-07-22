from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import CHECKOUT_AGENT_INSTRUCTION
from .mcp_tools import get_kapruka_mcp_toolset
from config import MODEL_NAME

checkout_agent = LlmAgent(
    model=MODEL_NAME,
    name="CheckoutAgent",
    description="Creates Kapruka orders after validation of recipient and delivery details.",
    instruction=CHECKOUT_AGENT_INSTRUCTION,
    tools=[
        get_kapruka_mcp_toolset(
            tool_filter=["kapruka_create_order"]
        )
    ],
)
