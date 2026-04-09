import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Custom hook for API operations with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const executeRequest = useCallback(async (requestFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    executeRequest,
    reset
  };
};

// Custom hook for health check
export const useHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const { executeRequest } = useApi();

  const checkHealth = useCallback(async () => {
    try {
      await executeRequest(apiService.healthCheck);
      setIsHealthy(true);
      setLastCheck(new Date());
      return true;
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date());
      return false;
    }
  }, [executeRequest]);

  useEffect(() => {
    checkHealth();
    
    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth
  };
};

// Custom hook for supported drugs
export const useSupportedDrugs = () => {
  const [drugs, setDrugs] = useState([]);
  const [genes, setGenes] = useState([]);
  const { loading, error, executeRequest } = useApi();

  const fetchDrugs = useCallback(async () => {
    try {
      const result = await executeRequest(apiService.getSupportedDrugs);
      setDrugs(result.supported_drugs || []);
      setGenes(result.supported_genes || []);
      return result;
    } catch (error) {
      console.error('Failed to fetch supported drugs:', error);
      throw error;
    }
  }, [executeRequest]);

  useEffect(() => {
    fetchDrugs();
  }, [fetchDrugs]);

  return {
    drugs,
    genes,
    loading,
    error,
    refetch: fetchDrugs
  };
};

// Custom hook for VCF analysis
export const useVCFAnalysis = () => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const { loading, error, executeRequest } = useApi();

  const analyzeVCF = useCallback(async (vcfFile = null, vcfContent = null, selectedDrugs = [], patientId = 'Unknown') => {
    setProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const result = await executeRequest(
        apiService.analyzeVCF,
        selectedDrugs,
        patientId,
        vcfFile,
        vcfContent
      );
      
      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResult(result);
      
      return result;
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      throw error;
    }
  }, [executeRequest]);

  const resetAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setProgress(0);
  }, []);

  return {
    analysisResult,
    progress,
    loading,
    error,
    analyzeVCF,
    resetAnalysis
  };
};

// Custom hook for sample data
export const useSampleData = () => {
  const [sampleData, setSampleData] = useState({});
  const { loading, error, executeRequest } = useApi();

  const loadSampleData = useCallback(async (patientId) => {
    try {
      const result = await executeRequest(apiService.getSampleData, patientId);
      setSampleData(prev => ({
        ...prev,
        [patientId]: result
      }));
      return result;
    } catch (error) {
      console.error(`Failed to load sample data for ${patientId}:`, error);
      throw error;
    }
  }, [executeRequest]);

  return {
    sampleData,
    loading,
    error,
    loadSampleData
  };
};

// Custom hook for VCF validation
export const useVCFValidation = () => {
  const [validationResult, setValidationResult] = useState(null);
  const { loading, error, executeRequest } = useApi();

  const validateVCF = useCallback(async (vcfFile) => {
    try {
      const result = await executeRequest(apiService.validateVCF, vcfFile);
      setValidationResult(result);
      return result;
    } catch (error) {
      setValidationResult({ valid: false, errors: [error.message] });
      throw error;
    }
  }, [executeRequest]);

  const resetValidation = useCallback(() => {
    setValidationResult(null);
  }, []);

  return {
    validationResult,
    loading,
    error,
    validateVCF,
    resetValidation
  };
};

export default useApi;
