import React from 'react';
import { CAPABILITIES } from '../../constants';

export default function FeatureSection() {
  return (
    <section id="features" className="py-20 px-6 bg-[#F5F5F7] border-y border-black/[0.04]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#86868B] mb-2">
            Features
          </h2>
          <p className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#1D1D1F]">
            Built for speed and simplicity.
          </p>
        </div>

        {/* 3 Bento Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-center mb-6 text-[#1D1D1F]">
                    <Icon className="w-6 h-6 text-[#0071E3]" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block mb-2">
                    {cap.badge}
                  </span>
                  <h3 className="text-xl font-semibold text-[#1D1D1F] tracking-tight mb-3">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[#6E6E73] leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
