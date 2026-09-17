"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  SquarePen,
  History,
  Globe,
  Package,
} from "lucide-react";
import SidebarHistoryList from "./SidebarHistoryList";
import LanguagePopover from "../header/LanguagePopover";
import { useSourcingStore, useSourcingActions } from "@/store/useSourcingStore";
import { HistoryItem } from "@/types/sourcing";
import SettingsModal from "../profile/SettingsModal";
import OrdersPanel from "./OrdersPanel";

interface GlobalSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  onReset: () => void;
  history: HistoryItem[];
  onSelectHistory: (id: string) => void;
  activeHistoryId?: string;
}

const CaretLineLeft = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="6" y1="4" x2="6" y2="20" />
    <polyline points="18 5 11 12 18 19" />
  </svg>
);

const CaretLineRight = ({ className, size = 20 }: { className?: string; size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 5 13 12 6 19" />
    <line x1="18" y1="4" x2="18" y2="20" />
  </svg>
);

export default function GlobalSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onReset,
  history,
  onSelectHistory,
  activeHistoryId,
}: GlobalSidebarProps) {
  const [showLanguagePopover, setShowLanguagePopover] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const languageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageContainerRef.current && !languageContainerRef.current.contains(event.target as Node)) {
        setShowLanguagePopover(false);
      }
    }
    if (showLanguagePopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLanguagePopover]);

  const currency = useSourcingStore(state => state.currency);
  const { handleDeleteHistory } = useSourcingActions();

  const isEffectiveCollapsed = isCollapsed && !isMobileOpen;

  return (
    <>
      <aside
        className={`shrink-0 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] bg-[#faf9f6] md:bg-slate-50/50
          fixed md:static inset-y-0 left-0 h-full z-40 md:z-20 md:border-r border-slate-100
          ${isMobileOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-16" : "md:w-64"}
        `}
      >
        {/* Top Section - Brand/Logo & Collapse Toggle */}
        <div className="h-14 flex items-center justify-between px-3.5 relative overflow-hidden shrink-0 group/header">
          {/* Mobile close button */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen?.(false)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-[#402970] hover:text-[#402970] transition-colors cursor-pointer outline-none focus:outline-none"
              title="Close sidebar"
            >
              <X size={20} />
            </button>
          )}

          {/* Logo transition wrapper */}
          <div className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden shrink-0 select-none flex items-center ${
            isEffectiveCollapsed
              ? "w-9 justify-center opacity-100 group-hover/header:w-0 group-hover/header:opacity-0 group-hover/header:pointer-events-none"
              : "w-32 justify-start pl-1 opacity-100"
          }`}>
            <img
              src="/image.png"
              alt="Multi-Agent Workflow Logo"
              className="h-8 w-auto object-contain rounded-md"
            />
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden md:flex h-9 hover:bg-slate-100 rounded-lg text-[#402970] hover:text-[#402970] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer outline-none items-center justify-center shrink-0 relative ${
              isEffectiveCollapsed
                ? "w-0 opacity-0 pointer-events-none group-hover/header:w-9 group-hover/header:opacity-100 group-hover/header:pointer-events-auto"
                : "w-9 ml-auto"
            }`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <CaretLineRight className={`absolute transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              isEffectiveCollapsed ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50 pointer-events-none"
            }`} size={20} />
            <CaretLineLeft className={`absolute transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              !isEffectiveCollapsed ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50 pointer-events-none"
            }`} size={20} />
          </button>
        </div>

        {/* Main Navigation List */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-none">
          {/* New Chat Option */}
          <button
            onClick={onReset}
            className={`w-full h-10 px-2.5 flex items-center justify-start rounded-xl text-sm transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer relative outline-none group ${
              activeHistoryId === undefined
                ? "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100/50 text-[#402970] font-bold"
                : "text-slate-700 border border-transparent hover:bg-[#402970]/5 hover:text-[#402970] font-semibold"
            }`}
            title="New chat"
          >
            <SquarePen size={19} className="text-[#402970] shrink-0" />
            <span className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap ${
              isEffectiveCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
            }`}>
              New chat
            </span>
            <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#402970] rounded-l-full transition-all duration-300 ${
              isEffectiveCollapsed && activeHistoryId === undefined ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
            }`} />
          </button>

          {/* History Section Header */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => { if (isEffectiveCollapsed) setIsCollapsed(false); }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-slate-800 font-bold text-sm select-none outline-none cursor-pointer hover:bg-slate-50/50 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              title="History"
            >
              <div className="flex items-center">
                <History size={19} className="text-[#402970] shrink-0" />
                <span className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap font-extrabold text-[13px] text-slate-800 tracking-wide ${
                  isEffectiveCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-3"
                }`}>
                  History
                </span>
              </div>
            </button>

            {/* History List Wrap */}
            <div className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
              isEffectiveCollapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[70vh] opacity-100"
            }`}>
              {history.length > 0 && (
                <SidebarHistoryList
                  history={history}
                  activeHistoryId={activeHistoryId}
                  onSelectHistory={onSelectHistory}
                  onDeleteHistory={handleDeleteHistory}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-100/50 space-y-1 shrink-0">

          {/* Language & Currency */}
          <div className="relative" ref={languageContainerRef}>
            <button
              onClick={() => setShowLanguagePopover(!showLanguagePopover)}
              className="w-full h-10 px-2.5 flex items-center justify-start transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer outline-none group border border-slate-200 bg-white hover:bg-slate-50 hover:border-[#402970]/20 hover:shadow-sm text-slate-700 font-bold text-xs rounded-xl"
              title={`Language & Currency: English-${currency}`}
            >
              <Globe size={19} className="text-[#402970] group-hover:text-[#402970] transition-colors shrink-0" />
              <span className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap group-hover:text-[#402970] transition-colors ${
                isEffectiveCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-2.5"
              }`}>
                English (<span className="uppercase">{currency}</span>)
              </span>
            </button>
            {showLanguagePopover && (
              <LanguagePopover onClose={() => setShowLanguagePopover(false)} align="right" />
            )}
          </div>

          {/* Orders button */}
          <button
            onClick={() => setIsOrdersOpen(true)}
            className="w-full h-10 px-2.5 flex items-center justify-start transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer outline-none group border border-slate-200 bg-white hover:bg-slate-50 hover:border-[#402970]/20 hover:shadow-sm text-slate-700 font-bold text-xs rounded-xl"
            title="My Orders"
          >
            <Package
              size={19}
              className="text-[#402970] group-hover:text-[#402970] transition-colors shrink-0"
            />
            <span className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap group-hover:text-[#402970] transition-colors ${
              isEffectiveCollapsed ? "max-w-0 opacity-0 ml-0" : "max-w-[150px] opacity-100 ml-2.5"
            }`}>
              My Orders
            </span>
          </button>

        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Orders Panel */}
      <OrdersPanel isOpen={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
    </>
  );
}
