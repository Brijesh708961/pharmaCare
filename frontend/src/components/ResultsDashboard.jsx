import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Info,
  Activity,
  Shield,
  FileText,
  TrendingUp
} from 'lucide-react';

const ResultsDashboard = ({ analysisData, onExportJSON, onCopyJSON }) => {
  const [expandedSections, setExpandedSections] = useState({
    explanation: true,
    variants: false,
    quality: false,
    recommendations: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getRiskLevelConfig = (riskLevel) => {
    const configs = {
      'Safe': {
        icon: CheckCircle,
        color: 'green',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-500',
        badge: 'bg-green-100 text-green-800'
      },
      'Adjust Dosage': {
        icon: AlertCircle,
        color: 'yellow',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-500',
        badge: 'bg-yellow-100 text-yellow-800'
      },
      'Toxic': {
        icon: XCircle,
        color: 'red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-500',
        badge: 'bg-red-100 text-red-800'
      },
      'Ineffective': {
        icon: AlertTriangle,
        color: 'orange',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        iconColor: 'text-orange-500',
        badge: 'bg-orange-100 text-orange-800'
      },
      'Unknown': {
        icon: HelpCircle,
        color: 'gray',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-500',
        badge: 'bg-gray-100 text-gray-800'
      }
    };
    return configs[riskLevel] || configs['Unknown'];
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      'Low': { color: 'green', bar: 'bg-green-500' },
      'Medium': { color: 'yellow', bar: 'bg-yellow-500' },
      'High': { color: 'orange', bar: 'bg-orange-500' },
      'Critical': { color: 'red', bar: 'bg-red-500' }
    };
    return configs[severity] || configs['Low'];
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 0.5) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (!analysisData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Analysis Results
          </h3>
          <p className="text-gray-500">
            Upload a VCF file and select a drug to see pharmacogenomic analysis results.
          </p>
        </div>
      </div>
    );
  }

  const riskConfig = getRiskLevelConfig(analysisData.risk_assessment?.risk_level);
  const severityConfig = getSeverityConfig(analysisData.risk_assessment?.severity);
  const RiskIcon = riskConfig.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Main Risk Level Display */}
      <div className={`${riskConfig.bgColor} ${riskConfig.borderColor} border rounded-lg p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-white ${riskConfig.iconColor}`}>
              <RiskIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${riskConfig.textColor}`}>
                {analysisData.risk_assessment?.risk_level || 'Unknown'}
              </h2>
              <p className={`text-sm ${riskConfig.textColor} opacity-75`}>
                Risk Level for {analysisData.drug_info?.name}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${riskConfig.badge}`}>
              <Shield className="w-4 h-4 mr-1" />
              {analysisData.risk_assessment?.severity || 'Unknown'} Severity
            </div>
            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysisData.risk_assessment?.confidence || 0)}`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {(analysisData.risk_assessment?.confidence || 0).toFixed(2)} Confidence
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Confidence Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {((analysisData.risk_assessment?.confidence || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-sky-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(analysisData.risk_assessment?.confidence || 0) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Genes Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">
                {analysisData.quality_metrics?.genes_analyzed || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Object.keys(analysisData.pharmacogenomic_profile || {}).length} total genes
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Variants Found</p>
              <p className="text-2xl font-bold text-gray-900">
                {analysisData.quality_metrics?.variant_coverage || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 text-sky-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {analysisData.quality_metrics?.total_variants_found || 0} total in VCF
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Clinical Recommendation
        </h3>
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <p className="text-gray-800 font-medium">
            {analysisData.risk_assessment?.recommendation || 'No recommendation available'}
          </p>
          {analysisData.risk_assessment?.dosage && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Recommended Dosage:</strong> {analysisData.risk_assessment.dosage}
            </p>
          )}
        </div>
        
        {analysisData.risk_assessment?.warnings?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Clinical Warnings:</h4>
            <div className="space-y-2">
              {analysisData.risk_assessment.warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Sections */}
      <div className="space-y-4">
        {/* AI Explanation */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('explanation')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                AI-Generated Explanation
              </h3>
              {analysisData.explanation?.ai_generated && (
                <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded-full">
                  AI Generated
                </span>
              )}
            </div>
            {expandedSections.explanation ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          <AnimatePresence>
          {expandedSections.explanation && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 border-t border-gray-200 overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {analysisData.explanation?.biological_mechanism && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Biological Mechanism</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {analysisData.explanation.biological_mechanism}
                    </p>
                  </div>
                )}
                
                {analysisData.explanation?.variant_reasoning && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Variant Reasoning</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {analysisData.explanation.variant_reasoning}
                    </p>
                  </div>
                )}
                
                {analysisData.explanation?.clinical_interpretation && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Clinical Interpretation</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {analysisData.explanation.clinical_interpretation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Pharmacogenomic Profile */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('variants')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                Pharmacogenomic Profile
              </h3>
            </div>
            {expandedSections.variants ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          <AnimatePresence>
          {expandedSections.variants && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 border-t border-gray-200 overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                {Object.entries(analysisData.pharmacogenomic_profile || {}).map(([gene, profile]) => (
                  <div key={gene} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{gene}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        profile.severity >= 4 ? 'bg-red-100 text-red-800' :
                        profile.severity >= 3 ? 'bg-orange-100 text-orange-800' :
                        profile.severity >= 2 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {profile.phenotype}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Severity: {profile.severity}/4</p>
                      <p>Variants: {profile.variant_count}</p>
                      {profile.variants.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {profile.variants.map((variant, index) => (
                            <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                              {variant.rsid} - {variant.variant_effect}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('quality')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                Quality Metrics
              </h3>
            </div>
            {expandedSections.quality ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          <AnimatePresence>
          {expandedSections.quality && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 border-t border-gray-200 overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Analysis Quality</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VCF Quality Score:</span>
                      <span className="font-medium">
                        {(analysisData.quality_metrics?.vcf_quality_score || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">
                        {analysisData.quality_metrics?.processing_time_ms || 0}ms
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Data Coverage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Variants:</span>
                      <span className="font-medium">
                        {analysisData.quality_metrics?.total_variants_found || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target Variants:</span>
                      <span className="font-medium">
                        {analysisData.quality_metrics?.variant_coverage || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {(analysisData.quality_metrics?.parsing_errors?.length > 0 || 
                analysisData.quality_metrics?.warnings?.length > 0) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Issues</h4>
                  <div className="space-y-2">
                    {analysisData.quality_metrics.parsing_errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                    {analysisData.quality_metrics.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => onCopyJSON?.(analysisData)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Copy className="w-4 h-4" />
          <span>Copy JSON</span>
        </button>
        <button
          onClick={() => onExportJSON?.(analysisData)}
          className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ResultsDashboard;
