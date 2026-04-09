import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LandingPage from '../components/LandingPage';

const Landing = ({ 
  darkMode,
  vcfFile,
  vcfContent,
  selectedDrugs,
  loading,
  analysisError,
  handleSampleDataLoad,
  handleFileSelect,
  setAnalysisError,
  handleDrugSelect,
  handleAnalyze
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollToSection = location.state?.scrollToSection || null;

  return (
    <LandingPage
      onGetStarted={handleAnalyze} /* Fire analyze directly */
      onNavigateCompatibility={() => {
        navigate('/compatibility');
        window.scrollTo(0, 0);
      }}
      darkMode={darkMode}
      scrollToSection={scrollToSection}
      vcfFile={vcfFile}
      vcfContent={vcfContent}
      selectedDrugs={selectedDrugs}
      loading={loading}
      analysisError={analysisError}
      handleSampleDataLoad={handleSampleDataLoad}
      handleFileSelect={handleFileSelect}
      setAnalysisError={setAnalysisError}
      handleDrugSelect={handleDrugSelect}
    />
  );
};

export default Landing;
