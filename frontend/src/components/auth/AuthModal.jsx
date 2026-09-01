import React, { useState, useEffect } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  isLoading,
  authError,
  onClearError,
  messageHint
}) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      if (onClearError) onClearError();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      const res = await onLogin({ email, password });
      if (res?.success) onClose();
    } else {
      const res = await onRegister({ name, email, password });
      if (res?.success) onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Apple-styled Modal Card */}
      <div
        className="relative w-full max-w-[420px] rounded-[32px] bg-white/95 border border-black/[0.08] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.3),0_1px_3px_rgba(0,0,0,0.04)] p-7 sm:p-9 overflow-hidden text-left backdrop-blur-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow inside card */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#6366F1]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#EC4899]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 p-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.05] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Icon & Title */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-black/[0.05] p-2.5 flex items-center justify-center mx-auto shadow-sm">
            <img src="/Logo.png" alt="Aethria Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 id="auth-modal-title" className="text-xl font-bold tracking-tight text-[#1D1D1F]">
              {mode === 'login' ? 'Sign in to Aethria' : 'Create your Aethria Account'}
            </h3>
            <p className="text-xs text-[#86868B] mt-1 leading-relaxed">
              {messageHint || (mode === 'login'
                ? 'Sign in with your account to access the AI workspace.'
                : 'Unlock full-stack coding, neural voice synthesis, and cloud chat persistence.')}
            </p>
          </div>
        </div>

        {/* Apple Segmented Pill Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#F5F5F7] rounded-xl border border-black/[0.04] mb-5" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => setMode('login')}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40 ${
              mode === 'login'
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            onClick={() => setMode('register')}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/40 ${
              mode === 'register'
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 bg-[#FFF2F2] border border-[#FF3B30]/20 rounded-xl text-xs text-[#D70015] flex items-center justify-between animate-fadeIn">
            <span>{authError}</span>
            {onClearError && (
              <button
                type="button"
                onClick={onClearError}
                aria-label="Dismiss error"
                className="text-[#D70015] hover:opacity-80 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label htmlFor="auth-name" className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                Your Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#86868B]" />
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Satyam Rana"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.05] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#86868B]" />
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F5F7] border border-black/[0.05] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#86868B]" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F5F5F7] border border-black/[0.05] rounded-xl text-xs text-[#1D1D1F] placeholder:text-[#94A3B8] outline-none focus:bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all font-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 p-1 text-[#86868B] hover:text-[#1D1D1F] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D1D1F]/40"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Security Trust Badge */}
        <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-center gap-2 text-[11px] text-[#86868B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Encrypted with JWT & BCrypt Security</span>
        </div>
      </div>
    </div>
  );
}
