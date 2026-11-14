import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Map, 
  Calendar, 
  ShieldAlert, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  Share2, 
  ArrowRight, 
  Satellite, 
  Activity, 
  Layers,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { useFireWatch } from '../context/FireWatchContext';
import { IMAGES } from '../services/assets';

export default function OverviewPage() {
  const { 
    userRole, 
    regionName, 
    startDate, 
    endDate, 
    alertData, 
    reliabilityData, 
    calendarData,
    bbox 
  } = useFireWatch();

  const roleTitles = {
    scientist: 'Scientist / Research Lead',
    responder: 'Incident Commander / Emergency Responder',
    general: 'Environmental Analyst / General Observer'
  };

  const pages = [
    {
      title: 'Geospatial Map Explorer',
      route: '/explorer',
      icon: Map,
      tag: 'Interactive GIS',
      description: 'Explore thermal anomaly distributions, draw target bounding boxes, or inspect localized cluster density.',
      color: 'border-[#3B82F6]/40 hover:border-[#38BDF8] text-[#38BDF8]'
    },
    {
      title: 'Fire Activity Calendar',
      route: '/calendar',
      icon: Calendar,
      tag: 'LFAI Heatmap',
      description: 'Historical 2000–2026 matrix evaluating monthly fire anomalies against day-aligned multi-decade medians.',
      color: 'border-[#F97316]/40 hover:border-[#F97316] text-[#F97316]'
    },
    {
      title: 'Probabilistic Alert Status',
      route: '/alerts',
      icon: ShieldAlert,
      tag: 'Risk Telemetry',
      description: 'Current fire activity rank relative to the 25-year baseline with probability distribution statements.',
      color: 'border-[#EF4444]/40 hover:border-[#EF4444] text-[#EF4444]'
    },
    {
      title: 'Sensor Transition Analytics',
      route: '/sensors',
      icon: TrendingUp,
      tag: 'MODIS & VIIRS',
      description: 'Inspect cross-calibration across the 2012–2026 overlap era and verify model stability under simulated sensor loss.',
      color: 'border-[#14B8A6]/40 hover:border-[#14B8A6] text-[#14B8A6]'
    },
    {
      title: 'Data Reliability Scorecard',
      route: '/reliability',
      icon: ShieldCheck,
      tag: 'Model Verification',
      description: 'Scientific verification scorecard validating NASA POWER cloud-cover adjustments and sensor redundancy.',
      color: 'border-[#10B981]/40 hover:border-[#10B981] text-[#10B981]'
    },
    {
      title: 'Hotspot Data Export',
      route: '/export',
      icon: Download,
      tag: 'CSV & Geodata',
      description: 'Download harmonized hotspot records with NASA FIRMS attribution headers and calibrated LFAI metrics.',
      color: 'border-[#F59E0B]/40 hover:border-[#F59E0B] text-[#F59E0B]'
    },
    {
      title: 'Shareable Analysis',
      route: '/share',
      icon: Share2,
      tag: 'Collaboration',
      description: 'Generate permalinks encoding geographical coordinates, dates, and operational perspectives for teammates.',
      color: 'border-[#A855F7]/40 hover:border-[#A855F7] text-[#A855F7]'
    }
  ];

  const alertLabel = alertData?.alert_label || 'Normal';
  const percentile = alertData?.percentile ?? 50.0;
  const relScore = reliabilityData?.reliability_score ?? 94;
  const relLevel = reliabilityData?.reliability_level || 'High';

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-10 space-y-12">
      
      {/* Top Welcome Banner with Role Context */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0E1420] via-[#141C2C] to-[#0E1420] border border-[#1E293B] p-8 sm:p-10 ambient-glow-frame">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img src={IMAGES.forestCanopy} alt="Forest Canopy" className="w-full h-full object-cover object-center" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#38BDF8] text-xs font-mono uppercase tracking-wider">
              {roleTitles[userRole] || 'Operational Analyst'}
            </span>
            <span className="text-xs font-mono text-[#64748B]">&bull;</span>
            <span className="text-xs font-mono text-[#94A3B8]">Active Session</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Satellite Intelligence Overview
          </h1>

          <p className="text-sm text-[#94A3B8] font-light leading-relaxed">
            Currently analyzing <strong className="text-white">{regionName}</strong> across historical window <strong className="text-white">{startDate}</strong> to <strong className="text-white">{endDate}</strong>. Access dedicated analytical workflows below.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-[#94A3B8]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>BBox: [{bbox.map(n => Number(n).toFixed(1)).join(', ')}]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Baseline: 2000–2026 (26 Years)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Summary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 font-mono">
        <div className="cinematic-card p-6 border-[#1E293B]">
          <span className="text-[11px] uppercase tracking-wider text-[#64748B] block mb-1">Current Alert</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${alertLabel === 'Unusual' ? 'text-[#EF4444]' : alertLabel === 'Elevated' ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
              {alertLabel}
            </span>
            <span className="text-xs text-[#94A3B8]">({percentile}th %ile)</span>
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1">Day-aligned comparison</span>
        </div>

        <div className="cinematic-card p-6 border-[#1E293B]">
          <span className="text-[11px] uppercase tracking-wider text-[#64748B] block mb-1">Statistical Reliability</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#10B981]">{relScore}</span>
            <span className="text-xs text-[#94A3B8]">/ 100 ({relLevel})</span>
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1">Cloud effort model verified</span>
        </div>

        <div className="cinematic-card p-6 border-[#1E293B]">
          <span className="text-[11px] uppercase tracking-wider text-[#64748B] block mb-1">Active Constellation</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#38BDF8]">3</span>
            <span className="text-xs text-[#94A3B8]">Instruments</span>
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1">Aqua, NOAA-20, NOAA-21</span>
        </div>

        <div className="cinematic-card p-6 border-[#1E293B]">
          <span className="text-[11px] uppercase tracking-wider text-[#64748B] block mb-1">Harmonization Status</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#F97316]">Active</span>
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1">Latent true fire index (LFAI)</span>
        </div>
      </div>

      {/* 7 Dedicated Analytical Modules */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-white">Analytical Modules &amp; Pages</h2>
            <p className="text-xs text-[#94A3B8] font-mono mt-0.5">Explore each dedicated section designed for comprehensive geospatial intelligence.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.route}
                to={p.route}
                className={`cinematic-card p-6 flex flex-col justify-between group border ${p.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#05070D] border border-white/10 group-hover:border-[#38BDF8]/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-[#94A3B8]">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-white group-hover:text-[#38BDF8] transition-colors mb-2">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#94A3B8] group-hover:text-white">
                  <span>Enter Module</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
