import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFireWatch } from '../context/FireWatchContext';
import { IMAGES } from '../services/assets';

export default function LandingPage() {
  const { setUserRole } = useFireWatch();
  const navigate = useNavigate();

  const handleSelectRole = (roleKey, targetPath) => {
    setUserRole(roleKey);
    navigate(targetPath);
  };

  const roles = [
    {
      id: 'scientist',
      title: 'Scientist',
      target: '/map',
      image: IMAGES.roleScientist || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'responder',
      title: 'Fire Manager',
      target: '/map',
      image: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'general',
      title: 'General User',
      target: '/map',
      image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  return (
    <div 
      className="relative min-h-[calc(100vh-64px)] bg-[var(--background)] text-[var(--text-primary)] flex flex-col justify-center items-center overflow-x-hidden transition-colors duration-200"
      style={{ padding: '32px', boxSizing: 'border-box' }}
    >
      
      {/* Background NASA Earth Observation Image with Subtle Theme Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={IMAGES.hero}
          alt="NASA Earth from Space Night View"
          className="w-full h-full object-cover object-center opacity-15 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/85 via-[var(--background)]/90 to-[var(--background)]" />
        
        {/* Subtle Ambient Vignette */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[var(--brand-highlight)]/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1600px] w-full mx-auto flex flex-col items-center text-center px-6">
        
        {/* Project Branding & Hero Description Paragraph (Clean and Minimal, No Extra Phrase) */}
        <div className="max-w-2xl mb-6">
          <h1 className="text-3xl sm:text-[38px] font-bold tracking-tight text-[var(--text-primary)] font-sans">
            FIREWATCH 2.0
          </h1>
          <p 
            className="text-[14px] sm:text-[15px] text-[var(--text-muted)] font-normal"
            style={{ padding: '24px 0px', lineHeight: 1.6 }}
          >
            By learning standard satellite observation effort and harmonising MODIS and VIIRS satellite observations for smarter fire activity monitoring.
          </p>
        </div>

        {/* 3 Compact Glass Role Selection Cards (Equal width, equal height, consistent 24px spacing) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleSelectRole(role.id, role.target)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectRole(role.id, role.target);
                }
              }}
              className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 flex flex-col h-full glass-card dashboard-card hover:border-[var(--brand-highlight)] text-left active:scale-[0.99] outline-none focus:ring-2 focus:ring-[var(--brand-highlight)]"
              style={{ boxSizing: 'border-box' }}
            >
              {/* Graphical Visualization Preview Container with exact padding: 20px */}
              <div 
                className="w-full bg-[var(--surface-secondary)]/50 border-b border-[var(--border-subtle)] flex items-center justify-center overflow-hidden"
                style={{ padding: '20px', boxSizing: 'border-box' }}
              >
                <div className="w-full h-32 rounded-lg overflow-hidden relative">
                  <img
                    src={role.image}
                    alt={role.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/75 to-transparent" />
                </div>
              </div>

              {/* Centered Role Name (Description removed) */}
              <div className="p-5 flex-1 flex items-center justify-center text-center">
                <h2 className="text-[17px] sm:text-[18px] font-semibold text-[var(--text-primary)] tracking-tight group-hover:text-[var(--brand-highlight)] transition-colors text-center">
                  {role.title}
                </h2>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
