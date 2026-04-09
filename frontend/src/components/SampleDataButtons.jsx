import React from 'react';
import { Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

const SampleDataButtons = ({ onLoadSample, isLoading }) => {
  const samplePatients = [
    {
      id: 'PatientA',
      name: 'Patient A - High Risk',
      description: 'Multiple risk variants for CYP2C19 and CYP2C9',
      expectedResults: ['Toxic', 'Adjust Dosage', 'Ineffective'],
      icon: AlertTriangle,
      color: 'red',
      file: 'sample_patient_a.vcf'
    },
    {
      id: 'PatientB', 
      name: 'Patient B - Normal',
      description: 'Normal metabolism across all genes',
      expectedResults: ['Safe'],
      icon: CheckCircle,
      color: 'green',
      file: 'sample_patient_b.vcf'
    },
    {
      id: 'PatientC',
      name: 'Patient C - Mixed',
      description: 'Mixed profile with some gene variants',
      expectedResults: ['Adjust Dosage', 'Safe'],
      icon: Users,
      color: 'yellow',
      file: 'sample_patient_c.vcf'
    }
  ];

  const handleLoadSample = async (patient) => {
    if (isLoading) return;
    
    try {
      // Load sample VCF from backend by patient id
      const response = await fetch(`/api/sample-data/${patient.id}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${patient.id}`);
      }
      
      const sampleData = await response.json();
      const vcfContent = sampleData.vcf_content;
      onLoadSample?.(patient.id, vcfContent, patient);
    } catch (error) {
      console.error('Error loading sample data:', error);
      // Fallback: create a simple VCF content
      const fallbackContent = generateFallbackVCF(patient.id);
      onLoadSample?.(patient.id, fallbackContent, patient);
    }
  };

  const generateFallbackVCF = (patientId) => {
    // Generate basic VCF content as fallback
    return `##fileformat=VCFv4.2
##fileDate=20240101
##source=PharmaGuard Demo Data
##reference=hg19
##INFO=<ID=GENE,Number=1,Type=String,Description="Gene name">
##INFO=<ID=RSID,Number=1,Type=String,Description="dbSNP ID">
##SAMPLE=<ID=${patientId},Description=Sample patient data for PharmaGuard demo>
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
1	96915541	rs4244285	G	A	.	.	GENE=CYP2C19;RSID=rs4244285
10	96542111	rs12248560	C	T	.	.	GENE=CYP2C19;RSID=rs12248560
4	76615513	rs12239046	C	T	.	.	GENE=CYP2C9;RSID=rs12239046
`;
  };

  const getColorClasses = (color) => {
    const colorMap = {
      red: {
        bg: 'bg-red-50 hover:bg-red-100',
        border: 'border-red-200',
        icon: 'text-red-500',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-800'
      },
      green: {
        bg: 'bg-green-50 hover:bg-green-100',
        border: 'border-green-200',
        icon: 'text-green-500',
        text: 'text-green-800',
        badge: 'bg-green-100 text-green-800'
      },
      yellow: {
        bg: 'bg-yellow-50 hover:bg-yellow-100',
        border: 'border-yellow-200',
        icon: 'text-yellow-500',
        text: 'text-yellow-800',
        badge: 'bg-yellow-100 text-yellow-800'
      }
    };
    return colorMap[color] || colorMap.green;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Try Sample Patient Data
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Quick demo with pre-configured patient profiles for instant testing
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {samplePatients.map((patient) => {
            const Icon = patient.icon;
            const colors = getColorClasses(patient.color);
            
            return (
              <div
                key={patient.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${colors.bg} ${colors.border}`}
                onClick={() => handleLoadSample(patient)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-white ${colors.icon}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${colors.text}`}>
                      {patient.name}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {patient.description}
                    </p>
                    
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Expected Results:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {patient.expectedResults.map((result, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      className={`mt-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isLoading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'Load Sample'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <FileText className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sky-800">
            <p className="font-medium mb-1">About Sample Data:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Patient A: Contains CYP2C19*2 and CYP2C19*3 variants (Poor Metabolizer)</li>
              <li>Patient B: Normal metabolizer profile with no risk variants</li>
              <li>Patient C: Mixed profile with intermediate metabolizer variants</li>
              <li>Perfect for demonstrating different risk levels and recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleDataButtons;
