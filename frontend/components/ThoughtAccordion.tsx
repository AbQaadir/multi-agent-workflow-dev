'use client';

import React, { useState } from 'react';
import { Brain, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ThoughtStep } from '@/types/chat';

interface ThoughtAccordionProps {
  steps: ThoughtStep[];
}

export const ThoughtAccordion: React.FC<ThoughtAccordionProps> = ({ steps }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-slate-800/40 text-xs font-semibold text-slate-300 hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-blue-400" />
          <span>Agent Thought Process & Workflow ({steps.length} steps)</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-3.5 space-y-2 border-t border-slate-800/60 bg-slate-950/40">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <div className="font-semibold text-blue-300 flex items-center gap-2">
                  <span>{step.agent}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    [{step.timestamp}]
                  </span>
                </div>
                <div className="text-slate-400">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
