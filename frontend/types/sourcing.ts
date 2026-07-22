export interface InlineProduct {
  id: string;
  name?: string;
  title?: string; // legacy compat
  price?: number;          // LKR (from MCP)
  priceDisplay?: string;   // formatted
  originalPrice?: number;  // original LKR price (before discount)
  imageUrl?: string;
  category?: string;
  inStock?: boolean;
  description?: string;
  url?: string;
  isSME?: boolean;
  currency?: string;
  stockCount?: number;
  isExplicitlySelected?: boolean;
  // legacy fields
  moq?: string;
  supplier?: string;
  location?: string;
  years?: number;
  rating?: number;
  verified?: boolean;
  image?: string;
  bgColor?: string;
}

// ── Conversational Order Flow Types ───────────────────────────────────────────

export interface CartItem {
  id: string;
  supplierId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  inStock?: boolean;
  stockQty?: number;
}

export type OrderFlowPhase =
  | "qty_ask"            // AI asked quantity — show quantity picker widget
  | "delivery_ask"       // AI asked delivery location — show all saved address cards + new address button
  | "new_address_form"   // Combined name+phone+rough-location+map form (replaces address_ask)
  | "address_ask"        // LEGACY: kept for backward compat with old DB sessions → renders as map_open
  | "map_open"           // LEGACY: show embedded Google Map for pin drop (old sessions only)
  | "delivery_date_ask" // NEW: user picks delivery date + optional gift/personal message
  | "payment_ask"        // AI asked payment method — show COD / Card buttons
  | "confirmed"          // Order placed — show confirmation card
  | "out_of_stock";      // Product out of stock — show apology

export interface SavedAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
}

/** Categorized saved delivery address per user */
export interface UserAddress {
  id: string;
  type: "home" | "work" | "custom";
  label: string;          // "Home" | "Work" | user-typed
  recipientName: string;  // who receives delivery
  phone: string;          // delivery contact number
  addressLine: string;    // street / rough address text
  city: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  isDefault: boolean;
}

export interface GeocodedLocation {
  lat: number;
  lng: number;
  label: string;
  formattedAddress: string;
}

export interface OrderFlowStepData {
  phase: OrderFlowPhase;
  product?: InlineProduct;
  cartItems?: CartItem[];
  stockStatus?: "in_stock" | "out_of_stock" | "limited";
  stockQty?: number;
  savedAddress?: SavedAddress;
  savedAddresses?: UserAddress[];
  geocodedLocation?: GeocodedLocation;
  confirmedQuantity?: number;
  confirmedAddress?: SavedAddress;
  paymentMethod?: "cod" | "card";
  checkoutUrl?: string;
  orderId?: string;
  errorMessage?: string;
  deliveryDate?: string;
  personalMessage?: string;
  deliveryFeeLKR?: number;
  deliveryCheckResult?: {
    city: string;
    canDeliver: boolean;
    flatRateLKR?: number;
    nextAvailableDate?: string;
    warning?: string;
  };
}

export interface DeliveryResult {
  city: string;
  canDeliver: boolean;
  deliveryDate?: string;
  flatRateLKR?: number;
  perishableAllowed?: boolean;
  warning?: string;
}

export interface TrackingStep {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}

export interface TrackingResult {
  orderId: string;
  currentStatus: string;
  estimatedDelivery?: string;
  steps: TrackingStep[];
  displayOrderRef?: string;
  displayTotalLKR?: number;
  displayItems?: Array<{
    name: string;
    quantity: number;
    priceLKR: number;
  }>;
  displayPersonalMessage?: string;
  displayRecipient?: {
    name: string;
    city: string;
  };
}

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  coverageAreas: string[];
  pricingLKR: string;
  phone: string;
  verified: boolean;
  responseTime: string;
}

export interface ServiceListing {
  category: string;
  categoryLabel: string;
  providers: ServiceProvider[];
  needsCityInput: boolean;
  cityPrompt?: string;
}

export interface CheckoutLink {
  productId: string;
  productTitle: string;
  priceLKR: number;
  checkoutUrl: string;
  expiresAt: string;
}

export interface ProductGroup {
  title: string;
  products: InlineProduct[];
}

export interface ThinkingStep {
  step: string;
  status: "running" | "completed";
  content: string;
  durationMs?: number;
  terms?: string[];
  term?: string;
  _key?: string;
  logs?: string[];
}

export interface CitySuggestion {
  name: string;
  alias?: string;
  province?: string;
}

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  status?: "sending" | "sent" | "analyzing";
  isInitialPrompt?: boolean;
  samples?: string[];

  // Thought process
  thinkingSteps?: ThinkingStep[];
  activeToolCall?: { name: string; args: unknown } | null;
  activeToolCalls?: Array<{ name: string; args: unknown }>;

  // products
  inlineProductsHeader?: string;
  inlineProducts?: InlineProduct[];
  productGroups?: ProductGroup[];
  showViewProductsButton?: boolean;

  // delivery
  deliveryResult?: DeliveryResult;
  trackingResult?: TrackingResult;
  citySuggestions?: CitySuggestion[];

  // services
  serviceListing?: ServiceListing;

  // Checkout links
  checkoutLinks?: CheckoutLink[];
  checkoutFormProduct?: InlineProduct;

  // Conversational order flow
  orderFlowStep?: OrderFlowStepData;
  orderFlowProduct?: InlineProduct;
  orderFlowStockStatus?: "in_stock" | "out_of_stock" | "limited";
  orderFlowStockQty?: number;

  // Google Search Grounding sources
  groundingSources?: Array<{ title: string; uri: string }>;

  // Follow-ups
  followUpText?: string;
  followUpSamples?: string[];
}

export interface HistoryItem {
  id: string;
  query: string;
  date: string;
  queryType: "design" | "manufacturer" | "bestseller" | "product" | "general";
  messages: Message[];
}
