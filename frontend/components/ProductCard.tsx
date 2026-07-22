'use client';

import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { ProductItem } from '@/types/chat';

interface ProductCardProps {
  product: ProductItem;
  onSelect: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:-translate-y-1 group">
      <div className="relative h-40 w-full overflow-hidden bg-slate-950">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{product.rating || 4.9}</span>
        </div>
      </div>

      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h4 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-tight">
            {product.title}
          </h4>
          <div className="mt-2 text-base font-bold text-orange-400 font-mono">
            Rs. {Number(product.price_lkr).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <button
          onClick={() => onSelect(product)}
          className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/20 active:scale-95"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Select Item</span>
        </button>
      </div>
    </div>
  );
};

interface ProductGridProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, onSelectProduct }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
      ))}
    </div>
  );
};
