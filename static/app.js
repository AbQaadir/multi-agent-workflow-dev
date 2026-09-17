document.addEventListener("DOMContentLoaded", () => {
    const chatFeed = document.getElementById("chatFeed");
    const chatForm = document.getElementById("chatForm");
    const userInput = document.getElementById("userInput");
    const newChatBtn = document.getElementById("newChatBtn");
    const suggestionItems = document.querySelectorAll(".suggestion-item");

    // Modal elements
    const checkoutModal = document.getElementById("checkoutModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const checkoutForm = document.getElementById("checkoutForm");

    let sessionId = "session_" + Date.now();

    // Event Listeners for Suggestions
    suggestionItems.forEach(item => {
        item.addEventListener("click", () => {
            const query = item.getAttribute("data-query");
            if (query) {
                userInput.value = query;
                submitQuery(query);
            }
        });
    });

    // New Chat Session
    newChatBtn.addEventListener("click", () => {
        sessionId = "session_" + Date.now();
        chatFeed.innerHTML = `
            <div class="welcome-card">
                <div class="welcome-icon">
                    <i class="fa-solid fa-bag-shopping"></i>
                </div>
                <h1>What can I help you find today?</h1>
                <p>Search products, verify Sri Lanka delivery cities, track orders, or generate gift recommendations using our multi-agent swarm.</p>
            </div>
        `;
    });

    // Chat Form Submit
    chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = userInput.value.trim();
        if (query) {
            submitQuery(query);
        }
    });

    // Modal Controls
    closeModalBtn.addEventListener("click", () => checkoutModal.classList.remove("active"));
    cancelModalBtn.addEventListener("click", () => checkoutModal.classList.remove("active"));

    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            session_id: sessionId,
            name: document.getElementById("recName").value,
            phone: document.getElementById("recPhone").value,
            address: document.getElementById("recAddress").value,
            city: document.getElementById("recCity").value,
            gift_message: document.getElementById("recMessage").value,
        };

        checkoutModal.classList.remove("active");
        appendUserMessage(`Submitted Recipient Details: ${payload.name}, ${payload.phone}, ${payload.city}`);

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            renderCheckoutSuccessResponse(data);
        } catch (err) {
            appendErrorMessage("Error placing order: " + err.message);
        }
    });

    async function submitQuery(queryText) {
        userInput.value = "";

        const welcome = chatFeed.querySelector(".welcome-card");
        if (welcome) welcome.remove();

        appendUserMessage(queryText);

        // Create Assistant Streaming UI Row
        const { assistantContainer, accordionBody, textDiv, productGrid, stepCountSpan } = createStreamingAssistantRow();
        let stepCount = 0;
        let rawText = "";

        try {
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: queryText, session_id: sessionId })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const blocks = buffer.split("\n\n");
                buffer = blocks.pop(); // keep last partial chunk

                for (const block of blocks) {
                    if (!block.trim()) continue;
                    const eventMatch = block.match(/^event:\s*(.+)$/m);
                    const dataMatch = block.match(/^data:\s*(.+)$/m);

                    if (eventMatch && dataMatch) {
                        const eventType = eventMatch[1].trim();
                        const eventData = JSON.parse(dataMatch[1].trim());

                        if (eventType === "thought_step") {
                            stepCount++;
                            stepCountSpan.textContent = stepCount;
                            appendThoughtStep(accordionBody, eventData);
                        } else if (eventType === "text_chunk") {
                            rawText += eventData.chunk;
                            textDiv.innerHTML = formatMarkdown(rawText) + `<span class="typing-cursor"></span>`;
                            chatFeed.scrollTop = chatFeed.scrollHeight;
                        } else if (eventType === "product_card") {
                            appendProductCard(productGrid, eventData);
                        } else if (eventType === "delivery_info") {
                            renderDeliveryWidget(assistantContainer, eventData);
                        } else if (eventType === "end") {
                            const cursor = textDiv.querySelector(".typing-cursor");
                            if (cursor) cursor.remove();
                        }
                    }
                }
            }

            // Remove cursor if finished
            const cursor = textDiv.querySelector(".typing-cursor");
            if (cursor) cursor.remove();

        } catch (err) {
            appendErrorMessage("Failed to stream response from Multi-Agent Workflow server.");
        }
    }

    function createStreamingAssistantRow() {
        const row = document.createElement("div");
        row.className = "msg-row";

        const assistantContainer = document.createElement("div");
        assistantContainer.className = "msg-assistant";

        // Accordion
        const accordion = document.createElement("div");
        accordion.className = "thought-accordion";
        accordion.innerHTML = `
            <details open>
                <summary class="thought-header">
                    <span class="thought-header-title">
                        <i class="fa-solid fa-brain"></i> Agent Thought Process & Workflow (<span class="step-count">0</span> steps)
                    </span>
                    <i class="fa-solid fa-chevron-down"></i>
                </summary>
                <div class="thought-body"></div>
            </details>
        `;

        const stepCountSpan = accordion.querySelector(".step-count");
        const accordionBody = accordion.querySelector(".thought-body");

        // Text Div
        const textDiv = document.createElement("div");
        textDiv.className = "assistant-text";
        textDiv.innerHTML = `<span class="typing-cursor"></span>`;

        // Product Grid
        const productGrid = document.createElement("div");
        productGrid.className = "product-grid";

        assistantContainer.appendChild(accordion);
        assistantContainer.appendChild(textDiv);
        assistantContainer.appendChild(productGrid);

        row.appendChild(assistantContainer);
        chatFeed.appendChild(row);
        chatFeed.scrollTop = chatFeed.scrollHeight;

        return { assistantContainer, accordionBody, textDiv, productGrid, stepCountSpan };
    }

    function appendThoughtStep(accordionBody, stepData) {
        const stepDiv = document.createElement("div");
        stepDiv.className = "thought-step animated-step";
        stepDiv.innerHTML = `
            <i class="fa-solid fa-circle-check thought-step-icon"></i>
            <div class="thought-step-content">
                <span class="thought-step-agent">${escapeHtml(stepData.agent)} <small style="color: var(--text-secondary);">[${stepData.timestamp}]</small></span>
                <span class="thought-step-detail">${escapeHtml(stepData.detail)}</span>
            </div>
        `;
        accordionBody.appendChild(stepDiv);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function appendProductCard(productGrid, p) {
        const card = document.createElement("div");
        card.className = "product-card animated-card";
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${p.image}" alt="${escapeHtml(p.title)}">
                <span class="product-badge">★ ${p.rating || 4.9}</span>
            </div>
            <div class="product-info">
                <div class="product-title">${escapeHtml(p.title)}</div>
                <div class="product-price">Rs. ${Number(p.price_lkr).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                <div class="product-actions">
                    <button class="btn-select" data-id="${p.id}" data-name="${escapeHtml(p.title)}">
                        <i class="fa-solid fa-cart-plus"></i> Select Item
                    </button>
                </div>
            </div>
        `;
        const btn = card.querySelector(".btn-select");
        btn.addEventListener("click", () => {
            checkoutModal.classList.add("active");
        });
        productGrid.appendChild(card);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function renderDeliveryWidget(container, del) {
        const delWidget = document.createElement("div");
        delWidget.className = "delivery-widget animated-card";
        delWidget.innerHTML = `
            <div class="delivery-icon">
                <i class="fa-solid fa-truck-fast"></i>
            </div>
            <div class="delivery-details">
                <h4>Delivery to ${escapeHtml(del.city)} Available!</h4>
                <p>Standard Delivery Fee: <strong>Rs. ${del.delivery_fee}</strong> | Schedule: <strong>${escapeHtml(del.estimated_delivery)}</strong></p>
            </div>
        `;
        container.appendChild(delWidget);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function renderCheckoutSuccessResponse(data) {
        const row = document.createElement("div");
        row.className = "msg-row";
        const assistantContainer = document.createElement("div");
        assistantContainer.className = "msg-assistant";
        const textDiv = document.createElement("div");
        textDiv.className = "assistant-text";
        textDiv.innerHTML = formatMarkdown(data.final_response);
        assistantContainer.appendChild(textDiv);
        row.appendChild(assistantContainer);
        chatFeed.appendChild(row);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function appendUserMessage(text) {
        const row = document.createElement("div");
        row.className = "msg-row";
        row.innerHTML = `<div class="msg-user">${escapeHtml(text)}</div>`;
        chatFeed.appendChild(row);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function appendErrorMessage(msg) {
        const row = document.createElement("div");
        row.className = "msg-row";
        row.innerHTML = `<div class="msg-assistant"><div class="assistant-text" style="color: #ef4444;">${msg}</div></div>`;
        chatFeed.appendChild(row);
        chatFeed.scrollTop = chatFeed.scrollHeight;
    }

    function formatMarkdown(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">$1</code>')
            .replace(/\n/g, '<br>');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
