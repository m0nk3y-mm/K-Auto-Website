import React, { useState } from 'react';
import { Eye, Plus, Check, ZoomIn } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity?: number) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [zoomState, setZoomState] = useState<{ x: number; y: number; isHovered: boolean }>({
    x: 50,
    y: 50,
    isHovered: false
  });

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
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

  const isLowStock = product.StockQty > 0 && product.StockQty <= 8;
  const isOutOfStock = product.StockQty <= 0;

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    >
      {/* Product Image Area with Mouseover Zoom */}
      <div 
        className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden"
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
            transform: zoomState.isHovered ? 'scale(1.45)' : 'scale(1)',
            transition: zoomState.isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out'
          }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/src/assets/images/hero_automotive_parts_1793961736556.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Hover Zoom Hint Badge */}
        <div className={`absolute bottom-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950/80 text-zinc-300 border border-slate-800 backdrop-blur-sm pointer-events-none transition-opacity duration-200 ${
          zoomState.isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <ZoomIn className="w-3 h-3 text-red-400" />
          <span>Zooming {Math.round(zoomState.x)}%</span>
        </div>

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          title="Quick View Specifications"
          aria-label="Quick View Specifications"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Stock Status Indicator */}
        <div className="absolute top-3 left-3 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300 z-10">
          {isOutOfStock ? (
            <span className="text-red-400">Out of Stock</span>
          ) : isLowStock ? (
            <span className="text-amber-400">{product.StockQty} left in stock</span>
          ) : (
            <span className="text-emerald-400">In Stock ({product.StockQty})</span>
          )}
        </div>
      </div>

      {/* Card Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Metadata line: Category · Part ID */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="text-red-400 uppercase font-semibold">{product.Category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.ProductID}</span>
          </div>

          {/* Part Name */}
          <h3 className="mt-1 font-semibold text-white text-base line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
            {product.PartName}
          </h3>

          {/* Compatible Vehicle Models */}
          <p className="mt-2 text-xs text-slate-400 line-clamp-1">
            <span className="text-zinc-400">Fitment:</span> {product.CarModelCompatibility}
          </p>
        </div>

        {/* Price & Action Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase font-mono text-zinc-400">Price (MMK)</span>
            <span className="text-lg font-bold font-mono tabular-nums text-white">
              {Number(product.Price).toLocaleString()} <span className="text-xs font-normal text-zinc-400">MMK</span>
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-950'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
