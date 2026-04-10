import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, ShieldCheck, Activity, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const DoctorDashboard = ({ darkMode, setDarkMode }) => {
  const { user } = useAuth();
  
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';

  const stats = [
    { label: 'Active Patients', value: '1,248', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'Pending Reports', value: '14', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Alerts Resolved', value: '89%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ];

  return (
    <DashboardLayout darkMode={darkMode} setDarkMode={setDarkMode}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${textP}`}>Welcome, Dr. {user?.name.split(' ')[0]}</h1>
          <p className={`mt-2 ${textS}`}>Here's an overview of your clinical pharmacogenomic alerts today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${cardBg} flex items-center space-x-4`}>
              <div className={`p-4 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold uppercase tracking-wider ${textS}`}>{stat.label}</p>
                <p className={`text-3xl font-bold ${textP}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Patient Activity */}
        <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className={`font-bold text-lg ${textP}`}>Recent PGx Reports</h2>
            <button className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">View All</button>
          </div>
          <div className="p-0">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`p-4 border-b last:border-0 border-gray-100 dark:border-gray-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer`}>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                    <span className="font-bold text-gray-500">P{i+1}</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${textP}`}>Patient {Math.floor(Math.random() * 9000) + 1000}</p>
                    <p className={`text-xs ${textS}`}>Action Required: CYP2C19 & Clopidogrel</p>
                  </div>
                </div>
                <div className="flex items-center text-sm font-semibold text-amber-600">
                  <Activity className="w-4 h-4 mr-2" /> Moderate Risk
                  <ChevronRight className="w-5 h-5 ml-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
