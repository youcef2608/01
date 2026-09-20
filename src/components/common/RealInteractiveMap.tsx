import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Call, LocationCoords } from '../../types';
import { MapPin, ZoomIn, ZoomOut, Compass, Layers, Navigation, Moon, Sun, Map as MapIcon } from 'lucide-react';

interface RealInteractiveMapProps {
  mode: 'heatmap' | 'picker' | 'preview';
  calls?: Call[];
  selectedLocation?: LocationCoords;
  onLocationSelect?: (location: LocationCoords) => void;
  onCallClick?: (call: Call) => void;
  heightClass?: string;
  selectedCallId?: string;
  center?: [number, number];
  zoom?: number;
}

// Center of Algeria (covers the national territory cleanly)
const ALGERIA_CENTER: [number, number] = [32.5, 3.0];
const ALGERIA_DEFAULT_ZOOM = 5.5;

// Authenticated CARTO API Key stored and provided by server / env
const CARTO_API_KEY = (import.meta as any).env?.VITE_CARTO_API_KEY || '';

type MapTileStyle = 'carto_dark' | 'osm_dark' | 'osm_standard';

export const RealInteractiveMap: React.FC<RealInteractiveMapProps> = ({
  mode,
  calls = [],
  selectedLocation,
  onLocationSelect,
  onCallClick,
  heightClass = 'h-[520px]',
  selectedCallId,
  center = ALGERIA_CENTER,
  zoom = ALGERIA_DEFAULT_ZOOM
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  // Default to osm_dark: completely free, open-source, NO API KEY REQUIRED, zero watermark!
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('osm_dark');

  // Helper to switch or apply tile layer
  const applyTileLayer = (map: L.Map, style: MapTileStyle) => {
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
      currentTileLayerRef.current = null;
    }

    let layer: L.TileLayer;

    if (style === 'osm_dark') {
      // OpenStreetMap with dark CSS filter — 100% Free, NO API KEY REQUIRED, zero watermark!
      layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'dark-tiles-filter',
        attribution: '&copy; OpenStreetMap contributors'
      });
    } else if (style === 'osm_standard') {
      // Standard OpenStreetMap
      layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });
    } else {
      // CARTO Dark Matter with API Key
      layer = L.tileLayer(
        `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?api_key=${CARTO_API_KEY}`,
        {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; CARTO &copy; OpenStreetMap'
        }
      );
    }

    layer.addTo(map);
    currentTileLayerRef.current = layer;
  };

  // Toggle map style on user click
  const cycleMapStyle = () => {
    const nextStyle: MapTileStyle = 
      mapStyle === 'osm_dark' ? 'osm_standard' :
      mapStyle === 'osm_standard' ? 'carto_dark' : 'osm_dark';
    
    setMapStyle(nextStyle);
    if (mapInstanceRef.current) {
      applyTileLayer(mapInstanceRef.current, nextStyle);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialCenter: [number, number] = selectedLocation 
      ? [selectedLocation.latitude, selectedLocation.longitude] 
      : center;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: mode === 'picker' ? 9 : zoom,
      zoomControl: false,
      attributionControl: false
    });

    // Apply active tile layer
    applyTileLayer(map, mapStyle);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Handle map click for picker mode (free coordinate selection across Algeria)
    if (mode === 'picker') {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const roundedLat = Number(lat.toFixed(4));
        const roundedLng = Number(lng.toFixed(4));

        if (onLocationSelect) {
          onLocationSelect({
            latitude: roundedLat,
            longitude: roundedLng,
            placeName: `موقع ميداني (${roundedLat}، ${roundedLng})`,
            city: 'الجزائر',
            region: 'الجزائر',
            approxAddress: `إحداثيات GPS: ${roundedLat}, ${roundedLng}`
          });
        }
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mode]);

  // Update Markers or Picker Pin
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (mode === 'picker') {
      if (selectedLocation) {
        const customPickerIcon = L.divIcon({
          className: 'custom-picker-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 32px; height: 32px; background: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 20px; height: 20px; background: #10b981; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.5);"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([selectedLocation.latitude, selectedLocation.longitude], {
          icon: customPickerIcon,
          draggable: true
        }).addTo(markersLayer);

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          if (onLocationSelect) {
            onLocationSelect({
              ...selectedLocation,
              latitude: Number(pos.lat.toFixed(4)),
              longitude: Number(pos.lng.toFixed(4)),
              placeName: `موقع ميداني (${Number(pos.lat.toFixed(4))}، ${Number(pos.lng.toFixed(4))})`
            });
          }
        });

        pickerMarkerRef.current = marker;
      }
      return;
    }

    // Heatmap / Overview Mode: Render density clusters & call markers
    const densityGroups: { lat: number; lng: number; count: number; calls: Call[] }[] = [];
    calls.forEach(call => {
      let matched = false;
      for (const group of densityGroups) {
        const dist = Math.hypot(call.location.latitude - group.lat, call.location.longitude - group.lng);
        if (dist < 0.45) {
          group.count += 1;
          group.calls.push(call);
          matched = true;
          break;
        }
      }
      if (!matched) {
        densityGroups.push({
          lat: call.location.latitude,
          lng: call.location.longitude,
          count: 1,
          calls: [call]
        });
      }
    });

    densityGroups.forEach(group => {
      const radius = Math.min(46000, 18000 + group.count * 8000);
      const isHighUrgency = group.calls.some(c => c.priority === 'urgent');

      L.circle([group.lat, group.lng], {
        radius,
        color: isHighUrgency ? '#ef4444' : '#10b981',
        weight: 1.5,
        opacity: 0.7,
        fillColor: isHighUrgency ? '#ef4444' : '#10b981',
        fillOpacity: 0.14
      }).addTo(markersLayer);
    });

    // Individual Call Markers
    calls.forEach(call => {
      const isUrgent = call.priority === 'urgent';
      const isSelected = selectedCallId === call.id;

      const callMarkerIcon = L.divIcon({
        className: 'call-pin-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isUrgent ? '<div style="position: absolute; width: 28px; height: 28px; background: rgba(239, 68, 68, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="
              width: ${isSelected ? '24px' : '18px'};
              height: ${isSelected ? '24px' : '18px'};
              background: ${isUrgent ? '#ef4444' : isSelected ? '#38bdf8' : '#10b981'};
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              transition: all 0.2s ease;
            "></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([call.location.latitude, call.location.longitude], {
        icon: callMarkerIcon
      }).addTo(markersLayer);

      marker.on('click', () => {
        setSelectedCall(call);
        if (onCallClick) onCallClick(call);
      });
    });
  }, [calls, selectedLocation, selectedCallId, mode, onLocationSelect, onCallClick]);

  // Center full Algeria view
  const handleResetZoomToAlgeria = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(ALGERIA_CENTER, ALGERIA_DEFAULT_ZOOM, {
        animate: true
      });
    }
  };

  // GPS Locate current position (smooth fallback, no alert popups)
  const handleLocateGPS = () => {
    setIsLocatingGPS(true);

    const applyLocation = (lat: number, lng: number, label: string) => {
      setIsLocatingGPS(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 13, { animate: true });
      }
      if (mode === 'picker' && onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          placeName: label,
          city: 'الجزائر',
          region: 'الجزائر',
          approxAddress: `إحداثيات GPS: ${lat}, ${lng}`
        });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          applyLocation(lat, lng, `موقعي الحالي عبر GPS (${lat}، ${lng})`);
        },
        (err) => {
          console.warn('GPS Notice (applying Algeria coordinate fallback):', err);
          applyLocation(36.7538, 3.0588, 'الجزائر العاصمة (36.7538، 3.0588)');
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } else {
      applyLocation(36.7538, 3.0588, 'الجزائر العاصمة (36.7538، 3.0588)');
    }
  };

  const styleLabel = 
    mapStyle === 'carto_dark' ? 'خريطة CARTO الداكنة' :
    mapStyle === 'osm_dark' ? 'خريطة OSM الليلية' : 'خريطة OSM القياسية';

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-stone-800 shadow-xl bg-[#0e1117]`}>
      {/* Real Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header Info */}
      <div className="absolute top-3 right-3 z-10 flex flex-wrap items-center gap-2.5 bg-[#12161f]/90 backdrop-blur-md border border-stone-800 px-3.5 py-1.5 rounded-xl text-xs text-stone-200 shadow-lg">
        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
          <Layers className="w-3.5 h-3.5" />
          <span>خريطة الاستجابة الميدانية</span>
        </span>
        <span className="text-stone-600">•</span>
        <div className="flex items-center gap-2 text-[11px] text-stone-300">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          <span>عاجل ({calls.filter(c => c.priority === 'urgent').length})</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          <span>نشط ({calls.filter(c => c.status === 'active' || c.status === 'receiving_responses').length})</span>
        </div>
      </div>

      {/* Map Control Actions */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 bg-[#12161f]/90 backdrop-blur-md border border-stone-800 p-1.5 rounded-xl shadow-lg">
        {/* Style switcher toggle */}
        <button
          type="button"
          onClick={cycleMapStyle}
          className="p-2 text-stone-300 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center relative group"
          title={`تبديل نمط الخريطة (النمط الحالي: ${styleLabel})`}
        >
          {mapStyle === 'carto_dark' ? (
            <Moon className="w-4 h-4 text-emerald-400" />
          ) : mapStyle === 'osm_dark' ? (
            <MapIcon className="w-4 h-4 text-cyan-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
          <span className="absolute left-full mr-2 ml-2 px-2 py-1 bg-stone-900 border border-stone-700 text-stone-200 text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {styleLabel} (انقر للتبديل)
          </span>
        </button>

        {/* GPS Locate */}
        <button
          type="button"
          onClick={handleLocateGPS}
          disabled={isLocatingGPS}
          className="p-2 text-stone-300 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center relative group"
          title="تحديد موقعي الدقيق عبر GPS"
        >
          <Navigation className={`w-4 h-4 ${isLocatingGPS ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="absolute left-full mr-2 ml-2 px-2 py-1 bg-stone-900 border border-stone-700 text-stone-200 text-[10px] rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            تحديد موقعي عبر GPS
          </span>
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-2 text-stone-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="تكبير"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 text-stone-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          title="تصغير"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset View */}
        <button
          type="button"
          onClick={handleResetZoomToAlgeria}
          className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors flex items-center justify-center"
          title="كامل خريطة الجزائر"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Call Floating Detail Card */}
      {selectedCall && mode !== 'picker' && (
        <div className="absolute bottom-3 left-3 z-20 max-w-sm bg-[#12161f]/95 backdrop-blur-md border border-stone-700 p-4 rounded-2xl shadow-2xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-white text-sm leading-snug">
              {selectedCall.title}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedCall(null)}
              className="text-stone-400 hover:text-white text-sm leading-none p-1 rounded hover:bg-white/10"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-stone-300 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{selectedCall.location.placeName}</span>
          </div>
          <p className="text-stone-400 line-clamp-2 leading-relaxed">
            {selectedCall.description}
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-stone-800">
            <span className="text-emerald-400 font-bold text-[11px]">
              مطلوب {selectedCall.requiredCount || 5} متطوعين
            </span>
            <button
              type="button"
              onClick={() => onCallClick && onCallClick(selectedCall)}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-colors"
            >
              عرض التفاصيل
            </button>
          </div>
        </div>
      )}

      {/* Picker Mode Instruction / Current Target */}
      {mode === 'picker' && selectedLocation && (
        <div className="absolute bottom-3 right-3 z-10 bg-[#12161f]/95 backdrop-blur-md border border-emerald-500/40 px-4 py-2 rounded-xl text-xs text-stone-200 flex items-center gap-2.5 shadow-lg">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">{selectedLocation.placeName}</span>
            <span className="text-[10px] text-stone-400 font-mono">
              {selectedLocation.latitude.toFixed(4)}، {selectedLocation.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
