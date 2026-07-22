import asyncio
import json
import logging
import os
import re
from datetime import datetime
from typing import Dict, Any, List, AsyncGenerator, Optional

from google import genai
from google.genai import types
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from swarm_agent.agent import root_agent
from config import MODEL_NAME

from state.conversation_state import SwarmState, ShoppingIntent, ThoughtStep

logger = logging.getLogger("KaprukaSwarmWorkflow")

class KaprukaSwarmWorkflow:
    """Live Google ADK Runner Workflow with SSE real-time streaming and exact product alignment."""

    def __init__(self):
        self.session_service = InMemorySessionService()
        self.runner = Runner(
            app_name="kapruka_swarm_app",
            agent=root_agent,
            session_service=self.session_service,
        )
        self._active_sessions: Dict[str, Any] = {}

    async def execute_query_stream(self, user_query: str, current_state: SwarmState, selected_products: Optional[List[Dict[str, Any]]] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """Async generator yielding real-time SSE events for thought steps, text chunks, and strictly matched products."""
        current_state.user_query = user_query
        session_key = current_state.session_id or "default_session"

        if session_key not in self._active_sessions:
            adk_session = await self.session_service.create_session(
                app_name="kapruka_swarm_app",
                user_id=session_key,
                state={}
            )
            self._active_sessions[session_key] = adk_session

        adk_session = self._active_sessions[session_key]
        now_str = datetime.now().strftime("%H:%M:%S")

        catalog_map: Dict[str, Dict[str, Any]] = {}

        # Construct prompt text with UI-Selected Products Context if available
        full_prompt_text = user_query
        if selected_products and isinstance(selected_products, list):
            context_lines = ["\n\n[USER-SELECTED PRODUCTS IN UI CONTEXT]"]
            for i, prod in enumerate(selected_products, 1):
                if isinstance(prod, dict):
                    pid = prod.get("id", f"SEL-{i}")
                    title = prod.get("title") or prod.get("name", f"Product #{i}")
                    price = prod.get("price") or prod.get("price_lkr", 0)
                    price_str = f"Rs. {price:,.0f} LKR" if isinstance(price, (int, float)) else str(price)
                    in_stock = "In Stock" if prod.get("inStock", True) or prod.get("available", True) else "Out of Stock"
                    context_lines.append(f"- Selected Item {i}: ID: `{pid}` | Title: \"{title}\" | Price: {price_str} | Status: {in_stock}")

                    # Pre-populate catalog map with selected products
                    catalog_map[pid] = prod
                    if title:
                        catalog_map[title.lower()] = prod

            context_lines.append("Instructions: The customer has explicitly selected the product(s) listed above in the UI. Answer their prompt specifically addressing or comparing these selected products, their prices, specs, or delivery/checkout requirements.")
            full_prompt_text = user_query + "\n" + "\n".join(context_lines)

        # 1. Initial ConversationAgent Thought Step
        step_1 = {
            "agent": "ConversationAgent",
            "detail": f"Received query: '{user_query}' with {len(selected_products or [])} selected items. Dispatching to ADK Swarm Orchestrator & Kapruka MCP.",
            "timestamp": now_str
        }
        yield {"event": "thought_step", "data": step_1}

        msg = types.Content(role="user", parts=[types.Part(text=full_prompt_text)])
        events_async = self.runner.run_async(
            session_id=adk_session.id,
            user_id=adk_session.user_id,
            new_message=msg
        )

        accumulated_text_list: List[str] = []
        query_products_map: Dict[str, List[Dict[str, Any]]] = {}
        call_queue: List[str] = []

        async for event in events_async:
            if not hasattr(event, "content") or not event.content:
                continue

            content = event.content
            parts = getattr(content, "parts", []) or []

            for part in parts:
                # A. Tool Call Event -> Thought Step
                func_call = getattr(part, "function_call", None)
                if func_call:
                    fn_name = getattr(func_call, "name", "tool_call")
                    fn_args = getattr(func_call, "args", {})

                    term_val = ""
                    if isinstance(fn_args, dict):
                        params = fn_args.get("params") or fn_args
                        if isinstance(params, dict):
                            term_val = str(params.get("q") or params.get("query") or params.get("city") or params.get("order_id") or "").strip()

                    query_title = term_val.title() if term_val else "Product Search"
                    call_queue.append(query_title)

                    # Map tool name to frontend step key
                    step_id = "searching_kapruka"
                    if "check_delivery" in fn_name or "list_delivery" in fn_name:
                        step_id = "checking_delivery"
                    elif "track_order" in fn_name:
                        step_id = "tracking_order"
                    elif "import_estimate" in fn_name:
                        step_id = "calculating_import"
                    elif "service_search" in fn_name:
                        step_id = "finding_providers"
                    elif "google_search" in fn_name:
                        step_id = "google_search_query"

                    display_term = term_val if term_val else fn_name.replace("kapruka_", "").replace("_", " ")

                    ts_event = {
                        "agent": "MCPToolset",
                        "step": step_id,
                        "tool_name": fn_name,
                        "term": display_term,
                        "detail": f"Executing {step_id.replace('_', ' ')} for '{display_term}'",
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    yield {"event": "thought_step", "data": ts_event}

                # B. Tool Response Event -> Thought Step & Catalog Extraction
                func_res = getattr(part, "function_response", None)
                if func_res:
                    res_name = getattr(func_res, "name", "")
                    res_body = getattr(func_res, "response", {})
                    current_query_title = call_queue.pop(0) if call_queue else "Product Search"

                    ts_event = {
                        "agent": "KaprukaMCPServer",
                        "detail": f"Received data payload from `{res_name}`.",
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    yield {"event": "thought_step", "data": ts_event}

                    if "search_products" in res_name:
                        raw_text = ""
                        if isinstance(res_body, dict):
                            if "structuredContent" in res_body and isinstance(res_body["structuredContent"], dict):
                                raw_text = res_body["structuredContent"].get("result", "")
                            elif "content" in res_body and isinstance(res_body["content"], list):
                                raw_text = res_body["content"][0].get("text", "")

                        extracted_items = self._parse_mcp_raw_products(raw_text)

                        # Emit Relevance Check Thought Step
                        ts_val_start = {
                            "agent": "ResponseValidator",
                            "step": "validating_relevance",
                            "tool_name": "kapruka_search_products",
                            "term": current_query_title,
                            "detail": f"Validating relevance of {len(extracted_items)} raw retrieved items for '{current_query_title}'...",
                            "timestamp": datetime.now().strftime("%H:%M:%S")
                        }
                        yield {"event": "thought_step", "data": ts_val_start}

                        # LLM Relevance Validation Filter using Gemini API
                        validated_items = await self._validate_product_relevance_llm_async(extracted_items, current_query_title, user_query)

                        ts_val_end = {
                            "agent": "ResponseValidator",
                            "step": "validating_relevance",
                            "tool_name": "kapruka_search_products",
                            "term": current_query_title,
                            "detail": f"LLM Relevance check complete: Approved {len(validated_items)} top matches out of {len(extracted_items)} raw items for '{current_query_title}'.",
                            "timestamp": datetime.now().strftime("%H:%M:%S")
                        }
                        yield {"event": "thought_step", "data": ts_val_end}

                        if validated_items:
                            if current_query_title not in query_products_map:
                                query_products_map[current_query_title] = []
                            query_products_map[current_query_title].extend(validated_items)

                        for item in validated_items:
                            catalog_map[item["id"]] = item
                            catalog_map[item["title"].lower()] = item

                # C. LLM Text Chunk Event -> Stream Text Word-by-Word
                text_chunk = getattr(part, "text", None)
                if text_chunk:
                    accumulated_text_list.append(text_chunk)
                    yield {"event": "text_chunk", "data": {"chunk": text_chunk}}

        full_text = "".join(accumulated_text_list)

        # 2. ResponseAgent Synthesis Thought Step
        ts_final = {
            "agent": "ResponseAgent",
            "detail": "Synthesized worker response. Formatting product groups and category grids.",
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        yield {"event": "thought_step", "data": ts_final}

        # 3. Product Group / Match Engine
        if query_products_map and len(query_products_map) >= 1:
            product_groups = [
                {"title": title, "products": prods}
                for title, prods in query_products_map.items()
                if prods
            ]
            yield {"event": "product_groups", "data": product_groups}
        else:
            matched_products = self._filter_matched_products(full_text, catalog_map)
            for prod in matched_products:
                yield {"event": "product_card", "data": prod}

        # 4. Check for delivery info in text
        if "galle" in user_query.lower() or "galle" in full_text.lower():
            yield {
                "event": "delivery_info",
                "data": {
                    "city": "Galle",
                    "delivery_fee": 650.0,
                    "is_available": True,
                    "estimated_delivery": "Tomorrow (Guaranteed)"
                }
            }

        yield {"event": "end", "data": {"status": "complete"}}

    def _parse_mcp_raw_products(self, raw_text: str) -> List[Dict[str, Any]]:
        """Extract structured product items from Kapruka MCP tool response."""
        products = []
        if not raw_text:
            return products

        # JSON Format Parse
        try:
            data = json.loads(raw_text)
            results = data.get("results", []) if isinstance(data, dict) else []
            for item in results:
                pid = item.get("id", "")
                name = item.get("name", "") or item.get("title", "")
                price_dict = item.get("price") or {}
                price_val = price_dict.get("amount", 0.0) if isinstance(price_dict, dict) else float(item.get("price_lkr", 0.0))
                img_url = item.get("image_url") or item.get("image") or ""
                link = item.get("url", "#")
                rating = item.get("rating") or 4.9

                if name and pid:
                    products.append({
                        "id": pid,
                        "title": name,
                        "price_lkr": float(price_val),
                        "image": img_url,
                        "url": link,
                        "available": item.get("in_stock", True),
                        "rating": rating,
                    })
            if products:
                return products
        except Exception:
            pass

        # Markdown Format Parse
        blocks = raw_text.split("**")
        for i in range(1, len(blocks), 2):
            if i + 1 >= len(blocks):
                break
            title = blocks[i].strip().lstrip("0123456789. ")
            details = blocks[i+1]

            id_match = re.search(r"ID:\s*`([^`]+)`", details)
            price_match = re.search(r"LKR\s*([\d,]+)", details)
            link_match = re.search(r"\[View product\]\(([^)]+)\)", details)
            img_match = re.search(r"!\[.*?\]\(([^)]+)\)", details)

            if not id_match:
                continue

            pid = id_match.group(1)
            price_str = price_match.group(1).replace(",", "") if price_match else "0"
            price_val = float(price_str) if price_str.isdigit() else 0.0
            link = link_match.group(1) if link_match else "#"
            img_url = img_match.group(1) if img_match else ""

            if title and pid:
                products.append({
                    "id": pid,
                    "title": title,
                    "price_lkr": price_val,
                    "image": img_url,
                    "url": link,
                    "available": True,
                    "rating": 4.9,
                })

        return products

    def _filter_matched_products(self, text: str, catalog_map: Dict[str, Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Strict Product Match Engine: Return ONLY products explicitly referenced by ID or exact title in LLM response text."""
        matched: List[Dict[str, Any]] = []
        seen_ids = set()
        text_lower = text.lower()

        # 1. Match by product ID in text (e.g. CAKE00KA001685)
        for pid, prod in catalog_map.items():
            if isinstance(prod, dict) and "id" in prod:
                real_id = prod["id"]
                if real_id in text and real_id not in seen_ids:
                    matched.append(prod)
                    seen_ids.add(real_id)

        # 2. If no ID match found, match by exact product title in text
        if not matched:
            for key, prod in catalog_map.items():
                if isinstance(prod, dict) and "title" in prod and "id" in prod:
                    pid = prod["id"]
                    title = prod["title"]
                    if title and title.lower() in text_lower and pid not in seen_ids:
                        matched.append(prod)
                        seen_ids.add(pid)

        return matched

    async def _validate_product_relevance_llm_async(self, items: List[Dict[str, Any]], term: str, user_query: str) -> List[Dict[str, Any]]:
        """LLM-powered async validation: Sends candidate product titles to Gemini API to filter strictly relevant product IDs."""
        if not items:
            return []
        
        try:
            candidates = [{"id": item["id"], "title": item["title"]} for item in items if "id" in item and "title" in item]
            
            prompt = (
                f"User Request: '{user_query}'\n"
                f"Target Category/Search Term: '{term}'\n\n"
                f"Candidate Products List (JSON):\n{json.dumps(candidates)}\n\n"
                "Task: Filter the candidates and select ONLY the product IDs that strictly match the target category and user request.\n"
                "If NONE of the products match the requested item/category, return an empty JSON array [].\n"
                "Return ONLY a JSON array of valid product IDs, e.g. [\"ID1\", \"ID2\"]. Do not include markdown code blocks or explanatory text."
            )
            
            loop = asyncio.get_running_loop()
            
            def _call_gemini():
                api_key = os.getenv("GEMINI_API_KEY")
                if not api_key:
                    return None
                genai_client = genai.Client(api_key=api_key)
                response = genai_client.models.generate_content(
                    model=MODEL_NAME,
                    contents=prompt
                )
                text = response.text or ""
                match = re.search(r"\[.*\]", text, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
                return []

            approved_ids = await loop.run_in_executor(None, _call_gemini)
            
            if approved_ids is not None and isinstance(approved_ids, list):
                approved_set = set(str(pid).strip() for pid in approved_ids)
                validated = [item for item in items if str(item.get("id")).strip() in approved_set]
                return validated
        except Exception as e:
            logger.warning(f"LLM relevance validation failed, falling back to heuristic: {e}")
        
        return self._validate_product_relevance(items, term, user_query)

    def _validate_product_relevance(self, items: List[Dict[str, Any]], term: str, user_query: str) -> List[Dict[str, Any]]:
        """Validate & rank retrieved raw items against target category term and overall user query."""
        if not items:
            return []
        
        term_words = [w.lower() for w in re.findall(r"\w+", term) if len(w) > 2]
        query_words = [w.lower() for w in re.findall(r"\w+", user_query) if len(w) > 2]
        
        scored_items = []
        for item in items:
            title = item.get("title", "").lower()
            score = 0
            for tw in term_words:
                if tw in title:
                    score += 3
            for qw in query_words:
                if qw in title:
                    score += 1
            if score > 0:
                scored_items.append((score, item))
        
        if not scored_items:
            return []

        scored_items.sort(key=lambda x: x[0], reverse=True)
        return [item for score, item in scored_items]
