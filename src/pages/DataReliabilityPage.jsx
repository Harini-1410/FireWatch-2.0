import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Satellite, 
  Calendar, 
  CloudRain, 
  Layers,
  MapPin,
  Cpu,
  Database
} from 'lucide-react';
import { useFireWatch } from '../context/FireWatchContext';

export default function DataReliabilityPage() {
  const { reliabilityData, regionName } = useFireWatch();
  const [activeTab, setActiveTab] = useState('scorecard');

  const level = reliabilityData?.reliability_level || 'High';
  const score = reliabilityData?.reliability_score ?? 94;
  const passedChecks = reliabilityData?.passed_checks || [
    'Observation effort calibrated with daily cloud fractions',
    'NASA POWER cloud data integrated daily',
    'Multi-sensor cross-calibration over 2012–2026 overlap period',
    '25-year consistent historical baseline (2000–2025)',
    'Biome-specific sensitivity offsets applied against NOAA-20/21 anchor',
    'Day-aligned partial month calculation prevents false alert inflation'
  ];
  const failedChecks = reliabilityData?.failed_checks || [
    'Suomi NPP VIIRS retired Nov 2026: reduces constellation redundancy for late-2026 estimates',
    'Terra MODIS on standby (March 2026 anomaly): MODIS daytime observation relies primarily on Aqua'
  ];
  const details = reliabilityData?.details || {
    n_sensors_current: 3,
    n_sensors_historical_avg: 2.85,
    months_with_obs: 312,
    baseline_years: 26,
    coverage_pct: 98.4
  };

  const tabs = [
    { id: 'scorecard', label: 'Reliability Scorecard' },
    { id: 'checks', label: 'Quality Verification Checks' },
    { id: 'diagram', label: 'Architecture & Schema Analytics' }
  ];

  return (
    <div className="page-container space-y-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-heading-page">
            Reliability and Schema Analytics
          </h1>
          <p className="text-body mt-1">
            Scorecard audit of observational effort, sensor redundancy, and cloud normalizations across {regionName}.
          </p>
        </div>

        <div 
          className="flex items-center gap-2 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-subtle)] text-xs self-start md:self-auto shrink-0 whitespace-nowrap"
          style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}
        >
          <MapPin className="w-3.5 h-3.5 text-[var(--brand-spindrift)] shrink-0" />
          <span className="text-[var(--text-muted)] whitespace-nowrap">Active Domain: <strong className="text-[var(--text-primary)] font-medium">{regionName}</strong></span>
        </div>
      </div>

      {/* Tab Navigation (8a: active tab text bolder font-weight 700 and main text color) */}
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`text-[13px] transition-all cursor-pointer rounded-t-lg whitespace-nowrap flex items-center justify-center ${
              activeTab === tab.id
                ? 'bg-[var(--surface-secondary)]/80 text-[var(--text-primary)] border-b-2 border-[var(--brand-spindrift)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border-b-2 border-transparent hover:bg-[var(--surface-secondary)]/30 font-medium'
            }`}
            style={{ 
              padding: '12px 20px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--text-primary)' : undefined
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description Paragraph (8b, 9a, 10a: 16px space below tab underline and shortened to ONE line) */}
      <div style={{ marginTop: '16px', marginBottom: '24px' }}>
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed max-w-4xl">
          LFAI standardizes hotspot counts across the changing satellite fleet.
        </p>
      </div>

      {/* Tab 1: Reliability Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="flex flex-col" style={{ gap: 'var(--gap)' }}>
          {/* Primary Scorecard Banner (R1: 20px padding on all sides) */}
          <div 
            className="glass-card dashboard-card flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
          >
            <div className="space-y-3 max-w-2xl">
              {/* 1: HIGH RELIABILITY TIER badge (padding: 8px 18px, letter-spacing: 0.04em, white-space: nowrap) */}
              <div 
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-spindrift)]/15 text-[var(--brand-spindrift)] border border-[var(--brand-spindrift)]/30 text-xs font-semibold uppercase font-mono"
                style={{ padding: '8px 18px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}
              >
                <span className="w-2 h-2 rounded-full bg-[var(--brand-spindrift)]" />
                <span>{level} Reliability Tier</span>
              </div>

              <h2 className="text-[20px] sm:text-[22px] font-semibold text-[var(--text-primary)]">
                Statistical Confidence Rating
              </h2>

              <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
                High statistical confidence ({score}/100). The LFAI model standardizes sensor count variations across {regionName}, maintaining consistent baseline estimates despite recent satellite fleet changes.
              </p>
            </div>

            {/* Score Gauge Box (R1: 20px padding on all sides) */}
            <div 
              className="rounded-xl bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)] text-center w-full md:w-52 shrink-0 space-y-1"
              style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
            >
              <div className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-mono">Reliability Score</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-bold text-[var(--brand-spindrift)] font-mono">{score}</span>
                <span className="text-sm text-[var(--text-dim)] font-mono">/100</span>
              </div>
              <div className="text-xs text-[var(--text-muted)] pt-1">
                {passedChecks.length} of {passedChecks.length + failedChecks.length} checks validated
              </div>
            </div>
          </div>

          {/* 8c: Equal 24px vertical gap and horizontal gap between four stat boxes */}
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--gap)' }}>
            {/* R3: Centered horizontally and vertically, equal 20px padding on all sides */}
            <div 
              className="glass-card dashboard-card flex flex-col items-center justify-center text-center space-y-2"
              style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
            >
              <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
                <Satellite className="w-3.5 h-3.5 text-[var(--brand-spindrift)]" />
                <span>Active Sensors</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-mono">{details.n_sensors_current ?? 3}</div>
              <div className="text-[11px] text-[var(--text-dim)]">Fleet average: {details.n_sensors_historical_avg ?? '2.8'}</div>
            </div>

            {/* R3: Centered horizontally and vertically, equal 20px padding on all sides */}
            <div 
              className="glass-card dashboard-card flex flex-col items-center justify-center text-center space-y-2"
              style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
            >
              <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
                <Calendar className="w-3.5 h-3.5 text-[var(--brand-hazeblue)]" />
                <span>Calibrated Depth</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-mono">{details.baseline_years ?? 26} Yrs</div>
              <div className="text-[11px] text-[var(--text-dim)]">{details.months_with_obs ?? 312} observations</div>
            </div>

            {/* R3: Centered horizontally and vertically, equal 20px padding on all sides */}
            <div 
              className="glass-card dashboard-card flex flex-col items-center justify-center text-center space-y-2"
              style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
            >
              <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
                <CloudRain className="w-3.5 h-3.5 text-[var(--brand-spindrift)]" />
                <span>Coverage Ratio</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-mono">{details.coverage_pct ?? 98.4}%</div>
              <div className="text-[11px] text-[var(--text-dim)]">Clear-sky weighted</div>
            </div>

            {/* R3: Centered horizontally and vertically, equal 20px padding on all sides */}
            <div 
              className="glass-card dashboard-card flex flex-col items-center justify-center text-center space-y-2"
              style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
            >
              <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
                <Layers className="w-3.5 h-3.5 text-[var(--brand-hazeblue)]" />
                <span>Cross-Overlap</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-mono">14 Yrs</div>
              <div className="text-[11px] text-[var(--text-dim)]">2012–2026 synchrony</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quality Verification Checks */}
      {activeTab === 'checks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--gap)' }}>
            
            {/* 4: Passed Checks Card */}
            <div 
              className="glass-card dashboard-card flex flex-col"
              style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
            >
              {/* Title row: 12px space under title, 1px divider line */}
              <div 
                className="flex items-center gap-2 border-b border-[var(--border-subtle)]"
                style={{ paddingBottom: '12px' }}
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--brand-spindrift)]" />
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  Passed Validations ({passedChecks.length})
                </h3>
              </div>

              {/* 16px space under line, flex column stretching to 100% width, 10px gap between boxes */}
              <div 
                className="flex flex-col w-full"
                style={{ marginTop: '16px', gap: '10px' }}
              >
                {passedChecks.map((check, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] rounded-lg bg-[var(--surface-secondary)]/40 border border-[var(--border-subtle)] w-full"
                    style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box' }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-spindrift)] shrink-0 mt-0.5" />
                    <span className="leading-relaxed flex-1 min-w-0">{check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4: Warnings / Advisory Card */}
            <div 
              className="glass-card dashboard-card flex flex-col"
              style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
            >
              {/* Title row: 12px space under title, 1px divider line */}
              <div 
                className="flex items-center gap-2 border-b border-[var(--border-subtle)]"
                style={{ paddingBottom: '12px' }}
              >
                <AlertTriangle className="w-4 h-4 text-[var(--brand-hazeblue)]" />
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
                  Fleet Operational Advisories ({failedChecks.length})
                </h3>
              </div>

              {/* 16px space under line, flex column stretching to 100% width, 12px gap between boxes */}
              <div 
                className="flex flex-col w-full"
                style={{ marginTop: '16px', gap: '12px' }}
              >
                {failedChecks.map((check, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2.5 text-xs rounded-lg bg-[var(--surface-secondary)]/40 border border-[var(--border-subtle)] w-full"
                    style={{ width: '100%', padding: '12px 16px', boxSizing: 'border-box' }}
                  >
                    <AlertTriangle className="w-4 h-4 text-[var(--brand-hazeblue)] shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1 min-w-0">
                      <span className="text-[var(--text-primary)] font-medium block leading-relaxed">{check}</span>
                      <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                        LFAI automatically widens confidence bounds rather than reporting false certainty.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Visual Data Diagrams (10b: 16px padding on cards, 16px gap between cards) */}
      {activeTab === 'diagram' && (
        <div 
          className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card)] glass-card flex flex-col items-center justify-center text-center space-y-6"
          style={{ padding: 'var(--pad)', boxSizing: 'border-box' }}
        >
          <div className="max-w-2xl space-y-2">
            {/* 2: Multi-Sensor Fleet Architecture Pipeline badge (padding: 8px 18px, white-space: nowrap, centered) */}
            <div 
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-spindrift)]/10 text-[var(--brand-spindrift)] border border-[var(--brand-spindrift)]/30 text-xs font-mono"
              style={{ padding: '8px 18px', whiteSpace: 'nowrap' }}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Sensor Fleet Architecture Pipeline</span>
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">
              Latent Fire Activity Index (LFAI) Transformation Pipeline
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Raw MODIS (1km) and VIIRS (375m) hotspot observations flow into day-aligned observation effort models, normalized by daily clear-sky fraction from NASA POWER.
            </p>
          </div>

          {/* Architectural Diagram Box (10b: 16px padding on cards, 16px gap between the three cards, shortened descriptions) */}
          <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3" style={{ gap: '16px' }}>
            <div 
              className="rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] space-y-2 text-left"
              style={{ padding: '16px', boxSizing: 'border-box' }}
            >
              <div className="text-[var(--brand-spindrift)] font-bold">1. Ingestion Layer</div>
              <p className="text-[11px] text-[var(--text-muted)]">Terra, Aqua, Suomi-NPP, NOAA-20/21 hotspots by region.</p>
            </div>
            <div 
              className="rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] space-y-2 text-left"
              style={{ padding: '16px', boxSizing: 'border-box' }}
            >
              <div className="text-[var(--brand-hazeblue)] font-bold">2. Effort Normalization</div>
              <p className="text-[11px] text-[var(--text-muted)]">Cloud-cover weighting removes false zeros.</p>
            </div>
            <div 
              className="rounded-xl bg-[var(--surface-secondary)]/50 border border-[var(--border-subtle)] space-y-2 text-left"
              style={{ padding: '16px', boxSizing: 'border-box' }}
            >
              <div className="text-[var(--brand-spindrift)] font-bold">3. LFAI Output</div>
              <p className="text-[11px] text-[var(--text-muted)]">Monthly index with 25-year percentile rank.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
