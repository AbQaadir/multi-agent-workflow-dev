"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useSourcingStore } from "@/store/useSourcingStore";
import AddressManager from "./AddressManager";
import type { UserAddress } from "@/types/sourcing";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const userAddresses = useSourcingStore(state => state.userAddresses);
  const setUserAddresses = useSourcingStore(state => state.setUserAddresses);
  const [isSavingAddresses, setIsSavingAddresses] = useState(false);

  if (!isOpen) return null;

  const handleSaveAddresses = async (updated: UserAddress[]) => {
    setIsSavingAddresses(true);
    setUserAddresses(updated);
    setIsSavingAddresses(false);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] animate-fadeIn">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative w-full max-w-[800px] bg-white rounded-xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col md:flex-row animate-slideUp max-h-[88vh]">

        {/* Left User Identity Panel */}
        <div className="w-full md:w-[260px] shrink-0 bg-slate-50 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-100 select-none relative">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#402970_1px,transparent_1px)] [background-size:12px_12px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-transparent to-[#402970]/5 opacity-40" />

          <div className="flex flex-col items-center gap-4 text-center z-10 w-full">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#402970] to-purple-500 flex items-center justify-center font-extrabold text-2xl text-white shrink-0 shadow-md">
              MW
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-800 tracking-tight leading-snug">Guest User</h4>
              <p className="text-xs text-slate-400 font-medium leading-none">Multi-Agent Workflow Session</p>
            </div>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative max-h-[88vh]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer z-10"
          >
            <X size={16} />
          </button>

          <div className="px-8 pt-8 pb-1 shrink-0 flex flex-col gap-1">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Settings</h3>
          </div>

          <div className="overflow-y-auto flex-1 px-8 pb-8 pt-1">
            <AddressManager
              addresses={userAddresses}
              onSave={handleSaveAddresses}
              isSaving={isSavingAddresses}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
