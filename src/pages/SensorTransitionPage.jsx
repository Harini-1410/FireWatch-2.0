import React from 'react';
import { 
  PowerOff, 
  MapPin,
  RotateCcw,
  TrendingUp,
  Satellite,
  Layers,
  Activity
} from 'lucide-react';
import SensorTransitionChart from '../components/SensorTransitionChart';
import { useFireWatch } from '../context/FireWatchContext';

export default function SensorTransitionPage() {
  const {
    transitionData,
    isLoading,
    excludeTerra,
    toggleTerra,
    regionName
  } = useFireWatch();

  return (
    <div className="page-container flex flex-col" style={{ gap: 'var(--gap)' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-heading-page">
            Interactive Sensors Dashboard
          </h1>
          <p 
            className="text-body"
            style={{ padding: '4px 0px' }}
          >
            Tracking multi-sensor observations across 2000–2026. Resolving the 2012 step change via negative-binomial observation effort modeling.
          </p>
        </div>

        {/* Switch off Terra simulation button - Unified button design */}
        <button
          type="button"
          onClick={toggleTerra}
          className={`btn-secondary flex items-center gap-2 text-[13px] ${
            excludeTerra
              ? 'border-[var(--brand-spindrift)] text-[var(--brand-spindrift)] bg-[var(--brand-spindrift)]/15 font-semibold'
              : ''
          }`}
          title="Simulate decommissioned Terra satellite to evaluate model continuity"
        >
          <PowerOff className="w-4 h-4" />
          <span>{excludeTerra ? 'Terra Excluded (Simulated)' : 'Switch off Terra'}</span>
        </button>
      </div>

      {/* Terra Simulation Advisory if Active */}
      {excludeTerra && (
        <div className="p-4 rounded-xl glass-card border border-[var(--brand-spindrift)]/40 text-xs text-[var(--text-primary)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[var(--brand-spindrift)]" />
            <strong className="text-[13px]">Simulation Active:</strong>
            <span className="text-[var(--text-muted)]">Terra MODIS observations excluded. Model dynamically increases weight on Aqua and NOAA-20 VIIRS observations.</span>
          </div>
          <button
            type="button"
            onClick={toggleTerra}
            className="underline hover:text-[var(--brand-spindrift)] font-medium ml-4 shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Terra</span>
          </button>
        </div>
      )}

      {/* Main Graph Display Card (padding: 24px; box-sizing: border-box) */}
      <div 
        className="glass-card dashboard-card space-y-4"
        style={{ padding: '24px', boxSizing: 'border-box' }}
      >
        {/* Card Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5">
          <div>
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Multi-Sensor Fleet Observations
            </h2>
            <div 
              className="text-xs text-[var(--text-muted)]"
              style={{ padding: '4px 0px' }}
            >
              Active Domain: <strong className="text-[var(--text-primary)]">{regionName}</strong> &bull; Overlap Window: 2012–2026
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <span className="w-3.5 h-0.5 bg-[var(--text-muted)] rounded" />
              <span>MODIS (1km)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <span className="w-3.5 h-0.5 bg-[var(--text-secondary)] rounded" />
              <span>VIIRS (375m)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--brand-highlight)]">
              <span className="w-3.5 h-0.5 bg-[var(--brand-highlight)] rounded" />
              <span>Harmonised LFAI</span>
            </span>
          </div>
        </div>

        {/* Graph Visualisation Canvas (padding: 12px) */}
        <div 
          className="h-[460px] sm:h-[480px] w-full"
          style={{ padding: '12px', boxSizing: 'border-box' }}
        >
          <SensorTransitionChart
            transitionData={transitionData}
            isLoading={isLoading}
            excludeTerra={excludeTerra}
          />
        </div>
      </div>

      {/* 7: Equal 24px vertical gap from chart box and 24px horizontal gap between small boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--gap)' }}>
        
        {/* S3: 20px padding on all sides. S2: title and ONE short line */}
        <div 
          className="glass-card dashboard-card flex flex-col justify-center space-y-2"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2 text-[var(--brand-highlight)] text-xs font-mono">
            <Satellite className="w-4 h-4 shrink-0" />
            <span className="uppercase tracking-wider font-semibold">Sensor 01 &bull; MODIS</span>
          </div>
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
            Terra &amp; Aqua Cross-Calibration
          </h3>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            25-year continuity anchor establishing historical monthly baseline fire distributions.
          </p>
        </div>

        {/* S3: 20px padding on all sides. S2: title and ONE short line */}
        <div 
          className="glass-card dashboard-card flex flex-col justify-center space-y-2"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs font-mono">
            <Activity className="w-4 h-4 shrink-0" />
            <span className="uppercase tracking-wider font-semibold">Sensor 02 &bull; VIIRS</span>
          </div>
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
            Suomi-NPP &amp; NOAA-20/21
          </h3>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            High-resolution thermal imaging detecting low-intensity burning and smaller perimeters.
          </p>
        </div>

        {/* S3: 20px padding on all sides. S2: title and ONE short line */}
        <div 
          className="glass-card dashboard-card flex flex-col justify-center space-y-2"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2 text-[var(--brand-highlight)] text-xs font-mono">
            <Layers className="w-4 h-4 shrink-0" />
            <span className="uppercase tracking-wider font-semibold">Harmonised LFAI</span>
          </div>
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
            Observation Effort Model
          </h3>
          <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
            Normalizes orbital fleet changes delivering unbroken monthly fire indices.
          </p>
        </div>

      </div>

    </div>
  );
}
