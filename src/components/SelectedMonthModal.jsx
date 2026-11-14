import React from 'react';
import { X, Calendar, ArrowRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SelectedMonthModal({
  selectedCell,
  onClose,
  onSetAsTargetMonth
}) {
  if (!selectedCell) return null;

  const monthName = MONTH_NAMES[selectedCell.month - 1];
  const isAnomalyPositive = selectedCell.anomaly > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-md border-[var(--border-subtle)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 bg-[var(--surface-secondary)]/80 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--brand-spindrift)]" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              {monthName} {selectedCell.year} Telemetry
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs font-mono">
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-[var(--surface-secondary)]/50 rounded-lg border border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-dim)] block">Harmonized LFAI</span>
              <span className="text-lg font-bold text-[var(--brand-spindrift)]">
                {selectedCell.harmonized_count.toLocaleString()}
              </span>
              <span className="text-[10px] text-[var(--text-dim)] block">Median: {selectedCell.median.toLocaleString()}</span>
            </div>

            <div className="p-2.5 bg-[var(--surface-secondary)]/50 rounded-lg border border-[var(--border-subtle)]">
              <span className="text-[10px] uppercase text-[var(--text-dim)] block">Anomaly</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {isAnomalyPositive ? `+${selectedCell.anomaly}%` : `${selectedCell.anomaly}%`}
              </span>
              <span className="text-[10px] text-[var(--text-dim)] block">Status: {selectedCell.alert_status}</span>
            </div>
          </div>

          <div className="p-2.5 bg-[var(--surface-secondary)]/50 rounded-lg border border-[var(--border-subtle)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Active Instruments:</span>
              <span className="text-[var(--text-primary)] font-bold">{selectedCell.n_sensors} Sats</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedCell.sensors?.map((s) => (
                <span key={s} className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)]">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-2.5 bg-[var(--surface-secondary)]/50 rounded-lg border border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Clear-Sky Observation Days:</span>
            <span className="text-[var(--text-primary)] font-bold">{selectedCell.clear_sky_days} / 30 d</span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[var(--surface-secondary)]/60 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onSetAsTargetMonth(selectedCell.date);
              onClose();
            }}
            className="btn-primary py-1 px-3 text-xs font-mono font-medium"
          >
            <span>Set as Alert Target</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-secondary py-1 px-3 text-xs font-mono"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
