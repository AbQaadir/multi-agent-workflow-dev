from typing import Dict, Any
from .conversation_state import SwarmState

SWARM_STATE_KEY = "swarm_state"

def get_swarm_state(state_dict: Dict[str, Any]) -> SwarmState:
    """Retrieve or initialize SwarmState object from ADK session state dictionary."""
    if SWARM_STATE_KEY in state_dict and isinstance(state_dict[SWARM_STATE_KEY], dict):
        try:
            return SwarmState.model_validate(state_dict[SWARM_STATE_KEY])
        except Exception:
            pass
    return SwarmState()

def save_swarm_state(state_dict: Dict[str, Any], swarm_state: SwarmState) -> None:
    """Save SwarmState object into ADK session state dictionary."""
    state_dict[SWARM_STATE_KEY] = swarm_state.model_dump()
