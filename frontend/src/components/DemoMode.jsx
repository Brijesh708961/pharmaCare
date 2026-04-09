import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Info, Zap } from 'lucide-react';

const DemoMode = ({ 
  isActive, 
  onToggle, 
  onReset,
  currentPatient,
  progress = 0 
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const demoPatients = [
    {
      id: 'PatientA',
      name: 'Patient A',
      description: 'High risk profile - CYP2C19 Poor Metabolizer',
      riskLevel: 'High',
      color: 'red'
    },
    {
      id: 'PatientB', 
      name: 'Patient B',
      description: 'Normal risk profile - Minimal variants',
      riskLevel: 'Low',
      color: 'green'
    },
    {
      id: 'PatientC',
      name: 'Patient C', 
      description: 'Mixed risk profile - Intermediate variants',
      riskLevel: 'Medium',
      color: 'yellow'
    }
  ];

  const getCurrentPatient = () => {
    return demoPatients.find(p => p.id === currentPatient) || demoPatients[0];
  };

  const getProgressColor = () => {
    if (progress < 33) return 'bg-sky-500';
    if (progress < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Demo Mode Toggle */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold">Demo Mode</h3>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Stop Demo</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Start Demo</span>
              </>
            )}
          </button>

          {/* Current Patient Info */}
          {isActive && currentPatient && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Current Patient:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium bg-${getCurrentPatient().color}-100 text-${getCurrentPatient().color}-700`}>
                  {getCurrentPatient().name}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {getCurrentPatient().description}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          {isActive && progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Demo Progress</span>
                <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo</span>
          </button>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="border-t border-gray-200 p-4 bg-sky-50">
            <h4 className="font-medium text-sky-900 mb-2">Demo Information</h4>
            <ul className="space-y-1 text-sm text-sky-800">
              <li>• <strong>Patient A:</strong> CYP2C19 Poor Metabolizer - high clopidogrel risk</li>
              <li>• <strong>Patient B:</strong> Normal metabolic profile - low overall risk</li>
              <li>• <strong>Patient C:</strong> Mixed variants - moderate risk levels</li>
              <li>• Demo automatically cycles through sample data</li>
              <li>• Progress shows analysis completion status</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoMode;
