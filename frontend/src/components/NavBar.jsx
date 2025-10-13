import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code, Menu, X, User, LogOut, Home, Zap } from 'lucide-react';

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      // Navigate to home - you can replace this with your navigation method
      window.location.href = '/';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateTo = (path) => {
    setCurrentPath(path);
    setIsMobileMenuOpen(false);
    // Replace with your navigation method (e.g., navigate(path))
    window.location.href = path;
  };

  const isActive = (path) => {
    return currentPath === path;
  };

  const Link = ({ to, children, icon: Icon, onClick }) => {
    const active = isActive(to);
    
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            active 
              ? 'bg-white/20 text-white shadow-lg' 
              : 'text-indigo-100 hover:text-white hover:bg-white/10'
          }`}
        >
          {Icon && <Icon className="h-4 w-4 mr-2" />}
          {children}
        </button>
      );
    }

    return (
      <button
        onClick={() => navigateTo(to)}
        className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
          active 
            ? 'bg-white/20 text-white shadow-lg' 
            : 'text-indigo-100 hover:text-white hover:bg-white/10'
        }`}
      >
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {children}
      </button>
    );
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-blue-600 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo and Brand */}
          <button onClick={() => navigateTo('/')} className="flex items-center group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h2 className="text-2xl font-bold text-white">Aethria</h2>
              <p className="text-xs text-indigo-100 hidden sm:block">AI Coding Companion</p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link to="/" icon={Home}>
              Home
            </Link>
            <Link to="/codeassistant" icon={Zap}>
              Code Assistant
            </Link>
            <Link to="/practise" icon={Zap}>
              Practise
            </Link>
            <Link to="/profile" icon={User}>
              Profile
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden flex items-center justify-center w-10 h-10 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-600 border-t border-white/20 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            <Link to="/" icon={Home}>
              Home
            </Link>
            <Link to="/codeassistant" icon={Zap}>
              Code Assistant
            </Link>
            <Link to="/practise" icon={Zap}>
              Practice
            </Link>
            <Link to="/profile" icon={User}>
              Profile
            </Link>
                    
                
          </div>
        </div>
      )}
    </nav>
  );
}