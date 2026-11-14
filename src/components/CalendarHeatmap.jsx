import React, { useState } from 'react';
import { Calendar as CalendarIcon, Info } from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Coordinated RdYlGn diverging fire activity scale:
 * Below baseline = muted sage/green, Normal = Spindrift tint, Elevated/Unusual = amber/crimson
 */
function getCellColor(anomaly, n_sensors = 2) {
  if (anomaly === null || anomaly === undefined || isNaN(anomaly)) {
    return 'var(--surface-secondary)';
  }

  // Single-sensor observations: value-suppressed uncertainty
  if (n_sensors === 1) {
    if (anomaly <= -15) return '#52635B';
    if (anomaly <= 15) return '#7C8276';
    if (anomaly <= 40) return '#827464';
    return '#826060';
  }

  if (anomaly <= -30) {
    return '#3B5944'; // Deep forest
  } else if (anomaly <= -10) {
    return '#5A7D63'; // Soft sage
  } else if (anomaly <= 15) {
    return 'var(--brand-highlight)'; // Adapts between themes (Spindrift in dark, Warm Taupe in light)
  } else if (anomaly <= 40) {
    return '#B88B4A'; // Muted amber
  } else {
    return '#A24E4E'; // Muted crimson
  }
}

export default function CalendarHeatmap({
  calendarData,
  isLoading,
  selectedCell,
  setSelectedCell,
  isComparableMode,
  setIsComparableMode
}) {
  const [hoveredCell, setHoveredCell] = useState(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border-subtle)] border-t-[var(--brand-spindrift)] animate-spin mb-3" />
        <span className="text-xs font-mono text-[var(--text-muted)]">Computing Harmonised Fire Activity Matrix...</span>
      </div>
    );
  }

  if (!calendarData || !calendarData.grid || calendarData.grid.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
        <Info className="w-6 h-6 text-[var(--text-dim)] mb-2" />
        <span className="text-xs font-mono text-[var(--text-muted)]">No historical calendar data loaded</span>
      </div>
    );
  }

  const yearsMap = {};
  calendarData.grid.forEach((item) => {
    if (!yearsMap[item.year]) yearsMap[item.year] = {};
    yearsMap[item.year][item.month] = item;
  });

  const years = Object.keys(yearsMap).map(Number).sort((a, b) => b - a);

  return (
    <div className="flex flex-col w-full space-y-4">
      
      {/* Heatmap Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[var(--brand-spindrift)]" />
          <h2 className="text-[15px] sm:text-[16px] font-semibold text-[var(--text-primary)] tracking-wide">
            Historical Burning Activity Matrix
          </h2>
          <span className="text-xs font-mono text-[var(--text-dim)]">
            (2000–2026)
          </span>
        </div>

        {/* Mode Toggle (10px vertical and 20px horizontal padding, 12px gap between buttons) */}
        <div className="toggle-track text-xs font-mono self-start sm:self-auto flex items-center" style={{ gap: '12px' }}>
          <button
            type="button"
            onClick={() => setIsComparableMode(true)}
            className={`rounded-full transition-all cursor-pointer ${
              isComparableMode ? 'toggle-active shadow-xs' : 'toggle-inactive hover:text-[var(--text-primary)]'
            }`}
            style={{ padding: '10px 20px' }}
            title="Comparable mode: MODIS-consistent observation baseline"
          >
            Comparable
          </button>
          <button
            type="button"
            onClick={() => setIsComparableMode(false)}
            className={`rounded-full transition-all cursor-pointer ${
              !isComparableMode ? 'toggle-active shadow-xs' : 'toggle-inactive hover:text-[var(--text-primary)]'
            }`}
            style={{ padding: '10px 20px' }}
            title="Complete mode: Full multi-sensor resolution"
          >
            Complete
          </button>
        </div>
      </div>

      {/* Heatmap Grid Container: EXACT max-width: 720px, margin-inline: auto */}
      <div className="w-full overflow-x-auto py-1">
        <div 
          className="heatmap-container"
          style={{ width: '100%', maxWidth: '720px', marginInline: 'auto' }}
        >
          
          {/* Month Header Row (gap: 3px) */}
          <div 
            className="grid grid-cols-[44px_repeat(12,1fr)] mb-1.5 pb-1 border-b border-[var(--border-subtle)]"
            style={{ gap: '3px' }}
          >
            <div className="text-[10px] font-mono text-[var(--text-dim)] font-semibold text-right pr-1.5 self-center">
              YEAR
            </div>
            {MONTH_NAMES.map((m) => (
              <div key={m} className="text-[10px] font-mono text-[var(--text-muted)] uppercase font-semibold text-center">
                {m}
              </div>
            ))}
          </div>

          {/* Year Rows with Exact gap: 3px and cells width: 14px / height: 14px */}
          <div className="space-y-[3px]">
            {years.map((year) => {
              const yearData = yearsMap[year] || {};
              const sample = Object.values(yearData)[0];
              const isSingleSensor = sample && sample.n_sensors === 1;

              return (
                <div 
                  key={year} 
                  className="grid grid-cols-[44px_repeat(12,1fr)] items-center"
                  style={{ gap: '3px' }}
                >
                  <div className="text-[10px] font-mono text-[var(--text-dim)] text-right pr-1.5 flex items-center justify-end gap-1">
                    <span>{year}</span>
                    {isSingleSensor && <span className="w-1 h-1 rounded-full bg-[var(--text-dim)]" title="Single sensor era" />}
                  </div>

                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const cell = yearData[month];
                    if (!cell) {
                      return (
                        <div 
                          key={month} 
                          className="heatmap-cell mx-auto rounded-xs bg-[var(--surface-secondary)]/30"
                          style={{ width: '14px', height: '14px', flexShrink: 0 }}
                        />
                      );
                    }

                    const isSelected = selectedCell && selectedCell.year === cell.year && selectedCell.month === cell.month;
                    const bg = getCellColor(cell.anomaly, cell.n_sensors);

                    return (
                      <div
                        key={month}
                        onClick={() => setSelectedCell(cell)}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`heatmap-cell mx-auto rounded-xs ${isSelected ? 'selected' : ''} ${cell.is_hatched ? 'hatched-pattern' : ''}`}
                        style={{ 
                          backgroundColor: bg,
                          width: '14px', 
                          height: '14px', 
                          flexShrink: 0 
                        }}
                        title={`${MONTH_NAMES[month - 1]} ${year}: ${cell.harmonized_count.toLocaleString()} count (${cell.anomaly >= 0 ? '+' : ''}${cell.anomaly}% anomaly)`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Dynamic Hover Status Strip */}
      <div 
        className="text-xs font-mono border-t border-[var(--border-subtle)] flex items-center justify-between"
        style={{ width: '100%', maxWidth: '720px', marginInline: 'auto', paddingTop: '8px' }}
      >
        {hoveredCell ? (
          <div className="flex flex-wrap items-center gap-2 text-[var(--text-primary)]">
            <span className="font-bold text-[var(--brand-spindrift)]">
              {MONTH_NAMES[hoveredCell.month - 1]} {hoveredCell.year}
            </span>
            <span>Observed: <strong>{hoveredCell.harmonized_count.toLocaleString()}</strong></span>
            <span className="text-[var(--text-dim)]">&bull;</span>
            <span>Median: <strong>{hoveredCell.baseline_median?.toLocaleString() || '1,380'}</strong></span>
            <span className="text-[var(--text-dim)]">&bull;</span>
            <span>Anomaly: <strong>{hoveredCell.anomaly >= 0 ? `+${hoveredCell.anomaly}%` : `${hoveredCell.anomaly}%`}</strong></span>
          </div>
        ) : (
          <span className="text-[var(--text-dim)] text-[11px]">Hover over any month cell to inspect anomaly metrics.</span>
        )}
      </div>

      {/* Legend Paragraph (padding: 16px 0px) */}
      <p 
        className="text-[12px] text-[var(--text-muted)] text-center"
        style={{ padding: '16px 0px', maxWidth: '720px', marginInline: 'auto' }}
      >
        Monthly fire anomaly categories calibrated against the 25-year day-aligned baseline (RdYlGn diverging color scale).
      </p>

      {/* Heatmap Legend Row (Entire legend row: padding: 12px 0px) */}
      <div 
        className="flex items-center justify-center flex-wrap gap-2 text-xs font-mono border-t border-[var(--border-subtle)]"
        style={{ width: '100%', maxWidth: '720px', marginInline: 'auto', padding: '12px 0px' }}
      >
        {/* Legend Item: Below Baseline */}
        <div 
          className="flex items-center rounded glass-panel border border-[var(--border-subtle)]"
          style={{ padding: '6px 12px' }}
        >
          <span 
            className="rounded-xs bg-[#5A7D63]" 
            style={{ width: '12px', height: '12px', marginRight: '8px', flexShrink: 0 }}
          />
          <span className="text-[11px] text-[var(--text-secondary)]">Below Baseline</span>
        </div>

        {/* Legend Item: Normal */}
        <div 
          className="flex items-center rounded glass-panel border border-[var(--border-subtle)]"
          style={{ padding: '6px 12px' }}
        >
          <span 
            className="rounded-xs bg-[var(--brand-highlight)]" 
            style={{ width: '12px', height: '12px', marginRight: '8px', flexShrink: 0 }}
          />
          <span className="text-[11px] text-[var(--text-secondary)]">Normal</span>
        </div>

        {/* Legend Item: Elevated */}
        <div 
          className="flex items-center rounded glass-panel border border-[var(--border-subtle)]"
          style={{ padding: '6px 12px' }}
        >
          <span 
            className="rounded-xs bg-[#B88B4A]" 
            style={{ width: '12px', height: '12px', marginRight: '8px', flexShrink: 0 }}
          />
          <span className="text-[11px] text-[var(--text-secondary)]">Elevated</span>
        </div>

        {/* Legend Item: Unusual */}
        <div 
          className="flex items-center rounded glass-panel border border-[var(--border-subtle)]"
          style={{ padding: '6px 12px' }}
        >
          <span 
            className="rounded-xs bg-[#A24E4E]" 
            style={{ width: '12px', height: '12px', marginRight: '8px', flexShrink: 0 }}
          />
          <span className="text-[11px] text-[var(--text-secondary)]">Unusual</span>
        </div>

        {/* Legend Item: Single-Sensor */}
        <div 
          className="flex items-center rounded glass-panel border border-[var(--border-subtle)]"
          style={{ padding: '6px 12px' }}
        >
          <span 
            className="rounded-xs bg-[#5B6375]" 
            style={{ width: '12px', height: '12px', marginRight: '8px', flexShrink: 0 }}
          />
          <span className="text-[11px] text-[var(--text-secondary)]">Single-Sensor</span>
        </div>

        {/* Legend Item: Cloud Obscured */}
        <div 
          className="flex items-center rounded glass-panel border border-[var(--border-subtle)]"
          style={{ padding: '6px 12px' }}
        >
          <span 
            className="rounded-xs hatched-pattern bg-[var(--surface-secondary)]" 
            style={{ width: '12px', height: '12px', marginRight: '8px', flexShrink: 0 }}
          />
          <span className="text-[11px] text-[var(--text-secondary)]">Cloud Obscured</span>
        </div>
      </div>

    </div>
  );
}
