# shopping agent

An intelligent, multi-agent AI shopping assistant inspired by Alibaba's AI Mode. This project leverages the **Google ADK Swarm** architecture and **Model Context Protocol (MCP)** to provide a dynamic, highly interactive, and conversational e-commerce experience for Kapruka.

## 🌟 Key Features

- **Swarm Agent Architecture**: Utilizes a robust multi-agent system where a `root_agent` orchestrates specialized sub-agents (e.g., Sourcing, Checkout, Planning) to handle complex user intents.
- **Rich Interactive UI**: A Next.js-powered chat interface that renders rich markdown, side-by-side product comparisons, proactive call-to-actions, and interactive components within the chat timeline.
- **Real-Time Data with MCP**: Integrates directly with Kapruka's live catalog via MCP, ensuring product recommendations are accurate, validated, and highly relevant (no mocked data).
- **Context-Aware Shopping**: The backend dynamically injects the user's UI state (e.g., selected products) into the LLM context, allowing the agent to answer questions, compare, or checkout specifically for the items the user has chosen.
- **Integrated Checkout & Maps**: Seamless checkout flow with Google Maps integration for delivery address selection and validation.

## 🏗️ Architecture

The project is split into two main components:

### Backend (Python)
- **Framework**: FastAPI + Uvicorn (SSE Streaming)
- **AI Orchestration**: Google ADK (`google-adk`)
- **Integration**: MCP (`mcp`)
- **Entry point**: `web_server.py`

### Frontend (TypeScript / React)
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Mapping**: `@react-google-maps/api`

## 🚀 Getting Started

### Prerequisites
- Python >= 3.11
- Node.js >= 20
- `uv` (Python package manager)

### 1. Environment Variables

Create a `.env` file in the root directory and configure your API keys:

```bash
# .env
GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY" # Optional fallback
```

Create a `.env.local` file in the `frontend` directory for Next.js variables:

```bash
# frontend/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
```

### 2. Backend Setup

From the root directory, install the Python dependencies and start the FastAPI server:

```bash
# Install dependencies using uv
uv sync

# Run the backend server
uv run uvicorn web_server:app --reload --port 8000
```

### 3. Frontend Setup

Open a new terminal, navigate to the `frontend` directory, install Node modules, and start the development server:

```bash
cd frontend

# Install dependencies
npm install

# Run the frontend server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🛠️ Tech Stack Highlights
- **Google Gemini 2.5 Flash** (Configurable in `config.py`)
- **FastAPI** for high-performance, asynchronous streaming
- **Server-Sent Events (SSE)** for real-time agent responses
- **Lucide React** for beautiful iconography
- **Tailwind CSS v4** for modern styling

## 📜 License
*Proprietary / Closed Source* - Internal Kapruka Project.
