import React from 'react';
import { CheckCircle, Package, ArrowRight, Table, Copy, Check } from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderDetails: {
    name: string;
    phone: string;
    address: string;
    total: number;
    method: string;
  } | null;
  onViewInAdmin?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderDetails,
  onViewInAdmin
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !orderDetails) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-5">
        
        {/* Animated Success Badge */}
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-white">
            Order Confirmed!
          </h2>
          <p className="text-xs text-slate-300">
            Thank you for ordering with Kauto Myanmar. Your order has been recorded into the database.
          </p>
        </div>

        {/* Order Reference Ticket */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-left space-y-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-mono text-zinc-400 block">Order Identifier</span>
              <span className="text-sm font-mono font-bold text-red-400">{orderId}</span>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Customer:</span>
              <span className="text-slate-200 font-medium">{orderDetails.name}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Contact Phone:</span>
              <span className="text-slate-200 font-mono">{orderDetails.phone}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Payment Method:</span>
              <span className="text-slate-200">{orderDetails.method}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[11px]">Total Paid/Due:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {orderDetails.total.toLocaleString()} MMK
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="text-zinc-400 block">Delivery Address:</span>
            <span>{orderDetails.address}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onViewInAdmin && (
            <button
              onClick={() => {
                onClose();
                onViewInAdmin();
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Table className="w-3.5 h-3.5 text-red-400" />
              <span>Track in Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-red-950"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
