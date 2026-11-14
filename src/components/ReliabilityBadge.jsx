import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, ChevronRight } from 'lucide-react';

export default function ReliabilityBadge({
  reliabilityData,
  onClick,
  isLoading
}) {
  if (isLoading) {
    return (
      <div className="dashboard-card p-5 flex flex-col justify-center h-full min-h-[110px] animate-pulse">
        <div className="h-4 bg-[#182231] rounded w-1/3 mb-3" />
        <div className="h-6 bg-[#182231] rounded w-1/2" />
      </div>
    );
  }

  const level = reliabilityData?.reliability_level || 'High';
  const score = reliabilityData?.reliability_score ?? 94;
  const details = reliabilityData?.details || {};

  let badgeColor = 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30';
  let dotColor = 'bg-[#10B981]';
  let Icon = ShieldCheck;

  if (level === 'Moderate') {
    badgeColor = 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
    dotColor = 'bg-[#F59E0B]';
    Icon = AlertTriangle;
  } else if (level === 'Low') {
    badgeColor = 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
    dotColor = 'bg-[#EF4444]';
    Icon = ShieldAlert;
  }

  return (
    <div className="dashboard-card p-5 flex flex-col justify-between h-full">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#232D3F]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
          <h3 className="font-semibold text-sm text-[#F8FAFC] tracking-wide">
            Data Reliability
          </h3>
        </div>

        {/* Tier Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold uppercase ${badgeColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} subtle-pulse`} />
          <Icon className="w-3.5 h-3.5" />
          <span>{level}</span>
        </div>
      </div>

      {/* Main Metric Value: 24-32px bold */}
      <div className="my-2 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">{score}</span>
          <span className="text-xs text-[#94A3B8]">/100 score</span>
        </div>
        <span className="text-xs font-mono text-[#64748B]">
          {details.baseline_years ?? 26}y baseline &bull; {details.n_sensors_current ?? 3} sats
        </span>
      </div>

      {/* Clickable Inspection Link */}
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-between w-full text-xs font-mono text-[#3B82F6] hover:text-white pt-2 border-t border-[#232D3F] transition-colors cursor-pointer"
      >
        <span>Inspect Verification Scorecard</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
