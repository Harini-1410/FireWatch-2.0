import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  RotateCcw,
  Sun,
  Moon,
  User,
  Check
} from 'lucide-react';
import { useFireWatch } from '../context/FireWatchContext';

export default function Navigation() {
  const { userRole, setUserRole, theme, toggleTheme } = useFireWatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/', end: true },
    { label: 'Map', path: '/map' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Alerts', path: '/alerts' },
    { label: 'Sensors', path: '/sensors' },
    { label: 'Reliability', path: '/reliability' },
    { label: 'Export', path: '/export' }
  ];

  const roleLabels = {
    scientist: 'Scientist',
    responder: 'Fire Manager',
    general: 'General User'
  };

  const currentRoleLabel = roleLabels[userRole] || 'Fire Manager';

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-200">
      <div className="max-w-[1600px] w-full mx-auto px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Project Branding */}
        <div className="flex items-center shrink-0">
          <Link 
            to="/" 
            className="text-[var(--text-primary)] font-bold tracking-wider text-[15px] sm:text-[16px] font-sans hover:text-[var(--brand-highlight)] transition-colors focus:outline-none flex items-center gap-2"
            title="FireWatch 2.0 Home"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--brand-highlight)]" />
            <span>FIREWATCH 2.0</span>
          </Link>
        </div>

        {/* Center: Horizontal Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 shrink-0">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `py-2 text-[13px] sm:text-[14px] font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[var(--text-primary)] border-b-2 border-[var(--brand-highlight)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] border-b-2 border-transparent'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Theme Toggle & Compact User Profile Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/80 flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--brand-highlight)] transition-all cursor-pointer shadow-xs active:scale-95"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
            aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#CDD09D] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#0E0E10] transition-transform hover:-rotate-12" />
            )}
          </button>

          {/* Compact User Profile Indicator (Circular icon + Role name) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[var(--surface-secondary)]/80 border border-[var(--border-subtle)] hover:border-[var(--brand-highlight)] transition-all cursor-pointer shadow-xs active:scale-95"
              title="Click to switch role perspective"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-highlight)] shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-[13px] font-medium text-[var(--text-primary)] hidden sm:inline pr-0.5">
                {currentRoleLabel}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-dim)] shrink-0 hidden sm:inline" />
            </button>

            {/* Profile Dropdown with Specific Spacing (.profile-dropdown, .profile-dropdown-title, .profile-option, .profile-home-action) */}
            {roleDropdownOpen && (
              <div 
                className="profile-dropdown absolute right-0 mt-2 glass-card border border-[var(--border-subtle)] shadow-2xl z-50 text-[13px] font-sans"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                {/* Title Container */}
                <div className="profile-dropdown-title border-b border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                  <span>Current Profile</span>
                  <span className="text-[var(--text-primary)] font-bold">{currentRoleLabel}</span>
                </div>
                
                {/* Role Options - Each on distinct row with proper vertical spacing */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('scientist')}
                    className={`profile-option justify-between cursor-pointer border ${
                      userRole === 'scientist' 
                        ? 'bg-[var(--brand-highlight)]/25 text-[var(--text-primary)] border-[var(--brand-highlight)] font-semibold shadow-xs' 
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-highlight)]" />
                      <span>Scientist</span>
                    </div>
                    {userRole === 'scientist' && <Check className="w-4 h-4 text-[var(--text-primary)]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('responder')}
                    className={`profile-option justify-between cursor-pointer border ${
                      userRole === 'responder' 
                        ? 'bg-[var(--brand-highlight)]/25 text-[var(--text-primary)] border-[var(--brand-highlight)] font-semibold shadow-xs' 
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-highlight)]" />
                      <span>Fire Manager</span>
                    </div>
                    {userRole === 'responder' && <Check className="w-4 h-4 text-[var(--text-primary)]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('general')}
                    className={`profile-option justify-between cursor-pointer border ${
                      userRole === 'general' 
                        ? 'bg-[var(--brand-highlight)]/25 text-[var(--text-primary)] border-[var(--brand-highlight)] font-semibold shadow-xs' 
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-highlight)]" />
                      <span>General User</span>
                    </div>
                    {userRole === 'general' && <Check className="w-4 h-4 text-[var(--text-primary)]" />}
                  </button>
                </div>

                {/* Return Home Action Container */}
                <div className="border-t border-[var(--border-subtle)] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      navigate('/');
                    }}
                    className="profile-home-action w-full flex items-center justify-between text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] border border-transparent hover:border-[var(--border-subtle)] cursor-pointer"
                  >
                    <span>Return to Home</span>
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] py-3 px-6 space-y-1 bg-[var(--surface)] backdrop-blur-md">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--brand-highlight)]/20 text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-3 mt-2 border-t border-[var(--border-subtle)] flex items-center justify-between px-3 text-[12px] text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-highlight)]">
                <User className="w-3 h-3" />
              </div>
              <span>Profile: <strong className="text-[var(--text-primary)]">{currentRoleLabel}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/');
              }}
              className="text-[var(--text-primary)] font-semibold hover:underline"
            >
              Switch Role
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
