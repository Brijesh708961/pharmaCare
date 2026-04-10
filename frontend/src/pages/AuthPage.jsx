import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dna, Mail, Lock, User, ArrowRight, ShieldCheck, Activity } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const AuthPage = ({ darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, updateRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Plucked from RoleSelection page
  const selectedRole = location.state?.role || null;
  const walletAddress = location.state?.walletAddress || null;

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      await new Promise(r => setTimeout(r, 600));

      // Attempt Auth
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Store local context
      login(data.token, data.user);
      let userRole = data.user.role;

      // If user came from RoleSelection, we set their role physically in the backend
      if (selectedRole && (!userRole || userRole !== selectedRole)) {
        const roleRes = await fetch('/api/auth/set-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: data.token,
            role: selectedRole,
            wallet_address: walletAddress
          })
        });

        if (roleRes.ok) {
          userRole = selectedRole;
          updateRole(selectedRole, walletAddress);
        }
      }

      // Route based on final role
      if (userRole) {
        navigate(userRole === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient');
      } else {
        navigate('/role-selection');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bgClass = darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900';
  const cardClass = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const inputClass = darkMode 
    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-emerald-500' 
    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-emerald-500';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${bgClass}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] ${darkMode ? 'bg-emerald-900/20' : 'bg-emerald-200/40'}`} />
        <div className={`absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[120px] ${darkMode ? 'bg-blue-900/20' : 'bg-blue-200/40'}`} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-md p-8 sm:p-10 rounded-3xl border shadow-2xl ${cardClass} z-10`}
      >
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center transform rotate-3">
            <Dna className="w-8 h-8 text-emerald-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedRole && !isLogin
              ? `Sign up as a ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} to continue.` 
              : isLogin ? 'Enter your details to access your dashboard.' : 'Start your pharmacogenomic journey today.'}
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-5 h-5 mb-1" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div key="name" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  required={!isLogin}
                  placeholder="Full Name"
                  className={`block w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </motion.div>
            )}
            
            <motion.div key="email" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="email"
                required
                placeholder="Email address"
                className={`block w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </motion.div>

            <motion.div key="password" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="password"
                required
                placeholder="Password"
                autoComplete="current-password"
                className={`block w-full pl-10 pr-3 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${inputClass}`}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </motion.div>
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-70 mt-6"
          >
            {loading ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-200 dark:border-gray-800 pt-6">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={handleToggle}
              className="font-semibold tracking-wide text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 focus:outline-none focus:underline transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
