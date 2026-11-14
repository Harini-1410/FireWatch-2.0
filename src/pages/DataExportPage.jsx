import React, { useState } from 'react';
import { 
  Download, 
  Check, 
  RotateCw, 
  MapPin, 
  Calendar, 
  Copy, 
  Link as LinkIcon, 
  Layers,
  Database,
  Filter,
  FileCode,
  Share2
} from 'lucide-react';
import { useFireWatch } from '../context/FireWatchContext';

export default function DataExportPage() {
  const {
    bbox,
    startDate,
    endDate,
    regionName,
    selectedRegionId,
    activeLayer,
    isExporting,
    triggerExportCSV
  } = useFireWatch();

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [filterThreshold, setFilterThreshold] = useState('all');

  const handleDownload = async () => {
    try {
      await triggerExportCSV();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/map?bbox=${bbox.map(n => Number(n).toFixed(2)).join(',')}&start=${startDate}&end=${endDate}&layer=${activeLayer}&region=${selectedRegionId}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const [minLat, minLon, maxLat, maxLon] = bbox || [-15, -75, 5, -45];

  const columns = [
    { 
      name: 'satellite', 
      type: 'String', 
      units: 'Platform ID', 
      desc: 'Satellite platform (e.g. MODIS-Aqua, VIIRS-NOAA20, VIIRS-SNPP).' 
    },
    { 
      name: 'acquisition_utc', 
      type: 'Timestamp', 
      units: 'ISO 8601 UTC', 
      desc: 'UTC timestamp of satellite orbital thermal detection.' 
    },
    { 
      name: 'latitude', 
      type: 'Float', 
      units: 'Decimal Degrees', 
      desc: 'WGS84 latitude coordinate (-90.0000° to +90.0000°).' 
    },
    { 
      name: 'longitude', 
      type: 'Float', 
      units: 'Decimal Degrees', 
      desc: 'WGS84 longitude coordinate (-180.0000° to +180.0000°).' 
    },
    { 
      name: 'frp', 
      type: 'Float', 
      units: 'Megawatts (MW)', 
      desc: 'Fire Radiative Power measured at pixel nadir.' 
    },
    { 
      name: 'confidence_normalized', 
      type: 'Float', 
      units: '0.00 to 1.00', 
      desc: 'Standardized observation confidence across sensor tiers.' 
    },
    { 
      name: 'included_in_lfai', 
      type: 'Boolean', 
      units: 'Flag (0 / 1)', 
      desc: 'Verification tag indicating inclusion in regional LFAI baseline.' 
    }
  ];

  return (
    <div className="export-page page-container flex flex-col" style={{ gap: 'var(--gap)' }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-heading-page">
            Data Export &amp; Sharing
          </h1>
          <p className="text-body mt-1">
            Export filtered satellite thermal observations as CSV or generate an authenticated reproducible permalink.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--surface-secondary)] px-3.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs self-start md:self-auto shrink-0 text-[var(--text-muted)]">
          <Database className="w-3.5 h-3.5 text-[var(--brand-highlight)]" />
          <span>NASA FIRMS Export Protocol</span>
        </div>
      </div>

      {/* Central Data Control Card (7: Equal 16px gap between all rows inside box and 16px to bottom edge) */}
      <div 
        className="glass-card dashboard-card flex flex-col"
        style={{ height: 'auto', minHeight: 'unset', padding: '20px 20px 16px 20px', gap: '16px', boxSizing: 'border-box' }}
      >
        
        {/* Section Heading Container */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)]"
          style={{ paddingBottom: '12px' }}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--brand-highlight)]" />
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Export Query Configuration
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--text-dim)]">
            Harmonised LFAI &bull; WGS84 Extents
          </span>
        </div>

        {/* Input fields and dropdowns (form-control with padding: 12px 16px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Dropdown 1: File Export Format */}
          <div className="space-y-1">
            <label className="subheading text-xs text-[var(--text-muted)] font-medium block">
              File Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="form-control w-full cursor-pointer font-mono"
            >
              <option value="csv">CSV (Standard Tabular)</option>
              <option value="geojson">GeoJSON (FeatureCollection)</option>
              <option value="parquet">Parquet (Cloud-Optimized)</option>
              <option value="json">JSON (API Response)</option>
            </select>
          </div>

          {/* Dropdown 2: Thermal Observation Filter */}
          <div className="space-y-1">
            <label className="subheading text-xs text-[var(--text-muted)] font-medium block">
              Confidence Filter
            </label>
            <select
              value={filterThreshold}
              onChange={(e) => setFilterThreshold(e.target.value)}
              className="form-control w-full cursor-pointer font-mono"
            >
              <option value="all">All Harmonised Hotspots</option>
              <option value="high">LFAI Verified (Confidence &ge; 80%)</option>
              <option value="frp">Intense Fire (FRP &ge; 50 MW)</option>
            </select>
          </div>

          {/* Input field 1: Start Temporal Interval */}
          <div className="space-y-1">
            <label className="subheading text-xs text-[var(--text-muted)] font-medium block">
              Start Month
            </label>
            <input
              type="text"
              readOnly
              value={startDate}
              className="form-control w-full cursor-default font-mono opacity-90"
            />
          </div>

          {/* Input field 2: End Temporal Interval */}
          <div className="space-y-1">
            <label className="subheading text-xs text-[var(--text-muted)] font-medium block">
              End Month
            </label>
            <input
              type="text"
              readOnly
              value={endDate}
              className="form-control w-full cursor-default font-mono opacity-90"
            />
          </div>

        </div>

        {/* 7: Equal size and height, 16px gap to input row and 16px to bottom edge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            className="rounded-lg bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)] flex items-center justify-between h-14"
            style={{ padding: '16px', boxSizing: 'border-box' }}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[var(--brand-highlight)]" />
              <span className="text-xs text-[var(--text-primary)] font-medium">{regionName}</span>
            </div>
            <span className="text-[11px] text-[var(--text-dim)] font-mono">[{minLat.toFixed(1)}°, {minLon.toFixed(1)}°]</span>
          </div>

          <div 
            className="rounded-lg bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)] flex items-center justify-between h-14"
            style={{ padding: '16px', boxSizing: 'border-box' }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-xs text-[var(--text-primary)] font-medium">{startDate} to {endDate}</span>
            </div>
            <span className="text-[11px] text-[var(--text-dim)] font-mono">Calibrated</span>
          </div>

          <div 
            className="rounded-lg bg-[var(--surface-secondary)]/60 border border-[var(--border-subtle)] flex items-center justify-between h-14"
            style={{ padding: '16px', boxSizing: 'border-box' }}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[var(--brand-highlight)]" />
              <span className="text-xs text-[var(--text-primary)] font-medium uppercase">{activeLayer} Layer</span>
            </div>
            <span className="text-[11px] text-[var(--text-dim)] font-mono">Normalized</span>
          </div>
        </div>

      </div>

      {/* Two Column Actions (11: 24px vertical space between big sections, 24px horizontal space between cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch" style={{ gap: 'var(--gap)' }}>
        
        {/* Action Card 1: CSV Download */}
        <div 
          className="glass-card dashboard-card flex flex-col justify-between space-y-5"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[var(--brand-highlight)]" />
              {/* E3: Sub-line removed, title kept */}
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Download CSV Dataset
              </h2>
            </div>
            <div className="text-[11px] text-[var(--text-dim)] font-mono">
              Format: Standard UTF-8 CSV with NASA attribution comments.
            </div>
          </div>

          {/* Primary Action Button (primary-action with padding: 14px 28px) */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="primary-action btn-primary w-full shadow-sm"
          >
            {isExporting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-[var(--btn-primary-text)]" />
                <span>Preparing CSV Stream...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-[var(--btn-primary-text)]" />
                <span>Download Complete</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[var(--btn-primary-text)]" />
                <span>Download firewatch_harmonized_data.csv</span>
              </>
            )}
          </button>
        </div>

        {/* Action Card 2: Shareable Link */}
        <div 
          className="glass-card dashboard-card flex flex-col justify-between space-y-5"
          style={{ padding: '20px', boxSizing: 'border-box' }}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-[var(--brand-highlight)]" />
              {/* E2: Sub-line removed, title kept */}
              <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Generate Shareable Permalink
              </h2>
            </div>

            {/* Input field with form-control padding */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="form-control w-full select-all truncate font-mono text-xs opacity-90"
              />
            </div>
          </div>

          {/* Primary Action Button (primary-action with padding: 14px 28px) */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="primary-action btn-secondary w-full shadow-sm"
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4 text-[var(--brand-highlight)]" />
                <span className="text-[var(--brand-highlight)]">Permalink Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Shareable Permalink</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Schema Reference Table (E6: balanced column widths, 16px left/right padding on every cell, left-aligned) */}
      <div 
        className="glass-card dashboard-card space-y-4"
        style={{ padding: '20px', boxSizing: 'border-box' }}
      >
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[var(--brand-highlight)]" />
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)]">
              Export Schema Field Specifications
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--text-dim)]">
            7 Output Attributes &bull; WGS84 Standard
          </span>
        </div>

        <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="bg-[var(--surface-secondary)] text-[var(--text-dim)] uppercase font-mono tracking-wider text-[11px] border-b border-[var(--border-subtle)]">
                <th className="font-semibold w-[25%]" style={{ padding: '12px 16px', textAlign: 'left' }}>Field Name</th>
                <th className="font-semibold w-[30%]" style={{ padding: '12px 16px', textAlign: 'left' }}>Data Type &amp; Units</th>
                <th className="font-semibold w-[45%]" style={{ padding: '12px 16px', textAlign: 'left' }}>Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--surface)]/50">
              {columns.map((col) => (
                <tr key={col.name} className="hover:bg-[var(--surface-secondary)]/40 transition-colors">
                  <td className="font-mono font-semibold text-[var(--brand-highlight)] truncate" style={{ padding: '12px 16px', textAlign: 'left' }}>
                    {col.name}
                  </td>
                  <td className="font-mono text-[var(--text-muted)]" style={{ padding: '12px 16px', textAlign: 'left' }}>
                    <span className="text-[var(--text-primary)] font-medium">{col.type}</span> &bull; {col.units}
                  </td>
                  <td className="text-[var(--text-secondary)] leading-relaxed" style={{ padding: '12px 16px', textAlign: 'left' }}>
                    {col.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
