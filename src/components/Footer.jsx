import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--surface-secondary)]/40 backdrop-blur-md py-3 text-xs text-[var(--text-dim)]">
      <div className="max-w-[1600px] w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Subtle Brand Title Only */}
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)] font-medium text-[12px] tracking-wider uppercase font-mono">
            FIREWATCH 2.0
          </span>
        </div>

        {/* Compact audit & methodology access */}
        <div className="flex items-center gap-3 text-[12px]">
          <Link
            to="/reliability"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-highlight)]" />
            <span>Reliability &amp; Calibration Audit</span>
          </Link>
        </div>

      </div>
    </footer>
  );
}
