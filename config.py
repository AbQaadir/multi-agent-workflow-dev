import os
from dotenv import load_dotenv

load_dotenv()

# Centralized environment configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL_NAME = os.getenv("GOOGLE_MODEL") or os.getenv("MODEL_NAME") or "gemini-2.5-flash"
