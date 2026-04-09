import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

const VCFUploader = ({ onFileSelect, onValidationError, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file) => {
    // Check file extension
    const validExtensions = ['.vcf', '.txt'];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      return 'Please upload a VCF file (.vcf or .txt extension)';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    // Check if file is empty
    if (file.size === 0) {
      return 'File is empty';
    }

    return null; // No validation error
  };

  const handleFile = useCallback((file) => {
    if (isLoading) return;

    // Debug: Log file details
    console.log('File received:', file);
    console.log('File size:', file.size);
    console.log('File name:', file.name);

    // Validate file
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      onValidationError?.(error);
      return;
    }

    setValidationError('');
    setFile(file);
    onFileSelect?.(file);

    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  }, [isLoading, onFileSelect, onValidationError]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const removeFile = useCallback(() => {
    setFile(null);
    setValidationError('');
    setUploadProgress(0);
    onFileSelect?.(null);
  }, [onFileSelect]);

  const clearError = useCallback(() => {
    setValidationError('');
    onValidationError?.('');
  }, [onValidationError]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload VCF File
        </label>
        
        {/* Drag and Drop Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-sky-500 bg-sky-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && document.getElementById('vcf-file-input').click()}
        >
          <input
            id="vcf-file-input"
            type="file"
            accept=".vcf,.txt"
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />
          
          {file ? (
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(() => {
                  if (!file.size) return '0.00 MB';
                  const sizeInMB = file.size / 1024 / 1024;
                  return `${sizeInMB.toFixed(2)} MB (${file.size.toLocaleString()} bytes)`;
                })()}
              </p>
              {uploadProgress < 100 && (
                <div className="w-full max-w-xs">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                {isDragging ? 'Drop your VCF file here' : 'Drag and drop your VCF file here'}
              </p>
              <p className="text-xs text-gray-500">or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">
                Supported formats: .vcf, .txt (Max 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Validation Error */}
        <AnimatePresence>
        {validationError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{validationError}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
        {file && !validationError && uploadProgress === 100 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg overflow-hidden"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-800">
              File uploaded successfully. Ready for analysis.
            </p>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* File Format Info */}
      <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <FileText className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-sky-800">
            <p className="font-medium mb-1">VCF File Requirements:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>Standard VCF format with header lines starting with #</li>
              <li>Contains variant information with CHROM, POS, ID, REF, ALT columns</li>
              <li>Optional: INFO field with GENE and RSID annotations</li>
              <li>Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VCFUploader;
