import React, { useState } from 'react';
import { X, Check, ShieldCheck, Truck, ShoppingBag, Plus, Minus, ZoomIn } from 'lucide-react';
import { Product } from '../types';

interface ProductQuickViewProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [zoomState, setZoomState] = useState<{ x: number; y: number; isHovered: boolean }>({
    x: 50,
    y: 50,
    isHovered: false
  });

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 700);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomState({ x, y, isHovered: true });
  };

  const handleMouseLeave = () => {
    setZoomState({ x: 50, y: 50, isHovered: false });
  };

  const isOutOfStock = product.StockQty <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-950/70 hover:bg-slate-950 border border-slate-800 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Left with Interactive Zoom */}
          <div 
            className="relative aspect-4/3 md:aspect-auto bg-slate-950 overflow-hidden cursor-crosshair group/zoom"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setZoomState(prev => ({ ...prev, isHovered: true }))}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={product.ImageURL}
              alt={product.PartName}
              className="w-full h-full object-cover select-none pointer-events-none will-change-transform"
              style={{
                transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
                transform: zoomState.isHovered ? 'scale(2.0)' : 'scale(1)',
                transition: zoomState.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out'
              }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/hero_automotive_parts_1793961736556.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden pointer-events-none" />

            {/* Magnifier Tip Indicator */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono bg-slate-950/80 text-zinc-300 border border-slate-800 backdrop-blur-md pointer-events-none">
              <ZoomIn className="w-3 h-3 text-red-400" />
              <span>{zoomState.isHovered ? `Zooming 200% (${Math.round(zoomState.x)}%, ${Math.round(zoomState.y)}%)` : 'Mouse over to zoom'}</span>
            </div>
          </div>

          {/* Details Right */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Category & Part ID */}
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="text-red-500 font-semibold uppercase">{product.Category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.ProductID}</span>
                <span aria-hidden="true">·</span>
                <span className={product.StockQty > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {product.StockQty > 0 ? `${product.StockQty} Available` : 'Out of Stock'}
                </span>
              </div>

              {/* Title */}
              <h2 className="mt-2 text-xl font-bold text-white leading-snug">
                {product.PartName}
              </h2>

              {/* Price */}
              <div className="mt-3">
                <span className="text-2xl font-black font-mono tabular-nums text-white">
                  {Number(product.Price).toLocaleString()}
                </span>
                <span className="ml-1.5 text-xs font-mono text-zinc-400">MMK (Myanmar Kyats)</span>
              </div>

              {/* Compatibility Box */}
              <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-slate-300 font-mono uppercase tracking-wider block">
                  Verified Car Fitment:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {product.CarModelCompatibility}
                </p>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                {product.Description}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-zinc-400 font-medium">Quantity</span>
                <div className="flex items-center border border-slate-700 bg-slate-950 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-mono font-bold text-white">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(Math.min(product.StockQty, qty + 1))}
                    disabled={qty >= product.StockQty}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {qty} to Cart — {(Number(product.Price) * qty).toLocaleString()} MMK</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-blue-400" />
                  Same-day dispatch
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  OEM Warranty Verified
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
