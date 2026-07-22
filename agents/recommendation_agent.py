from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import RECOMMENDATION_AGENT_INSTRUCTION
from config import MODEL_NAME

recommendation_agent = LlmAgent(
    model=MODEL_NAME,
    name="RecommendationAgent",
    description="Provides reasoning-based gift recommendations tailored to occasion, budget, and recipient.",
    instruction=RECOMMENDATION_AGENT_INSTRUCTION,
    tools=[],
)
