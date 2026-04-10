import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, LogOut, Home, FileText, ClipboardList, Shield, 
  Users, Activity, Pill, Settings, Heart 
} from 'lucide-react';

const DashboardLayout = ({ children, darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDoctor = user.role === 'doctor';

  const docLinks = [
    { name: 'Clinical Dashboard', path: '/dashboard/doctor', icon: Activity },
    { name: 'Patient Reports', path: '/dashboard/doctor/reports', icon: FileText },
    { name: 'CPIC Guidelines', path: '/dashboard/doctor/guidelines', icon: Shield },
    { name: 'Prescriptions', path: '/dashboard/doctor/prescriptions', icon: ClipboardList }
  ];

  const patLinks = [
    { name: 'Genetic Profile', path: '/dashboard/patient', icon: Dna },
    { name: 'Community', path: '/dashboard/patient/community', icon: Users },
    { name: 'Medication Tracker', path: '/dashboard/patient/medications', icon: Pill },
    { name: 'Settings', path: '/dashboard/patient/settings', icon: Settings }
  ];

  // Helper component for DNA icon
  function Dna(props) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.5 3.52-3.35 5.277-5.277"/><path d="M5.277 5.277C7.034 3.35 8.756 1.5 10.554 0"/><path d="M11 11l4 4"/><path d="M5 5l4 4"/><path d="M15 15l4 4"/><path d="M19 5l-4 4"/><path d="M9 15l-4 4"/>
      </svg>
    )
  }

  const links = isDoctor ? docLinks : patLinks;
  
  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const sidebarBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen flex ${bg}`}>
      
      {/* Mobile sidebar overlay */}
      {!sidebarOpen && (
        <button 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

      {/* Left Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className={`fixed lg:sticky top-0 h-screen z-30 shrink-0 border-r overflow-hidden flex flex-col ${sidebarBg}`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDoctor ? 'bg-emerald-500' : 'bg-blue-500'}`}>
              {isDoctor ? <Activity className="w-5 h-5 text-white"/> : <Heart className="w-5 h-5 text-white"/>}
            </div>
            <span className={`font-bold text-lg ${textP}`}>PharmaGuard</span>
          </div>
          <button className="lg:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textS}`}>Account</p>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden mr-3" />
            <div className="overflow-hidden">
              <p className={`text-sm font-bold truncate ${textP}`}>{user.name}</p>
              <p className={`text-xs truncate ${textS}`}>{user.wallet_address || 'No Wallet Connected'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const active = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`w-full flex items-center px-3 py-3 rounded-xl transition-colors ${
                  active 
                    ? (isDoctor ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 font-semibold' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold')
                    : `hover:bg-gray-100 dark:hover:bg-gray-800 ${textS} hover:${textP}`
                }`}
              >
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                <span className="text-sm truncate">{link.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => navigate('/')} 
            className={`w-full flex items-center px-3 py-3 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${textS} hover:${textP}`}
          >
            <Home className="w-5 h-5 mr-3 shrink-0" />
            <span className="text-sm">Back to Home</span>
          </button>
          <button 
            onClick={handleLogout} 
            className="w-full mt-1 flex items-center px-3 py-3 rounded-xl transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
          >
            <LogOut className="w-5 h-5 mr-3 shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 transition-opacity ${!sidebarOpen ? 'w-full' : ''}`}>
        {/* Mobile Header */}
        <header className={`lg:hidden flex items-center justify-between p-4 border-b z-10 sticky top-0 ${sidebarBg}`}>
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <Menu className={`w-6 h-6 ${textP}`} />
            </button>
            <span className={`font-bold ${textP}`}>{isDoctor ? 'Doctor Portal' : 'Patient Portal'}</span>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
