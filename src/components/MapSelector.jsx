import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Square, 
  MapPin, 
  Layers, 
  RotateCcw, 
  Crosshair,
  Info
} from 'lucide-react';
import { PRESET_REGIONS } from '../services/mockData';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapSelector({
  bbox,
  setBbox,
  selectedRegionId,
  setSelectedRegionId,
  activeLayer,
  setActiveLayer
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlayLayerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [selectionMode, setSelectionMode] = useState('none');
  const [dragStart, setDragStart] = useState(null);
  const [tempRect, setTempRect] = useState(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [-5.0, -60.0],
      zoom: 4,
      minZoom: 2,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Official Esri Dark Gray Base: free, clean GIS standard, zero watermarks
    const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: '&copy; Esri, DeLorme, NAVTEQ'
    }).addTo(map);

    tileLayerRef.current = tiles;
    overlayLayerRef.current = L.layerGroup().addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Handle container resize automatically
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer if activeLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    let maxZoom = 16;

    if (activeLayer === 'satellite') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 18;
    }

    tileLayerRef.current = L.tileLayer(newUrl, {
      maxZoom,
      attribution: '&copy; Esri'
    }).addTo(mapInstanceRef.current);
  }, [activeLayer]);

  // Update visual bounding box overlay whenever bbox state changes
  useEffect(() => {
    if (!mapInstanceRef.current || !overlayLayerRef.current) return;

    overlayLayerRef.current.clearLayers();

    if (bbox && bbox.length === 4) {
      const [minLat, minLon, maxLat, maxLon] = bbox;
      const bounds = [[minLat, minLon], [maxLat, maxLon]];

      // Outer bounding box polygon
      const rect = L.rectangle(bounds, {
        color: '#D7BDB0',
        weight: 2,
        fillColor: '#E3D5CA',
        fillOpacity: 0.18,
        dashArray: '4, 4'
      });

      overlayLayerRef.current.addLayer(rect);

      // Fit map view to newly chosen region smoothly
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 6,
        animate: true,
        duration: 0.6
      });
    }
  }, [bbox]);

  // Map interaction mode handlers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectionMode === 'box') {
      map.dragging.disable();
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = 'crosshair';
      }
    } else if (selectionMode === 'pin') {
      map.dragging.enable();
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = 'pointer';
      }
    } else {
      map.dragging.enable();
      if (mapContainerRef.current) {
        mapContainerRef.current.style.cursor = 'grab';
      }
    }

    const handleMapClick = (e) => {
      if (selectionMode === 'pin') {
        const { lat, lng } = e.latlng;
        const halfSpan = 2.5;
        const newBbox = [
          Number((lat - halfSpan).toFixed(2)),
          Number((lng - halfSpan).toFixed(2)),
          Number((lat + halfSpan).toFixed(2)),
          Number((lng + halfSpan).toFixed(2))
        ];

        if (markerLayerRef.current) {
          markerLayerRef.current.clearLayers();
          const marker = L.marker([lat, lng]).bindPopup(`Target Pin: [${lat.toFixed(2)}°, ${lng.toFixed(2)}°]`);
          markerLayerRef.current.addLayer(marker);
          marker.openPopup();
        }

        setSelectedRegionId('custom');
        setBbox(newBbox);
        setSelectionMode('none');
      }
    };

    const handleMouseDown = (e) => {
      if (selectionMode === 'box' && e.originalEvent.button === 0) {
        setDragStart(e.latlng);
        if (tempRect) {
          overlayLayerRef.current.removeLayer(tempRect);
          setTempRect(null);
        }
      }
    };

    const handleMouseMove = (e) => {
      if (selectionMode === 'box' && dragStart) {
        const bounds = L.latLngBounds(dragStart, e.latlng);
        if (!tempRect) {
          const rect = L.rectangle(bounds, {
            color: '#D7BDB0',
            weight: 2,
            dashArray: '4, 4',
            fillColor: '#E3D5CA',
            fillOpacity: 0.18
          });
          overlayLayerRef.current.addLayer(rect);
          setTempRect(rect);
        } else {
          tempRect.setBounds(bounds);
        }
      }
    };

    const handleMouseUp = (e) => {
      if (selectionMode === 'box' && dragStart) {
        const bounds = L.latLngBounds(dragStart, e.latlng);
        const south = Number(bounds.getSouth().toFixed(2));
        const west = Number(bounds.getWest().toFixed(2));
        const north = Number(bounds.getNorth().toFixed(2));
        const east = Number(bounds.getEast().toFixed(2));

        if (Math.abs(north - south) > 0.1 && Math.abs(east - west) > 0.1) {
          setSelectedRegionId('custom');
          setBbox([south, west, north, east]);
        }

        if (tempRect) {
          overlayLayerRef.current.removeLayer(tempRect);
          setTempRect(null);
        }
        setDragStart(null);
        setSelectionMode('none');
      }
    };

    map.on('click', handleMapClick);
    map.on('mousedown', handleMouseDown);
    map.on('mousemove', handleMouseMove);
    map.on('mouseup', handleMouseUp);

    return () => {
      map.off('click', handleMapClick);
      map.off('mousedown', handleMouseDown);
      map.off('mousemove', handleMouseMove);
      map.off('mouseup', handleMouseUp);
    };
  }, [selectionMode, dragStart, tempRect]);

  const handleReset = () => {
    const defaultPreset = PRESET_REGIONS[0];
    setSelectedRegionId(defaultPreset.id);
    setBbox(defaultPreset.bbox);
    if (markerLayerRef.current) markerLayerRef.current.clearLayers();
  };

  const [minLat, minLon, maxLat, maxLon] = bbox || [-15, -75, 5, -45];
  const approxCells = Math.round((Math.abs(maxLat - minLat) / 0.25) * (Math.abs(maxLon - minLon) / 0.25));

  return (
    <div className="glass-card dashboard-card p-5 sm:p-6 flex flex-col h-full overflow-hidden">
      
      {/* Card Header with Consistent Map Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--border-subtle)]">
        {/* M1: 20px left padding (and 16px top/bottom) to heading area only */}
        <div 
          className="flex items-center gap-2"
          style={{ paddingLeft: '20px', paddingTop: '16px', paddingBottom: '16px' }}
        >
          <Crosshair className="w-4 h-4 text-[var(--brand-highlight)]" />
          <h2 className="font-semibold text-sm text-[var(--text-primary)] tracking-wide">
            Geographical Area Selection
          </h2>
          <span className="text-xs font-mono text-[var(--text-dim)] hidden sm:inline">
            (~{approxCells} cells)
          </span>
        </div>

        {/* 1: Selection Tools (height: 36px, padding: 8px 16px, line-height: 1.2, centered vertically) */}
        <div className="flex items-center gap-2 text-xs font-mono flex-wrap self-center">
          <button
            type="button"
            onClick={() => setSelectionMode(selectionMode === 'box' ? 'none' : 'box')}
            className={`map-tool-button rounded-lg font-medium transition-all cursor-pointer border flex items-center justify-center text-center ${
              selectionMode === 'box'
                ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--border-accent)] font-semibold shadow-xs'
                : 'bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--border-accent)]'
            }`}
            style={{ height: '36px', padding: '8px 16px', lineHeight: '1.2', boxSizing: 'border-box' }}
            title="Click and drag on map to draw a custom bounding box"
          >
            Draw Box
          </button>

          <button
            type="button"
            onClick={() => setSelectionMode(selectionMode === 'pin' ? 'none' : 'pin')}
            className={`map-tool-button rounded-lg font-medium transition-all cursor-pointer border flex items-center justify-center text-center ${
              selectionMode === 'pin'
                ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border-[var(--border-accent)] font-semibold shadow-xs'
                : 'bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[var(--border-accent)]'
            }`}
            style={{ height: '36px', padding: '8px 16px', lineHeight: '1.2', boxSizing: 'border-box' }}
            title="Click on map to drop target pin"
          >
            Drop Pin
          </button>

          <button
            type="button"
            onClick={() => setActiveLayer(activeLayer === 'dark' ? 'satellite' : 'dark')}
            className="map-tool-button rounded-lg bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] font-medium cursor-pointer transition-all flex items-center justify-center text-center"
            style={{ height: '36px', padding: '8px 16px', lineHeight: '1.2', boxSizing: 'border-box' }}
            title="Toggle between dark canvas and satellite imagery"
          >
            {activeLayer === 'dark' ? 'Dark View' : 'Satellite'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-[var(--surface-secondary)] text-[var(--text-dim)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-accent)] cursor-pointer transition-all flex items-center justify-center"
            style={{ height: '36px', width: '36px', padding: '8px', boxSizing: 'border-box' }}
            title="Reset map view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative flex-1 min-h-[380px] w-full bg-[var(--map-bg)] rounded-xl overflow-hidden border border-[var(--border-subtle)]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        
        {/* Floating Bottom Bounding Box Indicator */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="glass-panel px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] flex items-center gap-2 shadow-lg">
            <span>Lat: <strong className="text-[var(--text-primary)]">{minLat.toFixed(2)}°</strong> to <strong className="text-[var(--text-primary)]">{maxLat.toFixed(2)}°</strong></span>
            <span className="text-[var(--text-dim)]">|</span>
            <span>Lon: <strong className="text-[var(--text-primary)]">{minLon.toFixed(2)}°</strong> to <strong className="text-[var(--text-primary)]">{maxLon.toFixed(2)}°</strong></span>
          </div>
        </div>

        {selectionMode !== 'none' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-4 py-1.5 rounded-full text-xs font-mono font-semibold shadow-md">
            {selectionMode === 'box' ? 'Click and drag on map to define area' : 'Click any point on map to drop pin'}
          </div>
        )}
      </div>
    </div>
  );
}
