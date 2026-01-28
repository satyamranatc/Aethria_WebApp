import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useUser, UserButton, SignInButton } from "@clerk/clerk-react";
import {
  Code,
  Menu,
  X,
  Home,
  Zap,
  User,
  ChartArea,
  UserCircle,
  Sparkles,
} from "lucide-react";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isSignedIn, user } = useUser();

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const NavLink = ({ to, icon: Icon, label, isExternal }) => {
    const isActive = location.pathname === to;

    // Base classes
    const baseClasses = `
      relative flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    `;

    // Active state styling
    const activeClasses = isActive
      ? "text-indigo-600 bg-indigo-50"
      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50";

    const content = (
      <>
        {Icon && (
          <Icon
            className={`h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"}`}
          />
        )}
        <span>{label}</span>
        {isActive && (
          <span className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
        )}
      </>
    );

    if (isExternal) {
      return (
        <a
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${activeClasses}`}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        to={to}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`${baseClasses} ${activeClasses}`}
      >
        {content}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || isMobileMenuOpen
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none rounded-xl"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md ring-1 ring-black/5">
                <Code className="h-6 w-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                Aethria
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-500 uppercase hidden sm:block">
                AI Coding Companion
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="flex items-center bg-gray-100/50 p-1.5 rounded-2xl border border-gray-200/50 backdrop-blur-md">
              <NavLink to="/" icon={Home} label="Home" />
              <NavLink
                to="/ProjectAssistant"
                icon={Sparkles}
                label="Assistant"
              />
              <NavLink to="/practise" icon={Zap} label="Practice" />
              <NavLink to="/results" icon={ChartArea} label="Results" />
              <NavLink
                to="https://cognivueweb.onrender.com/"
                icon={UserCircle}
                label="Interview"
                isExternal
              />
            </div>
          </div>

          {/* User Profile / Mobile Toggle */}
          <div className="flex items-center gap-4">
            {/* Auth Button */}
            <div className="hidden sm:flex">
              {isSignedIn ? (
                <div className="bg-gray-100/80 p-1 pr-4 rounded-full flex items-center gap-3 hover:bg-gray-200/80 transition-colors cursor-pointer border border-gray-200">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">
                    {user.firstName}
                  </span>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl transition-all duration-300 origin-top overflow-hidden ${
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 py-6 space-y-3">
          <NavLink to="/" icon={Home} label="Home" />
          <NavLink
            to="/ProjectAssistant"
            icon={Sparkles}
            label="AI Code Assistant"
          />
          <NavLink to="/practise" icon={Zap} label="Practice Mode" />
          <NavLink to="/results" icon={ChartArea} label="Results Dashboard" />
          <NavLink
            to="https://cognivueweb.onrender.com/"
            icon={UserCircle}
            label="AI Interview"
            isExternal
          />

          <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-500">Account</span>
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton>
                <button className="text-sm font-bold text-indigo-600">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
