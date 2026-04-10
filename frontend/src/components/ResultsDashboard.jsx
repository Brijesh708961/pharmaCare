import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle, AlertCircle, XCircle, HelpCircle,
  ChevronDown, Download, Copy, Info, Activity,
  Shield, FileText, TrendingUp, Dna, Pill, Beaker, Star
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  })
};

const RISK_CONFIG = {
  'Safe':          { icon: CheckCircle,   bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', sub: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  'Adjust Dosage': { icon: AlertCircle,   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   sub: 'text-amber-600',   badge: 'bg-amber-100 text-amber-800 border-amber-200',   dot: 'bg-amber-500',   bar: 'bg-amber-500'   },
  'Toxic':         { icon: XCircle,       bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     sub: 'text-red-600',     badge: 'bg-red-100 text-red-800 border-red-200',         dot: 'bg-red-500',     bar: 'bg-red-500'     },
  'Ineffective':   { icon: AlertTriangle, bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-800',  sub: 'text-orange-600',  badge: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500',  bar: 'bg-orange-500'  },
  'Unknown':       { icon: HelpCircle,    bg: 'bg-gray-50',    border: 'border-gray-200',    text: 'text-gray-800',    sub: 'text-gray-500',    badge: 'bg-gray-100 text-gray-700 border-gray-200',       dot: 'bg-gray-400',    bar: 'bg-gray-400'    },
};

const GENE_META = {
  CYP2D6:  { desc: 'Critical for opioid, antidepressant, and tamoxifen metabolism', icon: Pill        },
  CYP2C19: { desc: 'Essential for clopidogrel activation and many CNS drugs',       icon: Beaker      },
  CYP2C9:  { desc: 'Critical for warfarin dosing and many common medications',      icon: Shield      },
  SLCO1B1: { desc: 'Key for statin-induced myopathy risk',                          icon: Activity    },
  TPMT:    { desc: 'Critical for azathioprine and 6-mercaptopurine toxicity risk',  icon: AlertTriangle },
  DPYD:    { desc: 'Essential for 5-FU and capecitabine toxicity risk',             icon: XCircle     },
};

const SeverityBar = ({ value, max = 4 }) => {
  const pct = Math.round((value / max) * 100);
  const color = value >= 4 ? 'bg-red-500' : value >= 3 ? 'bg-orange-500' : value >= 2 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`} />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right">{value}/{max}</span>
    </div>
  );
};

const Section = ({ icon: Icon, title, badge, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
            <Icon className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
          {badge && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">{badge}</span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-gray-100">
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricCard = ({ label, value, sub, icon: Icon, custom }) => (
  <motion.div custom={custom} variants={fadeUp} initial="hidden" animate="visible"
    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-emerald-700" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </motion.div>
);

const GeneCard = ({ gene, profile, meta, GeneIcon }) => {
  const [open, setOpen] = useState(false);
  const sevColor = profile.severity >= 4 ? 'text-red-700 bg-red-50 border-red-100' :
    profile.severity >= 3 ? 'text-orange-700 bg-orange-50 border-orange-100' :
    profile.severity >= 2 ? 'text-amber-700 bg-amber-50 border-amber-100' :
    'text-emerald-700 bg-emerald-50 border-emerald-100';

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <GeneIcon className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <span className="font-bold text-emerald-800 font-mono text-sm">{gene}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sevColor}`}>{profile.phenotype}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{meta.desc || ''}</p>
          </div>
        </div>
        <div className="flex items-center space-x-5 flex-shrink-0 ml-3">
          <div className="hidden sm:block text-center">
            <p className="text-xs text-gray-400">Variants</p>
            <p className="text-sm font-bold text-gray-900">{profile.variant_count}</p>
          </div>
          <div className="w-20 hidden sm:block">
            <p className="text-xs text-gray-400 mb-1">Severity</p>
            <SeverityBar value={profile.severity} />
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="variants" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-gray-100">
            <div className="px-4 py-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Detected Variants</p>
              {profile.variants?.length > 0 ? (
                <div className="space-y-1.5">
                  {profile.variants.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <span className="font-mono font-semibold text-emerald-700">{v.rsid || 'N/A'}</span>
                      <span className="text-gray-500">{v.variant_effect || 'Unknown effect'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No specific variants detected for this gene.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultsDashboard = ({ analysisData, onExportJSON, onCopyJSON }) => {
  if (!analysisData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Results</h3>
        <p className="text-gray-400 text-sm">Upload a VCF file and select a drug to see pharmacogenomic analysis results.</p>
      </div>
    );
  }

  const risk = analysisData.risk_assessment || {};
  const riskCfg = RISK_CONFIG[risk.risk_level] || RISK_CONFIG['Unknown'];
  const RiskIcon = riskCfg.icon;
  const confidence = (risk.confidence || 0) * 100;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-4">

      {/* ── HERO RISK CARD ───────────────────────────────── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className={`${riskCfg.bg} ${riskCfg.border} border rounded-2xl p-6 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <RiskIcon className={`w-7 h-7 ${riskCfg.text}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${riskCfg.sub}`}>
                Risk Level for <span className="capitalize">{analysisData.drug_info?.name}</span>
              </p>
              <h2 className={`text-3xl font-bold ${riskCfg.text}`}>{risk.risk_level || 'Unknown'}</h2>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${riskCfg.badge}`}>
              <Shield className="w-3 h-3 inline mr-1" />{risk.severity || 'Unknown'} Severity
            </span>
            <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600">
              {confidence.toFixed(1)}% confidence
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── METRICS ROW ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Confidence Score" value={`${confidence.toFixed(1)}%`} sub="ML model prediction" icon={TrendingUp} custom={1} />
        <MetricCard label="Genes Analyzed" value={analysisData.quality_metrics?.genes_analyzed ?? 0}
          sub={`${Object.keys(analysisData.pharmacogenomic_profile || {}).length} total genes`} icon={Dna} custom={2} />
        <MetricCard label="Variants Found" value={analysisData.quality_metrics?.variant_coverage ?? 0}
          sub={`${analysisData.quality_metrics?.total_variants_found ?? 0} total in VCF`} icon={Activity} custom={3} />
      </div>

      {/* ── CLINICAL RECOMMENDATION ──────────────────────── */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Star className="w-4 h-4 text-emerald-700" />
          </div>
          <h3 className="font-semibold text-gray-900">Clinical Recommendation</h3>
        </div>

        <div className="border border-emerald-100 bg-emerald-50 rounded-xl p-4 mb-4">
          <p className="text-gray-800 font-medium leading-relaxed">{risk.recommendation || 'No recommendation available'}</p>
          {risk.dosage && (
            <p className="text-sm text-emerald-700 mt-2 font-medium">
              Recommended Dosage: <span className="font-normal text-emerald-600">{risk.dosage}</span>
            </p>
          )}
        </div>

        {risk.warnings?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Clinical Warnings</p>
            <div className="space-y-2">
              {risk.warnings.map((w, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">{w}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── AI EXPLANATION ───────────────────────────────── */}
      {analysisData.explanation && (
        <Section icon={Info} title="AI-Generated Explanation"
          badge={analysisData.explanation.ai_generated ? 'AI' : undefined} defaultOpen={true}>
          <div className="space-y-4">
            {[
              { label: 'Biological Mechanism', key: 'biological_mechanism' },
              { label: 'Variant Reasoning',    key: 'variant_reasoning'    },
              { label: 'Clinical Interpretation', key: 'clinical_interpretation' },
            ].map(({ label, key }) => analysisData.explanation[key] && (
              <div key={key}>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 leading-relaxed">
                  {analysisData.explanation[key]}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── PHARMACOGENOMIC PROFILE ──────────────────────── */}
      <Section icon={Dna} title="Pharmacogenomic Profile" defaultOpen={false}>
        <div className="space-y-2.5">
          {Object.entries(analysisData.pharmacogenomic_profile || {}).map(([gene, profile]) => {
            const meta = GENE_META[gene] || {};
            const GeneIcon = meta.icon || Dna;
            return <GeneCard key={gene} gene={gene} profile={profile} meta={meta} GeneIcon={GeneIcon} />;
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Understanding Your Results:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-500">
            {[
              ['Poor Metabolizer', 'Reduced enzyme activity - higher drug levels, increased toxicity risk'],
              ['Intermediate Metabolizer', 'Moderately reduced enzyme activity - may need dose adjustment'],
              ['Normal Metabolizer', 'Standard enzyme activity - typical drug response'],
              ['Ultra-Rapid Metabolizer', 'Increased enzyme activity - lower drug levels, reduced efficacy'],
              ['Severity Score', '1 (Low) to 4 (Critical) based on clinical impact'],
            ].map(([term, desc]) => (
              <div key={term} className="flex items-start space-x-1.5">
                <span className="text-gray-300 mt-0.5">•</span>
                <span><span className="text-gray-700 font-medium">{term}:</span> {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── QUALITY METRICS ──────────────────────────────── */}
      <Section icon={Activity} title="Quality Metrics" defaultOpen={false}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'VCF Quality',       value: `${((analysisData.quality_metrics?.vcf_quality_score || 0) * 100).toFixed(0)}%` },
            { label: 'Processing',        value: `${analysisData.quality_metrics?.processing_time_ms || 0}ms`                   },
            { label: 'Total Variants',    value: analysisData.quality_metrics?.total_variants_found ?? 0                        },
            { label: 'Pharmacogene Hits', value: analysisData.quality_metrics?.variant_coverage ?? 0                            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        {(analysisData.quality_metrics?.warnings?.length > 0) && (
          <div className="mt-3 space-y-2">
            {analysisData.quality_metrics.warnings.map((w, i) => (
              <div key={i} className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">{w}</div>
            ))}
          </div>
        )}
      </Section>

      {/* ── EXPORT ACTIONS ────────────────────────────────── */}
      <div className="flex justify-end space-x-3 pt-1">
        <button onClick={() => onCopyJSON?.(analysisData)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:border-gray-300 hover:text-gray-900 transition-all text-sm font-medium shadow-sm">
          <Copy className="w-4 h-4" /><span>Copy JSON</span>
        </button>
        <button onClick={() => onExportJSON?.(analysisData)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-800 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium">
          <Download className="w-4 h-4" /><span>Export JSON</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ResultsDashboard;
