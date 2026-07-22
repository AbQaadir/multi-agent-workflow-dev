export interface ThoughtStep {
  agent: string;
  detail: string;
  timestamp: string;
}

export interface ProductItem {
  id: string;
  title: string;
  price_lkr: number;
  image: string;
  url: string;
  available: boolean;
  rating?: number;
}

export interface DeliveryInfo {
  city: string;
  delivery_fee: number;
  is_available: boolean;
  estimated_delivery: string;
}

export interface RecipientInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  gift_message?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  thoughtSteps?: ThoughtStep[];
  products?: ProductItem[];
  deliveryInfo?: DeliveryInfo;
  isStreaming?: boolean;
}
