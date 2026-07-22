'use client';

import { useState, useCallback } from 'react';
import { ChatMessage, ThoughtStep, ProductItem, DeliveryInfo } from '@/types/chat';

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => 'session_' + Date.now());

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isStreaming) return;

    const userMsgId = 'usr_' + Date.now();
    const assistantMsgId = 'ast_' + Date.now();

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
    };

    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      thoughtSteps: [],
      products: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, session_id: sessionId }),
      });

      if (!response.body) {
        throw new Error('No response body returned from server');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(.+)$/m);
          const dataMatch = block.match(/^data:\s*(.+)$/m);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1].trim();
            const eventData = JSON.parse(dataMatch[1].trim());

            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.id !== assistantMsgId) return msg;

                if (eventType === 'thought_step') {
                  const newStep: ThoughtStep = eventData;
                  return {
                    ...msg,
                    thoughtSteps: [...(msg.thoughtSteps || []), newStep],
                  };
                } else if (eventType === 'text_chunk') {
                  return {
                    ...msg,
                    text: msg.text + eventData.chunk,
                  };
                } else if (eventType === 'product_card') {
                  const newProduct: ProductItem = eventData;
                  const existing = msg.products || [];
                  if (!existing.some((p) => p.id === newProduct.id)) {
                    return {
                      ...msg,
                      products: [...existing, newProduct],
                    };
                  }
                  return msg;
                } else if (eventType === 'delivery_info') {
                  const del: DeliveryInfo = eventData;
                  return {
                    ...msg,
                    deliveryInfo: del,
                  };
                } else if (eventType === 'end') {
                  return {
                    ...msg,
                    isStreaming: false,
                  };
                }
                return msg;
              })
            );
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: '⚠️ Unable to connect to Kapruka Swarm backend on http://localhost:8000.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    clearChat,
  };
}
