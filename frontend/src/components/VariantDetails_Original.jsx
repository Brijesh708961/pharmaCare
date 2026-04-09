import React, { useState } from 'react';
import { 
  DNA, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const VariantDetails = ({ pharmacogenomicProfile, riskAssessment }) => {
  const [expandedGenes, setExpandedGenes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  const toggleGene = (gene) => {
    setExpandedGenes(prev => ({
      ...prev,
      [gene]: !prev[gene]
    }));
  };

  const getSeverityColor = (severity) => {
    if (severity >= 4) return 'text-red-600 bg-red-50 border-red-200';
    if (severity >= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (severity >= 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSeverityIcon = (severity) => {
    if (severity >= 4) return AlertTriangle;
    if (severity >= 3) return AlertCircle;
    if (severity >= 2) return AlertCircle;
    return CheckCircle;
  };

  const getPhenotypeColor = (phenotype) => {
    const colorMap = {
      'Poor Metabolizer': 'text-red-700 bg-red-100',
      'Ultra-Rapid Metabolizer': 'text-orange-700 bg-orange-100',
      'Intermediate Metabolizer': 'text-yellow-700 bg-yellow-100',
      'Normal Metabolizer': 'text-green-700 bg-green-100',
      'Normal Function': 'text-green-700 bg-green-100',
      'Reduced Function': 'text-orange-700 bg-orange-100',
      'Low Activity': 'text-red-700 bg-red-100',
      'Deficient': 'text-red-700 bg-red-100',
      'Intermediate Activity': 'text-yellow-700 bg-yellow-100'
    };
    return colorMap[phenotype] || 'text-gray-700 bg-gray-100';
  };

  const getGeneInfo = (gene) => {
    const geneInfo = {
      'CYP2D6': {
        name: 'Cytochrome P450 2D6',
        function: 'Drug metabolism for ~25% of common medications',
        location: 'Chromosome 22q13.2',
        relevance: 'Critical for opioid, antidepressant, and tamoxifen metabolism'
      },
      'CYP2C19': {
        name: 'Cytochrome P450 2C19',
        function: 'Drug metabolism for antiplatelet agents, PPIs, and antidepressants',
        location: 'Chromosome 10q24.1',
        relevance: 'Essential for clopidogrel activation and many CNS drugs'
      },
      'CYP2C9': {
        name: 'Cytochrome P450 2C9',
        function: 'Drug metabolism for warfarin, NSAIDs, and oral hypoglycemics',
        location: 'Chromosome 10q23.33',
        relevance: 'Critical for warfarin dosing and many common medications'
      },
      'SLCO1B1': {
        name: 'Solute Carrier Organic Anion Transporter Family Member 1B1',
        function: 'Hepatic uptake transporter for statins and other drugs',
        location: 'Chromosome 12p12.1',
        relevance: 'Key for statin-induced myopathy risk'
      },
      'TPMT': {
        name: 'Thiopurine S-Methyltransferase',
        function: 'Metabolism of thiopurine drugs',
        location: 'Chromosome 6p22.3',
        relevance: 'Critical for azathioprine and 6-mercaptopurine toxicity risk'
      },
      'DPYD': {
        name: 'Dihydropyrimidine Dehydrogenase',
        function: 'Metabolism of fluoropyrimidine chemotherapy',
        location: 'Chromosome 1p21.3',
        relevance: 'Essential for 5-FU and capecitabine toxicity risk'
      }
    };
    return geneInfo[gene] || { name: gene, function: 'Unknown', location: 'Unknown', relevance: 'Unknown' };
  };

  const openDbSNP = (rsid) => {
    window.open(`https://www.ncbi.nlm.nih.gov/snp/${rsid}`, '_blank');
  };

  if (!pharmacogenomicProfile) {
    return (
      <div className="text-center py-8">
        <DNA className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No variant data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(pharmacogenomicProfile).map(([gene, profile]) => {
          const SeverityIcon = getSeverityIcon(profile.severity);
          const geneInfo = getGeneInfo(gene);
          
          return (
            <div
              key={gene}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                expandedGenes[gene] ? 'ring-2 ring-sky-500' : ''
              } ${getSeverityColor(profile.severity)}`}
              onClick={() => toggleGene(gene)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <DNA className="w-5 h-5" />
                  <h3 className="font-bold">{gene}</h3>
                </div>
                <SeverityIcon className="w-5 h-5" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phenotype:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhenotypeColor(profile.phenotype)}`}>
                    {profile.phenotype}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Variants:</span>
                  <span className="text-sm">{profile.variant_count}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Severity:</span>
                  <span className="text-sm font-medium">{profile.severity}/4</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 line-clamp-2">
                  {geneInfo.relevance}
                </p>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {expandedGenes[gene] ? 'Click to collapse' : 'Click to expand'}
                </span>
                {expandedGenes[gene] ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Gene Details */}
      {Object.entries(pharmacogenomicProfile).map(([gene, profile]) => {
        if (!expandedGenes[gene]) return null;
        
        const geneInfo = getGeneInfo(gene);
        
        return (
          <div key={`details-${gene}`} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{geneInfo.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">{geneInfo.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Function:</span>
                  <p className="text-gray-600">{geneInfo.function}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Clinical Relevance:</span>
                  <p className="text-gray-600">{geneInfo.relevance}</p>
                </div>
              </div>
            </div>

            {profile.variants.length > 0 ? (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Detected Variants</h4>
                <div className="space-y-3">
                  {profile.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h5 className="font-mono font-semibold text-sky-600">
                              {variant.rsid}
                            </h5>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPhenotypeColor(variant.phenotype)}`}>
                              {variant.phenotype}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                              {variant.variant_effect}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Chromosome:</span>
                              <p className="text-gray-600">{variant.chrom}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Position:</span>
                              <p className="text-gray-600">{variant.pos}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Reference:</span>
                              <p className="text-gray-600 font-mono">{variant.ref}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Alternate:</span>
                              <p className="text-gray-600 font-mono">{variant.alt}</p>
                            </div>
                          </div>
                          
                          {variant.quality && variant.quality !== '.' && (
                            <div className="mt-2">
                              <span className="font-medium text-gray-700 text-sm">Quality Score:</span>
                              <p className="text-gray-600 text-sm">{variant.quality}</p>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => openDbSNP(variant.rsid)}
                          className="ml-4 p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="View in dbSNP database"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">No risk variants detected</p>
                <p className="text-green-600 text-sm mt-1">
                  This gene shows normal metabolic activity
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Gene Information Legend */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sky-800">
            <p className="font-medium mb-2">Understanding Your Results:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Poor Metabolizer:</strong> Reduced enzyme activity - higher drug levels, increased toxicity risk</li>
              <li>• <strong>Intermediate Metabolizer:</strong> Moderately reduced enzyme activity - may need dose adjustment</li>
              <li>• <strong>Normal Metabolizer:</strong> Standard enzyme activity - typical drug response</li>
              <li>• <strong>Ultra-Rapid Metabolizer:</strong> Increased enzyme activity - lower drug levels, reduced efficacy</li>
              <li>• <strong>Severity Score:</strong> 1 (Low) to 4 (Critical) based on clinical impact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantDetails;
