'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import { DeliveryInfo } from '@/types/chat';

interface DeliveryWidgetProps {
  info: DeliveryInfo;
}

export const DeliveryWidget: React.FC<DeliveryWidgetProps> = ({ info }) => {
  if (!info) return null;

  return (
    <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 flex items-center gap-3.5 shadow-lg">
      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
        <Truck className="w-5 h-5" />
      </div>
      <div className="flex flex-col text-xs">
        <h4 className="font-bold text-slate-100 text-sm">
          Delivery to {info.city} Available!
        </h4>
        <div className="text-slate-300 mt-0.5">
          Standard Delivery Fee: <span className="font-semibold text-emerald-400">Rs. {info.delivery_fee}</span> | Schedule:{' '}
          <span className="font-semibold text-slate-200">{info.estimated_delivery}</span>
        </div>
      </div>
    </div>
  );
};
