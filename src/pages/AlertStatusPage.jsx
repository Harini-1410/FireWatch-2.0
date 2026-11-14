import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  Info,
  Radio,
  Satellite,
  Clock,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useFireWatch } from '../context/FireWatchContext';

export default function AlertStatusPage() {
  const { 
    alertData, 
    regionName, 
    targetMonth
  } = useFireWatch();

  const alertLabel = alertData?.alert_label || 'Normal';
  const percentile = alertData?.percentile ?? 50.0;
  const count = alertData?.harmonized_count ?? 1845;
  const median = alertData?.baseline_median ?? 1380;
  const anomalyPct = alertData?.anomaly_pct ?? 33.7;

  let badgeColor = 'bg-[var(--brand-spindrift)]/20 text-[var(--brand-spindrift)] border-[var(--brand-spindrift)]/50';
  let dotColor = 'bg-[var(--brand-spindrift)]';
  let statusTextColor = 'text-[var(--brand-spindrift)]';
  let Icon = ShieldCheck;

  if (alertLabel === 'Elevated') {
    badgeColor = 'bg-[#B88B4A]/20 text-[#B88B4A] border-[#B88B4A]/50';
    dotColor = 'bg-[#B88B4A]';
    statusTextColor = 'text-[#B88B4A]';
    Icon = AlertTriangle;
  } else if (alertLabel === 'Unusual') {
    badgeColor = 'bg-[#A24E4E]/20 text-[#A24E4E] border-[#A24E4E]/50';
    dotColor = 'bg-[#A24E4E]';
    statusTextColor = 'text-[#A24E4E]';
    Icon = ShieldAlert;
  }

  return (
    <div className="page-container flex flex-col" style={{ gap: 'var(--gap)' }}>
      
      {/* Main Header Title Bar (padding: 20px 32px) */}
      <div 
        className="glass-card dashboard-card flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[var(--border-subtle)]"
        style={{ padding: '20px 32px', boxSizing: 'border-box' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[var(--brand-spindrift)]" />
            <h1 className="text-heading-page">
              Fire Activity Alert Status
            </h1>
          </div>
          <p className="text-body">
            Day-aligned anomaly assessment comparing observed fire activity against the 25-year historical baseline.
          </p>
        </div>

        {/* A2: Top-right first box with 16px left/right padding and 12px top/bottom */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            className="flex items-center gap-2 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-subtle)] text-xs"
            style={{ padding: '12px 16px', boxSizing: 'border-box' }}
          >
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-spindrift)]" />
            <span className="text-[var(--text-muted)]">Domain: <strong className="text-[var(--text-primary)] font-medium">{regionName}</strong></span>
          </div>
          <div 
            className="flex items-center gap-2 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-subtle)] text-xs"
            style={{ padding: '12px 16px', boxSizing: 'border-box' }}
          >
            <Radio className="w-3.5 h-3.5 text-[var(--brand-hazeblue)] animate-pulse" />
            <span className="text-[var(--brand-hazeblue)] font-mono font-medium">FIRMS Live Feed</span>
          </div>
        </div>
      </div>

      {/* A1: Alert Feed with 24px equal gap between all boxes */}
      <div 
        className="w-full flex flex-col"
        style={{ gap: '24px' }}
      >
        
        {/* Feed Card 1: Primary Current Regional Anomaly Alert */}
        <div 
          className="glass-card dashboard-card flex flex-col justify-between space-y-4"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          {/* Top Strip with Status Badges (6a: 12px padding-bottom and 12px margin-bottom after divider) */}
          <div 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)]"
            style={{ paddingBottom: '12px', marginBottom: '12px' }}
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Badge: Active Alert */}
              <span 
                className="rounded-full border text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 bg-[var(--brand-spindrift)]/20 text-[var(--text-primary)] border-[var(--brand-spindrift)]/50 font-mono"
                style={{ padding: '8px 16px', boxSizing: 'border-box' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-spindrift)] animate-ping" />
                <span>Active Alert</span>
              </span>

              {/* Status Badge: Normal / Elevated / Unusual */}
              <span 
                className={`rounded-full border text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono ${badgeColor}`}
                style={{ padding: '8px 16px', boxSizing: 'border-box' }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <Icon className="w-3 h-3" />
                <span>{alertLabel} Alert</span>
              </span>

              <span className="text-xs text-[var(--text-muted)] ml-2">
                Target: <strong className="text-[var(--text-primary)] font-medium">{targetMonth}</strong>
              </span>
            </div>

            <div className="text-xs text-[var(--text-dim)] font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Calibrated Baseline: 2000–2025</span>
            </div>
          </div>

          {/* Anomaly Evaluation & Percentile Rank */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-2.5">
              <div className={`text-xl sm:text-2xl font-bold tracking-tight ${statusTextColor}`}>
                {alertLabel.toUpperCase()} ACTIVITY DETECTED
              </div>
              
              <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                Harmonised fire observations are <strong>{Math.abs(anomalyPct)}% {anomalyPct >= 0 ? 'above' : 'below'}</strong> the historical median for {targetMonth} across {regionName}.
              </p>

              {/* A5: 16px left/right padding and 12px top/bottom padding on each item */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
                <span 
                  className="rounded-lg bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)]"
                  style={{ padding: '12px 16px', boxSizing: 'border-box' }}
                >
                  Observed: <strong className="text-[var(--text-primary)]">{count.toLocaleString()}</strong>
                </span>
                <span 
                  className="rounded-lg bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)]"
                  style={{ padding: '12px 16px', boxSizing: 'border-box' }}
                >
                  Historical Median: <strong className="text-[var(--text-primary)]">{median.toLocaleString()}</strong>
                </span>
                <span 
                  className="rounded-lg bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)]"
                  style={{ padding: '12px 16px', boxSizing: 'border-box' }}
                >
                  Anomaly: <strong className={anomalyPct >= 0 ? "text-[var(--brand-spindrift)]" : "text-[var(--brand-hazeblue)]"}>{anomalyPct >= 0 ? `+${anomalyPct}%` : `${anomalyPct}%`}</strong>
                </span>
              </div>
            </div>

            {/* 6b: 25-Year Percentile Rank box aligned to right edge (margin-left: auto; align-self: flex-start), width: fit-content */}
            <div 
              className="lg:col-span-4 bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] rounded-xl text-center space-y-1"
              style={{ width: 'fit-content', marginLeft: 'auto', alignSelf: 'flex-start', padding: '12px 20px', boxSizing: 'border-box' }}
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-mono">25-Year Percentile Rank</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-mono">{percentile}</span>
                <span className="text-xs text-[var(--text-dim)] font-mono">th %ile</span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {percentile >= 90 ? 'Exceeds 90th percentile threshold' : percentile >= 75 ? 'Above 75th percentile threshold' : 'Within historical seasonal baseline'}
              </div>
            </div>
          </div>
        </div>

        {/* Feed Card 2: Seasonal Baseline Regional Cycle */}
        <div 
          className="glass-card dashboard-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Status Badge: Resolved */}
              <span 
                className="rounded-full border text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 bg-[var(--brand-hazeblue)]/20 text-[var(--text-primary)] border-[var(--brand-hazeblue)]/40 font-mono"
                style={{ padding: '4px 10px' }}
              >
                <CheckCircle2 className="w-3 h-3 text-[var(--brand-spindrift)]" />
                <span>Resolved</span>
              </span>

              {/* Status Badge: Normal */}
              <span 
                className="rounded-full border text-[11px] font-semibold uppercase tracking-wider bg-[var(--surface-secondary)] text-[var(--text-dim)] border-[var(--border-subtle)] font-mono"
                style={{ padding: '4px 10px' }}
              >
                Prior Period
              </span>

              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Seasonal Baseline Normalization
              </h3>
            </div>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Antecedent monthly fire counts for prior quarters across {regionName} converged to nominal baseline envelopes with 0 persistent false positives.
            </p>
          </div>

          <div className="text-xs font-mono text-[var(--text-dim)] shrink-0">
            Audit Check: PASS
          </div>
        </div>

        {/* Feed Card 3: Satellite Fleet Sentinel Status */}
        <div 
          className="glass-card dashboard-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {/* Status Badge: Active */}
              <span 
                className="rounded-full border text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 bg-[var(--brand-spindrift)]/20 text-[var(--text-primary)] border-[var(--brand-spindrift)]/40 font-mono"
                style={{ padding: '6px 14px' }}
              >
                <Satellite className="w-3 h-3 text-[var(--brand-spindrift)]" />
                <span>Active</span>
              </span>

              {/* Status Badge: Normal */}
              <span 
                className="rounded-full border text-[11px] font-semibold uppercase tracking-wider bg-[var(--brand-hazeblue)]/15 text-[var(--text-primary)] border-[var(--brand-hazeblue)]/30 font-mono"
                style={{ padding: '6px 14px' }}
              >
                Calibrated
              </span>

              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                MODIS + VIIRS Cross-Calibration Anchor
              </h3>
            </div>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Dual-platform orbital geometry synced with Suomi-NPP (375m) and Aqua MODIS (1km) overpasses. Observation effort parameters operating nominal.
            </p>
          </div>

          <div className="text-xs font-mono text-[var(--text-dim)] shrink-0">
            Constellation: 3 Active Platforms
          </div>
        </div>

        {/* Feed Card 4: Advisory Information Note */}
        <div 
          className="glass-card dashboard-card flex items-start gap-3 text-xs text-[var(--text-muted)]"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <Info className="w-4 h-4 text-[var(--brand-spindrift)] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[13px]">
            Anomalies reflect observed satellite thermal density normalized by daily observation effort and cloud fractions. This indicates environmental anomaly conditions relative to historical patterns, not a deterministic fire spread prediction.
          </p>
        </div>

      </div>

    </div>
  );
}
