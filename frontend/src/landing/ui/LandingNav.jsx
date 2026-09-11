import React, { useState, useEffect } from 'react';
import { FolderCode, LogOut, User } from 'lucide-react';
import MagneticButton from './MagneticButton';

const LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#intelligence', label: 'Intelligence' },
  { href: '#developers', label: 'Developers' }
];

export default function LandingNav({
  user,
  isAuthenticated,
  onOpenAuth,
  onOpenProfile,
  onOpenProjects,
  onLogout,
  onConnect
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`landing-nav ${scrolled ? 'is-scrolled' : 'is-top'}`}>
      <div className="landing-nav-inner">
        <a href="#intro" className="landing-brand" data-cursor="view">
          <img src="/Logo.png" alt="" className="h-6 w-6 rounded-md object-contain" />
          <span>Aethria</span>
          <span className="landing-brand-meta">3.0</span>
        </a>

        <nav className="landing-nav-links" aria-label="Primary">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} data-cursor="view">
              {link.label}
            </a>
          ))}
          <button
            type="button"
            data-cursor="view"
            onClick={() => {
              if (isAuthenticated) onOpenProjects?.();
              else onOpenAuth?.('Sign in to access your Project Command Center');
            }}
          >
            Projects
          </button>
        </nav>

        <div className="landing-nav-actions">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                className="landing-user"
                onClick={() => setMenuOpen((v) => !v)}
                data-cursor="view"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="User account menu"
              >
                <span className="landing-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="hidden max-w-[110px] truncate sm:inline">{user.name}</span>
              </button>
              {menuOpen && (
                <div className="landing-user-menu" role="menu" aria-label="Account options">
                  <p className="px-3 pb-2 text-[11px] text-[#86868B]">{user.email}</p>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProjects?.();
                    }}
                  >
                    <FolderCode className="h-3.5 w-3.5" /> Command Center
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenProfile?.();
                    }}
                  >
                    <User className="h-3.5 w-3.5" /> Account & token
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="text-[#FF3B30]"
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout?.();
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="landing-ghost"
              onClick={() => onOpenAuth?.('Sign in to access the Aethria Workspace.')}
              data-cursor="view"
            >
              Sign In
            </button>
          )}

          <MagneticButton type="button" className="landing-cta" onClick={onConnect}>
            <span className="cta-full">See in action</span>
            <span className="cta-short">See in action</span>
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
