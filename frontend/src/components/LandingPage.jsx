import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Upload, Search, ShieldCheck, Dna, Activity, Users, FileText,
  Beaker, Heart, MessageSquare, Link2, UploadCloud, Pill, Plus
} from 'lucide-react';

/* ─── ANIMATION VARIANTS ──────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  })
};

/* ─── SVG DNA HELIX ───────────────────────────────────────────── */
const DNAHelix = () => {
  const STRANDS = 18;
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 300 620" className="w-full h-full max-w-xs md:max-w-sm" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a7c9a0" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#a7c9a0" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="s1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8dfc5"/><stop offset="50%" stopColor="#6aaa62"/><stop offset="100%" stopColor="#c8dfc5"/>
          </linearGradient>
          <linearGradient id="s2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b0d4ac"/><stop offset="50%" stopColor="#4a8c45"/><stop offset="100%" stopColor="#b0d4ac"/>
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="bsm"><feGaussianBlur stdDeviation="1.2"/></filter>
        </defs>
        <ellipse cx="150" cy="310" rx="110" ry="290" fill="url(#hGlow)"/>
        {Array.from({ length: STRANDS }).map((_, i) => {
          const t = i / (STRANDS - 1);
          const y = 30 + t * 560;
          const ph = t * Math.PI * 4;
          const x1 = 150 + Math.sin(ph) * 72;
          const x2 = 150 + Math.sin(ph + Math.PI) * 72;
          const d1 = (Math.sin(ph) + 1) / 2;
          const d2 = (Math.sin(ph + Math.PI) + 1) / 2;
          return (
            <g key={i}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="#8fba89" strokeWidth="1.4" strokeOpacity="0.4" filter="url(#bsm)"/>
              <circle cx={x1} cy={y} r={4 + d1 * 5} fill="url(#s1)" opacity={0.45 + d1 * 0.55} filter="url(#glow)"/>
              <circle cx={x2} cy={y} r={4 + d2 * 5} fill="url(#s2)" opacity={0.45 + d2 * 0.55} filter="url(#glow)"/>
            </g>
          );
        })}
        {[0, Math.PI].map((off, si) => {
          const pts = Array.from({ length: 80 }).map((_, i) => {
            const t = i / 79;
            const y2 = 30 + t * 560;
            const x = 150 + Math.sin(t * Math.PI * 4 + off) * 72;
            return `${x},${y2}`;
          }).join(' ');
          return <polyline key={si} points={pts} fill="none" stroke={si === 0 ? '#6aaa62' : '#4a8c45'} strokeWidth="2.2" strokeOpacity="0.55" strokeLinecap="round" filter="url(#glow)"/>;
        })}
        {[[28,80,4],[262,150,6],[18,360,5],[272,440,3],[58,530,4],[242,75,3]].map(([cx,cy,r],i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#a7c9a0" opacity="0.3"/>
        ))}
      </svg>
    </div>
  );
};

/* ─── PILLS DECORATION ───────────────────────────────────────── */
const PillsDecoration = () => (
  <div className="absolute bottom-0 left-0 w-60 md:w-80 overflow-hidden pointer-events-none" aria-hidden="true">
    <svg viewBox="0 0 310 180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4a8c45"/><stop offset="100%" stopColor="#2d5a3d"/></linearGradient>
        <linearGradient id="pH" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f2f2f2"/><stop offset="100%" stopColor="#d4d4d4"/></linearGradient>
        <filter id="ps"><feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.18"/></filter>
      </defs>
      <g transform="rotate(-22, 95, 95)" filter="url(#ps)">
        <rect x="48" y="72" width="88" height="34" rx="17" fill="url(#pG)" opacity="0.88"/>
        <rect x="92" y="72" width="44" height="34" rx="0" fill="url(#pH)" opacity="0.82"/>
        <rect x="114" y="72" width="22" height="34" rx="17" fill="url(#pH)" opacity="0.82"/>
      </g>
      <g transform="rotate(18, 162, 122)" filter="url(#ps)">
        <rect x="142" y="112" width="58" height="24" rx="12" fill="url(#pG)" opacity="0.72"/>
        <rect x="170" y="112" width="30" height="24" rx="0" fill="url(#pH)" opacity="0.72"/>
        <rect x="182" y="112" width="18" height="24" rx="12" fill="url(#pH)" opacity="0.72"/>
      </g>
      {[[28,142,8],[72,148,6],[105,153,7],[136,144,5],[14,122,5],[54,128,4],[190,155,5]].map(([x,y,r],i)=>(
        <circle key={i} cx={x} cy={y} r={r} fill="#c0dcbc" opacity="0.65" filter="url(#ps)"/>
      ))}
    </svg>
  </div>
);

/* ─── SCROLL INDICATOR ───────────────────────────────────────── */
const ScrollIndicator = ({ darkMode }) => (
  <div className="flex flex-col items-center space-y-1.5" aria-label="Scroll for more" role="img">
    <span className={`text-[10px] tracking-[0.25em] uppercase font-medium ${darkMode?'text-gray-600':'text-gray-400'}`}>SCROLL</span>
    <motion.div animate={{y:[0,7,0]}} transition={{duration:1.6,repeat:Infinity,ease:'easeInOut'}} className={`w-px h-8 ${darkMode?'bg-gray-700':'bg-gray-300'}`}/>
  </div>
);

/* ─── DRUG GENE CAROUSEL ─────────────────────────────────────── */
const DrugGeneCarousel = ({ darkMode }) => {
  const items = [
    { drug:'CODEINE', gene:'CYP2D6', effect:'Prodrug → morphine conversion — Toxic if ultrarapid metabolizer' },
    { drug:'WARFARIN', gene:'CYP2C9', effect:'Warfarin clearance — Bleeding if poor metabolizer' },
    { drug:'CLOPIDOGREL', gene:'CYP2C19', effect:'Prodrug activation — Ineffective if poor metabolizer' },
    { drug:'SIMVASTATIN', gene:'SLCO1B1', effect:'Hepatic uptake — Myopathy if *5 variant' },
    { drug:'AZATHIOPRINE', gene:'TPMT', effect:'Thiopurine inactivation — Myelosuppression if poor metabolizer' },
    { drug:'FLUOROURACIL', gene:'DPYD', effect:'5-FU catabolism — Severe toxicity if DPYD deficient' },
  ];
  // duplicate for seamless loop
  const doubled = [...items, ...items];
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="overflow-hidden w-full relative" aria-label="Drug gene interaction carousel">
      {/* Left/Right gradient fade */}
      <div className={`absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none ${darkMode?'bg-gradient-to-r from-gray-950':'bg-gradient-to-r from-gray-50'} to-transparent`} aria-hidden="true"/>
      <div className={`absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none ${darkMode?'bg-gradient-to-l from-gray-950':'bg-gradient-to-l from-gray-50'} to-transparent`} aria-hidden="true"/>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="flex space-x-4 py-4"
        style={{ width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <div key={i} className={`flex-shrink-0 w-72 p-5 rounded-2xl border ${cardBg} shadow-sm`} role="listitem">
            <p className={`text-xs mb-3 leading-snug ${textS}`}>{item.effect}</p>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold tracking-wide ${textP}`}>{item.drug}</span>
              <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg ${darkMode?'bg-emerald-900/50 text-emerald-400 border border-emerald-800':'bg-emerald-50 text-emerald-800 border border-emerald-100'}`}>{item.gene}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const MiniAnalyzer = ({ 
  darkMode, 
  onGetStarted,
  vcfFile,
  vcfContent,
  selectedDrugs,
  loading,
  analysisError,
  handleFileSelect,
  handleDrugSelect,
  setAnalysisError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [customDrug, setCustomDrug] = useState('');
  const fileInputRef = useRef(null);

  const vcfReady = !!vcfFile || !!vcfContent;

  const drugs = [
    { id:'codeine', name:'CODEINE', gene:'CYP2D6', category:'Pain reliever / opioid' },
    { id:'warfarin', name:'WARFARIN', gene:'CYP2C9', category:'Blood thinner' },
    { id:'clopidogrel', name:'CLOPIDOGREL', gene:'CYP2C19', category:'Antiplatelet' },
    { id:'simvastatin', name:'SIMVASTATIN', gene:'SLCO1B1', category:'Cholesterol statin' },
    { id:'azathioprine', name:'AZATHIOPRINE', gene:'TPMT', category:'Immunosuppressant' },
    { id:'fluorouracil', name:'FLUOROURACIL', gene:'DPYD', category:'Chemotherapy' },
  ];

  const toggleDrug = (id) => {
    const isSelected = selectedDrugs.some(d => (typeof d === 'string' ? d : d.name) === id);
    if (isSelected) {
      handleDrugSelect(selectedDrugs.filter(d => (typeof d === 'string' ? d : d.name) !== id));
    } else {
      handleDrugSelect([...selectedDrugs, { name: id }]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.vcf') || file.name.endsWith('.txt'))) {
      handleFileSelect(file);
    } else if (file) {
      setAnalysisError('Please upload a valid .vcf or .txt file');
    }
  };

  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';
  const inputBg = darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700';

  const canAnalyze = vcfReady && selectedDrugs.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* VCF Upload Card */}
        <div className={`rounded-2xl border ${cardBg} p-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <span className={`text-xs font-bold ${darkMode?'text-gray-500':'text-gray-300'}`}>01</span>
            <div>
              <h3 className={`font-bold ${textP}`}>Upload VCF File</h3>
              <p className={`text-xs ${textS}`}>Variant Call Format v4.2</p>
            </div>
          </div>
          <div
            role="button"
            tabIndex={0}
            aria-label="Drag and drop VCF file or click to browse"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if(e.key==='Enter'||e.key===' ') fileInputRef.current?.click(); }}
            className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
              isDragging ? 'border-emerald-500 bg-emerald-50' :
              vcfReady ? 'border-emerald-400 bg-emerald-50' :
              darkMode ? 'border-gray-700 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".vcf,.txt" className="hidden"
              onChange={(e) => { 
                const file = e.target.files[0];
                if(file) handleFileSelect(file); 
              }}/>
            {vcfReady ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-700"/>
                </div>
                <p className={`text-sm font-semibold ${darkMode?'text-emerald-400':'text-emerald-700'}`}>VCF file loaded ✓</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <UploadCloud className={`w-8 h-8 ${darkMode?'text-gray-600':'text-gray-300'}`}/>
                <p className={`text-sm font-medium ${darkMode?'text-gray-400':'text-gray-500'}`}>
                  <span className={`font-semibold ${darkMode?'text-emerald-400':'text-emerald-700'}`}>Drag</span> & drop your VCF file here
                </p>
                <p className={`text-xs ${textS}`}>or click to browse files</p>
                <div className="flex space-x-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded border ${darkMode?'border-gray-700 text-gray-500':'border-gray-200 text-gray-400'}`}>.vcf only</span>
                  <span className={`text-xs px-2 py-0.5 rounded border ${darkMode?'border-gray-700 text-gray-500':'border-gray-200 text-gray-400'}`}>Max 5 MB</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drug Selection Card */}
        <div className={`rounded-2xl border ${cardBg} p-6`}>
          <div className="flex items-center space-x-3 mb-4">
            <span className={`text-xs font-bold ${darkMode?'text-gray-500':'text-gray-300'}`}>02</span>
            <div>
              <h3 className={`font-bold ${textP}`}>Select Drug(s)</h3>
              <p className={`text-xs ${textS}`}>Click to toggle • supports multiple</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3" role="group" aria-label="Drug selection">
            {drugs.map((drug) => {
              const sel = selectedDrugs.some(d => (typeof d === 'string' ? d : d.name) === drug.id);
              return (
                <motion.button
                  key={drug.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleDrug(drug.id)}
                  aria-pressed={sel}
                  aria-label={`${drug.name} - ${drug.category}`}
                  className={`p-3 rounded-xl text-left border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    sel
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className={`text-xs font-bold tracking-wide ${sel ? (darkMode?'text-emerald-400':'text-emerald-800') : textP}`}>{drug.name}</p>
                  <p className={`text-[10px] mt-0.5 ${sel ? (darkMode?'text-emerald-500':'text-emerald-600') : textS}`}>{drug.gene}</p>
                  <p className={`text-[10px] ${sel ? (darkMode?'text-emerald-500':'text-emerald-600') : textS}`}>{drug.category}</p>
                </motion.button>
              );
            })}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add other drug (e.g. METFORMIN)..."
              value={customDrug}
              onChange={e => setCustomDrug(e.target.value)}
              onKeyDown={e => { 
                if(e.key==='Enter' && customDrug.trim()) { 
                  handleDrugSelect([...selectedDrugs, { name: customDrug.trim().toLowerCase() }]);
                  setCustomDrug(''); 
                } 
              }}
              aria-label="Add custom drug name"
              className={`flex-1 text-xs px-3 py-2 rounded-lg border focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${inputBg}`}
            />
            <button
              onClick={() => {
                if(customDrug.trim()) {
                  handleDrugSelect([...selectedDrugs, { name: customDrug.trim().toLowerCase() }]);
                  setCustomDrug('');
                }
              }}
              aria-label="Add custom drug"
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Analyze Button */}
      <motion.button
        onClick={onGetStarted}
        whileHover={canAnalyze ? { scale: 1.01 } : {}}
        whileTap={canAnalyze ? { scale: 0.99 } : {}}
        aria-label={canAnalyze ? 'Analyze pharmacogenomic risk' : 'Upload a VCF file to continue'}
        className={`w-full py-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center space-x-3 ${
          canAnalyze
            ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg'
            : darkMode ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100'
        }`}
        disabled={!canAnalyze}
      >
        <span className={`text-lg ${canAnalyze?'text-emerald-400':'text-gray-500'}`}>✦</span>
        <span>{loading ? 'Analyzing Profile...' : 'Analyze Pharmacogenomic Risk'}</span>
        {!canAnalyze && <span className={`text-xs font-normal ${darkMode?'text-gray-600':'text-gray-400'}`}>— upload a VCF file to continue</span>}
      </motion.button>
      
      {analysisError && (
        <div className={`mt-4 p-4 rounded-lg border text-sm ${darkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-300 text-red-800'}`}>
          <p className="font-semibold">Error:</p>
          <p>{analysisError}</p>
        </div>
      )}
    </div>
  );
};

/* ─── MAIN LANDING PAGE ──────────────────────────────────────── */
const LandingPage = ({ 
  onGetStarted, 
  darkMode, 
  scrollToSection, 
  onNavigateCompatibility,
  vcfFile,
  vcfContent,
  selectedDrugs,
  loading,
  analysisError,
  handleSampleDataLoad,
  handleFileSelect,
  setAnalysisError,
  handleDrugSelect
}) => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  // Handle external scroll requests
  useEffect(() => {
    if (scrollToSection) {
      const el = document.getElementById(scrollToSection.replace('#',''));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [scrollToSection]);

  const bg = darkMode ? 'bg-gray-950' : 'bg-white';
  const bgAlt = darkMode ? 'bg-gray-900/60' : 'bg-gray-50';
  const textP = darkMode ? 'text-white' : 'text-gray-900';
  const textS = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100';
  const eyebrow = darkMode ? 'text-gray-500' : 'text-gray-400';

  const genes = [
    { id:'CYP2D6', full:'Cytochrome P450 2D6', fn:'Metabolizes ~25% of all drugs', drugs:['Codeine','Tramadol','Tamoxifen','Antidepressants'], variants:['*1','*2','*4','*5','*10','*17','*41'] },
    { id:'CYP2C19', full:'Cytochrome P450 2C19', fn:'Key in prodrug activation', drugs:['Clopidogrel','PPIs','Antidepressants','Antifungals'], variants:['*1','*2','*3','*17'] },
    { id:'CYP2C9', full:'Cytochrome P450 2C9', fn:'Metabolizes narrow-TI drugs', drugs:['Warfarin','NSAIDs','Phenytoin','Sulfonylureas'], variants:['*1','*2','*3','*5','*6'] },
    { id:'SLCO1B1', full:'Solute Carrier Organic Anion 1B1', fn:'Hepatic drug uptake transporter', drugs:['Simvastatin','Atorvastatin','Methotrexate'], variants:['*1a','*1b','*5','*15','*17'] },
    { id:'TPMT', full:'Thiopurine S-Methyltransferase', fn:'Thiopurine drug inactivation', drugs:['Azathioprine','6-Mercaptopurine','Thioguanine'], variants:['*1','*2','*3A','*3B','*3C'] },
    { id:'DPYD', full:'Dihydropyrimidine Dehydrogenase', fn:'Fluoropyrimidine catabolism', drugs:['Fluorouracil (5-FU)','Capecitabine','Tegafur'], variants:['*1','*2A','HapB3','c.2846A>T'] },
  ];

  const features = [
    { icon: Activity, title:'Genomic Analysis',            desc:'Upload your VCF file and get instant pharmacogenomic risk assessments across 6 genes — powered by CPIC guidelines.',        tag:'Core Feature',    href:'#analyze',        action: onGetStarted },
    { icon: Heart,    title:'IVF & Genetic Compatibility',  desc:"See how your genetics combine with your partner's to predict medication responses for your future children.",             tag:'Family Planning', href:'#',               action: onNavigateCompatibility },
    { icon: Users,    title:'Genetic Twin Finder',          desc:'Discover patients with matching genetic profiles. Share experiences and learn from people like you.',                      tag:'Community',       href:'#community',      action: null },
    { icon: MessageSquare, title:'Community Feed',          desc:'A dedicated forum for the pharmacogenomics community — post updates, ask questions, and upvote helpful answers.',         tag:'Community',       href:'#community',      action: null },
    { icon: Beaker,   title:'AI Report Assistant',          desc:'Our Groq-powered chatbot explains your report in plain English — no jargon, just clear answers to your questions.',      tag:'AI Powered',      href:'#analyze',        action: onGetStarted },
    { icon: Link2,    title:'Drug Interaction Checker',     desc:'Analyze how your body processes 20+ common drugs including Warfarin, Codeine, Clopidogrel, and Simvastatin.',           tag:'Analysis',        href:'#analyze',        action: onGetStarted },
  ];

  return (
    <div className={`w-full ${bg} overflow-x-hidden`}>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section id="home" ref={heroRef} className="relative min-h-screen flex items-center pt-16 overflow-hidden" aria-label="Hero section">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ background: darkMode
            ? 'radial-gradient(ellipse 70% 55% at 70% 50%, rgba(45,90,61,0.14) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 70% 55% at 70% 50%, rgba(167,201,160,0.2) 0%, transparent 70%)' }}
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[calc(100vh-4rem)]">
            {/* Text */}
            <motion.div style={{ opacity: heroOpacity, y: heroY }} className="flex flex-col justify-center py-16 lg:py-0">
              <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
                className={`text-[10px] font-semibold tracking-[0.22em] uppercase mb-6 ${eyebrow}`}>
                Pharmacogenomics · Drug Safety
              </motion.p>
              <motion.h1 initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}}
                className={`text-5xl md:text-6xl lg:text-[4.2rem] font-bold leading-[1.07] tracking-tight mb-6 ${textP}`}>
                Predict{' '}<span className="text-emerald-600 font-light italic">safer</span>
                <br/>Medication
                <br/>Decisions
              </motion.h1>
              <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}} className="mb-10 max-w-md">
                <div className={`w-10 h-px mb-5 ${darkMode?'bg-gray-700':'bg-gray-200'}`} aria-hidden="true"/>
                <p className={`text-sm leading-relaxed ${textS}`}>
                  Upload your VCF file and instantly assess drug safety, dosage adjustments, and
                  toxicity risks using <strong className={darkMode?'text-gray-200':'text-gray-800'}>CPIC-aligned pharmacogenomic analysis</strong> — tailored to your unique genetic profile.
                </p>
              </motion.div>
              <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.3}} className="flex items-center space-x-6">
                <motion.button onClick={onGetStarted} whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                  aria-label="Explore PharmaGuard analysis tool"
                  className="flex items-center space-x-2.5 px-7 py-3.5 bg-emerald-800 text-white rounded-full text-sm font-semibold shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                  <span>Explore PharmaGuard</span><ArrowRight className="w-4 h-4"/>
                </motion.button>
                <a href="#how-it-works" className={`text-sm font-medium transition-colors focus:outline-none focus-visible:underline ${darkMode?'text-gray-500 hover:text-gray-300':'text-gray-400 hover:text-gray-700'}`}>
                  How it works
                </a>
              </motion.div>
            </motion.div>
            {/* DNA Helix */}
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:1,delay:0.3}}
              className="relative flex items-center justify-center h-[420px] lg:h-[580px]" aria-hidden="true">
              <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 h-3/4 w-px" 
                style={{background: darkMode?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)'}} aria-hidden="true"/>
              <motion.div animate={{y:[0,-12,0]}} transition={{duration:5.5,repeat:Infinity,ease:'easeInOut'}} className="w-full h-full">
                <DNAHelix/>
              </motion.div>
            </motion.div>
          </div>
        </div>
        <PillsDecoration/>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2"><ScrollIndicator darkMode={darkMode}/></div>
      </section>

      {/* ── ANALYSIS TOOL (embedded) ─────────────────────── */}
      <section id="analyze" className={`py-24 ${bgAlt}`} aria-labelledby="analyze-heading">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-10">
            <span className={`inline-block text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1.5 rounded-full border ${darkMode?'border-gray-700 text-gray-500':'border-gray-200 text-gray-400'}`}>
              ANALYSIS TOOL
            </span>
            <h2 id="analyze-heading" className={`text-4xl md:text-5xl font-bold mb-4 ${textP}`}>
              Pharmacogenomic Risk Analyzer
            </h2>
            <p className={`text-sm max-w-xl mx-auto ${textS}`}>
              Upload your VCF file and select medications to receive personalized risk predictions with{' '}
              <span className="text-emerald-600 font-medium">LLM-generated clinical explanations.</span>
            </p>
          </motion.div>
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:0.1}}>
            <MiniAnalyzer 
              darkMode={darkMode} 
              onGetStarted={onGetStarted}
              vcfFile={vcfFile}
              vcfContent={vcfContent}
              selectedDrugs={selectedDrugs}
              loading={loading}
              analysisError={analysisError}
              handleFileSelect={handleFileSelect}
              handleDrugSelect={handleDrugSelect}
              setAnalysisError={setAnalysisError}
            />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className={`py-24 ${bg}`} aria-labelledby="how-heading">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
            <span className={`inline-block text-[10px] font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1.5 rounded-full border ${darkMode?'border-gray-700 text-gray-500':'border-gray-200 text-gray-400'}`}>
              PROCESS
            </span>
            <h2 id="how-heading" className={`text-4xl md:text-5xl font-bold mb-4 ${textP}`}>
              How PharmaGuard Works
            </h2>
            <p className={`text-sm max-w-lg mx-auto ${textS}`}>
              From raw genomic data to{' '}
              <span className="text-emerald-600 font-medium">clinically actionable insights</span>{' '}
              in seconds.
            </p>
          </motion.div>

          {/* Steps with connecting arrows */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-12" role="list">
            {[
              { num:'01', icon: Upload, title:'Upload VCF File',
                desc:'Drag & drop or browse your Variant Call Format (.vcf) file. We validate structure, check for required INFO tags (GENE, STAR, RS), and parse pharmacogenomic variants.',
                badge:'Supports VCF v4.2 • Up to 5 MB' },
              { num:'02', icon: Search, title:'Select Drug(s)',
                desc:'Choose from supported drugs including Codeine, Warfarin, Clopidogrel, Simvastatin, Azathioprine, and Fluorouracil — or enter a custom drug name.',
                badge:'Single drug or comma-separated list' },
              { num:'03', icon: ShieldCheck, title:'Get AI Analysis',
                desc:'Our AI analyzes your variants across 6 critical pharmacogenes, predicts risk levels, and generates LLM-powered clinical explanations with specific variant citations.',
                badge:'Color-coded risk • CPIC recommendations' },
            ].map((step, i) => (
              <div key={i} className="flex" role="listitem">
                <motion.div custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
                  className={`flex-1 p-8 rounded-2xl border ${cardBg} relative`}>
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${darkMode?'bg-gray-800':'bg-gray-50'}`}>
                      <step.icon className="w-5 h-5 text-emerald-700" aria-hidden="true"/>
                    </div>
                    <span className={`text-4xl font-black ${darkMode?'text-gray-800':'text-gray-100'}`}>{step.num}</span>
                  </div>
                  <h3 className={`text-lg font-bold mb-3 ${textP}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed mb-5 ${textS}`}>{step.desc}</p>
                  <div className={`inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full ${darkMode?'bg-emerald-900/30 text-emerald-400':'bg-emerald-50 text-emerald-700'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
                    <span>{step.badge}</span>
                  </div>
                </motion.div>
                {/* Arrow connector */}
                {i < 2 && (
                  <div className="hidden md:flex items-center px-3 flex-shrink-0" aria-hidden="true">
                    <ArrowRight className={`w-5 h-5 ${darkMode?'text-gray-700':'text-gray-300'}`}/>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Risk Classification Legend */}
          <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            className={`rounded-2xl border ${cardBg} p-6`}>
            <p className={`text-[10px] font-semibold tracking-[0.2em] uppercase text-center mb-4 ${eyebrow}`}>RISK CLASSIFICATION</p>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                {color:'bg-emerald-500', label:'Safe', desc:'No dose adjustment needed'},
                {color:'bg-amber-500', label:'Adjust Dosage', desc:'Modified dosing recommended'},
                {color:'bg-red-500', label:'Toxic', desc:'Risk of serious toxicity'},
                {color:'bg-orange-500', label:'Ineffective', desc:'Drug may not work'},
                {color:'bg-gray-400', label:'Unknown', desc:'Insufficient data'},
              ].map((r, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} aria-hidden="true"/>
                  <span className={`text-xs font-semibold ${textP}`}>{r.label}</span>
                  <span className={`text-xs ${textS}`}>— {r.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES (6 cards 3×2) ─────────────────────────── */}
      <section id="features" className={`py-24 ${bgAlt}`} aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-14">
            <div className={`inline-flex items-center space-x-2 mb-4 px-3 py-1.5 rounded-full border ${darkMode?'border-gray-700 text-gray-500':'border-gray-200 text-gray-400'} text-[10px] font-semibold tracking-[0.2em] uppercase`}>
              <span className="text-emerald-500">✦</span><span>FEATURES</span><span>Everything You Need.</span>
            </div>
            <h2 id="features-heading" className={`text-4xl md:text-5xl font-bold ${textP}`}>
              All in One Place
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" role="list">
            {features.map((f, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
                role="listitem"
                onClick={() => f.action ? f.action() : null}
                tabIndex={0}
                onKeyDown={e => { if(e.key==='Enter'||e.key===' ') f.action?.(); }}
                aria-label={`${f.title} - ${f.tag}. ${f.desc}`}
                className={`group p-7 rounded-2xl border ${cardBg} hover:shadow-lg hover:border-emerald-100 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode?'bg-gray-800':'bg-gray-50'} group-hover:bg-emerald-50 transition-colors`}>
                    <f.icon className="w-5 h-5 text-emerald-700" aria-hidden="true"/>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${darkMode?'border-gray-700 text-gray-500':'border-gray-100 text-gray-400'}`}>{f.tag}</span>
                </div>
                <h3 className={`text-base font-bold mb-2 ${textP}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed mb-5 ${textS}`}>{f.desc}</p>
                <div className={`flex items-center space-x-1 text-sm font-semibold ${darkMode?'text-emerald-400':'text-emerald-700'} group-hover:translate-x-1 transition-transform`}>
                  <span>Explore</span><ArrowRight className="w-3.5 h-3.5"/>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DRUG-GENE INTERACTIONS (carousel) ─────────────── */}
      <section id="community" className={`py-24 ${bg} overflow-hidden`} aria-labelledby="dg-heading">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center">
            <h2 id="dg-heading" className={`text-4xl md:text-5xl font-bold mb-3 ${textP}`}>Drug–Gene Interactions</h2>
            <p className={`text-sm ${textS}`}>Key pharmacogenomic relationships analyzed by PharmaGuard</p>
          </motion.div>
        </div>
        <DrugGeneCarousel darkMode={darkMode}/>
      </section>

      {/* ── GENES & DRUGS ───────────────────────────────────── */}
      <section id="genes" className={`py-24 ${bgAlt}`} aria-labelledby="genes-heading">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mb-12">
            <h2 id="genes-heading" className={`text-4xl md:text-5xl font-bold ${textP}`}>Genes &amp; Drugs</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5" role="list">
            {genes.map((gene, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
                role="listitem"
                className={`p-7 rounded-2xl border ${cardBg} hover:shadow-md transition-shadow`}>
                <div className="mb-4">
                  <h3 className={`text-2xl font-bold ${darkMode?'text-emerald-400':'text-emerald-800'}`}>{gene.id}</h3>
                  <p className={`text-xs font-medium ${textS}`}>{gene.full}</p>
                  <p className={`text-xs mt-1 ${darkMode?'text-emerald-500/70':'text-emerald-700/70'}`}>{gene.fn}</p>
                </div>
                <div className="mb-4">
                  <p className={`text-[10px] font-bold tracking-[0.15em] uppercase mb-2 ${eyebrow}`}>Key Drugs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {gene.drugs.map((d, di) => (
                      <span key={di} className={`text-xs px-2.5 py-1 rounded-full border ${darkMode?'border-gray-700 text-gray-400':'border-gray-100 text-gray-600 bg-gray-50'}`}>{d}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={`text-[10px] font-bold tracking-[0.15em] uppercase mb-2 ${eyebrow}`}>Common Variants</p>
                  <div className="flex flex-wrap gap-1.5">
                    {gene.variants.map((v, vi) => (
                      <span key={vi} className={`text-xs font-mono px-2 py-0.5 rounded ${darkMode?'bg-gray-800 text-emerald-400':'bg-emerald-50 text-emerald-800'}`}>{v}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 bg-emerald-800 relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <Dna className="absolute right-[-5rem] top-1/2 -translate-y-1/2 w-96 h-96 text-emerald-700 opacity-25"/>
        </div>
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-5 text-emerald-300">Get Started</p>
            <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-5">
              Start Your Pharmacogenomic Journey
            </h2>
            <p className="text-emerald-200 text-sm mb-10 max-w-md mx-auto">
              Upload your VCF file and get your first analysis in under 30 seconds.
            </p>
            <motion.button onClick={onGetStarted} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
              aria-label="Get started with PharmaGuard"
              className="px-10 py-4 bg-white text-emerald-900 rounded-full font-bold text-sm hover:bg-emerald-50 transition-colors shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-800">
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
