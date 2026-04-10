import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, User, HeartPulse, ActivitySquare, Wallet, Globe, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoleSelection = ({ darkMode }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!selectedRole) return;
    setLoading(true);
    
    try {
      const email = selectedRole === 'doctor' ? 'doctor@gmail.com' : 'patient@gmail.com';
      const password = '12345678';

      // Auto-login using the seeded credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Demo login failed');
      }

      // Store in context (this sets global user state to Dr. Demo or John Doe)
      login(data.token, data.user);
      
      // Navigate straight to dashboard!
      navigate(`/dashboard/${selectedRole}`);
      
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${bg}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${textP}`}>Welcome to PharmaGuard</h1>
          <p className={`text-xl ${textS}`}>Choose your role to continue.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Doctor Card */}
          <button
            onClick={() => setSelectedRole('doctor')}
            className={`relative p-8 rounded-3xl border-2 text-left transition-all focus:outline-none ${
              selectedRole === 'doctor' 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                : `${cardBg} hover:border-emerald-300`
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${selectedRole === 'doctor' ? 'bg-emerald-500' : 'bg-emerald-100'}`}>
              <Stethoscope className={`w-7 h-7 ${selectedRole === 'doctor' ? 'text-white' : 'text-emerald-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${textP}`}>Doctor</h2>
            <p className={`text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-6`}>Healthcare Professional</p>
            <p className={`text-sm leading-relaxed mb-6 ${textS}`}>
              Access clinical dashboards, patient reports, and CPIC-guided prescribing tools.
            </p>
            <ul className="space-y-3">
              {['Patient PGx Reports', 'Drug Interaction Alerts', 'CPIC Guidelines'].map((item) => (
                <li key={item} className="flex items-center text-sm">
                  <ActivitySquare className={`w-4 h-4 mr-3 ${selectedRole === 'doctor' ? 'text-emerald-500' : textS}`} />
                  <span className={textP}>{item}</span>
                </li>
              ))}
            </ul>
          </button>

          {/* Patient Card */}
          <button
            onClick={() => setSelectedRole('patient')}
            className={`relative p-8 rounded-3xl border-2 text-left transition-all focus:outline-none ${
              selectedRole === 'patient' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                : `${cardBg} hover:border-blue-300`
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${selectedRole === 'patient' ? 'bg-blue-500' : 'bg-blue-100'}`}>
              <User className={`w-7 h-7 ${selectedRole === 'patient' ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${textP}`}>Patient</h2>
            <p className={`text-sm font-semibold text-blue-600 dark:text-blue-400 mb-6`}>Individual User</p>
            <p className={`text-sm leading-relaxed mb-6 ${textS}`}>
              View your pharmacogenomic profile, connect with genetic twins, and track medications.
            </p>
            <ul className="space-y-3">
              {['Your Genetic Profile', 'Community Access', 'Medication Tracker'].map((item) => (
                <li key={item} className="flex items-center text-sm">
                  <HeartPulse className={`w-4 h-4 mr-3 ${selectedRole === 'patient' ? 'text-blue-500' : textS}`} />
                  <span className={textP}>{item}</span>
                </li>
              ))}
            </ul>
          </button>
        </div>

        {/* Step 2: Wallet connection & Submit */}
        <AnimatePresence>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-8" />
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className={`flex items-center px-12 py-4 rounded-xl font-bold text-white transition-all shadow-md ${
                    !loading
                      ? (selectedRole === 'doctor' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')
                      : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70'
                  }`}
                >
                  {loading ? 'Entering...' : 'Enter Dashboard'}
                  {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};

export default RoleSelection;
