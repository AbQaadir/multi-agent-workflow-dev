from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import PRODUCT_AGENT_INSTRUCTION
from .mcp_tools import get_workflow_mcp_toolset
from config import MODEL_NAME

product_agent = LlmAgent(
    model=MODEL_NAME,
    name="ProductAgent",
    description="Searches catalog for products, categories, and item details.",
    instruction=PRODUCT_AGENT_INSTRUCTION,
    tools=[
        get_workflow_mcp_toolset(
            tool_filter=["search_products", "get_product", "list_categories"]
        )
    ],
)
