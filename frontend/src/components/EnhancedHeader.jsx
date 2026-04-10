import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Menu, X, LogIn, User, Activity, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home',                    href: '#home',        sectionId: 'home',         view: null },
  { label: 'How It Works',            href: '#how-it-works',sectionId: 'how-it-works', view: null },
  { label: 'Genetic Compatibility',   href: '#',            sectionId: null,           view: 'compatibility' },
  { label: 'Community',               href: '#community',   sectionId: 'community',    view: null },
  { label: 'Pill Scanner',            href: '#genes',       sectionId: 'genes',        view: null },
];

const PharmaLogo = ({ darkMode }) => (
  <div className="flex items-center space-x-3 group">
    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-md shadow-emerald-600/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
      <Activity className="w-5 h-5 text-white" />
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
        <Shield className="w-2.5 h-2.5 text-emerald-500" />
      </div>
    </div>
    <div className="flex flex-col justify-center leading-none select-none">
      <span className={`text-[19px] font-black tracking-tight uppercase ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        PHARMA<span className="text-emerald-500 font-light">GUARD</span>
      </span>
      <span className={`text-[9px] font-bold tracking-[0.25em] uppercase -mt-0.5 ml-[2px] ${darkMode ? 'text-emerald-400/80' : 'text-emerald-600/80'}`}>
        Genomics
      </span>
    </div>
  </div>
);

const EnhancedHeader = ({
  darkMode,
  setDarkMode,
  isHealthy,
  onNavigate,
  currentPage,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { user } = useAuth();

  // Track scroll position for header background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection Observer to highlight active nav link
  useEffect(() => {
    if (currentPage !== 'landing') return;
    const ids = NAV_LINKS.map(l => l.sectionId);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [currentPage]);

  // Smooth scroll OR navigate to page
  const handleNavClick = useCallback((e, link) => {
    e.preventDefault();
    setMobileOpen(false);

    // This nav link navigates to a different view (e.g. compatibility page)
    if (link.view) {
      onNavigate?.(link.view, null);
      return;
    }

    // Scroll navigation within landing page
    if (currentPage !== 'landing') {
      onNavigate?.('landing', link.sectionId);
    } else {
      const el = document.getElementById(link.sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage, onNavigate]);

  const isLanding = currentPage === 'landing';

  const headerBg = darkMode
    ? scrolled ? 'bg-gray-950/95 backdrop-blur-md border-gray-800/80 shadow-lg shadow-black/20'
                : 'bg-transparent border-transparent'
    : scrolled ? 'bg-white/96 backdrop-blur-md border-gray-100 shadow-sm'
               : 'bg-white border-gray-100';

  const linkBase = `text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:underline`;
  const linkActive = darkMode ? 'text-emerald-400' : 'text-emerald-700';
  const linkIdle = darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900';

  return (
    <header
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${headerBg}`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <button
            onClick={() => {
              if (!isLanding) onNavigate?.('landing', 'home');
              else { const el = document.getElementById('home'); el?.scrollIntoView({ behavior: 'smooth' }); }
            }}
            aria-label="PharmaGuard — go to home"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          >
            <PharmaLogo darkMode={darkMode}/>
          </button>

          {/* ── Desktop Navigation ── */}
          <nav role="navigation" aria-label="Primary navigation" className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => {
              const isActive = (currentPage === 'landing' && !link.view && activeSection === link.sectionId)
                            || (currentPage === link.view);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3 py-2 rounded-lg ${linkBase} ${isActive ? linkActive : linkIdle}`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* ── Right side controls ── */}
          <div className="flex items-center space-x-2">
            {/* System status indicator */}
            <div
              role="status"
              aria-label={isHealthy ? 'System online' : 'System offline'}
              title={isHealthy ? 'All systems online' : 'System offline'}
              className={`hidden sm:block w-2 h-2 rounded-full flex-shrink-0 ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`}
            />

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={darkMode}
              className={`p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
            </button>

            {/* Login / Analyze CTA */}
            <motion.button
              onClick={() => onNavigate?.('role-selection')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              aria-label={isLanding ? 'Open login' : 'Go to login'}
              className="hidden sm:flex items-center space-x-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <LogIn className="w-3.5 h-3.5"/>
              <span>Login</span>
            </motion.button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className={`md:hidden p-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {mobileOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            role="navigation"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden border-t overflow-hidden ${
              darkMode ? 'bg-gray-950/98 border-gray-800' : 'bg-white/98 border-gray-100'
            }`}
          >
            <div className="px-5 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = (currentPage === 'landing' && !link.view && activeSection === link.sectionId)
                              || (currentPage === link.view);
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? darkMode ? 'text-emerald-400 bg-emerald-900/20' : 'text-emerald-700 bg-emerald-50'
                        : darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <button
                onClick={() => { setMobileOpen(false); onNavigate?.('role-selection'); }}
                aria-label="Open login"
                className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-800 text-white text-sm font-semibold rounded-full"
              >
                <LogIn className="w-3.5 h-3.5"/><span>Login</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default EnhancedHeader;
