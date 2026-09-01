import React from 'react';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#E8F2FF] via-[#F3EDFF]/60 to-transparent blur-[120px] opacity-70" />
      <div className="absolute top-[35%] -left-[10%] w-[500px] h-[500px] bg-gradient-to-tr from-[#E6F4FE]/50 to-transparent blur-[140px] opacity-60" />
      <div className="absolute top-[45%] -right-[10%] w-[500px] h-[500px] bg-gradient-to-tl from-[#FCE7F3]/40 to-transparent blur-[140px] opacity-50" />
    </div>
  );
}
