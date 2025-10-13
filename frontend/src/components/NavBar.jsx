import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Code, Menu, X, Home, Zap, User } from 'lucide-react';

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const NavLink = ({ to, icon: Icon, label, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-3 py-2 rounded-lg text-indigo-100 hover:text-white hover:bg-white/10 transition-all duration-200"
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {label}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-2xl font-bold text-white">Aethria</h2>
              <p className="text-xs text-indigo-100 hidden sm:block">AI Coding Companion</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink to="/" icon={Home} label="Home" />
            <NavLink to="/codeassistant" icon={Zap} label="Code Assistant" />
            <NavLink to="/practise" icon={Zap} label="Practice" />
            <NavLink to="/profile" icon={User} label="Profile" />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-600 border-t border-white/20 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            <NavLink to="/" icon={Home} label="Home" onClick={toggleMobileMenu} />
            <NavLink to="/codeassistant" icon={Zap} label="Code Assistant" onClick={toggleMobileMenu} />
            <NavLink to="/practise" icon={Zap} label="Practice" onClick={toggleMobileMenu} />
            <NavLink to="/profile" icon={User} label="Profile" onClick={toggleMobileMenu} />
          </div>
        </div>
      )}
    </nav>
  );
}
