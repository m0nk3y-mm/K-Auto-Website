import React, { useState } from 'react';
import { X, UserCheck, KeyRound, Loader2, Sparkles } from 'lucide-react';
import { User } from '../types';
import { dbService } from '../services/databaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'admin'>('customer');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await dbService.login({
        Email: loginEmail,
        Password: loginPassword
      });

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Login error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await dbService.register({
        FullName: regFullName,
        Phone: regPhone,
        Email: regEmail,
        Password: regPassword,
        Address: regAddress,
        Role: regRole
      });

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Registration error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo auto-fill helpers
  const fillAdminDemo = () => {
    setMode('login');
    setLoginEmail('admin@uedcmm.com');
    setLoginPassword('admin123');
    setErrorMsg(null);
  };

  const fillCustomerDemo = () => {
    setMode('login');
    setLoginEmail('ko.kyaw@gmail.com');
    setLoginPassword('password123');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header with Close */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-white">
              {mode === 'login' ? 'Customer & Admin Sign In' : 'Create Kauto Account'}
            </h2>
            <p className="text-xs text-zinc-400">
              အကောင့်သို့ ဝင်ရောက်ရန် သို့မဟုတ် အသစ်ဖွင့်ရန်
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'register'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register New Account
          </button>
        </div>

        {/* Demo Shortcut Strip */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-400" />
            Quick Demo:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillAdminDemo}
              className="text-[11px] font-mono text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              Admin Demo
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={fillCustomerDemo}
              className="text-[11px] font-mono text-slate-300 hover:text-white underline cursor-pointer"
            >
              Customer Demo
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@uedcmm.com or customer@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">admin123 for admin</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-950"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name (အမည်) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ko Min Thein"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone (ဖုန်း) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="09971234567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Account Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as 'customer' | 'admin')}
                    className="w-full h-9 px-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Delivery Address (လိပ်စာ)
                </label>
                <input
                  type="text"
                  placeholder="Township, City (e.g. Kamayut, Yangon)"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-950"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <span className="text-[11px] text-zinc-500">
              {mode === 'login' ? "Don't have an account yet? " : "Already registered? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg(null);
              }}
              className="text-[11px] font-semibold text-red-400 hover:underline cursor-pointer"
            >
              {mode === 'login' ? 'Sign up here' : 'Sign in here'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
