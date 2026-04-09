import React, { useState, useEffect } from 'react';
import VCFUploader from './components/VCFUploader';
import DrugInput from './components/DrugInput';
import SampleDataButtons from './components/SampleDataButtons';
import ResultsDashboard from './components/ResultsDashboard';
import VariantDetails from './components/VariantDetails';
import LLMExplanation from './components/LLMExplanation';
import ClinicalRecommendations from './components/ClinicalRecommendations';
import ExportFunctionality from './components/ExportFunctionality';
import { FullScreenLoader, ErrorState, SuccessState } from './components/LoadingStates';
import { useVCFAnalysis, useHealthCheck, useSupportedDrugs } from './hooks/useApi';

function App() {
  const [vcfFile, setVCFFile] = useState(null);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [vcfContent, setVCFContent] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  
  const { analyzeVCF, analysisResult, progress, loading, error, resetAnalysis } = useVCFAnalysis();
  const { isHealthy, lastCheck } = useHealthCheck();
  const { drugs, loading: drugsLoading } = useSupportedDrugs();

  // Handle file selection
  const handleFileSelect = (file) => {
    setVCFFile(file);
    setVCFContent(null);
    setCurrentPatient(null);
    setAnalysisError(null);
  };

  // Handle sample data loading
  const handleSampleDataLoad = (patientId, content, patientInfo) => {
    setVCFContent(content);
    setCurrentPatient(patientInfo);
    setVCFFile(null);
    setAnalysisError(null);
  };

  // Handle drug selection
  const handleDrugSelect = (drugs) => {
    setSelectedDrugs(drugs);
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!vcfFile && !vcfContent) {
      setAnalysisError('Please upload a VCF file or select sample data');
      return;
    }

    if (selectedDrugs.length === 0) {
      setAnalysisError('Please select at least one drug to analyze');
      return;
    }

    try {
      setAnalysisError(null);
      setShowResults(false);
      
      // Analyze each selected drug
      for (const drug of selectedDrugs) {
        await analyzeVCF(drug.name, currentPatient?.id || 'Unknown', vcfFile, vcfContent);
      }
      
      setShowResults(true);
    } catch (error) {
      setAnalysisError(error.message);
    }
  };

  // Handle reset
  const handleReset = () => {
    setVCFFile(null);
    setVCFContent(null);
    setSelectedDrugs([]);
    setCurrentPatient(null);
    setShowResults(false);
    setAnalysisError(null);
    resetAnalysis();
  };

  // Handle export functions
  const handleExportJSON = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pharmaguard-analysis-${data.patient_id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = async (data) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      alert('JSON copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PG</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">PharmaGuard</h1>
              <span className="text-sm text-gray-500">Pharmacogenomic Risk Prediction</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 text-sm ${
                isHealthy ? 'text-green-600' : 'text-red-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isHealthy ? 'bg-green-600' : 'bg-red-600'
                }`} />
                <span>Backend {isHealthy ? 'Online' : 'Offline'}</span>
              </div>
              {lastCheck && (
                <span className="text-xs text-gray-500">
                  Last check: {new Date(lastCheck).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showResults ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pharmacogenomic Analysis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your VCF file and select medications to get personalized drug response predictions
                based on your genetic profile.
              </p>
            </div>

            {/* Sample Data Section */}
            <SampleDataButtons
              onLoadSample={handleSampleDataLoad}
              isLoading={loading}
            />

            {/* File Upload Section */}
            <VCFUploader
              onFileSelect={handleFileSelect}
              onValidationError={setAnalysisError}
              isLoading={loading}
            />

            {/* Drug Selection Section */}
            <DrugInput
              onDrugSelect={handleDrugSelect}
              selectedDrugs={selectedDrugs}
              isLoading={loading}
              maxDrugs={3}
            />

            {/* Error Display */}
            {analysisError && (
              <ErrorState
                error={{ message: analysisError }}
                onRetry={handleAnalyze}
                onDismiss={() => setAnalysisError(null)}
              />
            )}

            {/* Analyze Button */}
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                disabled={loading || (!vcfFile && !vcfContent) || selectedDrugs.length === 0}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Analyzing...' : 'Analyze Pharmacogenomic Profile'}
              </button>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Success Message */}
            <SuccessState
              message="Analysis completed successfully!"
              actionText="New Analysis"
              onAction={handleReset}
            />

            {/* Results Dashboard */}
            <ResultsDashboard
              analysisData={analysisResult}
              onExportJSON={handleExportJSON}
              onCopyJSON={handleCopyJSON}
            />

            {/* Detailed Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <VariantDetails
                  pharmacogenomicProfile={analysisResult?.pharmacogenomic_profile}
                  riskAssessment={analysisResult?.risk_assessment}
                />
                <LLMExplanation
                  explanation={analysisResult?.explanation}
                  riskLevel={analysisResult?.risk_assessment?.risk_level}
                  drugName={analysisResult?.drug_info?.name}
                  geneProfile={analysisResult?.pharmacogenomic_profile}
                />
              </div>
              <div className="space-y-8">
                <ClinicalRecommendations
                  riskAssessment={analysisResult?.risk_assessment}
                  drugInfo={analysisResult?.drug_info}
                  pharmacogenomicProfile={analysisResult?.pharmacogenomic_profile}
                />
                <ExportFunctionality
                  analysisData={analysisResult}
                  onExportPDF={handlePrint}
                  onPrint={handlePrint}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>PharmaGuard - Pharmacogenomic Risk Prediction System</p>
            <p className="mt-2">
              For educational and research purposes only. Not for clinical use.
            </p>
            <p className="mt-2">
              Powered by CPIC Guidelines and AI-Generated Explanations
            </p>
          </div>
        </div>
      </footer>

      {/* Full Screen Loading */}
      {loading && <FullScreenLoader message="Analyzing your genetic data..." />}
    </div>
  );
}

export default App;
