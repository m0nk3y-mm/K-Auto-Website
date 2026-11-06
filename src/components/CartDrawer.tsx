import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { OrderItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.Price * item.Quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-500" />
              <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
                Your Auto Parts Cart
              </h2>
              <span className="text-xs font-mono text-zinc-400">({items.length})</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-200">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Browse our catalog of performance brakes, suspension components, and engine oils for your car.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.ProductID}
                  className="flex gap-3.5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-800">
                    <img
                      src={item.ImageURL || '/src/assets/images/hero_automotive_parts_1793961736556.jpg'}
                      alt={item.PartName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-red-400 uppercase font-semibold">
                          {item.ProductID}
                        </span>
                        <button
                          onClick={() => onRemoveItem(item.ProductID)}
                          className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate mt-0.5">
                        {item.PartName}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {Number(item.Price).toLocaleString()} MMK
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-slate-700 bg-slate-900 rounded">
                        <button
                          onClick={() => onUpdateQuantity(item.ProductID, item.Quantity - 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono text-white font-medium">
                          {item.Quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.ProductID, item.Quantity + 1)}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">{totalAmount.toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Delivery (Myanmar Express)</span>
                  <span className="text-emerald-400 font-medium">Free for orders &gt; 100,000 MMK</span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total Amount</span>
                  <span className="font-mono text-red-400 tabular-nums">{totalAmount.toLocaleString()} MMK</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-950 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
