from google.adk.agents.llm_agent import LlmAgent
from prompts.agent_prompts import CONVERSATION_AGENT_INSTRUCTION
from config import MODEL_NAME

conversation_agent = LlmAgent(
    model=MODEL_NAME,
    name="ConversationAgent",
    description="Front-door conversational agent that parses intent and manages user interaction.",
    instruction=CONVERSATION_AGENT_INSTRUCTION,
    tools=[],
)
