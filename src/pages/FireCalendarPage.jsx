import React from 'react';
import { MapPin, Calendar as CalendarIcon, Satellite, Layers, Activity } from 'lucide-react';
import CalendarHeatmap from '../components/CalendarHeatmap';
import SelectedMonthModal from '../components/SelectedMonthModal';
import { useFireWatch } from '../context/FireWatchContext';

export default function FireCalendarPage() {
  const {
    calendarData,
    isLoading,
    selectedCell,
    setSelectedCell,
    isComparableMode,
    setIsComparableMode,
    regionName,
    setTargetMonth,
    loadDashboardData
  } = useFireWatch();

  return (
    <div className="page-container flex flex-col" style={{ gap: 'var(--gap)' }}>
      
      {/* Page Title & Active Region */}
      <div className="page-header mb-0">
        <div>
          <h1 className="text-heading-page">
            Historical Data and Calendar Heatmap
          </h1>
          <p className="text-body mt-1">
            25-year matrix evaluating monthly fire anomalies against calibrated day-aligned medians.
          </p>
        </div>

        {/* Region Chip (16px padding on all sides) */}
        <div 
          className="flex items-center gap-2 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border-subtle)] text-xs self-start md:self-auto shrink-0"
          style={{ padding: '16px', boxSizing: 'border-box' }}
        >
          <MapPin className="w-3.5 h-3.5 text-[var(--brand-spindrift)] shrink-0" />
          <span className="text-[var(--text-muted)]">Active Region: <strong className="text-[var(--text-primary)] font-medium">{regionName}</strong></span>
        </div>
      </div>

      {/* Top Metric Summary Cards (24px gap between cards and 24px vertical gap to matrix box) */}
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--gap)' }}>
        <div 
          className="glass-card dashboard-card flex flex-col justify-between"
          style={{ padding: '16px 24px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--brand-hazeblue)]" />
            <span>Timeline Baseline</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-1">2000–2026</div>
          <div className="text-[11px] text-[var(--text-dim)]">26-year calibrated depth</div>
        </div>

        <div 
          className="glass-card dashboard-card flex flex-col justify-between"
          style={{ padding: '16px 24px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
            <Satellite className="w-3.5 h-3.5 text-[var(--brand-spindrift)]" />
            <span>Harmonised Sensors</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-1">MODIS + VIIRS</div>
          <div className="text-[11px] text-[var(--text-dim)]">Cross-calibrated overlap</div>
        </div>

        <div 
          className="glass-card dashboard-card flex flex-col justify-between"
          style={{ padding: '16px 24px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
            <Activity className="w-3.5 h-3.5 text-[var(--brand-hazeblue)]" />
            <span>Anomaly Scale</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-1">RdYlGn Diverging</div>
          <div className="text-[11px] text-[var(--text-dim)]">Day-aligned percentile rank</div>
        </div>

        <div 
          className="glass-card dashboard-card flex flex-col justify-between"
          style={{ padding: '16px 24px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-mono">
            <Layers className="w-3.5 h-3.5 text-[var(--brand-spindrift)]" />
            <span>Spatial Mesh</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)] font-mono mt-1">0.25° Grid</div>
          <div className="text-[11px] text-[var(--text-dim)]">Effort-normalized aggregation</div>
        </div>
      </div>

      {/* Calendar Heatmap Container (padding: 24px; box-sizing: border-box) */}
      <div 
        className="glass-card dashboard-card w-full"
        style={{ padding: '24px', boxSizing: 'border-box' }}
      >
        <CalendarHeatmap
          calendarData={calendarData}
          isLoading={isLoading}
          selectedCell={selectedCell}
          setSelectedCell={setSelectedCell}
          isComparableMode={isComparableMode}
          setIsComparableMode={setIsComparableMode}
        />
      </div>

      {/* Under-Grid Legend Boxes (24px vertical gap, 24px horizontal gap, 20px padding, centered) */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--gap)' }}>
        
        <div 
          className="glass-card dashboard-card flex flex-col justify-between items-center text-center space-y-3"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5A7D63] shrink-0" />
              Diverging Anomaly Scale
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mt-2 text-center">
              Green indicates below-normal fire activity; amber and crimson indicate elevated anomalies.
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-dim)] pt-2 border-t border-[var(--border-subtle)] text-center w-full">
            Calibrated against 2000–2025 regional baseline medians
          </div>
        </div>

        <div 
          className="glass-card dashboard-card flex flex-col justify-between items-center text-center space-y-3"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B6375] shrink-0" />
              Value-Suppressing Uncertainty
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mt-2 text-center">
              Muted saturation denotes lower observational redundancy from single-sensor observation eras.
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-dim)] pt-2 border-t border-[var(--border-subtle)] text-center w-full">
            Uncertainty communicated directly on matrix cells
          </div>
        </div>

        <div 
          className="glass-card dashboard-card flex flex-col justify-between items-center text-center space-y-3"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="flex flex-col items-center text-center w-full">
            <h2 className="text-[15px] font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand-spindrift)] shrink-0" />
              Cloud Obscuration Hatching
            </h2>
            <p className="text-[13px] text-[var(--text-muted)] leading-relaxed mt-2 text-center">
              Diagonal hatching indicates heavy cloud cover with under three clear-sky days.
            </p>
          </div>
          <div className="text-[11px] text-[var(--text-dim)] pt-2 border-t border-[var(--border-subtle)] text-center w-full">
            Clear-sky fractions normalized daily
          </div>
        </div>

      </div>

      {/* Month Inspector Modal */}
      <SelectedMonthModal
        selectedCell={selectedCell}
        onClose={() => setSelectedCell(null)}
        onSetAsTargetMonth={(mStr) => {
          setTargetMonth(mStr);
          loadDashboardData();
        }}
      />

    </div>
  );
}
