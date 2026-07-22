from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import PLANNER_AGENT_INSTRUCTION
from config import MODEL_NAME

planner_agent = LlmAgent(
    model=MODEL_NAME,
    name="PlannerAgent",
    description="Generates sequential task execution plans for swarm workers.",
    instruction=PLANNER_AGENT_INSTRUCTION,
    tools=[],
)
