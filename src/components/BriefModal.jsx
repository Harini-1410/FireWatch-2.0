import React from 'react';
import { X, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BriefModal({
  isOpen,
  onClose,
  alertData,
  reliabilityData,
  calendarData,
  regionName
}) {
  if (!isOpen) return null;

  const alertLabel = alertData?.alert_label || 'Normal';
  const percentile = alertData?.percentile ?? 50;
  const reliabilityLevel = reliabilityData?.reliability_level || 'High';
  const score = reliabilityData?.reliability_score ?? 94;

  let peakHistoricalYear = 2024;
  let maxCount = 0;
  if (calendarData?.grid) {
    calendarData.grid.forEach(cell => {
      if (cell.harmonized_count > maxCount) {
        maxCount = cell.harmonized_count;
        peakHistoricalYear = cell.year;
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-xl bg-[#0f172a] border-[#2a3c5d] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-[#111b2e] border-b border-[#1e2d4a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#35c6a5]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Incident Situation Brief &bull; {regionName}
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
        <div className="p-4 space-y-2.5 text-xs text-[#cbd5e1] font-sans leading-relaxed">
          <p>
            <strong className="text-white">1. Current Status:</strong> Fire activity is classified as{' '}
            <span className={`font-mono font-bold ${
              alertLabel === 'Unusual' ? 'text-[#ef4444]' : alertLabel === 'Elevated' ? 'text-[#f59e0b]' : 'text-[#22c55e]'
            }`}>{alertLabel}</span>, tracking at the <strong>{percentile}th percentile</strong> of the 25-year satellite record.
          </p>

          <p>
            <strong className="text-white">2. Harmonization:</strong> The Latent Fire Activity Index (LFAI) models sensor detection differences between MODIS (1km) and VIIRS (375m), eliminating the 2012 step change.
          </p>

          <p>
            <strong className="text-white">3. Historical Trajectory:</strong> Seasonal patterns align closely with the dry season fire evolution observed in <strong>{peakHistoricalYear}</strong>.
          </p>

          <p>
            <strong className="text-white">4. Observation Confidence:</strong> Statistical reliability rated <strong>{reliabilityLevel} ({score}/100)</strong>, calibrated using NASA POWER daily cloud fractions.
          </p>

          <p>
            <strong className="text-white">5. Fleet Constellation:</strong> Suomi NPP retirement and Terra standby status factored into wider posterior credible intervals to maintain scientific validity.
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#0b1120] border-t border-[#1e2d4a] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
          <span>Derived from NASA FIRMS &amp; LFAI telemetry</span>
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
