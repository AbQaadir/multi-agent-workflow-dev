import { create } from "zustand";
import Cookies from "js-cookie";
import type { 
  InlineProduct, 
  Message, 
  HistoryItem, 
  DeliveryResult, 
  TrackingResult, 
  ServiceListing, 
  CheckoutLink, 
  OrderFlowStepData, 
  CartItem, 
  ProductGroup, 
  UserAddress,
  ThinkingStep
} from "@/types/sourcing";
import { getApiUrl } from "@/services/apiClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export interface SourcingState {
  // UI State
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  isViewingCart: boolean;
  setIsViewingCart: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Session & Chat State
  isChatting: boolean;
  setIsChatting: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeSessionOwnerId: string | null;
  setActiveSessionOwnerId: (val: string | null) => void;
  activeHistoryId: string | undefined;
  setActiveHistoryId: (id: string | undefined) => void;
  activeQueryText: string;
  setActiveQueryText: (text: string) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  history: HistoryItem[];
  setHistory: (history: HistoryItem[] | ((prev: HistoryItem[]) => HistoryItem[])) => void;
  abortController: AbortController | null;
  setAbortController: (ac: AbortController | null) => void;

  // Settings
  country: string;
  setCountry: (country: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;

  // Products & Cart
  selectedProducts: InlineProduct[];
  setSelectedProducts: (products: InlineProduct[] | ((prev: InlineProduct[]) => InlineProduct[])) => void;
  cartItems: CartItem[];
  setCartItems: (items: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void;
  cartToast: string | null;
  showCartToast: (msg: string) => void;
  clearCartToast: () => void;
  userAddresses: UserAddress[];
  setUserAddresses: (addresses: UserAddress[] | ((prev: UserAddress[]) => UserAddress[])) => void;
  isAgeVerificationRequired: boolean;
  setIsAgeVerificationRequired: (val: boolean) => void;

  // Complex Actions
  fetchHistory: (activeUserId: string) => Promise<void>;
  fetchSessionAndHydrate: (id: string, activeUserId: string, router?: any) => Promise<void>;
  handleDeleteHistory: (id: string, activeUserId: string, router?: any) => Promise<void>;
  handleResetLocal: () => void;
  handleReset: (router?: any) => void;
  handleSelectHistory: (id: string, activeUserId: string, router?: any) => void;
  handleStopGeneration: () => void;
  handleSendMessage: (
    text: string, 
    activeUserId: string, 
    editMessageId?: string
  ) => Promise<void>;
  handleSuggestionClick: (
    suggestion: string | undefined, 
    activeUserId: string
  ) => void;
  handleBuyProduct: (product: InlineProduct, activeUserId: string) => void;
  handleOrderCart: (products: InlineProduct[], activeUserId: string) => void;
  handleUpdateCart: (newCart: CartItem[], activeUserId: string) => Promise<void>;
  handleAddToCart: (products: InlineProduct[], activeUserId: string) => Promise<void>;
}

let cartToastTimerRef: ReturnType<typeof setTimeout> | null = null;

export const useSourcingStore = create<SourcingState>((set, get) => ({
  // --- UI State ---
  isSidebarCollapsed: true,
  setIsSidebarCollapsed: (val) => set((state) => ({ isSidebarCollapsed: typeof val === 'function' ? val(state.isSidebarCollapsed) : val })),
  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: (val) => set((state) => ({ isMobileSidebarOpen: typeof val === 'function' ? val(state.isMobileSidebarOpen) : val })),
  isViewingCart: false,
  setIsViewingCart: (val) => set((state) => ({ isViewingCart: typeof val === 'function' ? val(state.isViewingCart) : val })),

  // --- Session & Chat State ---
  isChatting: false,
  setIsChatting: (val) => set((state) => ({ isChatting: typeof val === 'function' ? val(state.isChatting) : val })),
  activeSessionOwnerId: null,
  setActiveSessionOwnerId: (val) => set({ activeSessionOwnerId: val }),
  activeHistoryId: undefined,
  setActiveHistoryId: (id) => set({ activeHistoryId: id }),
  activeQueryText: "",
  setActiveQueryText: (text) => set({ activeQueryText: text }),
  isGenerating: false,
  setIsGenerating: (val) => set({ isGenerating: val }),
  messages: [],
  setMessages: (val) => set((state) => ({ messages: typeof val === 'function' ? val(state.messages) : val })),
  history: [],
  setHistory: (val) => set((state) => ({ history: typeof val === 'function' ? val(state.history) : val })),
  abortController: null,
  setAbortController: (ac) => set({ abortController: ac }),

  // --- Settings ---
  country: "LK",
  setCountry: (c: string) => {
    set({ country: c });
    if (typeof window !== "undefined") Cookies.set("kapruka_country", c, { expires: 365 });
  },
  currency: "LKR",
  setCurrency: (c: string) => {
    set({ currency: c });
    if (typeof window !== "undefined") Cookies.set("kapruka_currency", c, { expires: 365 });
  },

  // --- Products & Cart ---
  selectedProducts: [],
  setSelectedProducts: (val) => set((state) => ({ selectedProducts: typeof val === 'function' ? val(state.selectedProducts) : val })),
  cartItems: [],
  setCartItems: (val) => set((state) => ({ cartItems: typeof val === 'function' ? val(state.cartItems) : val })),
  cartToast: null,
  showCartToast: (msg: string) => {
    set({ cartToast: msg });
    if (cartToastTimerRef) clearTimeout(cartToastTimerRef);
    cartToastTimerRef = setTimeout(() => {
      set({ cartToast: null });
    }, 3000);
  },
  clearCartToast: () => {
    set({ cartToast: null });
    if (cartToastTimerRef) clearTimeout(cartToastTimerRef);
  },
  userAddresses: [],
  setUserAddresses: (val) => set((state) => ({ userAddresses: typeof val === 'function' ? val(state.userAddresses) : val })),
  isAgeVerificationRequired: false,
  setIsAgeVerificationRequired: (val) => set({ isAgeVerificationRequired: val }),

  // --- Actions ---
  fetchHistory: async (activeUserId) => {
    // In-memory / local history management
  },

  fetchSessionAndHydrate: async (id, activeUserId, router) => {
    const state = get();
    const cachedItem = state.history.find((h) => h.id === id);
    if (cachedItem) {
      set({
        messages: cachedItem.messages,
        activeQueryText: cachedItem.query,
        isChatting: true
      });
    }
  },

  handleResetLocal: () => {
    set({
      isChatting: false,
      messages: [],
      activeHistoryId: undefined,
      activeQueryText: "",
      isGenerating: false,
      selectedProducts: [],
      cartItems: [],
      isViewingCart: false,
      activeSessionOwnerId: null
    });
  },

  handleReset: (router) => {
    set({ isMobileSidebarOpen: false, selectedProducts: [] });
    const ac = get().abortController;
    if (ac) {
      ac.abort();
      set({ abortController: null });
    }
    if (typeof window !== "undefined") window.history.pushState(null, "", "/");
    get().handleResetLocal();
  },

  handleSelectHistory: (id, activeUserId, router) => {
    set({ isMobileSidebarOpen: false, selectedProducts: [], activeHistoryId: id });
    get().fetchSessionAndHydrate(id, activeUserId, router);
  },

  handleDeleteHistory: async (id, activeUserId, router) => {
    set((state) => ({ history: state.history.filter((item) => item.id !== id) }));
    if (id === get().activeHistoryId) {
      get().handleReset(router);
    }
  },

  handleStopGeneration: () => {
    const ac = get().abortController;
    if (ac) {
      ac.abort();
      set({ abortController: null });
    }
    set({ isGenerating: false });
  },

  handleSendMessage: async (text, activeUserId, editMessageId) => {
    const state = get();

    if (state.abortController) {
      state.abortController.abort();
    }

    const abortController = new AbortController();
    set({ abortController });

    const userMessageId = `msg-${Date.now()}`;
    const timestamp = new Date();

    let userMessageIdToUpdate = userMessageId;
    const isEdit = !!editMessageId;
    let historyMessages: Message[] = [];

    if (isEdit) {
      const targetIndex = state.messages.findIndex(m => m.id === editMessageId);
      if (targetIndex !== -1) {
        const targetUserMsg = state.messages[targetIndex];
        const updatedUserMsg: Message = { ...targetUserMsg, text: text, status: "sending" };
        userMessageIdToUpdate = editMessageId!;
        const truncated = state.messages.slice(0, targetIndex);
        historyMessages = [...truncated, updatedUserMsg];
      }
    } else {
      const newUserMessage: Message = {
        id: userMessageId,
        sender: "user",
        text: text,
        timestamp,
        status: "sending",
        inlineProducts: state.selectedProducts.length > 0 ? [...state.selectedProducts] : undefined
      };
      historyMessages = [...state.messages, newUserMessage];
    }

    set({ messages: historyMessages });

    const selectedProductIds = state.selectedProducts.map(p => p.id);
    const isComparisonQuery = selectedProductIds.length > 0;
    
    set({
      selectedProducts: [],
      isChatting: true,
      isGenerating: true,
      activeQueryText: text
    });

    try {
      let currentSessionId = state.activeHistoryId || `session-${Date.now()}`;
      if (!state.activeHistoryId) {
        set({ activeHistoryId: currentSessionId });
        const newHistoryItem: HistoryItem = {
          id: currentSessionId,
          query: text || "New Sourcing Task",
          date: new Date().toLocaleDateString([], { month: "short", day: "2-digit", year: "numeric" }),
          queryType: "product",
          messages: []
        };
        set((s) => ({ history: [newHistoryItem, ...s.history] }));
      }

      const aiMessageId = `ai-msg-${Date.now()}`;
      const newAiMessage: Message = {
        id: aiMessageId,
        sender: "ai",
        text: "",
        timestamp: new Date(),
        thinkingSteps: [],
        activeToolCall: null,
        activeToolCalls: [],
      };

      set((s) => ({
        messages: [...s.messages.map(m => m.id === userMessageIdToUpdate ? { ...m, status: "sent" as const } : m), newAiMessage]
      }));

      // Call local backend endpoint at /api/chat
      const res = await fetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: text,
          userId: activeUserId,
          country: get().country,
          currency: get().currency,
          selectedProductIds: selectedProductIds.map(String),
          selectedProductsList: state.selectedProducts,
          editMessageId: isEdit ? editMessageId : undefined
        }),
        signal: abortController.signal
      });

      if (!res.ok) {
        throw new Error("Failed to post message to chat api");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No stream reader available");

      let buffer = "";
      let fullResponseText = "";
      let inlineProducts: InlineProduct[] = [];
      let followUpQuestions: string[] = [];
      let deliveryResult: DeliveryResult | undefined;
      let trackingResult: TrackingResult | undefined;
      let serviceListing: ServiceListing | undefined;
      let groundingSources: Array<{ title: string; uri: string }> = [];
      let accumulatedSteps: ThinkingStep[] = [];
      let checkoutFormProduct: InlineProduct | undefined = undefined;
      let orderFlowProduct: InlineProduct | undefined = undefined;
      let orderFlowStockStatus: "in_stock" | "out_of_stock" | "limited" | undefined = undefined;
      let orderFlowStockQty: number | undefined = undefined;
      let orderFlowStep: OrderFlowStepData | undefined = undefined;
      let productGroups: ProductGroup[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned) continue;

          if (cleaned.startsWith("data:")) {
            const dataStr = cleaned.replace("data:", "").trim();
            try {
              const packet = JSON.parse(dataStr);

              if (packet.type === "thought") {
                const stepKey = packet.term ? `${packet.step}__${packet.term}` : packet.step;
                const existingIdx = accumulatedSteps.findIndex(s => s._key ? s._key === stepKey : s.step === packet.step && !s._key);
                
                let prevLogs: string[] = [];
                if (existingIdx !== -1) {
                  prevLogs = accumulatedSteps[existingIdx].logs || [];
                }
                
                let updatedLogs = [...prevLogs];
                if (packet.log) {
                  updatedLogs.push(packet.log);
                  if (updatedLogs.length > 10) updatedLogs = updatedLogs.slice(-10);
                }

                const stepObj = {
                  _key: stepKey,
                  step: packet.step,
                  status: packet.status as "running" | "completed",
                  content: packet.content !== undefined ? packet.content : (existingIdx !== -1 ? accumulatedSteps[existingIdx].content : ""),
                  durationMs: packet.durationMs,
                  terms: packet.terms,
                  term: packet.term,
                  logs: updatedLogs,
                };
                
                if (existingIdx !== -1) accumulatedSteps[existingIdx] = stepObj;
                else accumulatedSteps.push(stepObj);

                set((s) => ({
                  messages: s.messages.map(m => m.id === aiMessageId ? { ...m, thinkingSteps: [...accumulatedSteps] } : m)
                }));
              } else if (packet.type === "tool_call") {
                set((s) => ({
                  messages: s.messages.map(m => m.id === aiMessageId ? {
                    ...m,
                    activeToolCall: { name: packet.name, args: packet.args },
                    activeToolCalls: [
                      ...(m.activeToolCalls || []).filter(c => !(c.name === packet.name && (c.args as { query?: string })?.query === (packet.args as { query?: string })?.query)),
                      { name: packet.name, args: packet.args }
                    ],
                  } : m)
                }));
              } else if (packet.type === "tool_result") {
                if (packet.result?.productGroups) {
                  productGroups = packet.result.productGroups;
                  set((s) => ({
                    messages: s.messages.map(m => m.id === aiMessageId ? { 
                      ...m, 
                      activeToolCall: null,
                      activeToolCalls: [],
                      productGroups, 
                      showViewProductsButton: true 
                    } : m)
                  }));
                }
                if (packet.result?.products) {
                  inlineProducts = packet.result.products;
                  set((s) => ({
                    messages: s.messages.map(m => m.id === aiMessageId ? { 
                      ...m, 
                      activeToolCall: null,
                      activeToolCalls: [],
                      inlineProductsHeader: isComparisonQuery ? "Compared Products" : "Kapruka Products", 
                      inlineProducts, 
                      showViewProductsButton: true 
                    } : m)
                  }));
                }
              } else if (packet.type === "text") {
                fullResponseText += packet.content;
                set((s) => ({ messages: s.messages.map(m => m.id === aiMessageId ? { ...m, text: fullResponseText } : m) }));
              }
            } catch (e) {}
          }
        }
      }

      set({ isGenerating: false });

      const finalMappedAi: Message = {
        id: aiMessageId,
        sender: "ai",
        text: fullResponseText,
        timestamp: new Date(),
        thinkingSteps: accumulatedSteps,
        inlineProductsHeader: inlineProducts.length > 0 ? "Kapruka Products" : undefined,
        inlineProducts: inlineProducts.length > 0 ? inlineProducts : undefined,
        productGroups: productGroups.length > 0 ? productGroups : undefined,
        showViewProductsButton: inlineProducts.length > 0,
        deliveryResult,
        trackingResult,
        serviceListing,
        groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
        followUpText: followUpQuestions.length > 0 ? "Continue with:" : undefined,
        followUpSamples: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        checkoutFormProduct,
        orderFlowStep,
        orderFlowProduct,
        orderFlowStockStatus,
        orderFlowStockQty,
      };

      set((s) => ({
        messages: s.messages.map(m => m.id === aiMessageId ? finalMappedAi : m),
        history: s.history.map(h => h.id === currentSessionId ? {
          ...h,
          messages: [...historyMessages.map(um => um.id === userMessageIdToUpdate ? { ...um, status: "sent" as const } : um), finalMappedAi]
        } : h)
      }));

    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        set({ isGenerating: false });
        set((s) => ({
          messages: s.messages.map(m => m.sender === "ai" && m.text === "" ? {
            ...m,
            text: "Sorry, I encountered an error while processing your request. Please check your connection and try again."
          } : m)
        }));
      }
    }
  },

  handleSuggestionClick: (suggestion, activeUserId) => {
    set({ isChatting: true, activeQueryText: "" });
    const initialPrompt: Message = {
      id: "initial-prompt",
      sender: "ai",
      text: "",
      timestamp: new Date(),
      isInitialPrompt: true,
      samples: [
        "Show me birthday cakes under Rs. 3,000",
        "Can you deliver flowers to Kandy this Saturday?",
        "My air conditioner is broken, find a technician in Colombo",
        "Show me handmade gifts from local Sri Lankan artisans",
      ],
    };
    set({ messages: [initialPrompt] });
    if (suggestion) {
      setTimeout(() => get().handleSendMessage(suggestion, activeUserId), 100);
    }
  },

  handleBuyProduct: async (product, activeUserId) => {
    let currentSessionId = get().activeHistoryId || `session-${Date.now()}`;
    set({ activeHistoryId: currentSessionId });

    const updatedCart = [...get().cartItems];
    const existingIdx = updatedCart.findIndex(item => item.id === product.id);
    if (existingIdx > -1) {
      updatedCart[existingIdx] = { ...updatedCart[existingIdx], quantity: updatedCart[existingIdx].quantity + 1 };
    } else {
      updatedCart.push({
        id: product.id,
        name: product.title || product.name || "Kapruka Product",
        price: product.price || 0,
        quantity: 1,
        imageUrl: product.imageUrl || product.image,
        inStock: product.inStock !== false,
      });
    }
    set({ cartItems: updatedCart });
    set({ selectedProducts: [product] });
    setTimeout(() => {
      get().handleSendMessage("checkout cart", activeUserId);
    }, 50);
  },

  handleUpdateCart: async (newCart, activeUserId) => {
    set({ cartItems: newCart });
  },

  handleAddToCart: async (products, activeUserId) => {
    if (products.length === 0) return;
    const updatedCart = [...get().cartItems];
    for (const prod of products) {
      const existingIdx = updatedCart.findIndex(item => String(item.id) === String(prod.id));
      if (existingIdx > -1) {
        updatedCart[existingIdx] = { ...updatedCart[existingIdx], quantity: updatedCart[existingIdx].quantity + 1 };
      } else {
        updatedCart.push({
          id: String(prod.id),
          name: prod.title || prod.name || "Kapruka Product",
          price: prod.price || 0,
          quantity: 1,
          imageUrl: prod.imageUrl || prod.image,
          inStock: prod.inStock !== false,
        });
      }
    }
    set({ cartItems: updatedCart });

    const itemNames = products.map(p => p.title || p.name || "item");
    const toastMsg = itemNames.length === 1
      ? `✓ "${itemNames[0].substring(0, 40)}" added to cart`
      : `✓ ${itemNames.length} items added to cart`;
    get().showCartToast(toastMsg);
  },

  handleOrderCart: async (products, activeUserId) => {
    if (products.length === 0) return;
    get().handleAddToCart(products, activeUserId);
    set({ selectedProducts: products });
    setTimeout(() => {
      get().handleSendMessage("checkout cart", activeUserId);
    }, 50);
  }
}));

export function useSourcingActions() {
  const store = useSourcingStore();
  const router = useRouter();
  const [guestId, setGuestId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem("kapruka_guest_uuid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("kapruka_guest_uuid", id);
    }
    setGuestId(id);
  }, []);

  const activeUserId = guestId || "default_session";

  return {
    activeUserId,
    isSharedReadOnly: false,
    fetchHistory: () => store.fetchHistory(activeUserId),
    fetchSessionAndHydrate: (id: string) => store.fetchSessionAndHydrate(id, activeUserId, router),
    handleDeleteHistory: (id: string) => store.handleDeleteHistory(id, activeUserId, router),
    handleReset: () => store.handleReset(router),
    handleResetLocal: () => store.handleResetLocal(),
    handleSelectHistory: (id: string) => store.handleSelectHistory(id, activeUserId, router),
    handleStopGeneration: () => store.handleStopGeneration(),
    handleSendMessage: (text: string, editMessageId?: string) => store.handleSendMessage(text, activeUserId, editMessageId),
    handleBuyProduct: (product: InlineProduct) => store.handleBuyProduct(product, activeUserId),
    handleOrderCart: (products: InlineProduct[]) => store.handleOrderCart(products, activeUserId),
    handleSuggestionClick: (suggestion?: string) => store.handleSuggestionClick(suggestion, activeUserId),
    handleUpdateCart: (newCart: CartItem[]) => store.handleUpdateCart(newCart, activeUserId),
    handleAddToCart: (products: InlineProduct[]) => store.handleAddToCart(products, activeUserId),
  };
}
