from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import RESPONSE_AGENT_INSTRUCTION
from config import MODEL_NAME

response_agent = LlmAgent(
    model=MODEL_NAME,
    name="ResponseAgent",
    description="Transforms worker JSON outputs and state into warm, structured Markdown responses for the user.",
    instruction=RESPONSE_AGENT_INSTRUCTION,
    tools=[],
)
