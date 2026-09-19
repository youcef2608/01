import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Call, LocationCoords } from '../../types';
import { MapPin, ZoomIn, ZoomOut, Compass, Layers, Flame, Eye } from 'lucide-react';

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
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

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

    // Dark sleek high-contrast map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Handle map click for picker mode (no wilaya lock - picks exact coordinate in Algeria)
    if (mode === 'picker') {
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const roundedLat = Number(lat.toFixed(4));
        const roundedLng = Number(lng.toFixed(4));

        if (onLocationSelect) {
          onLocationSelect({
            latitude: roundedLat,
            longitude: roundedLng,
            placeName: `مكان عادي (${roundedLat}، ${roundedLng})`,
            city: 'الجزائر',
            region: 'الجزائر',
            approxAddress: `إحداثيات جغرافية حرة: ${roundedLat}, ${roundedLng}`
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
              <div style="position: absolute; width: 34px; height: 34px; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 22px; height: 22px; background: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 16px rgba(16,185,129,0.9);"></div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
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
              placeName: `مكان عادي (${Number(pos.lat.toFixed(4))}، ${Number(pos.lng.toFixed(4))})`
            });
          }
        });

        pickerMarkerRef.current = marker;
      }
      return;
    }

    // Heatmap / Overview Mode: Render real density circles + call pins
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

    // Draw Heatmap Density Circles
    densityGroups.forEach(group => {
      const isDense = group.count >= 2;
      const radiusMeters = 8000 + group.count * 5000;

      L.circle([group.lat, group.lng], {
        radius: radiusMeters,
        color: isDense ? '#ef4444' : '#10b981',
        fillColor: isDense ? '#ef4444' : '#10b981',
        fillOpacity: isDense ? 0.22 : 0.12,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(markersLayer);
    });

    // Draw Call Pins
    calls.forEach(call => {
      const isUrgent = call.priority === 'urgent';
      const isSelected = selectedCallId === call.id;

      const markerHtml = `
        <div style="cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; transform: scale(${isSelected ? '1.3' : '1'}); transition: transform 0.2s ease;">
          ${isUrgent ? `<div style="position: absolute; width: 30px; height: 30px; background: rgba(239, 68, 68, 0.45); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="width: 22px; height: 22px; background: ${isUrgent ? '#ef4444' : isSelected ? '#10b981' : '#059669'}; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
            ${isUrgent ? '!' : '●'}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-call-marker',
        html: markerHtml,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([call.location.latitude, call.location.longitude], { icon });

      marker.on('click', () => {
        setSelectedCall(call);
        if (onCallClick) {
          onCallClick(call);
        }
      });

      marker.addTo(markersLayer);
    });
  }, [calls, selectedLocation, selectedCallId, mode]);

  const handleResetZoomToAlgeria = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(ALGERIA_CENTER, ALGERIA_DEFAULT_ZOOM, { duration: 1.2 });
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#090b0e]`}>
      {/* Real Map Leaflet Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header Badge */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center gap-2 bg-stone-950/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-2xl text-xs text-stone-200 shadow-xl">
        <span className="flex items-center gap-1.5 font-bold text-emerald-400">
          <Layers className="w-4 h-4" />
          <span>خريطة الجزائر التفاعلية</span>
        </span>
        <span className="text-stone-600">•</span>
        <div className="flex items-center gap-2 text-[11px] text-stone-300">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span>عاجل ({calls.filter(c => c.priority === 'urgent').length})</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          <span>نشط ({calls.filter(c => c.status === 'active').length})</span>
        </div>
      </div>

      {/* Zoom & Full View Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 bg-stone-950/85 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-xl">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="تكبير"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="تصغير"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoomToAlgeria}
          className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-colors flex items-center justify-center"
          title="عرض كامل خريطة الجزائر"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Call Floating Detail Card */}
      {selectedCall && mode !== 'picker' && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-stone-950/95 backdrop-blur-2xl border border-emerald-500/30 p-4 rounded-3xl shadow-2xl text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">
              {selectedCall.title}
            </h4>
            <button
              type="button"
              onClick={() => setSelectedCall(null)}
              className="text-stone-400 hover:text-white text-base leading-none p-1 rounded-lg hover:bg-white/5"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-2 text-stone-300 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{selectedCall.location.placeName}</span>
          </div>
          <p className="text-stone-400 line-clamp-2 leading-relaxed">
            {selectedCall.description}
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <span className="text-emerald-400 font-semibold text-[11px]">
              مطلوب {selectedCall.requiredCount || 5} متطوعين
            </span>
            <button
              type="button"
              onClick={() => onCallClick && onCallClick(selectedCall)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors shadow-md"
            >
              عرض التفاصيل
            </button>
          </div>
        </div>
      )}

      {/* Picker Mode Instruction / Current Target */}
      {mode === 'picker' && selectedLocation && (
        <div className="absolute bottom-4 right-4 z-10 bg-stone-950/90 backdrop-blur-xl border border-emerald-500/40 px-4 py-2.5 rounded-2xl text-xs text-stone-200 flex items-center gap-3 shadow-xl">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
          <div>
            <span className="font-bold text-white block">{selectedLocation.placeName}</span>
            <span className="text-[11px] text-stone-400 font-mono">
              {selectedLocation.latitude.toFixed(4)}، {selectedLocation.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
