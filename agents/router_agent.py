from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import ROUTER_AGENT_INSTRUCTION
from config import MODEL_NAME

router_agent = LlmAgent(
    model=MODEL_NAME,
    name="IntentRouterAgent",
    description="Classifies intent and routes tasks to specialized swarm agents.",
    instruction=ROUTER_AGENT_INSTRUCTION,
    tools=[],
)
