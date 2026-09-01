import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-10 px-6 text-xs text-[#86868B]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <img src="/Logo.png" alt="Aethria" className="w-5 h-5 object-contain rounded" />
          <span className="font-semibold text-[#1D1D1F]">Aethria AI</span>
          <span>&mdash; Developed by Satyam Rana</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">Architecture</span>
          <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">Security</span>
          <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">Neural Voice</span>
          <div className="flex items-center gap-1.5 text-[#248A3D] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            <span>Groq LPU Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
