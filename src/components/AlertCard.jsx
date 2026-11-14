import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';

export default function AlertCard({
  alertData,
  isLoading,
  error,
  regionName,
  currentMonth
}) {
  if (isLoading) {
    return (
      <div className="dashboard-card p-5 flex flex-col justify-center h-full min-h-[110px] animate-pulse">
        <div className="h-4 bg-[#182231] rounded w-1/3 mb-3" />
        <div className="h-6 bg-[#182231] rounded w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card p-5 border-[#EF4444]/40 text-[#EF4444] text-xs font-mono h-full flex flex-col justify-center">
        <span className="font-semibold text-[#EF4444]">Alert Telemetry Error</span>
        <span className="text-[11px] text-[#EF4444]/80 mt-1">{error}</span>
      </div>
    );
  }

  const alertLabel = alertData?.alert_label || 'Normal';
  const percentile = alertData?.percentile ?? 50.0;
  const month = alertData?.current_month || currentMonth || '2026-08';
  
  // Clean short explanatory statement
  const shortExplanation = alertData?.explanation 
    ? alertData.explanation.split('.')[0] + '.'
    : `Harmonized fire activity is within expected historical bounds for ${month}.`;

  let badgeColor = 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30';
  let dotColor = 'bg-[#10B981]';
  let Icon = ShieldCheck;

  if (alertLabel === 'Elevated') {
    badgeColor = 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
    dotColor = 'bg-[#F59E0B]';
    Icon = AlertTriangle;
  } else if (alertLabel === 'Unusual') {
    badgeColor = 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
    dotColor = 'bg-[#EF4444]';
    Icon = ShieldAlert;
  }

  return (
    <div className="dashboard-card p-5 flex flex-col justify-between h-full">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#232D3F]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="font-semibold text-sm text-[#F8FAFC] tracking-wide">
            Current Alert Status
          </h3>
          <span className="text-xs font-mono text-[#64748B]">({month})</span>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold uppercase ${badgeColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor} subtle-pulse`} />
          <Icon className="w-3.5 h-3.5" />
          <span>{alertLabel}</span>
        </div>
      </div>

      {/* Main Metric Value: 24-32px bold */}
      <div className="my-2 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC]">{percentile}</span>
          <span className="text-xs text-[#94A3B8]">th %ile rank</span>
        </div>
        <span className="text-xs font-mono text-[#64748B]">vs 25-yr baseline</span>
      </div>

      {/* Plain Language 1-Sentence Explanation */}
      <p className="text-xs text-[#E2E8F0] leading-relaxed line-clamp-2 mt-1">
        {shortExplanation}
      </p>
    </div>
  );
}
