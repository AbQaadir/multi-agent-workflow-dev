'use client';

import React from 'react';
import { ShoppingBag, Plus, Sparkles, Cpu, Server } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  onSelectSuggestion: (query: string) => void;
}

const SUGGESTIONS = [
  'Show me chocolate birthday cakes under 8000 LKR',
  'Do you deliver to Galle tomorrow?',
  'Track order KP-998877 status',
  'Recommend anniversary flowers with price',
];

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat, onSelectSuggestion }) => {
  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col p-5 flex-shrink-0 h-screen">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-lg text-slate-100 flex items-center gap-1">
            Kapruka <span className="text-orange-500">AI</span>
          </h1>
          <span className="text-xs text-slate-400">Swarm Commerce Assistant</span>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
      >
        <Plus className="w-4 h-4" />
        <span>New Conversation</span>
      </button>

      {/* Suggestions Section */}
      <div className="flex-1 mt-6 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Quick Prompts
        </h3>
        <div className="space-y-2">
          {SUGGESTIONS.map((query, idx) => (
            <button
              key={idx}
              onClick={() => onSelectSuggestion(query)}
              className="w-full text-left p-2.5 rounded-lg bg-slate-800/50 hover:bg-orange-500/10 border border-slate-800 hover:border-orange-500/30 text-xs text-slate-300 transition-all duration-150 flex items-center gap-2 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400 opacity-70 group-hover:opacity-100 flex-shrink-0" />
              <span className="line-clamp-2">{query}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer System Badges */}
      <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Gemini 3.5 Flash</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40">
          <Server className="w-4 h-4 text-blue-400" />
          <span>Kapruka Remote MCP</span>
        </div>
      </div>
    </aside>
  );
};
