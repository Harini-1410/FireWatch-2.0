import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Satellite, 
  Shield, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { useFireWatch } from '../context/FireWatchContext';
import { IMAGES } from '../services/assets';

export default function RoleSelectionPage() {
  const { userRole, setUserRole } = useFireWatch();
  const [selected, setSelected] = useState(userRole || 'responder');
  const navigate = useNavigate();

  const roles = [
    {
      id: 'scientist',
      title: 'Scientist / Researcher',
      targetRoute: '/calendar',
      tag: 'Scientific Rigor',
      description: 'For researchers studying historical fire patterns, satellite observations, and environmental changes.',
      highlights: ['Latent Fire Activity Index (LFAI)', 'Sensor Transition Cross-Calibration', '25-Year Observation Effort Baselines'],
      icon: Satellite,
      image: IMAGES.roleScientist,
      accentColor: 'border-[#38BDF8] text-[#38BDF8] ring-[#38BDF8]'
    },
    {
      id: 'responder',
      title: 'Fire Manager / Responder',
      targetRoute: '/explorer',
      tag: 'Field Operations',
      description: 'For fire management teams monitoring unusual fire activity and understanding regional fire conditions.',
      highlights: ['Interactive Spatial Area Selection', 'Day-Aligned Probabilistic Alerts', 'Operational Situation Briefings'],
      icon: Shield,
      image: IMAGES.roleResponder,
      accentColor: 'border-[#F97316] text-[#F97316] ring-[#F97316]'
    },
    {
      id: 'general',
      title: 'General User',
      targetRoute: '/overview',
      tag: 'Global Awareness',
      description: 'For users interested in exploring global fire activity, historical trends, and environmental insights.',
      highlights: ['Global Multi-Sensor Telemetry', 'Accessible Burning Activity Heatmaps', 'Historical Anomaly Trends'],
      icon: Globe,
      image: IMAGES.roleGeneral,
      accentColor: 'border-[#10B981] text-[#10B981] ring-[#10B981]'
    }
  ];

  const handleSelectAndEnter = (roleId, targetRoute) => {
    setSelected(roleId);
    setUserRole(roleId);
    // Smooth navigation into role-prioritized start page
    setTimeout(() => {
      navigate(targetRoute);
    }, 200);
  };

  return (
    <div className="relative min-h-screen bg-[#05070D] text-white flex flex-col justify-between py-12 px-6 sm:px-12 overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#3B82F6]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#38BDF8] text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tailored Operational Experience</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-normal text-white tracking-tight">
          Select Your Perspective
        </h1>

        <p className="text-sm sm:text-base text-[#94A3B8] max-w-xl mx-auto font-light">
          No login required. Choose the operational role that fits your analytical workflow to calibrate your interface priority.
        </p>
      </div>

      {/* 3 Role Selection Cards */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-12">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = selected === r.id;

          return (
            <div
              key={r.id}
              onClick={() => setSelected(r.id)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                isSelected 
                  ? 'border-[#38BDF8] shadow-[0_0_40px_rgba(59,130,246,0.35)] ring-1 ring-[#38BDF8]'
                  : 'border-[#1E293B] hover:border-[#38BDF8]/50 bg-[#0E1420]/70'
              }`}
            >
              {/* Image banner with dark gradient */}
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={r.image}
                  alt={r.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1420] via-[#0E1420]/60 to-transparent" />
                
                {/* Role Icon Tag */}
                <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-[#05070D]/80 backdrop-blur-md border border-white/10 text-white shadow-lg">
                  <Icon className="w-5 h-5 text-[#38BDF8]" />
                </div>

                <div className="absolute top-4 right-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase bg-[#05070D]/80 border border-white/10 text-[#94A3B8]">
                    {r.tag}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl text-white group-hover:text-[#38BDF8] transition-colors">
                      {r.title}
                    </h3>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#38BDF8]" />
                    )}
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                    {r.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">
                      Role Priorities:
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#CBD5E1] font-mono">
                      {r.highlights.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Enter Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAndEnter(r.id, r.targetRoute);
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-mono font-semibold tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-lg shadow-[#3B82F6]/30'
                      : 'bg-[#141C2C] hover:bg-[#1C2840] text-[#CBD5E1] border border-white/5'
                  }`}
                >
                  <span>Launch Experience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 max-w-md mx-auto text-center text-xs font-mono text-[#64748B] flex items-center justify-center gap-2">
        <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
        <span>You can switch roles anytime from the top navigation bar.</span>
      </div>

    </div>
  );
}
