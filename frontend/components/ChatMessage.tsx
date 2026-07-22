'use client';

import React from 'react';
import { ChatMessage as ChatMessageType, ProductItem } from '@/types/chat';
import { ThoughtAccordion } from './ThoughtAccordion';
import { ProductGrid } from './ProductCard';
import { DeliveryWidget } from './DeliveryWidget';

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectProduct: (product: ProductItem) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectProduct }) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white px-4 py-3 rounded-2xl rounded-tr-xs max-w-[80%] text-sm shadow-md leading-relaxed">
          {message.text}
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex flex-col mb-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-100 max-w-full">
        {/* 1. Thought Process Accordion */}
        {message.thoughtSteps && message.thoughtSteps.length > 0 && (
          <ThoughtAccordion steps={message.thoughtSteps} />
        )}

        {/* 2. Text Streamed Content */}
        {message.text && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
            {message.text}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 bg-orange-500 ml-1 animate-pulse align-middle" />
            )}
          </div>
        )}

        {/* 3. Product Cards Grid */}
        {message.products && message.products.length > 0 && (
          <ProductGrid products={message.products} onSelectProduct={onSelectProduct} />
        )}

        {/* 4. Delivery Info Widget */}
        {message.deliveryInfo && (
          <DeliveryWidget info={message.deliveryInfo} />
        )}
      </div>
    </div>
  );
};
