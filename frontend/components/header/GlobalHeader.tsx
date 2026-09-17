"use client";

import { useState } from "react";
import { Globe, Menu, ShoppingCart, Share2, CheckCircle2 } from "lucide-react";
import LocationPopover from "./LocationPopover";
import LanguagePopover from "./LanguagePopover";
import { useSourcingStore, useSourcingActions } from "@/store/useSourcingStore";

interface GlobalHeaderProps {
  onNewSourcing: () => void;
  isCompact?: boolean;
  onMenuToggle?: () => void;
}

export default function GlobalHeader({ onNewSourcing, isCompact = false, onMenuToggle }: GlobalHeaderProps) {
  const [showLocationPopover, setShowLocationPopover] = useState(false);
  const [showLanguagePopover, setShowLanguagePopover] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const country = useSourcingStore(state => state.country);
  const currency = useSourcingStore(state => state.currency);
  const isChatting = useSourcingStore(state => state.activeHistoryId !== null);
  
  const { isSharedReadOnly } = useSourcingActions();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-0 z-10">
      {isSharedReadOnly && (
        <div className="w-full bg-[#f8f9ff] border-b border-[#402970]/10 py-2 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#402970]">
          <span className="w-2 h-2 rounded-full bg-[#402970] animate-pulse"></span>
          You are viewing a shared chat.
          <button onClick={onNewSourcing} className="underline decoration-[#402970]/30 hover:decoration-[#402970] underline-offset-2 ml-1 cursor-pointer">
            Start a new chat
          </button>
          to ask your own questions.
        </div>
      )}
      <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">

        {/* Left Section: Brand & AI Mode */}
        <div className="flex items-center gap-2 sm:gap-6">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
              aria-label="Toggle menu"
              title="Open menu"
            >
              <Menu size={20} />
            </button>
          )}

          <div
            onClick={onNewSourcing}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
          >
            <div className="flex items-center">
              <img
                src="/workflow-logo.jpg"
                alt="Multi-Agent Workflow Logo"
                className="h-8 sm:h-10 w-auto object-contain rounded-md"
              />
            </div>
            <div className="h-5 sm:h-6 w-[1px] bg-slate-200 mx-0.5 sm:mx-1"></div>
          </div>

          {!isCompact && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-[#402970] transition-colors">Products</a>
              <a href="#" className="hover:text-[#402970] transition-colors">Manufacturers</a>
              <a href="#" className="hover:text-[#402970] transition-colors">Worldwide</a>
            </nav>
          )}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-600">

          {/* Deliver To */}
          <div
            className="relative hidden lg:block"
            onMouseEnter={() => setShowLocationPopover(true)}
            onMouseLeave={() => setShowLocationPopover(false)}
          >
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors py-2">
              <span className="text-xs">Deliver to:</span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold px-1 py-0.2 bg-slate-100 rounded text-slate-700 border border-slate-200 uppercase">
                  {country}
                </span>
              </div>
            </div>

            {showLocationPopover && (
              <LocationPopover onClose={() => setShowLocationPopover(false)} />
            )}
          </div>

          {/* Lang/Currency */}
          <div
            className="relative hidden sm:block"
            onMouseEnter={() => setShowLanguagePopover(true)}
            onMouseLeave={() => setShowLanguagePopover(false)}
          >
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 transition-colors py-2">
              <Globe size={16} className="text-slate-500" />
              <span>English-{currency}</span>
            </div>

            {showLanguagePopover && (
              <LanguagePopover onClose={() => setShowLanguagePopover(false)} />
            )}
          </div>

          {/* Cart */}
          <a href="#" className="p-2 text-slate-500 hover:text-slate-900 transition-colors relative" title="Shopping Cart">
            <ShoppingCart size={19} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#402970]"></span>
          </a>

          {/* Share Button */}
          {isChatting && !isSharedReadOnly && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#402970]/30 hover:bg-[#402970]/5 text-slate-600 hover:text-[#402970] transition-colors text-xs font-semibold"
            >
              {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Share2 size={14} />}
              {copied ? "Copied" : "Share"}
            </button>
          )}
        </div>

      </div>
      </header>
    </div>
  );
}
