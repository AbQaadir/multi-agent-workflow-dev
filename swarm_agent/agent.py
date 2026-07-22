import os
from dotenv import load_dotenv
from google.adk.agents.llm_agent import LlmAgent
from agents.mcp_tools import get_kapruka_mcp_toolset
from config import MODEL_NAME

load_dotenv()

# Define the Root Orchestrator Agent for Google ADK
root_agent = LlmAgent(
    model=MODEL_NAME,
    name="kapruka_swarm_root",
    description="Kapruka E-Commerce Swarm Root Orchestrator connecting domain specialist agents to Kapruka MCP.",
    instruction="""You are the main coordinator for the Kapruka E-Commerce Agent Swarm.
Help customers search for products, check delivery availability in Sri Lanka, track orders, and place new orders on Kapruka.

CRITICAL TOOL NAMING & FORMAT REQUIREMENT:
When searching products with `kapruka_search_products`, ALWAYS pass `response_format='json'` inside `params` (e.g. `params: {'q': 'cake', 'response_format': 'json'}`) to receive structured product image URLs and exact prices.

Always use exact tool names starting with 'kapruka_':
- kapruka_search_products
- kapruka_get_product
- kapruka_list_categories
- kapruka_list_delivery_cities
- kapruka_check_delivery
- kapruka_create_order
- kapruka_track_order
""",
    tools=[
        get_kapruka_mcp_toolset()
    ],
)
