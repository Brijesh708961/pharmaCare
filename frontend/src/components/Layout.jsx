import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import EnhancedHeader from './EnhancedHeader';
import EnhancedFooter from './EnhancedFooter';
import Chatbot from './Chatbot';
import { FullScreenLoader } from './LoadingStates';
import DemoMode from './DemoMode';

const Layout = ({ isHealthy, lastCheck, loading, darkMode, setDarkMode, showDemo, setShowDemo, handleDemoAction }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine current page string for EnhancedHeader highlighting
  let currentPage = 'landing';
  if (location.pathname === '/compatibility') currentPage = 'compatibility';
  else if (location.pathname === '/results') currentPage = 'results';
  else if (location.pathname === '/report') currentPage = 'report';

  // Apply dark mode class to document (important for tailwind dark mode)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleNavigate = (page, sectionId) => {
    if (page === 'landing') {
      navigate('/', { state: { scrollToSection: sectionId } });
    } else if (page === 'analyze') {
      navigate('/', { state: { scrollToSection: 'analyze' } });
    } else if (page === 'compatibility') {
      navigate('/compatibility');
    } else if (page === 'results') {
      navigate('/results');
    } else if (page === 'report') {
      navigate('/report');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* Navigation */}
      <EnhancedHeader 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        isHealthy={isHealthy} 
        lastCheck={lastCheck}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <main key={location.pathname} className="flex-1 mt-16">
          <Outlet />
        </main>
      </AnimatePresence>

      {/* Footer */}
      <EnhancedFooter darkMode={darkMode} />

      {/* Global Elements */}
      {loading && <FullScreenLoader message="Processing your genetic data..." />}
      <Chatbot />
      
      {/* Demo Mode Overlay */}
      {showDemo && (
        <div id="demo-overlay">
          <DemoMode 
            darkMode={darkMode}
            onStartDemo={handleDemoAction}
          />
        </div>
      )}
    </div>
  );
};

export default Layout;
