import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultsDashboard from '../components/ResultsDashboard';
import VariantDetails from '../components/VariantDetails';
import LLMExplanation from '../components/LLMExplanation';
import ClinicalRecommendations from '../components/ClinicalRecommendations';
import ExportFunctionality from '../components/ExportFunctionality';
import { SuccessState } from '../components/LoadingStates';

const ResultsPage = ({
  analysisResult,
  showResults,
  handleReset,
  handleExportJSON,
  handleCopyJSON,
  handlePrint
}) => {
  const navigate = useNavigate();

  // If there are no results, redirect to home page
  useEffect(() => {
    if (!showResults || !analysisResult) {
      navigate('/');
    }
  }, [showResults, analysisResult, navigate]);

  if (!showResults || !analysisResult) {
    return null; // Will redirect anyway
  }

  const handleActionClick = () => {
    handleReset();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-all duration-300 ease-in-out">
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <SuccessState
            message="Analysis completed successfully."
            actionText="← Start New Analysis"
            onAction={handleActionClick}
          />
        </div>

        <ResultsDashboard
          analysisData={analysisResult}
          onExportJSON={handleExportJSON}
          onCopyJSON={handleCopyJSON}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <VariantDetails
              pharmacogenomicProfile={analysisResult.pharmacogenomic_profile}
              riskAssessment={analysisResult.risk_assessment}
            />
            <LLMExplanation
              explanation={analysisResult.explanation}
              riskLevel={analysisResult.risk_assessment?.risk_level}
              drugName={analysisResult.drug_info?.name}
              geneProfile={analysisResult.pharmacogenomic_profile}
            />
          </div>
          <div className="space-y-8">
            <ClinicalRecommendations
              riskAssessment={analysisResult.risk_assessment}
              drugInfo={analysisResult.drug_info}
              pharmacogenomicProfile={analysisResult.pharmacogenomic_profile}
            />
            <ExportFunctionality
              analysisData={analysisResult}
              onExportPDF={handlePrint}
              onPrint={handlePrint}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
