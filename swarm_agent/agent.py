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

CRITICAL RESPONSE & TOOL RULES:
1. PARALLEL SEARCHES: When a customer asks for multiple items or categories (e.g. "flowers and shoes" or "gifts for girlfriend"), issue SEPARATE PARALLEL tool calls for each specific category (e.g., call `kapruka_search_products` with `q: 'flowers'` AND `q: 'shoes'`).
2. INTRO & CATEGORY DESCRIPTIONS: Start your text response with a brief 1-2 sentence overall summary introducing the options found. Then write 1 natural descriptive sentence highlighting recommendation ideas for each category (e.g. "Fresh rose arrangements and preserved bouquets from Shirohana are popular choices. Stylish footwear options are available in many sizes..."). Do NOT use bullet points or bold prefixes like "**For flowers**,".
3. NO TABLES: Do NOT generate markdown product tables or numbered item lists in text, as products are presented in clean visual grid components for each category right below your text.
4. TOOL FORMAT & LIMIT 50: When searching products with `kapruka_search_products`, ALWAYS pass `limit: 50` and `response_format='json'` inside `params` (e.g. `params: {'q': 'flowers', 'limit': 50, 'response_format': 'json'}`).

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
