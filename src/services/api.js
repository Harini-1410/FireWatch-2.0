/**
 * FireWatch 2.0 API Service Layer
 * Connects to Sridhar's FastAPI backend or switches to the synthetic mock adapter.
 */

import {
  generateMockCalendar,
  generateMockAlert,
  generateMockSensorTransition,
  generateMockReliability,
  generateMockCSV
} from './mockData';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Check if the backend is currently alive and responsive
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`${API_BASE_URL}/docs`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Format bbox parameters for query string
 * Supports both comma-separated `bbox=minLat,minLon,maxLat,maxLon`
 * and individual `min_lat`, `min_lon`, `max_lat`, `max_lon` for maximum compatibility
 */
function buildBboxQuery(bbox) {
  const [minLat, minLon, maxLat, maxLon] = bbox;
  return new URLSearchParams({
    min_lat: minLat,
    min_lon: minLon,
    max_lat: maxLat,
    max_lon: maxLon,
    bbox: `${minLat},${minLon},${maxLat},${maxLon}`
  });
}

/**
 * Fetch calendar heatmap grid
 * GET /calendar
 */
export async function fetchCalendar(bbox, startDate = '2000-01', endDate = '2026-11', forceMock = false) {
  if (forceMock) {
    return generateMockCalendar(bbox, startDate, endDate);
  }

  const query = buildBboxQuery(bbox);
  query.append('start_date', startDate);
  query.append('end_date', endDate);

  try {
    const res = await fetch(`${API_BASE_URL}/calendar?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { ...data, is_synthetic: false };
  } catch (err) {
    throw new Error(`Failed to load calendar data from ${API_BASE_URL}: ${err.message}`);
  }
}

/**
 * Fetch current alert status
 * GET /alert
 */
export async function fetchAlert(bbox, targetMonth = '2026-08', forceMock = false) {
  if (forceMock) {
    return generateMockAlert(bbox, targetMonth);
  }

  const query = buildBboxQuery(bbox);
  query.append('month', targetMonth);
  query.append('current_month', targetMonth);

  try {
    const res = await fetch(`${API_BASE_URL}/alert?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { ...data, is_synthetic: false };
  } catch (err) {
    throw new Error(`Failed to load alert data from ${API_BASE_URL}: ${err.message}`);
  }
}

/**
 * Fetch sensor transition series (MODIS, VIIRS, Harmonized)
 * GET /sensor-transition
 */
export async function fetchSensorTransition(bbox, startDate = '2000-01', endDate = '2026-11', excludeTerra = false, forceMock = false) {
  if (forceMock) {
    return generateMockSensorTransition(bbox, startDate, endDate, excludeTerra);
  }

  const query = buildBboxQuery(bbox);
  query.append('start_date', startDate);
  query.append('end_date', endDate);
  if (excludeTerra) {
    query.append('exclude_terra', 'true');
  }

  try {
    const res = await fetch(`${API_BASE_URL}/sensor-transition?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { ...data, is_synthetic: false };
  } catch (err) {
    throw new Error(`Failed to load sensor transition data from ${API_BASE_URL}: ${err.message}`);
  }
}

/**
 * Fetch reliability scorecard and checks
 * GET /reliability
 */
export async function fetchReliability(bbox, startDate = '2000-01', endDate = '2026-11', forceMock = false) {
  if (forceMock) {
    return generateMockReliability(bbox, startDate, endDate);
  }

  const query = buildBboxQuery(bbox);
  query.append('start_date', startDate);
  query.append('end_date', endDate);

  try {
    const res = await fetch(`${API_BASE_URL}/reliability?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { ...data, is_synthetic: false };
  } catch (err) {
    throw new Error(`Failed to load reliability data from ${API_BASE_URL}: ${err.message}`);
  }
}

/**
 * Download CSV export
 * GET /export
 */
export async function downloadExportCSV(bbox, startDate = '2000-01', endDate = '2026-11', forceMock = false) {
  if (forceMock) {
    const csvContent = generateMockCSV(bbox, startDate, endDate);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `firewatch_harmonized_data_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }

  const query = buildBboxQuery(bbox);
  query.append('start_date', startDate);
  query.append('end_date', endDate);

  try {
    const res = await fetch(`${API_BASE_URL}/export?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from header if present
    const disposition = res.headers.get('content-disposition');
    let filename = `firewatch_harmonized_data_${startDate}_${endDate}.csv`;
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    throw new Error(`Export failed: ${err.message}`);
  }
}
