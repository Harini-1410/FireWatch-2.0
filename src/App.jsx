import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FireWatchProvider } from './context/FireWatchContext';

import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import MapExplorerPage from './pages/MapExplorerPage';
import FireCalendarPage from './pages/FireCalendarPage';
import AlertStatusPage from './pages/AlertStatusPage';
import SensorTransitionPage from './pages/SensorTransitionPage';
import DataReliabilityPage from './pages/DataReliabilityPage';
import DataExportPage from './pages/DataExportPage';

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col justify-between font-sans selection:bg-[#CDD09D]/30 selection:text-[var(--text-primary)] transition-colors duration-200">
      
      {/* Global Navigation (Shown on all pages except First Screen /) */}
      <Navigation />

      {/* Main Page Viewport */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/map" element={<MapExplorerPage />} />
          <Route path="/explorer" element={<Navigate to="/map" replace />} />
          <Route path="/calendar" element={<FireCalendarPage />} />
          <Route path="/alerts" element={<AlertStatusPage />} />
          <Route path="/sensors" element={<SensorTransitionPage />} />
          <Route path="/reliability" element={<DataReliabilityPage />} />
          <Route path="/export" element={<DataExportPage />} />
          <Route path="/share" element={<Navigate to="/export" replace />} />
          <Route path="/overview" element={<Navigate to="/map" replace />} />
          <Route path="/roles" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Compliance Footer (Shown on all application pages, hidden on landing) */}
      {!isLandingPage && <Footer />}

    </div>
  );
}

export default function App() {
  return (
    <FireWatchProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </FireWatchProvider>
  );
}
