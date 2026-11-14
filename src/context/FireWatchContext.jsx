import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PRESET_REGIONS } from '../services/mockData';
import { 
  checkBackendHealth, 
  fetchCalendar, 
  fetchAlert, 
  fetchSensorTransition, 
  fetchReliability,
  downloadExportCSV,
  API_BASE_URL 
} from '../services/api';
import { getInitialUrlState, useUrlState } from '../hooks/useUrlState';

const FireWatchContext = createContext(null);

export function FireWatchProvider({ children }) {
  const initial = getInitialUrlState();

  // Theme State (Persisted in localStorage, defaults to 'dark')
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('firewatch_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('firewatch_theme', nextTheme);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
      if (typeof window !== 'undefined') {
        localStorage.setItem('firewatch_theme', newTheme);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', newTheme);
      }
    }
  };

  // Role State (Persisted in sessionStorage)
  const [userRole, setUserRoleState] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('firewatch_role') || 'responder';
    }
    return 'responder';
  });

  const setUserRole = (role) => {
    setUserRoleState(role);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('firewatch_role', role);
    }
  };

  // Geospatial & Temporal State
  const [bbox, setBbox] = useState(initial.bbox);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [endDate, setEndDate] = useState(initial.endDate);
  const [activeLayer, setActiveLayer] = useState(initial.activeLayer);
  const [selectedRegionId, setSelectedRegionId] = useState(initial.selectedRegionId);

  // Sync state to URL search parameters
  useUrlState({ bbox, startDate, endDate, activeLayer, selectedRegionId });

  // Mode toggles
  const [isMockMode, setIsMockMode] = useState(true);
  const [backendAlive, setBackendAlive] = useState(false);
  const [isComparableMode, setIsComparableMode] = useState(true);
  const [excludeTerra, setExcludeTerra] = useState(false);

  // Data states
  const [calendarData, setCalendarData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [transitionData, setTransitionData] = useState(null);
  const [reliabilityData, setReliabilityData] = useState(null);
  const [targetMonth, setTargetMonth] = useState('2026-08');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [widgetErrors, setWidgetErrors] = useState({});

  // Active month inspection
  const [selectedCell, setSelectedCell] = useState(null);

  // Derive Region
  const currentRegion = PRESET_REGIONS.find(p => p.id === selectedRegionId);
  const regionName = currentRegion ? currentRegion.name : 'Custom Spatial Area';

  // Check backend health periodically
  useEffect(() => {
    let isMounted = true;
    async function probeBackend() {
      const alive = await checkBackendHealth();
      if (!isMounted) return;
      setBackendAlive(alive);
      if (!alive) {
        setIsMockMode(true);
      }
    }
    probeBackend();
    const interval = setInterval(probeBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Main data loader function
  const loadDashboardData = useCallback(async (
    customBbox = bbox, 
    customStart = startDate, 
    customEnd = endDate, 
    customExclude = excludeTerra
  ) => {
    if (!customBbox || customBbox.length !== 4) return;
    if (customStart > customEnd) return;

    setIsLoading(true);
    setWidgetErrors({});

    try {
      const calRes = await fetchCalendar(customBbox, customStart, customEnd, isMockMode);
      setCalendarData(calRes);
    } catch (err) {
      console.error('Calendar error:', err);
      setWidgetErrors(prev => ({ ...prev, calendar: err.message }));
    }

    try {
      const alertRes = await fetchAlert(customBbox, targetMonth, isMockMode);
      setAlertData(alertRes);
    } catch (err) {
      console.error('Alert error:', err);
      setWidgetErrors(prev => ({ ...prev, alert: err.message }));
    }

    try {
      const transRes = await fetchSensorTransition(customBbox, customStart, customEnd, customExclude, isMockMode);
      setTransitionData(transRes);
    } catch (err) {
      console.error('Sensor transition error:', err);
      setWidgetErrors(prev => ({ ...prev, transition: err.message }));
    }

    try {
      const relRes = await fetchReliability(customBbox, customStart, customEnd, isMockMode);
      setReliabilityData(relRes);
    } catch (err) {
      console.error('Reliability error:', err);
      setWidgetErrors(prev => ({ ...prev, reliability: err.message }));
    }

    setIsLoading(false);
  }, [bbox, startDate, endDate, excludeTerra, isMockMode, targetMonth]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [isMockMode]);

  // Region preset switch
  const selectRegion = (presetId) => {
    setSelectedRegionId(presetId);
    const preset = PRESET_REGIONS.find(p => p.id === presetId);
    if (preset) {
      setBbox(preset.bbox);
      loadDashboardData(preset.bbox, startDate, endDate, excludeTerra);
    }
  };

  // Toggle Terra
  const toggleTerra = async () => {
    const nextExclude = !excludeTerra;
    setExcludeTerra(nextExclude);
    try {
      const transRes = await fetchSensorTransition(bbox, startDate, endDate, nextExclude, isMockMode);
      setTransitionData(transRes);
    } catch (err) {
      console.error('Failed to update Terra transition:', err);
    }
  };

  // Export CSV
  const triggerExportCSV = async () => {
    setIsExporting(true);
    try {
      await downloadExportCSV(bbox, startDate, endDate, isMockMode);
    } catch (err) {
      alert(`CSV Export Failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const value = {
    userRole,
    setUserRole,
    theme,
    setTheme,
    toggleTheme,
    bbox,
    setBbox,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeLayer,
    setActiveLayer,
    selectedRegionId,
    selectRegion,
    regionName,
    calendarData,
    alertData,
    transitionData,
    reliabilityData,
    targetMonth,
    setTargetMonth,
    selectedCell,
    setSelectedCell,
    isMockMode,
    setIsMockMode,
    backendAlive,
    isComparableMode,
    setIsComparableMode,
    excludeTerra,
    toggleTerra,
    isLoading,
    isExporting,
    triggerExportCSV,
    loadDashboardData,
    widgetErrors,
    API_BASE_URL
  };

  return (
    <FireWatchContext.Provider value={value}>
      {children}
    </FireWatchContext.Provider>
  );
}

export function useFireWatch() {
  const context = useContext(FireWatchContext);
  if (!context) {
    throw new Error('useFireWatch must be used within a FireWatchProvider');
  }
  return context;
}
