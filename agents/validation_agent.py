from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import VALIDATION_AGENT_INSTRUCTION
from config import MODEL_NAME

validation_agent = LlmAgent(
    model=MODEL_NAME,
    name="ValidationAgent",
    description="Validates recipient details, phone numbers, delivery city support, and cart before checkout.",
    instruction=VALIDATION_AGENT_INSTRUCTION,
    tools=[],
)
