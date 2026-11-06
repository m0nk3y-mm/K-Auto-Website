import React from 'react';
import { ShoppingBag, User as UserIcon, Shield, LogOut } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  currentView: 'store' | 'admin';
  onChangeView: (view: 'store' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onLogout,
  currentView,
  onChangeView
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => onChangeView('store')}
          className="text-left group flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span className="font-heading text-2xl font-black tracking-wider text-white uppercase transition-colors group-hover:text-red-500">
            K<span className="text-red-600">AUTO</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase font-mono text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
            MMK STORE
          </span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              onChangeView('store');
              const el = document.getElementById('catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`transition-colors hover:text-white cursor-pointer ${
              currentView === 'store' ? 'text-white font-semibold' : ''
            }`}
          >
            Parts Catalog
          </button>
          <button
            onClick={() => {
              onChangeView('store');
              const el = document.getElementById('vehicle-matcher');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="transition-colors hover:text-white cursor-pointer"
          >
            Vehicle Fitment
          </button>
          <button
            onClick={() => onChangeView('admin')}
            className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentView === 'admin' ? 'text-red-500 font-semibold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-red-500" />
            <span>Admin Management</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Admin Switch Shortcut */}
          {currentView === 'store' ? (
            <button
              onClick={() => onChangeView('admin')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500/50 hover:text-white transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>Admin</span>
            </button>
          ) : (
            <button
              onClick={() => onChangeView('store')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to Store</span>
            </button>
          )}

          {/* User Auth Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                  {currentUser.FullName}
                </p>
                <p className="text-[10px] font-mono text-zinc-400 capitalize">
                  {currentUser.Role}
                </p>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-red-400 bg-slate-900 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Sign In</span>
            </button>
          )}

          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm shadow-red-950 cursor-pointer"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold font-mono text-white bg-slate-950 border border-red-500 rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
