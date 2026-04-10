import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

const handleApiError = (error, defaultMessage) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.detail || defaultMessage;

    switch (status) {
      case 400:
        return new Error(`Bad Request: ${message}`);
      case 401:
        return new Error(`Unauthorized: ${message}`);
      case 403:
        return new Error(`Forbidden: ${message}`);
      case 404:
        return new Error(`Not Found: ${message}`);
      case 413:
        return new Error(`File too large: ${message}`);
      case 422:
        return new Error(`Validation Error: ${message}`);
      case 429:
        return new Error(`Too Many Requests: ${message}`);
      case 500:
        return new Error(`Server Error: ${message}`);
      case 502:
        return new Error(`Bad Gateway: ${message}`);
      case 503:
        return new Error(`Service Unavailable: ${message}`);
      default:
        return new Error(`HTTP ${status}: ${message}`);
    }
  } else if (error.request) {
    // Request was made but no response received
    if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. Please try again.');
    }
    return new Error('Network error. Please check your connection.');
  } else {
    // Something else happened
    return new Error(`${defaultMessage}: ${error.message}`);
  }
};

// API service functions
const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/api/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Health check failed');
    }
  },

  // Get supported drugs and genes
  async getSupportedDrugs() {
    try {
      const response = await api.get('/api/drugs');
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch supported drugs');
    }
  },

  // Analyze VCF file
  async analyzeVCF(selectedDrugs = [], patientId = 'Unknown', vcfFile = null, vcfContent = null) {
    try {
      const formData = new FormData();
      
      // Handle single drug or multiple drugs
      if (selectedDrugs.length === 1) {
        formData.append('drug_name', selectedDrugs[0]);
      } else if (selectedDrugs.length > 1) {
        // For multiple drugs, send as JSON string
        formData.append('drug_names', JSON.stringify(selectedDrugs));
        // Also send first drug for backward compatibility
        formData.append('drug_name', selectedDrugs[0]);
      }
      
      formData.append('patient_id', patientId);
      
      if (vcfFile) {
        formData.append('file', vcfFile);
      } else if (vcfContent) {
        formData.append('vcf_content', vcfContent);
      }

      const response = await api.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'VCF analysis failed');
    }
  },

  // Get sample patient data
  async getSampleData(patientId) {
    try {
      const response = await api.get(`/api/sample-data/${patientId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, `Failed to load sample data for ${patientId}`);
    }
  },

  // Interpret exported analysis JSON (Ollama narrative on backend)
  async interpretReportJson(reportObject) {
    try {
      const response = await api.post(
        '/api/report/interpret',
        { report: reportObject },
        { timeout: 120000 }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Report interpretation failed');
    }
  },

  // Validate VCF file
  async validateVCF(vcfFile) {
    try {
      const formData = new FormData();
      formData.append('file', vcfFile);

      const response = await api.post('/api/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'VCF validation failed');
    }
  },

  // Scan Pill Bottle from image
  async scanPillBottle(imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post('/api/scan-pill', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw handleApiError(error, 'Failed to extract drug from image');
    }
  },

  // Utility function to check if backend is available
  async isBackendAvailable() {
    try {
      await apiService.healthCheck();
      return true;
    } catch (error) {
      console.error('Backend not available:', error);
      return false;
    }
  },
};

export default apiService;
