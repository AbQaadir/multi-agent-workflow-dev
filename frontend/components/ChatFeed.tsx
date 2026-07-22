'use client';

import React, { useRef, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ChatMessage as ChatMessageType, ProductItem } from '@/types/chat';
import { ChatMessage } from './ChatMessage';

interface ChatFeedProps {
  messages: ChatMessageType[];
  onSelectProduct: (product: ProductItem) => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({ messages, onSelectProduct }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">
          What can I help you find on Kapruka today?
        </h2>
        <p className="text-sm text-slate-400 max-w-md leading-relaxed">
          Search Sri Lanka cakes, flowers, chocolates, check city delivery fees, or track order statuses using our multi-agent swarm.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
      {messages.map((msg) => (
        <ChatMessage key={msg.id} message={msg} onSelectProduct={onSelectProduct} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
