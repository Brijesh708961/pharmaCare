import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pill, Info, X } from 'lucide-react';

const DrugInput = ({ onDrugSelect, selectedDrugs, isLoading, maxDrugs = 3, availableDrugs = [] }) => {
  const selectedDrugNames = selectedDrugs.map((drug) =>
    typeof drug === 'string' ? drug : drug.name
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrugInfo, setSelectedDrugInfo] = useState(null);

  // Comprehensive list of pharmacogenomic drugs with categories
  const drugDatabase = [
    { name: 'clopidogrel', category: 'Antiplatelet', indication: 'Prevention of blood clots', genes: ['CYP2C19'] },
    { name: 'warfarin', category: 'Anticoagulant', indication: 'Blood thinner', genes: ['CYP2C9', 'VKORC1'] },
    { name: 'codeine', category: 'Opioid', indication: 'Pain relief', genes: ['CYP2D6'] },
    { name: 'simvastatin', category: 'Statin', indication: 'Cholesterol lowering', genes: ['SLCO1B1'] },
    { name: 'azathioprine', category: 'Immunosuppressant', indication: 'Autoimmune diseases', genes: ['TPMT'] },
    { name: 'fluorouracil', category: 'Chemotherapy', indication: 'Cancer treatment', genes: ['DPYD'] },
  ];

  const allowedDrugNames = new Set((availableDrugs || []).map((d) => String(d).toLowerCase()));
  const visibleDrugDatabase = allowedDrugNames.size
    ? drugDatabase.filter((drug) => allowedDrugNames.has(drug.name.toLowerCase()))
    : drugDatabase;

  const filteredDrugs = visibleDrugDatabase.filter(drug =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const selectDrug = (drug) => {
    if (selectedDrugNames.includes(drug.name)) {
      removeDrug(drug.name);
      return;
    }

    if (selectedDrugs.length >= maxDrugs) {
      alert(`Maximum ${maxDrugs} drugs can be selected`);
      return;
    }

    onDrugSelect?.([...selectedDrugs, drug]);
  };

  const removeDrug = (drugName) => {
    onDrugSelect?.(
      selectedDrugs.filter((drug) => (typeof drug === 'string' ? drug : drug.name) !== drugName)
    );
  };

  const showDrugInfo = (drug) => {
    setSelectedDrugInfo(drug);
  };

  const getRiskColor = (drug) => {
    // This would be populated with actual risk data from API
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Drug(s) for Analysis
        </label>
        
        {/* Drug Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search for a drug (e.g., clopidogrel, warfarin, codeine)..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              disabled={isLoading}
            />
            {selectedDrugs.length >= maxDrugs && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-amber-600 font-medium">
                  Max {maxDrugs} drugs
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drug Cards Grid */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Available Model-Supported Drugs ({filteredDrugs.length})
        </p>
        {filteredDrugs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDrugs.map((drug) => {
              const isSelected = selectedDrugNames.includes(drug.name);
              const maxReached = selectedDrugs.length >= maxDrugs;
              const isDisabled = isLoading || (!isSelected && maxReached);

              return (
                <motion.button
                  key={drug.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                  type="button"
                  onClick={() => !isDisabled && selectDrug(drug)}
                  disabled={isDisabled}
                  className={`text-left border rounded-lg p-3 transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50'
                      : isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <Pill className="w-4 h-4 text-gray-500" />
                        <p className="font-medium text-gray-900 truncate">{drug.name}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 truncate">{drug.category}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">Genes: {drug.genes.join(', ')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        showDrugInfo(drug);
                      }}
                      className="ml-2 p-1 hover:bg-gray-100 rounded"
                    >
                      <Info className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  {isSelected && (
                    <span className="inline-block mt-2 text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">
                      Selected
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600 text-center">No drugs found for "{searchTerm}"</p>
          </div>
        )}
      </div>

      {/* Selected Drugs */}
      {selectedDrugs.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Drugs ({selectedDrugs.length}/{maxDrugs})
          </p>
          <div className="space-y-2">
            <AnimatePresence>
            {selectedDrugs.map((drug) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={typeof drug === 'string' ? drug : drug.name}
                className={`flex items-center justify-between p-3 rounded-lg border ${getRiskColor(drug)}`}
              >
                <div className="flex items-center space-x-3">
                  <Pill className="w-5 h-5" />
                  <div>
                    <p className="font-medium">{typeof drug === 'string' ? drug : drug.name}</p>
                    <p className="text-xs opacity-75">
                      {typeof drug === 'string' ? 'Selected medication' : `${drug.category} • ${drug.indication}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (typeof drug !== 'string') {
                        showDrugInfo(drug);
                      }
                    }}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                    disabled={typeof drug === 'string'}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeDrug(typeof drug === 'string' ? drug : drug.name)}
                    className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Drug Info Modal */}
      <AnimatePresence>
      {selectedDrugInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDrugInfo.name}
              </h3>
              <button
                onClick={() => setSelectedDrugInfo(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Category</p>
                <p className="text-sm text-gray-600">{selectedDrugInfo.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Indication</p>
                <p className="text-sm text-gray-600">{selectedDrugInfo.indication}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Relevant Genes</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedDrugInfo.genes.map((gene) => (
                    <span
                      key={gene}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800"
                    >
                      {gene}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Drug Selection Tips:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Search by drug name, category, or indication</li>
              <li>Select up to {maxDrugs} drugs for comparative analysis</li>
              <li>Click the info icon to see drug details and relevant genes</li>
              <li>All drugs have established pharmacogenomic guidelines</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DrugInput;
