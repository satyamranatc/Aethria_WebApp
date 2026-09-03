import React from 'react';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Soft Ethereal Pastel Glowing Meshes */}
      <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-gradient-to-b from-[#EBF2FE]/90 via-[#F3EDFF]/70 to-transparent blur-[140px] opacity-80" />
      <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#E0F2FE]/60 via-[#F0FDF4]/30 to-transparent blur-[150px] opacity-70" />
      <div className="absolute top-[35%] -right-[10%] w-[650px] h-[650px] bg-gradient-to-tl from-[#FCE7F3]/50 via-[#EDE9FE]/40 to-transparent blur-[160px] opacity-65" />
      <div className="absolute -bottom-[10%] left-[20%] w-[700px] h-[400px] bg-gradient-to-t from-[#E0E7FF]/40 to-transparent blur-[130px] opacity-50" />
    </div>
  );
}

