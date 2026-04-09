import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Info,
  Activity,
  Pill
} from 'lucide-react';

const ClinicalRecommendations = ({ riskAssessment, drugInfo, pharmacogenomicProfile }) => {
  const [expandedSections, setExpandedSections] = useState({
    primary: true,
    alternatives: false,
    monitoring: false,
    dosage: false,
    warnings: false,
    contraindications: false
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
        badge: 'bg-green-100 text-green-800',
        panel: 'bg-green-50 border-green-200',
        emphasis: 'text-green-900',
        symbol: 'text-green-600'
      },
      'Adjust Dosage': {
        icon: 'text-yellow-500',
        badge: 'bg-yellow-100 text-yellow-800',
        panel: 'bg-yellow-50 border-yellow-200',
        emphasis: 'text-yellow-900',
        symbol: 'text-yellow-600'
      },
      'Toxic': {
        icon: 'text-red-500',
        badge: 'bg-red-100 text-red-800',
        panel: 'bg-red-50 border-red-200',
        emphasis: 'text-red-900',
        symbol: 'text-red-600'
      },
      'Ineffective': {
        icon: 'text-orange-500',
        badge: 'bg-orange-100 text-orange-800',
        panel: 'bg-orange-50 border-orange-200',
        emphasis: 'text-orange-900',
        symbol: 'text-orange-600'
      },
      'Unknown': {
        icon: 'text-gray-500',
        badge: 'bg-gray-100 text-gray-800',
        panel: 'bg-gray-50 border-gray-200',
        emphasis: 'text-gray-900',
        symbol: 'text-gray-600'
      }
    };
    return classes[level] || classes.Unknown;
  };

  const getDosageAdjustment = () => {
    if (!riskAssessment?.dosage) return null;
    
    const adjustments = {
      'Reduce initial dose by 50-75%': {
        type: 'reduction',
        percentage: '50-75%',
        reason: 'Poor metabolizer - increased drug exposure'
      },
      'Reduce initial dose by 25-50%': {
        type: 'reduction',
        percentage: '25-50%',
        reason: 'Intermediate metabolizer - moderately increased exposure'
      },
      'Start with 10% of standard dose': {
        type: 'reduction',
        percentage: '90%',
        reason: 'Low activity - high toxicity risk'
      },
      'Start with 30-70% of standard dose': {
        type: 'reduction',
        percentage: '30-70%',
        reason: 'Intermediate activity - moderate toxicity risk'
      },
      'Standard dosing': {
        type: 'standard',
        percentage: '0%',
        reason: 'Normal metabolism - standard risk'
      }
    };
    
    return adjustments[riskAssessment.dosage] || null;
  };

  const getAlternativeDrugs = () => {
    const alternatives = {
      'clopidogrel': [
        { name: 'prasugrel', reason: 'Not dependent on CYP2C19 activation', evidence: 'Level A' },
        { name: 'ticagrelor', reason: 'Direct acting antiplatelet', evidence: 'Level A' }
      ],
      'codeine': [
        { name: 'morphine', reason: 'Not metabolized by CYP2D6', evidence: 'Level A' },
        { name: 'hydromorphone', reason: 'Alternative opioid', evidence: 'Level B' }
      ],
      'simvastatin': [
        { name: 'pravastatin', reason: 'Lower myopathy risk', evidence: 'Level A' },
        { name: 'rosuvastatin', reason: 'Different transport pathway', evidence: 'Level B' }
      ],
      'azathioprine': [
        { name: 'methotrexate', reason: 'Different mechanism', evidence: 'Level B' },
        { name: 'mycophenolate', reason: 'Alternative immunosuppressant', evidence: 'Level B' }
      ]
    };
    
    return alternatives[drugInfo?.name] || [];
  };

  const getMonitoringRequirements = () => {
    const monitoring = {
      'warfarin': [
        { parameter: 'INR', frequency: '2-3 times weekly initially', target: '2.0-3.0' },
        { parameter: 'Bleeding signs', frequency: 'Ongoing', target: 'No bleeding' }
      ],
      'clopidogrel': [
        { parameter: 'Platelet function', frequency: 'If symptoms occur', target: 'Adequate inhibition' },
        { parameter: 'Cardiovascular events', frequency: 'Regular follow-up', target: 'No events' }
      ],
      '5-fluorouracil': [
        { parameter: 'Blood counts', frequency: 'Weekly', target: 'ANC > 1500' },
        { parameter: 'Mucositis', frequency: 'Each treatment', target: 'Grade ≤ 2' }
      ]
    };
    
    return monitoring[drugInfo?.name] || [];
  };

  const getContraindications = () => {
    const contraindications = {
      'Toxic': [
        'Avoid use in patients with identified risk variants',
        'Consider alternative therapeutic class',
        'If use is absolutely necessary, specialist consultation required'
      ],
      'Ineffective': [
        'Avoid use - unlikely to provide therapeutic benefit',
        'Consider alternative mechanisms of action',
        'Monitor for lack of efficacy if used'
      ],
      'Adjust Dosage': [
        'Do not use standard dosing',
        'Pharmacogenetic testing required before initiation',
        'Close monitoring for adverse effects'
      ]
    };
    
    return contraindications[riskAssessment?.risk_level] || [];
  };

  const dosageAdjustment = getDosageAdjustment();
  const alternatives = getAlternativeDrugs();
  const monitoring = getMonitoringRequirements();
  const contraindications = getContraindications();
  const riskClasses = getRiskClasses(riskAssessment?.risk_level);

  const SectionHeader = ({ title, section, icon: Icon, badge = null }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${riskClasses.icon}`} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {badge && (
          <span className={`px-2 py-1 ${riskClasses.badge} rounded-full text-xs font-medium`}>
            {badge}
          </span>
        )}
      </div>
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
    </button>
  );

  const SectionContent = ({ children, section, text }) => (
    <div className="px-4 pb-4 border-t border-gray-200">
      <div className="mt-4">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => copyToClipboard(text || children, section)}
            className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedSection === section ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Primary Recommendation */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <SectionHeader
          title="Primary Recommendation"
          section="primary"
          icon={Shield}
          badge={riskAssessment?.risk_level}
        />
        {expandedSections.primary && (
          <SectionContent section="primary" text={riskAssessment?.recommendation}>
            <div className={`p-4 border rounded-lg ${riskClasses.panel}`}>
              <div className="flex items-start space-x-3">
                {riskAssessment?.risk_level === 'Safe' ? (
                  <CheckCircle className={`w-5 h-5 ${riskClasses.symbol} flex-shrink-0 mt-0.5`} />
                ) : (
                  <AlertTriangle className={`w-5 h-5 ${riskClasses.symbol} flex-shrink-0 mt-0.5`} />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${riskClasses.emphasis}`}>
                    {riskAssessment?.recommendation}
                  </p>
                  {dosageAdjustment && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Dosage Adjustment:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Type:</span>
                          <p className="text-gray-600 capitalize">{dosageAdjustment.type}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Adjustment:</span>
                          <p className="text-gray-600">{dosageAdjustment.percentage}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Reason:</span>
                          <p className="text-gray-600">{dosageAdjustment.reason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SectionContent>
        )}
      </div>

      {/* Dosage Information */}
      {riskAssessment?.dosage && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Dosage Information"
            section="dosage"
            icon={Pill}
            badge="Detailed"
          />
          {expandedSections.dosage && (
            <SectionContent section="dosage" text={riskAssessment.dosage}>
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
                <h4 className="font-medium text-sky-900 mb-2">Recommended Dosage:</h4>
                <p className="text-sky-800 font-mono">{riskAssessment.dosage}</p>
                {dosageAdjustment && (
                  <div className="mt-3 text-sm text-sky-700">
                    <p><strong>Adjustment Type:</strong> {dosageAdjustment.type}</p>
                    <p><strong>Rationale:</strong> {dosageAdjustment.reason}</p>
                  </div>
                )}
              </div>
            </SectionContent>
          )}
        </div>
      )}

      {/* Clinical Warnings */}
      {riskAssessment?.warnings?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Clinical Warnings"
            section="warnings"
            icon={AlertTriangle}
            badge={riskAssessment.warnings.length}
          />
          {expandedSections.warnings && (
            <SectionContent section="warnings" text={riskAssessment.warnings.join('\n')}>
              <div className="space-y-3">
                {riskAssessment.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800">{warning}</p>
                  </div>
                ))}
              </div>
            </SectionContent>
          )}
        </div>
      )}

      {/* Alternative Medications */}
      {alternatives.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Alternative Medications"
            section="alternatives"
            icon={Pill}
            badge={alternatives.length}
          />
          {expandedSections.alternatives && (
            <SectionContent section="alternatives">
              <div className="space-y-3">
                {alternatives.map((alt, index) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{alt.name}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {alt.evidence}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </SectionContent>
          )}
        </div>
      )}

      {/* Monitoring Requirements */}
      {monitoring.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Monitoring Requirements"
            section="monitoring"
            icon={Activity}
            badge={monitoring.length}
          />
          {expandedSections.monitoring && (
            <SectionContent section="monitoring">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-900">
                        Parameter
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-900">
                        Frequency
                      </th>
                      <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-900">
                        Target/Goal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitoring.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                          {item.parameter}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                          {item.frequency}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                          {item.target}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionContent>
          )}
        </div>
      )}

      {/* Contraindications */}
      {contraindications.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader
            title="Contraindications & Precautions"
            section="contraindications"
            icon={AlertCircle}
            badge="Important"
          />
          {expandedSections.contraindications && (
            <SectionContent section="contraindications" text={contraindications.join('\n')}>
              <div className="space-y-3">
                {contraindications.map((contra, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{contra}</p>
                  </div>
                ))}
              </div>
            </SectionContent>
          )}
        </div>
      )}

      {/* Evidence Level Information */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sky-800">
            <p className="font-medium mb-2">Evidence Levels:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Level A:</strong> High confidence - multiple peer-reviewed studies</li>
              <li>• <strong>Level B:</strong> Moderate confidence - limited studies or expert consensus</li>
              <li>• <strong>Level C:</strong> Low confidence - case reports or preliminary data</li>
              <li>• <strong>Level D:</strong> Very low confidence - theoretical or extrapolated data</li>
            </ul>
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={() => window.open('https://cpicpgx.org/', '_blank')}
                className="flex items-center space-x-1 text-xs text-sky-600 hover:text-sky-800 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>CPIC Guidelines</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalRecommendations;
