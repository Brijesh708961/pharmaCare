import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Pill, Activity, Users, AlertCircle, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const PatientDashboard = ({ darkMode, setDarkMode }) => {
  const { user } = useAuth();
  
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';

  return (
    <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${textP}`}>Hello, {user?.name.split(' ')[0]}</h1>
          <p className={`mt-2 ${textS}`}>Here is your personalized pharmacogenomic profile summary.</p>
        </div>

        {/* Action Alert */}
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex sm:items-center flex-col sm:flex-row space-y-4 sm:space-y-0">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center shrink-0 mr-4">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-200">Review your Codeine risk profile</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">Your recent upload detected a CYP2D6 variant. Consult your doctor before taking Codeine.</p>
          </div>
          <button className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-sm shrink-0 transition-colors">
            View Details
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Medications */}
          <div className={`p-6 rounded-2xl border ${cardBg}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-bold text-lg flex items-center ${textP}`}>
                <Pill className="w-5 h-5 mr-2 text-blue-500" /> My Medications
              </h2>
              <button className="text-sm font-semibold text-blue-600 dark:text-blue-400">Edit</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-semibold ${textP}`}>Aspirin</p>
                  <p className={`text-xs ${textS}`}>Daily</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Safe</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-semibold ${textP}`}>Warfarin</p>
                  <p className={`text-xs ${textS}`}>Pending review</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Unknown Risk</span>
              </div>
            </div>
          </div>

          {/* Genetic profile summary */}
          <div className={`p-6 rounded-2xl border ${cardBg}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`font-bold text-lg flex items-center ${textP}`}>
                <Activity className="w-5 h-5 mr-2 text-pink-500" /> Profile Summary
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className={`font-mono ${textP}`}>CYP2D6</span>
                <span className={`${textS}`}>Poor Metabolizer</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className={`font-mono ${textP}`}>CYP2C19</span>
                <span className={`${textS}`}>Normal</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-2">
                <span className={`font-mono ${textP}`}>SLCO1B1</span>
                <span className={`${textS}`}>Reduced Function</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 border rounded-xl text-sm font-semibold dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Full Genetic Report
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
