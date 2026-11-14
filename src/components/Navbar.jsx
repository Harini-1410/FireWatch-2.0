import React, { useState } from 'react';
import { 
  Flame, 
  Share2, 
  Check, 
  Download, 
  Play,
  RotateCw,
  FileText,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { PRESET_REGIONS } from '../services/mockData';

export default function Navbar({
  selectedRegionId,
  onSelectRegion,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onLoadData,
  isLoading,
  isMockMode,
  setIsMockMode,
  backendAlive,
  onExportCSV,
  isExporting,
  onOpenBrief
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy share link', err);
    }
  };

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

  return (
    <header className="h-16 bg-[#0B0E14] border-b border-[#232D3F] sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4 text-xs">
      
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#141B26] border border-[#232D3F] flex items-center justify-center shadow-sm">
          <Flame className="w-4 h-4 text-[#F97316]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 leading-none">
            <span className="font-bold text-sm tracking-wide text-[#F8FAFC] font-mono">
              FIREWATCH <span className="text-[#F97316]">2.0</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 hidden md:inline">
              NASA SPACE APPS 2026
            </span>
          </div>
          <span className="text-[11px] text-[#94A3B8] mt-0.5">
            Satellite Fire Intelligence &bull; Command Platform
          </span>
        </div>
      </div>

      {/* Center Controls: Region + Date Range + Load Data */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center">
        
        {/* Preset Region Dropdown */}
        <div className="relative flex items-center bg-[#141B26] border border-[#232D3F] rounded-lg px-2.5 py-1.5 transition-colors hover:border-[#3B82F6]/50">
          <span className="text-[11px] font-mono text-[#64748B] mr-1.5 hidden sm:inline">Region:</span>
          <select
            value={selectedRegionId}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="bg-transparent text-[#F8FAFC] font-medium text-xs focus:outline-none cursor-pointer pr-3"
          >
            {PRESET_REGIONS.map((preset) => (
              <option key={preset.id} value={preset.id} className="bg-[#141B26] text-[#F8FAFC]">
                {preset.name}
              </option>
            ))}
            {selectedRegionId === 'custom' && (
              <option value="custom" className="bg-[#141B26] text-[#F8FAFC]">Custom Bounding Box</option>
            )}
          </select>
        </div>

        {/* Date Range Inputs */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#141B26] border border-[#232D3F] rounded-lg px-2.5 py-1 transition-colors hover:border-[#3B82F6]/50">
          <Calendar className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
          <input
            type="month"
            min="2000-01"
            max="2026-11"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent text-[11px] font-mono text-[#F8FAFC] focus:outline-none w-[82px]"
            title="Start Month"
          />
          <span className="text-[#64748B] text-[10px]">—</span>
          <input
            type="month"
            min="2000-01"
            max="2026-11"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent text-[11px] font-mono text-[#F8FAFC] focus:outline-none w-[82px]"
            title="End Month"
          />

          {/* Quick presets */}
          <div className="flex items-center gap-1 pl-1.5 border-l border-[#232D3F] text-[11px] font-mono text-[#94A3B8]">
            <button
              type="button"
              onClick={() => handleQuickPreset(5)}
              className="px-1.5 py-0.5 rounded hover:bg-[#182231] hover:text-white transition-colors"
              title="Last 5 Years"
            >
              5Y
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('all')}
              className="px-1.5 py-0.5 rounded hover:bg-[#182231] text-[#F97316] hover:text-[#F97316] font-semibold transition-colors"
              title="All 25 Years (2000-2026)"
            >
              All
            </button>
          </div>
        </div>

        {/* Load Data Button */}
        <button
          type="button"
          onClick={onLoadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono text-xs font-semibold tracking-wide transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          title="Query harmonized LFAI dataset across bounding box"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Querying...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load Data</span>
            </>
          )}
        </button>

      </div>

      {/* Right Controls: Data Mode + Actions */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Live / Demo Mode Toggle */}
        <div className="flex items-center bg-[#141B26] border border-[#232D3F] rounded-lg p-0.5 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setIsMockMode(false)}
            title={backendAlive ? "Connected to FastAPI on 127.0.0.1:8000" : "FastAPI backend currently unreachable"}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              !isMockMode
                ? backendAlive 
                  ? 'bg-[#10B981]/20 text-[#10B981] font-semibold'
                  : 'bg-[#EF4444]/20 text-[#EF4444] font-semibold'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${backendAlive ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
            <span>LIVE</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMockMode(true)}
            title="Use scientifically calibrated multi-sensor synthetic data"
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              isMockMode
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] font-semibold'
                : 'text-[#64748B] hover:text-[#94A3B8]'
            }`}
          >
            <span>DEMO</span>
          </button>
        </div>

        {/* AI Brief Action */}
        <button
          type="button"
          onClick={onOpenBrief}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#182231] border border-[#232D3F] text-[#94A3B8] hover:text-white transition-colors"
          title="Open Incident Situation Brief"
        >
          <FileText className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span className="hidden xl:inline text-[11px] font-mono">Brief</span>
        </button>

        {/* Share Link Action */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#182231] border border-[#232D3F] text-[#94A3B8] hover:text-white transition-colors"
          title="Copy shareable link with current area and dates"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[#10B981]" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-[#3B82F6]" />
          )}
          <span className="hidden xl:inline text-[11px] font-mono">
            {copied ? 'Copied' : 'Share'}
          </span>
        </button>

        {/* CSV Export Action */}
        <button
          type="button"
          onClick={onExportCSV}
          disabled={isExporting}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141B26] hover:bg-[#182231] border border-[#232D3F] text-[#F97316] hover:text-white transition-colors disabled:opacity-50"
          title="Download harmonized hotspot CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[11px] font-mono">CSV</span>
        </button>

      </div>
    </header>
  );
}
