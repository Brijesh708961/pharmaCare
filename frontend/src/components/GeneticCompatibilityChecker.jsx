import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, UploadCloud, ArrowLeft, CheckCircle, AlertTriangle,
  AlertCircle, ChevronDown, ChevronUp, Info, Dna, Users, ShieldCheck
} from 'lucide-react';

/* ─── Animation helpers ──────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  })
};

/* ─── File upload box ────────────────────────────────────────── */
const VCFDropBox = ({ label, colorClass, bgClass, dotColor, file, onFile, darkMode }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  const cardBg = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const dragBg  = dragging  ? `border-${colorClass}-400 bg-${colorClass}-50/30` : cardBg;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${label} — drag and drop or click to upload`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center text-center
        border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${dragBg}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".vcf,.vcf.gz,.vcf.bgz"
        className="hidden"
        onChange={(e) => { if (e.target.files[0]) onFile(e.target.files[0]); }}
      />

      {file ? (
        <>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${bgClass}`}>
            <CheckCircle className={`w-6 h-6 text-${colorClass}-600`} />
          </div>
          <p className={`text-sm font-semibold text-${colorClass}-700 dark:text-${colorClass}-400`}>
            {file.name}
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {(file.size / 1024).toFixed(1)} KB — ready
          </p>
        </>
      ) : (
        <>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${bgClass}`}>
            <UploadCloud className={`w-6 h-6 text-${colorClass}-500`} />
          </div>
          <p className={`text-[10px] font-bold tracking-[0.18em] uppercase mb-1 text-${colorClass}-500`}>{label}</p>
          <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Upload {label.toLowerCase().includes('partner') ? "partner's" : 'your'} VCF
          </p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            vcf, vcf.gz, vcf.bgz
          </p>
        </>
      )}

      {/* Dot indicator */}
      <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${dotColor} ${file ? 'opacity-100' : 'opacity-30'}`} aria-hidden="true"/>
    </div>
  );
};

/* ─── Compatibility result row ───────────────────────────────── */
const CompatibilityRow = ({ gene, score, risk, detail, darkMode, index }) => {
  const [open, setOpen] = useState(false);
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';

  const riskConfig = {
    low:      { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle, bar: 'bg-emerald-500', label: 'Low Risk' },
    moderate: { color: 'text-amber-600',   bg: 'bg-amber-50',   icon: AlertCircle, bar: 'bg-amber-500',   label: 'Moderate' },
    high:     { color: 'text-red-600',     bg: 'bg-red-50',     icon: AlertTriangle,bar:'bg-red-500',     label: 'High Risk' },
  }[risk] ?? { color: 'text-gray-500', bg: 'bg-gray-50', icon: CheckCircle, bar: 'bg-gray-400', label: 'Unknown' };

  const RiskIcon = riskConfig.icon;

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className={`rounded-2xl border ${cardBg} overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`compat-panel-${gene}`}
        className={`w-full flex items-center justify-between px-5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
        } transition-colors`}
      >
        <div className="flex items-center space-x-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${riskConfig.bg}`}>
            <RiskIcon className={`w-4 h-4 ${riskConfig.color}`} aria-hidden="true" />
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold font-mono ${textP}`}>{gene}</p>
            <p className={`text-xs ${riskConfig.color}`}>{riskConfig.label}</p>
          </div>
        </div>

        <div className="flex items-center space-x-5">
          {/* Score bar */}
          <div className="hidden sm:block">
            <div className="flex items-center space-x-2">
              <div className={`w-28 h-1.5 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} aria-hidden="true">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.07 }}
                  className={`h-full rounded-full ${riskConfig.bar}`}
                />
              </div>
              <span className={`text-xs font-semibold w-8 text-right ${textS}`}>{score}%</span>
            </div>
          </div>
          {open ? <ChevronUp className={`w-4 h-4 ${textS}`}/> : <ChevronDown className={`w-4 h-4 ${textS}`}/>}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`compat-panel-${gene}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`px-5 pb-5 border-t overflow-hidden ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}
          >
            <p className={`text-sm leading-relaxed pt-4 ${textS}`}>{detail}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full ${darkMode?'bg-gray-800 text-gray-400':'bg-gray-50 text-gray-500'}`}>
                <Dna className="w-3 h-3 mr-1.5" aria-hidden="true"/> Pharmacogenomic variant
              </span>
              <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full ${riskConfig.bg} ${riskConfig.color}`}>
                <Info className="w-3 h-3 mr-1.5" aria-hidden="true"/> Inheritance score: {score}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ─── MAIN PAGE ──────────────────────────────────────────────── */
const GeneticCompatibilityChecker = ({ darkMode, onBack }) => {
  const [yourFile, setYourFile]         = useState(null);
  const [partnerFile, setPartnerFile]   = useState(null);
  const [analysisState, setAnalysisState] = useState('idle'); // idle | loading | done
  const [partnerName, setPartnerName]   = useState('P');

  const canAnalyze = yourFile && partnerFile;

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    setAnalysisState('loading');
    setTimeout(() => setAnalysisState('done'), 2800); // simulate
  };

  const handleReset = () => {
    setYourFile(null);
    setPartnerFile(null);
    setAnalysisState('idle');
    setPartnerName('P');
  };

  // Mock results
  const results = [
    { gene:'CYP2D6', score:72, risk:'high',
      detail:'Both parents carry reduced-function alleles (*4, *5). Children have a 72% probability of inheriting Poor or Intermediate Metabolizer phenotype, significantly affecting opioid and antidepressant metabolism.' },
    { gene:'CYP2C19', score:40, risk:'moderate',
      detail:'One parent carries *2 loss-of-function variant. Offspring have approximately 40% chance of inheriting reduced CYP2C19 activity, impacting clopidogrel activation and several psychiatric medications.' },
    { gene:'CYP2C9', score:18, risk:'low',
      detail:'Both parents show predominantly normal function alleles. Only an 18% probability of children inheriting reduced-function variants affecting warfarin and NSAID metabolism.' },
    { gene:'SLCO1B1', score:55, risk:'moderate',
      detail:"One parent carries the *5 variant (rs4149056). There is a 55% chance that children will inherit this statin-myopathy risk variant, particularly relevant for simvastatin dosing." },
    { gene:'TPMT', score:12, risk:'low',
      detail:'Neither parent carries significant TPMT variants. Very low probability (12%) of children inheriting thiopurine sensitivity. Azathioprine at standard doses should be well tolerated.' },
    { gene:'DPYD', score:25, risk:'low',
      detail:'No major DPYD variants detected in either parent. 25% residual probability accounts for uncharacterised variants. Children are unlikely to exhibit severe fluorouracil toxicity.' },
  ];

  const bg       = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg   = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const textP    = darkMode ? 'text-white' : 'text-gray-900';
  const textS    = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg  = darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-600'
                             : 'bg-gray-50 border-gray-200 text-gray-700 placeholder-gray-400';

  return (
    <div className={`min-h-screen ${bg}`}>

      {/* ── Page content (offset for fixed header) ──────── */}
      <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-24 pb-20">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          aria-label="Go back to home"
          className={`flex items-center space-x-2 text-sm font-medium mb-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg ${
            darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </motion.button>

        {/* ── Header ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 text-xs font-semibold mb-5">
            <Heart className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Family Planning & Compatibility</span>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${textP}`}>
            Genetic Compatibility Checker
          </h1>
          <p className={`text-sm max-w-lg mx-auto leading-relaxed ${textS}`}>
            Upload your partner's genetic data to analyze the probability of your{' '}
            <span className={darkMode ? 'text-pink-400' : 'text-pink-600'}>children inheriting</span>{' '}
            pharmacogenomic risks.
          </p>
        </motion.div>

        {/* ── Partner Avatar + Name input ───────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`rounded-2xl border ${cardBg} p-8 mb-5`}
        >
          {/* You ♥ Partner diagram */}
          <div className="flex items-center justify-center space-x-5 mb-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-900">
                <span className="text-blue-600 font-bold text-base">You</span>
              </div>
              {yourFile && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-label="Your VCF uploaded" />}
            </div>

            <div className="flex items-center space-x-3">
              <div className={`h-px w-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} aria-hidden="true"/>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="w-6 h-6 text-pink-400 fill-current" aria-hidden="true" />
              </motion.div>
              <div className={`h-px w-10 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} aria-hidden="true"/>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-900">
                <span className="text-pink-600 font-bold text-base">{partnerName.charAt(0).toUpperCase() || 'P'}</span>
              </div>
              {partnerFile && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-label="Partner's VCF uploaded" />}
            </div>
          </div>

          {/* Partner name input */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <label htmlFor="partner-name" className={`text-xs font-semibold ${textS}`}>
                Partner's name (optional):
              </label>
              <input
                id="partner-name"
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                maxLength={20}
                placeholder="Partner"
                aria-label="Enter your partner's name"
                className={`w-32 px-3 py-1.5 text-sm rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${inputBg}`}
              />
            </div>
          </div>

          {/* Two upload boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <VCFDropBox
              label="YOUR VCF"
              colorClass="blue"
              bgClass="bg-blue-50"
              dotColor="bg-blue-400"
              file={yourFile}
              onFile={setYourFile}
              darkMode={darkMode}
            />
            <VCFDropBox
              label="PARTNER'S VCF"
              colorClass="pink"
              bgClass="bg-pink-50"
              dotColor="bg-pink-400"
              file={partnerFile}
              onFile={setPartnerFile}
              darkMode={darkMode}
            />
          </div>

          {/* Analyze button */}
          <motion.button
            onClick={handleAnalyze}
            disabled={!canAnalyze || analysisState === 'loading'}
            whileHover={canAnalyze ? { scale: 1.01 } : {}}
            whileTap={canAnalyze ? { scale: 0.99 } : {}}
            aria-label={canAnalyze ? 'Analyze genetic compatibility' : 'Upload both VCF files to continue'}
            className={`w-full py-4 rounded-xl font-semibold text-base transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              canAnalyze && analysisState !== 'loading'
                ? (darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-700')
                : (darkMode ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')
            }`}
          >
            {analysisState === 'loading' ? (
              <span className="flex items-center justify-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  aria-hidden="true"
                />
                <span>Analyzing compatibility…</span>
              </span>
            ) : 'Analyze Compatibility'}
          </motion.button>
        </motion.div>

        {/* ── Results ───────────────────────────────────── */}
        <AnimatePresence>
          {analysisState === 'done' && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Summary banner */}
              <div className={`rounded-2xl border mb-5 p-6 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-pink-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className={`font-bold ${textP}`}>Compatibility Report</p>
                      <p className={`text-xs ${textS}`}>
                        You &amp; {partnerName || 'Partner'} — {results.length} genes analyzed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`text-2xl font-black text-amber-500`}>Moderate</p>
                      <p className={`text-xs ${textS}`}>Overall inheritance risk</p>
                    </div>
                    <button
                      onClick={handleReset}
                      aria-label="Reset and start new analysis"
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        darkMode
                          ? 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                          : 'border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300'
                      }`}
                    >
                      New Analysis
                    </button>
                  </div>
                </div>
              </div>

              {/* Gene-by-gene breakdown */}
              <div className="space-y-3" role="list" aria-label="Gene compatibility results">
                <p className={`text-xs font-semibold tracking-[0.18em] uppercase mb-3 ${textS}`}>
                  Gene-by-Gene Inheritance Probability
                </p>
                {results.map((r, i) => (
                  <div key={r.gene} role="listitem">
                    <CompatibilityRow {...r} darkMode={darkMode} index={i} />
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`mt-6 p-4 rounded-xl border flex items-start space-x-3 ${
                  darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 flex-shrink-0 mt-0.5 ${darkMode?'text-gray-500':'text-gray-400'}`} aria-hidden="true"/>
                <p className={`text-xs leading-relaxed ${textS}`}>
                  This report is for <strong>informational purposes only</strong> and does not constitute medical advice.
                  Probabilities are based on known CPIC pharmacogenomic variants. Consult a clinical geneticist or
                  genetic counselor for medical decisions.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default GeneticCompatibilityChecker;
