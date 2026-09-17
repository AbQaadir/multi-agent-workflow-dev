import asyncio
import logging
from dotenv import load_dotenv

from state.conversation_state import SwarmState
from planner.workflow import MultiAgentWorkflow

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("MultiAgentWorkflowMain")

async def main():
    load_dotenv()
    logger.info("Initializing Multi-Agent Workflow Swarm System...")

    workflow = MultiAgentWorkflow()
    session_state = SwarmState(session_id="test_session_001")

    test_queries = [
        "Find birthday cakes under 8000 LKR",
        "Can a delivery be made to Galle tomorrow?",
        "Track order reference KP123456",
        "Send chocolates to my mom in Colombo tomorrow under 7000 LKR",
    ]

    for i, query in enumerate(test_queries, 1):
        print(f"\n==========================================")
        print(f" TEST CASE {i}: '{query}'")
        print(f"==========================================")

        updated_state = await workflow.execute_query(query, session_state)
        print(f"\nIntent Detected: {updated_state.intent.intent_type}")
        print(f"\nResponse:\n{updated_state.final_response}\n")

if __name__ == "__main__":
    asyncio.run(main())
