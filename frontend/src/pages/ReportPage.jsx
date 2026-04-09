import React, { useState } from 'react';
import { FileJson, FileText, Loader2, Sparkles } from 'lucide-react';
import apiService from '../services/api';

const ReportPage = ({ darkMode }) => {
  const [pasteText, setPasteText] = useState('');
  const [narrative, setNarrative] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseJson = (text) => {
    const trimmed = text.trim();
    if (!trimmed) throw new Error('Paste JSON or upload a file first.');
    return JSON.parse(trimmed);
  };

  const runInterpret = async (reportObj) => {
    setLoading(true);
    setError(null);
    setNarrative('');
    setSource('');
    try {
      const data = await apiService.interpretReportJson(reportObj);
      setNarrative(data.narrative || '');
      setSource(data.source || '');
    } catch (e) {
      setError(e.message || 'Interpretation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const obj = parseJson(text);
      await runInterpret(obj);
    } catch (err) {
      setError(err.message || 'Invalid JSON file');
    }
    e.target.value = '';
  };

  const handlePasteSubmit = async () => {
    try {
      const obj = parseJson(pasteText);
      await runInterpret(obj);
    } catch (err) {
      setError(err.message || 'Invalid JSON');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className={`rounded-xl border p-6 md:p-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Report reader
            </h1>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload a PharmaGuard JSON export. The backend uses <strong>Ollama</strong> to produce a plain-language summary.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${darkMode ? 'border-gray-600 hover:border-purple-500 hover:bg-gray-700/40' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'}`}>
              <FileJson className={`w-10 h-10 mr-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              <div className="text-left">
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Drop or choose a JSON file</p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Exported analysis from Download JSON</p>
              </div>
              <input type="file" accept=".json,application/json" className="hidden" onChange={handleFile} />
            </label>
          </div>

          <div>
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Or paste JSON</p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder='{"patient_id":"...", "drug_info":{...}}'
              className={`w-full font-mono text-sm rounded-lg border p-3 ${darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
            />
            <button
              type="button"
              onClick={handlePasteSubmit}
              disabled={loading || !pasteText.trim()}
              className={`mt-3 px-4 py-2 rounded-lg font-medium text-white ${loading || !pasteText.trim() ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : 'Generate readable report'}
            </button>
          </div>
        </div>

        {error && (
          <div className={`mt-4 p-4 rounded-lg border ${darkMode ? 'bg-red-900/40 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {error}
          </div>
        )}

        {narrative && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-semibold flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <FileText className="w-5 h-5 mr-2" />
                Readable summary
              </h2>
              {source && (
                <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  Source: {source}
                </span>
              )}
            </div>
            <div className={`rounded-lg border p-4 prose prose-sm max-w-none whitespace-pre-wrap ${darkMode ? 'border-gray-600 bg-gray-900/50 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}>
              {narrative}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;