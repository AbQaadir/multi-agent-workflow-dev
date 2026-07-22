'use client';

import React from 'react';
import { Radio, ShieldCheck, Globe } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-slate-100 text-base">Alibaba AI Mode Workspace</h2>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Swarm Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <Globe className="w-3.5 h-3.5 text-orange-400" />
          <span>Sri Lanka (LKR Rs)</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>MCP Authenticated</span>
        </div>
      </div>
    </header>
  );
};
