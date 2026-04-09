import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import ResultsPage from './pages/ResultsPage';
import ReportPage from './pages/ReportPage';
import Compatibility from './pages/Compatibility';
import { useVCFAnalysis, useHealthCheck, useSupportedDrugs } from './hooks/useApi';

function App() {
  const [vcfFile, setVCFFile] = useState(null);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [vcfContent, setVCFContent] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showDemo, setShowDemo] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { analyzeVCF, analysisResult, loading, resetAnalysis } = useVCFAnalysis();
  const { isHealthy, lastCheck } = useHealthCheck();
  const { drugs, loading: drugsLoading } = useSupportedDrugs();
  const navigate = useNavigate();

  // Auto-show demo on first visit
  useEffect(() => {
    const hasSeenDemo = localStorage.getItem('pharmaguard_demo_seen');
    if (!hasSeenDemo) {
      setTimeout(() => setShowDemo(true), 1000);
      localStorage.setItem('pharmaguard_demo_seen', 'true');
    }
  }, []);

  const handleFileSelect = (file) => {
    setVCFFile(file);
    setVCFContent(null);
    setCurrentPatient(null);
    setAnalysisError(null);
  };

  const handleSampleDataLoad = (patientId, content, patientInfo) => {
    setVCFContent(content);
    setCurrentPatient(patientInfo);
    setVCFFile(null);
    setAnalysisError(null);
  };

  const handleDrugSelect = (selected) => {
    setSelectedDrugs(selected);
  };

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

      const drugNames = selectedDrugs.map((drug) =>
        typeof drug === 'string' ? drug : drug.name
      );
      const patientId = currentPatient?.name || currentPatient?.id || 'Unknown';
      await analyzeVCF(vcfFile, vcfContent, drugNames, patientId);

      setShowResults(true);
      navigate('/results');
    } catch (error) {
      setAnalysisError(error.message);
    }
  };

  const handleReset = () => {
    setVCFFile(null);
    setVCFContent(null);
    setSelectedDrugs([]);
    setCurrentPatient(null);
    setShowResults(false);
    setAnalysisError(null);
    resetAnalysis();
  };

  const handleDemoAction = (action) => {
    switch (action) {
      case 'upload':
        // Auto-load sample data for Patient A
        handleSampleDataLoad('PatientA', '', { name: 'Patient A', description: 'High risk profile' });
        navigate('/', { state: { scrollToSection: 'analyze' } });
        break;
      case 'select':
        // Auto-select common drugs
        setSelectedDrugs([{ name: 'clopidogrel' }, { name: 'warfarin' }]);
        navigate('/', { state: { scrollToSection: 'analyze' } });
        break;
      case 'analyze':
        // Auto-run analysis
        handleAnalyze();
        break;
      case 'results':
        // Show results
        setShowResults(true);
        navigate('/results');
        break;
      default:
        break;
    }
    setShowDemo(false);
  };

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
    <Routes>
      <Route 
        element={
          <Layout 
            isHealthy={isHealthy} 
            lastCheck={lastCheck} 
            loading={loading}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            showDemo={showDemo}
            setShowDemo={setShowDemo}
            handleDemoAction={handleDemoAction}
          />
        }
      >
        <Route 
          path="/" 
          element={
            <Landing 
              darkMode={darkMode}
              vcfFile={vcfFile}
              vcfContent={vcfContent}
              selectedDrugs={selectedDrugs}
              loading={loading}
              analysisError={analysisError}
              handleSampleDataLoad={handleSampleDataLoad}
              handleFileSelect={handleFileSelect}
              setAnalysisError={setAnalysisError}
              handleDrugSelect={handleDrugSelect}
              handleAnalyze={handleAnalyze}
            />
          } 
        />
        <Route path="/compatibility" element={<Compatibility darkMode={darkMode} />} />
        
        {/* Legacy redirect for users who bookmark or refresh /analyze */}
        <Route path="/analyze" element={<Navigate to="/" replace state={{ scrollToSection: 'analyze' }} />} />
        
        <Route 
          path="/results" 
          element={
            <ResultsPage 
              analysisResult={analysisResult}
              showResults={showResults}
              handleReset={handleReset}
              handleExportJSON={handleExportJSON}
              handleCopyJSON={handleCopyJSON}
              handlePrint={handlePrint}
            />
          } 
        />
        <Route 
          path="/report" 
          element={<ReportPage darkMode={darkMode} />} 
        />
      </Route>
    </Routes>
  );
}

export default App;