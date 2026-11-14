import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Map as MapIcon,
  Calendar as CalendarIcon,
  ShieldAlert,
  TrendingUp,
  ShieldCheck,
  Download,
  Calendar, 
  RotateCw, 
  Play
} from 'lucide-react';
import MapSelector from '../components/MapSelector';
import { useFireWatch } from '../context/FireWatchContext';
import { PRESET_REGIONS } from '../services/mockData';

export default function MapExplorerPage() {
  const {
    bbox,
    setBbox,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeLayer,
    setActiveLayer,
    selectedRegionId,
    selectRegion,
    regionName,
    loadDashboardData,
    isLoading
  } = useFireWatch();

  const handleQuickPreset = (years) => {
    const end = '2026-11';
    if (years === 'all') {
      setStartDate('2000-01');
      setEndDate(end);
    } else {
      const startYear = 2026 - years;
      setStartDate(`${startYear}-01`);
      setEndDate(end);
    }
  };

  const isQuickActive = (years) => {
    if (years === 'all' && startDate === '2000-01') return true;
    if (years === 1 && startDate === '2025-01') return true;
    if (years === 5 && startDate === '2021-01') return true;
    return false;
  };

  const [minLat, minLon, maxLat, maxLon] = bbox || [-15, -75, 5, -45];
  const approxCells = Math.round((Math.abs(maxLat - minLat) / 0.25) * (Math.abs(maxLon - minLon) / 0.25));

  const sidebarLinks = [
    { label: 'Map', path: '/map', icon: MapIcon },
    { label: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { label: 'Alerts', path: '/alerts', icon: ShieldAlert },
    { label: 'Sensors', path: '/sensors', icon: TrendingUp },
    { label: 'Reliability', path: '/reliability', icon: ShieldCheck },
    { label: 'Export', path: '/export', icon: Download }
  ];

  return (
    <div className="page-container space-y-6">
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-heading-page">
            Geospatial Map Explorer
          </h1>
          <p className="text-body mt-1">
            Explore active fire detections, customize geographical bounding boxes, and inspect multi-sensor observations.
          </p>
        </div>

        {/* Load Data Button */}
        <button
          type="button"
          onClick={() => loadDashboardData()}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2 shadow-sm min-h-[40px] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-[var(--btn-primary-text)]" />
              <span>Loading Data...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-[var(--btn-primary-text)]" />
              <span>Load Data</span>
            </>
          )}
        </button>
      </div>

      {/* Main 3-Column Responsive Grid: Left Sidebar (~200px) + Main Map (Flexible) + Right Settings (~320px) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Navigation Sidebar (padding: 24px 16px, clean without unwanted profile labels) */}
        <aside 
          className="lg:col-span-2 glass-card dashboard-card hidden xl:flex flex-col justify-between"
          style={{ padding: '24px 16px', boxSizing: 'border-box' }}
        >
          <div className="space-y-4">
            <div className="text-[11px] font-mono text-[var(--text-dim)] uppercase tracking-wider px-2 font-semibold">
              Views
            </div>

            {/* Sidebar Navigation Items (padding: 12px 16px) */}
            <nav className="space-y-1.5">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all w-full cursor-pointer ${
                        isActive
                          ? 'bg-[var(--brand-highlight)]/25 text-[var(--text-primary)] border border-[var(--border-accent)] font-semibold shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] border border-transparent'
                      }`
                    }
                    style={{ padding: '12px 16px' }}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Operational Target Status Chip (Clean: domain only, no Profile: scientist label) */}
          <div className="pt-4 border-t border-[var(--border-subtle)] space-y-1 text-xs">
            <div className="text-[10px] text-[var(--text-dim)] uppercase font-mono">Domain</div>
            <div className="text-[var(--text-primary)] font-semibold truncate">{regionName}</div>
          </div>
        </aside>

        {/* Center / Main Map Viewport (Flexible Column) */}
        <div className="lg:col-span-8 xl:col-span-6 min-h-[580px] lg:h-[650px] flex flex-col">
          <MapSelector
            bbox={bbox}
            setBbox={setBbox}
            selectedRegionId={selectedRegionId}
            setSelectedRegionId={(id) => selectRegion(id)}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
          />
        </div>

        {/* Right Control Settings Panel (M3: 20px padding on all boxes, 16px gap between inner items) */}
        <div 
          className="lg:col-span-4 xl:col-span-4 glass-card dashboard-card flex flex-col justify-between gap-6"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          
          {/* Preset Regions Box (6: 12px space under title, 1px divider, 16px space, fit-content boxes with 12px gap) */}
          <div 
            className="rounded-xl bg-[var(--surface-secondary)]/40 border border-[var(--border-subtle)] flex flex-col"
            style={{ padding: '20px', boxSizing: 'border-box' }}
          >
            {/* 6a: 12px space under title, 1px divider */}
            <div 
              className="flex items-center justify-between border-b border-[var(--border-subtle)]"
              style={{ paddingBottom: '12px' }}
            >
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Preset Regions</h2>
              <span className="text-[11px] text-[var(--text-dim)] font-mono">Biomes</span>
            </div>

            {/* 6a & 6b: 16px space under divider line, column with 12px gap, left-aligned, width: fit-content */}
            <div 
              className="flex flex-col items-start text-xs"
              style={{ marginTop: '16px', gap: '12px' }}
            >
              {PRESET_REGIONS.map((preset) => {
                const isSelected = selectedRegionId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => selectRegion(preset.id)}
                    className={`rounded-lg text-left transition-all border cursor-pointer block ${
                      isSelected
                        ? 'bg-[var(--brand-highlight)]/25 border-[var(--border-accent)] text-[var(--text-primary)] font-semibold shadow-xs'
                        : 'bg-[var(--surface-secondary)]/60 border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-accent)]'
                    }`}
                    style={{ width: 'fit-content', padding: '8px 14px', lineHeight: 'normal', boxSizing: 'border-box' }}
                  >
                    <div className="font-semibold text-[13px] text-[var(--text-primary)]">
                      {preset.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] leading-tight mt-1">
                      {preset.biome}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Section Box (20px padding, 16px gap) */}
          <div 
            className="date-range-section rounded-xl bg-[var(--surface-secondary)]/40 border border-[var(--border-subtle)] space-y-4"
            style={{ padding: '20px', boxSizing: 'border-box' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <h2 className="text-[14px] font-semibold text-[var(--text-primary)]">Date Range</h2>
              <Calendar className="w-4 h-4 text-[var(--brand-highlight)]" />
            </div>

            {/* 2b: 16px space between Date Range heading line and inputs row */}
            <div 
              className="flex flex-col sm:flex-row items-center gap-2 text-xs w-full"
              style={{ marginTop: '16px' }}
            >
              {/* 5: flex: 1; min-width: 0; fontSize: 13px; paddingRight: 32px */}
              <div 
                className="bg-[var(--input-bg)] rounded-lg border border-[var(--input-border)] space-y-1 w-full flex-1 min-w-0"
                style={{ flex: '1 1 0%', minWidth: 0, padding: '10px 8px', boxSizing: 'border-box' }}
              >
                <span className="text-[10px] text-[var(--text-dim)] uppercase font-semibold block px-0.5">Start Month</span>
                <input
                  type="month"
                  min="2000-01"
                  max="2026-11"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[var(--text-primary)] font-medium focus:outline-none w-full"
                  style={{ flex: '1 1 0%', minWidth: 0, fontSize: '13px', paddingLeft: '2px', paddingRight: '32px', height: '30px', boxSizing: 'border-box' }}
                />
              </div>

              {/* 5: flex: 1; min-width: 0; fontSize: 13px; paddingRight: 32px */}
              <div 
                className="bg-[var(--input-bg)] rounded-lg border border-[var(--input-border)] space-y-1 w-full flex-1 min-w-0"
                style={{ flex: '1 1 0%', minWidth: 0, padding: '10px 8px', boxSizing: 'border-box' }}
              >
                <span className="text-[10px] text-[var(--text-dim)] uppercase font-semibold block px-0.5">End Month</span>
                <input
                  type="month"
                  min="2000-01"
                  max="2026-11"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[var(--text-primary)] font-medium focus:outline-none w-full"
                  style={{ flex: '1 1 0%', minWidth: 0, fontSize: '13px', paddingLeft: '2px', paddingRight: '32px', height: '30px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* 2c: Quick Selection row with 16px space above (margin-top: 16px) and 8px padding inside */}
            <div 
              className="flex items-center gap-4 text-xs"
              style={{ marginTop: '16px', padding: '8px', boxSizing: 'border-box' }}
            >
              <span className="text-[var(--text-dim)] text-[11px] font-mono">Quick:</span>
              <div className="toggle-track flex-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleQuickPreset(1)}
                  className={`flex-1 py-1 rounded-full text-center font-medium transition-all text-[11px] cursor-pointer ${
                    isQuickActive(1)
                      ? 'toggle-active shadow-xs'
                      : 'toggle-inactive hover:text-[var(--text-primary)]'
                  }`}
                >
                  1Y
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset(5)}
                  className={`flex-1 py-1 rounded-full text-center font-medium transition-all text-[11px] cursor-pointer ${
                    isQuickActive(5)
                      ? 'toggle-active shadow-xs'
                      : 'toggle-inactive hover:text-[var(--text-primary)]'
                  }`}
                >
                  5Y
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('all')}
                  className={`flex-1 py-1 rounded-full text-center font-medium transition-all text-[11px] cursor-pointer ${
                    isQuickActive('all')
                      ? 'toggle-active shadow-xs'
                      : 'toggle-inactive hover:text-[var(--text-primary)]'
                  }`}
                >
                  25Y
                </button>
              </div>
            </div>
          </div>

          {/* Bounding Coordinates Summary Box (20px padding, 16px gap) */}
          <div 
            className="rounded-xl bg-[var(--surface-secondary)]/40 border border-[var(--border-subtle)] space-y-4 text-xs"
            style={{ padding: '20px', boxSizing: 'border-box' }}
          >
            <div className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider font-mono font-semibold border-b border-[var(--border-subtle)] pb-2">
              Bounding Coordinates
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Coordinates:</span>
                <span className="text-[var(--text-primary)] font-mono text-[11px]">[{minLat.toFixed(1)}°, {minLon.toFixed(1)}° to {maxLat.toFixed(1)}°, {maxLon.toFixed(1)}°]</span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Grid Mesh:</span>
                <span className="text-[var(--text-primary)] font-semibold font-mono text-[11px]">~{approxCells} cells (0.25°)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
