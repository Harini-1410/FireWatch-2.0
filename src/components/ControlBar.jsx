import React from 'react';
import { 
  Calendar, 
  Play, 
  RotateCw, 
  Clock, 
  SlidersHorizontal,
  Flame,
  Radio,
  Sparkles
} from 'lucide-react';

export default function ControlBar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onLoadData,
  isLoading,
  isMockMode,
  backendAlive,
  isComparableMode,
  setIsComparableMode
}) {
  // Preset handlers
  const handlePreset = (years) => {
    const end = '2026-11';
    if (years === 'all') {
      setStartDate('2000-01');
      setEndDate(end);
    } else {
      const targetYear = 2026 - years;
      setStartDate(`${targetYear}-01`);
      setEndDate(end);
    }
  };

  const handleStartChange = (e) => {
    const val = e.target.value;
    if (val <= endDate) {
      setStartDate(val);
    }
  };

  const handleEndChange = (e) => {
    const val = e.target.value;
    if (val >= startDate) {
      setEndDate(val);
    }
  };

  return (
    <div className="card p-4 bg-[#111827] border-[#1e293b] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Date Range Selection */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-semibold">
            Temporal Window
          </span>
        </div>

        {/* Start / End Month-Year Pickers */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#172138] px-2.5 py-1.5 rounded-lg border border-[#2e3c54]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">From:</span>
            <input
              type="month"
              min="2000-01"
              max="2026-11"
              value={startDate}
              onChange={handleStartChange}
              className="bg-transparent text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-orange-500 rounded px-1"
            />
          </div>

          <span className="text-slate-500 font-mono">—</span>

          <div className="flex items-center gap-1.5 bg-[#172138] px-2.5 py-1.5 rounded-lg border border-[#2e3c54]">
            <span className="text-[11px] font-mono text-slate-400 uppercase">To:</span>
            <input
              type="month"
              min="2000-01"
              max="2026-11"
              value={endDate}
              onChange={handleEndChange}
              className="bg-transparent text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-orange-500 rounded px-1"
            />
          </div>
        </div>

        {/* Quick Range Chips */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => handlePreset(1)}
            className="px-2 py-1 rounded bg-[#172138] hover:bg-[#202d4b] border border-[#2e3c54] text-slate-300 hover:text-white transition-colors"
          >
            1Y
          </button>
          <button
            type="button"
            onClick={() => handlePreset(5)}
            className="px-2 py-1 rounded bg-[#172138] hover:bg-[#202d4b] border border-[#2e3c54] text-slate-300 hover:text-white transition-colors"
          >
            5Y
          </button>
          <button
            type="button"
            onClick={() => handlePreset(10)}
            className="px-2 py-1 rounded bg-[#172138] hover:bg-[#202d4b] border border-[#2e3c54] text-slate-300 hover:text-white transition-colors"
          >
            10Y
          </button>
          <button
            type="button"
            onClick={() => handlePreset('all')}
            className="px-2 py-1 rounded bg-[#172138] hover:bg-[#202d4b] border border-[#2e3c54] text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            All History (2000-2026)
          </button>
        </div>
      </div>

      {/* Right Controls: Harmonization Mode Toggle & Load Data Button */}
      <div className="flex items-center gap-3">
        
        {/* Comparable vs Complete Mode Toggle */}
        <div 
          className="flex items-center bg-[#172138] p-1 rounded-lg border border-[#2e3c54] text-xs font-mono cursor-pointer"
          title="Comparable mode thins VIIRS detections to MODIS-equivalent resolution for long-term consistency. Complete mode uses full 375m VIIRS resolution."
        >
          <button
            type="button"
            onClick={() => setIsComparableMode(true)}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              isComparableMode ? 'bg-orange-500/30 text-orange-300 font-semibold border border-orange-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Comparable
          </button>
          <button
            type="button"
            onClick={() => setIsComparableMode(false)}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              !isComparableMode ? 'bg-teal-500/30 text-teal-300 font-semibold border border-teal-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Complete
          </button>
        </div>

        {/* Load Data Button */}
        <button
          type="button"
          onClick={onLoadData}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-950/40 hover:shadow-orange-900/60 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-orange-400/40"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin text-white" />
              <span>Fetching Harmonized LFAI...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Load Data</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
