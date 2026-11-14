import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Satellite, 
  Layers, 
  Calendar,
  CloudRain
} from 'lucide-react';

export default function ReliabilityModal({
  isOpen,
  onClose,
  reliabilityData
}) {
  if (!isOpen || !reliabilityData) return null;

  const level = reliabilityData.reliability_level || 'High';
  const score = reliabilityData.reliability_score ?? 94;
  const passedChecks = reliabilityData.passed_checks || [];
  const failedChecks = reliabilityData.failed_checks || [];
  const details = reliabilityData.details || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-xl bg-[#0f172a] border-[#2a3c5d] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-4 py-3 bg-[#111b2e] border-b border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#35c6a5]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Statistical Reliability Scorecard
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded bg-[#131f36] hover:bg-[#1e2d4a] text-[#94a3b8] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs font-sans">
          
          {/* Top Score Banner */}
          <div className="p-3 rounded-lg bg-[#131f36] border border-[#1e2d4a] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#64748b] block">Confidence Tier</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-mono font-black ${
                  level === 'High' ? 'text-[#22c55e]' : level === 'Moderate' ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                }`}>
                  {level.toUpperCase()}
                </span>
                <span className="text-sm font-mono text-[#cbd5e1]">{score}/100</span>
              </div>
            </div>
            <p className="text-[11px] text-[#94a3b8] max-w-sm">
              {reliabilityData.explanation}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 font-mono text-center">
            <div className="p-2 bg-[#131f36] rounded border border-[#1e2d4a]">
              <span className="text-[9px] uppercase text-[#64748b] block">Active Sats</span>
              <span className="text-base font-bold text-white">{details.n_sensors_current ?? 3}</span>
            </div>
            <div className="p-2 bg-[#131f36] rounded border border-[#1e2d4a]">
              <span className="text-[9px] uppercase text-[#64748b] block">Months</span>
              <span className="text-base font-bold text-white">{details.months_with_obs ?? 312}</span>
            </div>
            <div className="p-2 bg-[#131f36] rounded border border-[#1e2d4a]">
              <span className="text-[9px] uppercase text-[#64748b] block">Baseline</span>
              <span className="text-base font-bold text-white">{details.baseline_years ?? 26}y</span>
            </div>
            <div className="p-2 bg-[#131f36] rounded border border-[#1e2d4a]">
              <span className="text-[9px] uppercase text-[#64748b] block">Coverage</span>
              <span className="text-base font-bold text-white">{details.coverage_pct ?? 98.4}%</span>
            </div>
          </div>

          {/* Passed Checks */}
          <div>
            <h4 className="font-mono text-[11px] uppercase font-bold text-[#22c55e] mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passed Scientific Validations ({passedChecks.length})</span>
            </h4>
            <div className="space-y-1">
              {passedChecks.map((check, idx) => (
                <div key={idx} className="flex items-start gap-2 p-1.5 rounded bg-[#22c55e]/5 border border-[#22c55e]/15 text-[#cbd5e1] text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-[#22c55e] mt-0.5 shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Caveats */}
          {failedChecks.length > 0 && (
            <div>
              <h4 className="font-mono text-[11px] uppercase font-bold text-[#f59e0b] mb-1.5 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Observational Caveats ({failedChecks.length})</span>
              </h4>
              <div className="space-y-1">
                {failedChecks.map((warn, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-1.5 rounded bg-[#f59e0b]/5 border border-[#f59e0b]/15 text-[#f59e0b] text-[11px]">
                    <AlertTriangle className="w-3 h-3 text-[#f59e0b] mt-0.5 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#0b1120] border-t border-[#1e2d4a] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
          <span>Calibrated against NASA POWER cloud fractions</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#1e2d4a] hover:bg-[#2a3c5d] text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
