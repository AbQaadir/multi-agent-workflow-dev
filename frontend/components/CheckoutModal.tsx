'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { ProductItem } from '@/types/chat';

interface CheckoutModalProps {
  isOpen: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onSubmit: (details: {
    name: string;
    phone: string;
    address: string;
    city: string;
    gift_message: string;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  product,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Colombo');
  const [giftMessage, setGiftMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, phone, address, city, gift_message: giftMessage });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-base">
            Recipient Delivery Details
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Product Summary */}
        {product && (
          <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-3">
            <img
              src={product.image}
              alt={product.title}
              className="w-12 h-12 rounded-lg object-cover border border-slate-800"
            />
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-slate-200 line-clamp-1">{product.title}</span>
              <span className="text-orange-400 font-bold">Rs. {Number(product.price_lkr).toLocaleString('en-US')}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Recipient Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kasun Perera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Recipient Phone Number</label>
            <input
              type="tel"
              required
              placeholder="e.g. 0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Street Address</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. No 45, Temple Road"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Delivery City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500 text-xs"
            >
              <option value="Colombo">Colombo</option>
              <option value="Galle">Galle</option>
              <option value="Kandy">Kandy</option>
              <option value="Negombo">Negombo</option>
              <option value="Jaffna">Jaffna</option>
              <option value="Matara">Matara</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Gift Message (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Happy Birthday!"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-orange-500 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold flex items-center gap-1.5 text-xs shadow-lg shadow-orange-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Generate Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
