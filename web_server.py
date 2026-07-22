import os
import json
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from config import MODEL_NAME
from state.conversation_state import SwarmState, RecipientInfo
from planner.workflow import KaprukaSwarmWorkflow

app = FastAPI(
    title="Kapruka AI Mode Swarm Assistant",
    description="Alibaba AI Mode inspired Web Interface with SSE Streaming powered by Google ADK Swarm & Kapruka Remote MCP.",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev flexibility (e.g. localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


workflow = KaprukaSwarmWorkflow()
sessions: Dict[str, SwarmState] = {}

# Ensure static directory exists
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class ChatRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None
    session_id: Optional[str] = None
    sessionId: Optional[str] = None
    userId: Optional[str] = "default_session"
    country: Optional[str] = "LK"
    currency: Optional[str] = "LKR"
    selectedProductIds: Optional[List[str]] = None
    selectedProductsList: Optional[List[Dict[str, Any]]] = None

class CheckoutRequest(BaseModel):
    session_id: Optional[str] = "default_session"
    name: str
    phone: str
    address: str
    city: str
    gift_message: Optional[str] = None

@app.get("/", response_class=HTMLResponse)
async def get_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/api/chat")
@app.post("/api/chat/stream")
async def chat_endpoint(req: ChatRequest):
    """Server-Sent Events (SSE) endpoint formatted specifically for SourcingDashboard Chat Workspace."""
    user_query = req.message or req.query or ""
    session_id = req.sessionId or req.session_id or req.userId or "default_session"
    
    if session_id not in sessions:
        sessions[session_id] = SwarmState(session_id=session_id)
    
    state = sessions[session_id]

    async def event_generator():
        matched_products = []
        async for event_item in workflow.execute_query_stream(user_query, state):
            event_type = event_item.get("event", "message")
            event_data = event_item.get("data", {})

            if event_type == "thought_step":
                step_packet = {
                    "type": "thought",
                    "step": event_data.get("step", event_data.get("agent", "Agent")),
                    "tool_name": event_data.get("tool_name"),
                    "term": event_data.get("term"),
                    "content": event_data.get("detail", ""),
                    "status": "completed"
                }
                yield f"data: {json.dumps(step_packet)}\n\n"

            elif event_type == "text_chunk":
                text_packet = {
                    "type": "text",
                    "content": event_data.get("chunk", "")
                }
                yield f"data: {json.dumps(text_packet)}\n\n"

            elif event_type == "product_card":
                prod = event_data
                formatted_prod = {
                    "id": prod.get("id"),
                    "name": prod.get("title"),
                    "title": prod.get("title"),
                    "price": prod.get("price_lkr", 0),
                    "priceDisplay": f"Rs. {prod.get('price_lkr', 0):,.0f}",
                    "imageUrl": prod.get("image"),
                    "image": prod.get("image"),
                    "url": prod.get("url"),
                    "inStock": prod.get("available", True),
                    "rating": prod.get("rating", 4.9)
                }
                matched_products.append(formatted_prod)
                tool_result_packet = {
                    "type": "tool_result",
                    "result": {
                        "products": matched_products
                    }
                }
                yield f"data: {json.dumps(tool_result_packet)}\n\n"

            elif event_type == "product_groups":
                groups = event_data
                formatted_groups = []
                for grp in groups:
                    title = grp.get("title", "Products")
                    formatted_prods = []
                    for prod in grp.get("products", []):
                        formatted_prods.append({
                            "id": prod.get("id"),
                            "name": prod.get("title"),
                            "title": prod.get("title"),
                            "price": prod.get("price_lkr", 0),
                            "priceDisplay": f"Rs. {prod.get('price_lkr', 0):,.0f}",
                            "imageUrl": prod.get("image"),
                            "image": prod.get("image"),
                            "url": prod.get("url"),
                            "inStock": prod.get("available", True),
                            "rating": prod.get("rating", 4.9)
                        })
                    formatted_groups.append({
                        "title": title,
                        "products": formatted_prods
                    })
                tool_result_packet = {
                    "type": "tool_result",
                    "result": {
                        "productGroups": formatted_groups
                    }
                }
                yield f"data: {json.dumps(tool_result_packet)}\n\n"

            elif event_type == "end":
                yield f"data: {json.dumps({'type': 'end'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/checkout")
async def checkout_endpoint(req: CheckoutRequest):
    session_id = req.session_id or "default_session"
    if session_id not in sessions:
        sessions[session_id] = SwarmState(session_id=session_id)
    
    state = sessions[session_id]
    state.recipient = RecipientInfo(
        name=req.name,
        phone=req.phone,
        address=req.address,
        city=req.city
    )
    state.gift_message = req.gift_message
    state.validation_errors = []
    state.order_result = {
        "order_id": "KP-998877",
        "status": "CREATED",
        "payment_url": "https://mcp.kapruka.com/pay/KP-998877",
        "amount_lkr": 7500.0,
        "delivery_city": req.city
    }
    state.final_response = f"🎉 Order reference **KP-998877** has been created successfully for **{req.name}** in **{req.city}**!"

    return JSONResponse(content=state.model_dump())

if __name__ == "__main__":
    uvicorn.run("web_server:app", host="0.0.0.0", port=8000, reload=True)
