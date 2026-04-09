import React, { useState } from 'react';
import { 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Info,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';

const LLMExplanation = ({ explanation, riskLevel, drugName, geneProfile }) => {
  const [expandedSections, setExpandedSections] = useState({
    biological: true,
    variant: false,
    clinical: false,
    summary: false
  });
  const [copiedSection, setCopiedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getRiskClasses = (level) => {
    const classes = {
      'Safe': {
        icon: 'text-green-500',
        header: 'bg-green-50 border-green-200',
        title: 'text-green-600',
        subtitle: 'text-green-700'
      },
      'Adjust Dosage': {
        icon: 'text-yellow-500',
        header: 'bg-yellow-50 border-yellow-200',
        title: 'text-yellow-600',
        subtitle: 'text-yellow-700'
      },
      'Toxic': {
        icon: 'text-red-500',
        header: 'bg-red-50 border-red-200',
        title: 'text-red-600',
        subtitle: 'text-red-700'
      },
      'Ineffective': {
        icon: 'text-orange-500',
        header: 'bg-orange-50 border-orange-200',
        title: 'text-orange-600',
        subtitle: 'text-orange-700'
      },
      'Unknown': {
        icon: 'text-gray-500',
        header: 'bg-gray-50 border-gray-200',
        title: 'text-gray-600',
        subtitle: 'text-gray-700'
      }
    };
    return classes[level] || classes.Unknown;
  };

  const riskClasses = getRiskClasses(riskLevel);

  const SectionHeader = ({ title, section, icon: Icon, hasContent = true }) => (
    <button
      onClick={() => hasContent && toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
        hasContent ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
      }`}
      disabled={!hasContent}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${riskClasses.icon}`} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {!hasContent && (
          <span className="text-xs text-gray-500 italic">(No content available)</span>
        )}
      </div>
      {hasContent && (
        <div className="flex items-center space-x-2">
          {copiedSection === section && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
          {expandedSections[section] ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      )}
    </button>
  );

  const SectionContent = ({ children, section, text }) => (
    <div className="px-4 pb-4 border-t border-gray-200">
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => copyToClipboard(text || children, section)}
            className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedSection === section ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <div className="text-gray-800 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );

  if (!explanation) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 text-center">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No AI Explanation Available
          </h3>
          <p className="text-gray-500">
            AI-generated explanations are not available for this analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className={`${riskClasses.header} border-b p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className={`w-6 h-6 ${riskClasses.title}`} />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                AI-Generated Explanation
              </h2>
              <p className={`text-sm ${riskClasses.subtitle}`}>
                For {drugName} • {riskLevel} Risk Level
              </p>
            </div>
          </div>
          {explanation.ai_generated && (
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm font-medium">
                AI Generated
              </span>
              {explanation.model_used && (
                <span className="text-xs text-gray-500">
                  via {explanation.model_used}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {explanation.summary && (
        <div className="border-b border-gray-200">
          <SectionHeader
            title="Executive Summary"
            section="summary"
            icon={Info}
            hasContent={!!explanation.summary}
          />
          {expandedSections.summary && (
            <SectionContent section="summary" text={explanation.summary}>
              <div className="prose prose-sm max-w-none">
                {explanation.summary.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>
            </SectionContent>
          )}
        </div>
      )}

      {/* Biological Mechanism */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Biological Mechanism"
          section="biological"
          icon={Brain}
          hasContent={!!explanation.biological_mechanism}
        />
        {expandedSections.biological && explanation.biological_mechanism && (
          <SectionContent section="biological" text={explanation.biological_mechanism}>
            <div className="prose prose-sm max-w-none">
              {explanation.biological_mechanism.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </SectionContent>
        )}
      </div>

      {/* Variant Reasoning */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Variant-Level Reasoning"
          section="variant"
          icon={AlertCircle}
          hasContent={!!explanation.variant_reasoning}
        />
        {expandedSections.variant && explanation.variant_reasoning && (
          <SectionContent section="variant" text={explanation.variant_reasoning}>
            <div className="prose prose-sm max-w-none">
              {explanation.variant_reasoning.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </SectionContent>
        )}
      </div>

      {/* Clinical Interpretation */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Clinical Interpretation"
          section="clinical"
          icon={Info}
          hasContent={!!explanation.clinical_interpretation}
        />
        {expandedSections.clinical && explanation.clinical_interpretation && (
          <SectionContent section="clinical" text={explanation.clinical_interpretation}>
            <div className="prose prose-sm max-w-none">
              {explanation.clinical_interpretation.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          </SectionContent>
        )}
      </div>

      {/* Footer Information */}
      <div className="bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <p>This explanation was generated by an AI model to help interpret the pharmacogenomic analysis.</p>
            <p className="mt-1">Always consult with healthcare professionals for medical decisions.</p>
          </div>
          <button
            onClick={() => window.open('https://cpicpgx.org/', '_blank')}
            className="flex items-center space-x-1 text-xs text-sky-600 hover:text-sky-800 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>CPIC Guidelines</span>
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Medical Disclaimer:</p>
            <p>
              This AI-generated explanation is for educational purposes only and should not be used as a substitute 
              for professional medical advice, diagnosis, or treatment. The information provided is based on 
              current pharmacogenomic knowledge and may not reflect the most recent research or clinical guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMExplanation;
