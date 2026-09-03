import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home, MessageSquare, ArrowLeft } from 'lucide-react';
import AmbientBackground from '../components/common/AmbientBackground';
import SEOHead from '../components/common/SEOHead';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col items-center justify-center p-6 relative overflow-hidden font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Display','Inter',sans-serif]">
      <SEOHead
        title="404 — Page Not Found | Aethria Intelligence"
        description="The requested page could not be found on Aethria Intelligence."
        canonicalUrl="https://www.aethria.in/404"
      />
      <AmbientBackground />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 animate-fadeIn">
        {/* Luminous 404 Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] text-white flex items-center justify-center shadow-xl shadow-indigo-500/25">
          <span className="text-2xl font-extrabold tracking-tight">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            Page Not Found
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            The page or workspace you are looking for has been moved, renamed, or does not exist.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] shadow-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#6366F1]" />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open AI Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
}
