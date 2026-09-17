# SourcingDashboard UI Migration & Backend Alignment Task Tracker

## Overview
Migrate the full `SourcingDashboard` chat UI into `multi-agent-workflow`, preserving exact styling while completely stripping out authentication (Supabase). Also align the Python FastAPI SSE streaming responses to yield the structured JSON packets expected by the frontend.

---

## Detailed Implementation Roadmap

### Phase 7: Prerequisites & Package Setup
- [x] **Task 7.1**: Install required dependencies (`zustand`, `js-cookie`, `@types/js-cookie`, `@react-google-maps/api`) in `frontend/`.
- [x] **Task 7.2**: Verify `package.json` and ensure compatibility with Next.js & React 19.

### Phase 8: Assets, Design Tokens & Core Layout Setup
- [x] **Task 8.1**: Copy SVG assets (`world.svg`, `person.svg`, `workflow-logo.jpg`, etc.) from source `frontend/public/` to `frontend/public/`.
- [x] **Task 8.2**: Copy `globals.css` with exact Tailwind v4 variables, keyframe animations, and custom scrollbars.
- [x] **Task 8.3**: Copy `types/sourcing.ts` to `frontend/types/sourcing.ts` for full TypeScript definitions.
- [x] **Task 8.4**: Update `frontend/app/layout.tsx` to include `Plus_Jakarta_Sans` font and `SourcingInitializer` (without AuthProvider).

### Phase 9: Component Migration & Authentication Stripping
- [x] **Task 9.1**: Copy `useSourcingStore.ts` to `frontend/store/` and remove database/Supabase/Auth fetching code.
- [x] **Task 9.2**: Copy `components/sidebar/` and strip `useAuth` from `GlobalSidebar.tsx` and `OrdersPanel.tsx`.
- [x] **Task 9.3**: Copy `components/landing/` and strip `useAuth` from `LandingWorkspace.tsx`.
- [x] **Task 9.4**: Copy `components/header/` and strip `useAuth` from `GlobalHeader.tsx`.
- [x] **Task 9.5**: Copy `components/profile/` and strip `useAuth` from `SettingsModal.tsx`.
- [x] **Task 9.6**: Copy `components/chat/` (`ChatWorkspace.tsx`, `ChatMessageTimeline.tsx`, `ThinkingPanel.tsx`, `ChatInputArea.tsx`, `ProductCard.tsx`, `ProductGrid.tsx`, `ProductCatalogModal.tsx`, `CartModal.tsx`, `ShareChatModal.tsx`, `AgeVerificationModal.tsx`).
- [x] **Task 9.7**: Copy `components/SourcingDashboard.tsx` and remove `useAuth` / `isSyncing` references.
- [x] **Task 9.8**: Update `frontend/app/page.tsx` to mount `<SourcingDashboard />`.

### Phase 10: Backend SSE Endpoint & Schema Alignment
- [x] **Task 10.1**: Update `web_server.py` to handle `@app.post("/api/chat")` streaming requests.
- [x] **Task 10.2**: Refactor `planner/workflow.py` `execute_query_stream` to yield structured JSON SSE packets:
  - `{"type": "thought", "step": "...", "content": "...", "status": "completed"}`
  - `{"type": "text", "content": "..."}`
  - `{"type": "tool_result", "result": {"products": [...]}}`
  - `{"type": "end"}`

### Phase 11: Build & End-to-End Verification
- [x] **Task 11.1**: Run `npm run build` in `frontend/` to ensure zero TypeScript or build errors.
- [x] **Task 11.2**: Start `web_server.py` and `npm run dev`, test chat query in UI, verify thoughts and product cards render cleanly.

---

## Phase 12: Production-Grade Agent Response Formatting & Swarm Enhancement
- [x] **Task 12.1**: Refactor `root_agent` system instruction in `swarm_agent/agent.py` to enforce scannable visual markdown hierarchy (`### Subheadings`, bold highlights, bullet points).
- [x] **Task 12.2**: Implement side-by-side comparison table formatting instructions for user-selected products queries.
- [x] **Task 12.3**: Update sub-agent prompts in `prompts/agent_prompts.py` (`RESPONSE_AGENT_INSTRUCTION`, `PRODUCT_AGENT_INSTRUCTION`, `RECOMMENDATION_AGENT_INSTRUCTION`) for rich markdown consistency.
- [x] **Task 12.4**: Add proactive Call-to-Action (CTA) formatting rules guiding shoppers to city delivery checks and direct checkout.
- [x] **Task 12.5**: Verify full stack with build tests and update `walkthrough.md`.

