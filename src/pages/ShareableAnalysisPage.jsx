import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  Layers, 
  UserCheck, 
  ExternalLink,
  ShieldCheck,
  Link as LinkIcon
} from 'lucide-react';
import { useFireWatch } from '../context/FireWatchContext';

export default function ShareableAnalysisPage() {
  const {
    bbox,
    startDate,
    endDate,
    regionName,
    selectedRegionId,
    activeLayer,
    userRole
  } = useFireWatch();

  const [copied, setCopied] = useState(false);

  // Build the complete permalink URL
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/explorer?bbox=${bbox.map(n => Number(n).toFixed(2)).join(',')}&start=${startDate}&end=${endDate}&layer=${activeLayer}&region=${selectedRegionId}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const [minLat, minLon, maxLat, maxLon] = bbox || [-15, -75, 5, -45];

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-[#A855F7]/10 text-[#C084FC] border border-[#A855F7]/30">
              Module 07 &bull; Collaboration
            </span>
            <span className="text-xs font-mono text-[#64748B]">State Permalink Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white">Shareable Analysis Permalink</h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-light mt-1">
            Encode your exact spatial bounding box, temporal window, and visualization layers into an authenticated-free shareable URL.
          </p>
        </div>
      </div>

      {/* Main Permalink Card */}
      <div className="cinematic-card p-8 sm:p-12 ambient-glow-frame space-y-8">
        
        {/* Copy Bar */}
        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] block">
            Generated Analysis Permalink:
          </label>
          
          <div className="flex items-center gap-2 bg-[#05070D] p-2 rounded-xl border border-[#1E293B]">
            <LinkIcon className="w-4 h-4 text-[#38BDF8] ml-2 shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-xs font-mono text-[#F8FAFC] focus:outline-none flex-1 px-2 select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-[#10B981] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Encoded State Summary */}
        <div className="space-y-3">
          <h3 className="font-serif text-lg text-white">Encoded Session Parameters</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#05070D] border border-[#1E293B] space-y-1">
              <div className="flex items-center gap-1.5 text-[#38BDF8]">
                <MapPin className="w-3.5 h-3.5" />
                <span className="uppercase text-[10px] text-[#64748B]">Spatial Bounding Box</span>
              </div>
              <span className="text-white font-bold block">{regionName}</span>
              <span className="text-[10px] text-[#64748B]">Lat: {minLat.toFixed(2)}° &rarr; {maxLat.toFixed(2)}° | Lon: {minLon.toFixed(2)}° &rarr; {maxLon.toFixed(2)}°</span>
            </div>

            <div className="p-4 rounded-xl bg-[#05070D] border border-[#1E293B] space-y-1">
              <div className="flex items-center gap-1.5 text-[#F97316]">
                <Calendar className="w-3.5 h-3.5" />
                <span className="uppercase text-[10px] text-[#64748B]">Temporal Window</span>
              </div>
              <span className="text-white font-bold block">{startDate} to {endDate}</span>
              <span className="text-[10px] text-[#64748B]">Multi-decade baseline reference</span>
            </div>

            <div className="p-4 rounded-xl bg-[#05070D] border border-[#1E293B] space-y-1">
              <div className="flex items-center gap-1.5 text-[#10B981]">
                <Layers className="w-3.5 h-3.5" />
                <span className="uppercase text-[10px] text-[#64748B]">Basemap Layer</span>
              </div>
              <span className="text-white font-bold block capitalize">{activeLayer} Canvas</span>
              <span className="text-[10px] text-[#64748B]">Esri GIS Provider</span>
            </div>

            <div className="p-4 rounded-xl bg-[#05070D] border border-[#1E293B] space-y-1">
              <div className="flex items-center gap-1.5 text-[#C084FC]">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="uppercase text-[10px] text-[#64748B]">Target Perspective</span>
              </div>
              <span className="text-white font-bold block capitalize">{userRole} Experience</span>
              <span className="text-[10px] text-[#64748B]">Custom module priority</span>
            </div>
          </div>
        </div>

        {/* Security & Confidentiality Notice */}
        <div className="p-4 rounded-xl bg-[#05070D] border border-white/5 text-xs text-[#94A3B8] font-sans flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
          <span>
            <strong>Zero Credentials in Link:</strong> This permalink safely encodes only public geospatial bounding parameters. No API keys, credentials, or personal telemetry are included.
          </span>
        </div>

      </div>

    </div>
  );
}
