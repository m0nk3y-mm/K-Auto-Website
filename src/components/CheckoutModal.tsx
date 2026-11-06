import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Loader2, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { User, OrderItem } from '../types';
import { dbService } from '../services/databaseService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  currentUser: User | null;
  onOrderSuccess: (orderId: string, orderDetails: { name: string; phone: string; address: string; total: number; method: string }) => void;
  onOpenAuth: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onOrderSuccess,
  onOpenAuth
}) => {
  const [name, setName] = useState(currentUser?.FullName || '');
  const [phone, setPhone] = useState(currentUser?.Phone || '');
  const [address, setAddress] = useState(currentUser?.Address || '');
  const [township, setTownship] = useState('Kamayut, Yangon');
  const [paymentMethod, setPaymentMethod] = useState<'KBZPay' | 'WavePay' | 'Cash on Delivery' | 'AYA Bank'>('KBZPay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = items.reduce((sum, item) => sum + item.Price * item.Quantity, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('ကျေးဇူးပြု၍ အမည်အပြည့်အစုံ ထည့်သွင်းပေးပါ (Please provide your full name).');
      return;
    }
    if (!phone.trim()) {
      setError('ကျေးဇူးပြု၍ ဆက်သွယ်ရန် ဖုန်းနံပါတ် ထည့်သွင်းပေးပါ (e.g. 09xxxxxxxxx).');
      return;
    }
    if (!address.trim()) {
      setError('ကျေးဇူးပြု၍ ပို့ဆောင်ရမည့် လိပ်စာ ထည့်သွင်းပေးပါ (Please enter your delivery street address).');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullDeliveryAddress = `${address.trim()}, ${township}`;
      const result = await dbService.createOrder({
        UserID: currentUser?.UserID || 'GUEST-' + Math.floor(1000 + Math.random() * 9000),
        CustomerName: name.trim(),
        Phone: phone.trim(),
        Address: fullDeliveryAddress,
        Items: items,
        TotalAmount: totalAmount,
        PaymentMethod: paymentMethod
      });

      if (result.success) {
        onOrderSuccess(result.orderId, {
          name: name.trim(),
          phone: phone.trim(),
          address: fullDeliveryAddress,
          total: totalAmount,
          method: paymentMethod
        });
      } else {
        setError(result.message || 'အော်ဒါတင်ခြင်း မအောင်မြင်ပါ');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`အော်ဒါအမှား: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
              Confirm & Submit Order
            </h2>
            <p className="text-xs text-zinc-400">
              အော်ဒါအချက်အလက်များကို အတည်ပြု၍ တင်ပါ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guest Notice */}
        {!currentUser && (
          <div className="px-5 py-3 bg-amber-950/40 border-b border-amber-800/40 flex items-center justify-between text-xs text-amber-300">
            <span>You are ordering as a Guest. Sign in to track order history in your account.</span>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-white underline font-semibold cursor-pointer shrink-0 ml-2"
            >
              Sign In
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Customer & Delivery Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              01. Recipient & Delivery Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name (အမည်) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ko Aung Kyaw"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mobile Phone (ဖုန်းနံပါတ်) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 09798765432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Street Address & House / Condo Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 4B, Grand Building, Pyay Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Township & City (မြို့နယ်/မြို့)
                </label>
                <select
                  value={township}
                  onChange={(e) => setTownship(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="Kamayut, Yangon">Kamayut, Yangon</option>
                  <option value="Bahan, Yangon">Bahan, Yangon</option>
                  <option value="Hlaing, Yangon">Hlaing, Yangon</option>
                  <option value="Yankin, Yangon">Yankin, Yangon</option>
                  <option value="Mayangone, Yangon">Mayangone, Yangon</option>
                  <option value="Chanayethazan, Mandalay">Chanayethazan, Mandalay</option>
                  <option value="Mahaaungmye, Mandalay">Mahaaungmye, Mandalay</option>
                  <option value="Zabuthiri, Naypyitaw">Zabuthiri, Naypyitaw</option>
                  <option value="Taunggyi, Shan State">Taunggyi, Shan State</option>
                  <option value="Mawlamyine, Mon State">Mawlamyine, Mon State</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              02. Payment Method (ငွေပေးချေမှုပုံစံ)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('KBZPay')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'KBZPay'
                    ? 'border-red-500 bg-red-600/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-400 mb-1.5" />
                <span className="text-xs">KBZPay</span>
                <span className="text-[10px] text-zinc-400 font-mono">09971234567</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('WavePay')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'WavePay'
                    ? 'border-red-500 bg-red-600/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-400 mb-1.5" />
                <span className="text-xs">WavePay</span>
                <span className="text-[10px] text-zinc-400 font-mono">09798765432</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-red-500 bg-red-600/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400 mb-1.5" />
                <span className="text-xs">Cash on Delivery</span>
                <span className="text-[10px] text-zinc-400 font-mono">ပစ္စည်းရောက်မှငွေချေ</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('AYA Bank')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === 'AYA Bank'
                    ? 'border-red-500 bg-red-600/10 text-white font-semibold'
                    : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-red-400 mb-1.5" />
                <span className="text-xs">Bank Transfer</span>
                <span className="text-[10px] text-zinc-400 font-mono">AYA / CB Bank</span>
              </button>
            </div>
          </div>

          {/* Order Items Review Strip */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
              <span>Order Summary ({items.length} items)</span>
              <span>Total Price</span>
            </div>
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
              {items.map((item) => (
                <div key={item.ProductID} className="flex justify-between text-xs text-slate-300">
                  <span className="truncate max-w-[320px]">
                    {item.Quantity}x {item.PartName}
                  </span>
                  <span className="font-mono tabular-nums text-white shrink-0">
                    {(item.Price * item.Quantity).toLocaleString()} MMK
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-sm font-bold text-white">
              <span>Final Total</span>
              <span className="font-mono text-base text-red-500 tabular-nums">
                {totalAmount.toLocaleString()} MMK
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-950 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Order ({totalAmount.toLocaleString()} MMK)</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant order recording and automatic stock deduction</span>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
