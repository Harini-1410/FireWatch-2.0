import { useEffect } from 'react';
import { PRESET_REGIONS } from '../services/mockData';

const DEFAULT_BBOX = PRESET_REGIONS[0].bbox; // Amazon Basin default
const DEFAULT_START_DATE = '2000-01';
const DEFAULT_END_DATE = '2026-11';
const DEFAULT_LAYER = 'dark';

/**
 * Validates bounding box: [minLat, minLon, maxLat, maxLon]
 */
function isValidBbox(bbox) {
  if (!Array.isArray(bbox) || bbox.length !== 4) return false;
  const [minLat, minLon, maxLat, maxLon] = bbox;
  if (isNaN(minLat) || isNaN(minLon) || isNaN(maxLat) || isNaN(maxLon)) return false;
  if (minLat < -90 || minLat > 90 || maxLat < -90 || maxLat > 90) return false;
  if (minLon < -180 || minLon > 180 || maxLon < -180 || maxLon > 180) return false;
  if (minLat >= maxLat) return false;
  return true;
}

/**
 * Validates YYYY-MM date string
 */
function isValidDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const match = dateStr.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  return year >= 2000 && year <= 2030;
}

/**
 * Read initial state from URL query parameters
 */
export function getInitialUrlState() {
  if (typeof window === 'undefined') {
    return {
      bbox: DEFAULT_BBOX,
      startDate: DEFAULT_START_DATE,
      endDate: DEFAULT_END_DATE,
      activeLayer: DEFAULT_LAYER,
      selectedRegionId: 'amazon'
    };
  }

  const params = new URLSearchParams(window.location.search);
  
  // Parse bbox
  let bbox = DEFAULT_BBOX;
  const bboxParam = params.get('bbox');
  if (bboxParam) {
    const parts = bboxParam.split(',').map(s => parseFloat(s.trim()));
    if (isValidBbox(parts)) {
      bbox = parts;
    }
  }

  // Parse dates
  let startDate = DEFAULT_START_DATE;
  const startParam = params.get('start');
  if (startParam && isValidDate(startParam)) {
    startDate = startParam;
  }

  let endDate = DEFAULT_END_DATE;
  const endParam = params.get('end');
  if (endParam && isValidDate(endParam)) {
    endDate = endParam;
  }

  // Ensure start <= end
  if (startDate > endDate) {
    startDate = DEFAULT_START_DATE;
    endDate = DEFAULT_END_DATE;
  }

  // Parse layer
  let activeLayer = DEFAULT_LAYER;
  const layerParam = params.get('layer');
  if (layerParam && ['dark', 'satellite', 'light'].includes(layerParam)) {
    activeLayer = layerParam;
  }

  // Parse region id
  let selectedRegionId = params.get('region') || 'amazon';

  return {
    bbox,
    startDate,
    endDate,
    activeLayer,
    selectedRegionId
  };
}

/**
 * Hook to synchronize state to URL query parameters
 */
export function useUrlState({ bbox, startDate, endDate, activeLayer, selectedRegionId }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (bbox && bbox.length === 4) {
      params.set('bbox', bbox.map(n => Number(n).toFixed(2)).join(','));
    }
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (activeLayer) params.set('layer', activeLayer);
    if (selectedRegionId) params.set('region', selectedRegionId);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [bbox, startDate, endDate, activeLayer, selectedRegionId]);
}
