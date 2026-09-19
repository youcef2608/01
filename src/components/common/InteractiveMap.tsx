import React, { useState, useRef } from 'react';
import { Call, LocationCoords } from '../../types';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers, AlertCircle, Compass } from 'lucide-react';

interface InteractiveMapProps {
  mode: 'picker' | 'heatmap' | 'radar';
  calls?: Call[];
  selectedLocation?: LocationCoords;
  onLocationSelect?: (location: LocationCoords) => void;
  userLocation?: { latitude: number; longitude: number };
  onCallClick?: (call: Call) => void;
  heightClass?: string;
  selectedCallId?: string;
}

// Coordinate bounds mapping to SVG viewBox
// Centered around Saudi Arabia (lat ~18 to ~30, lon ~36 to ~52)
const LAT_MIN = 17.0;
const LAT_MAX = 31.5;
const LON_MIN = 35.0;
const LON_MAX = 52.0;

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  mode,
  calls = [],
  selectedLocation,
  onLocationSelect,
  userLocation,
  onCallClick,
  heightClass = 'h-96',
  selectedCallId
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCall, setHoveredCall] = useState<Call | null>(null);

  // Convert GPS Coordinates to SVG percentages
  const projectCoords = (lat: number, lon: number) => {
    // Normalization with padding
    const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
    // Latitude is inverted in SVG (higher lat = lower Y)
    const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Convert SVG percentage back to GPS coordinates for picker
  const unprojectCoords = (xPercent: number, yPercent: number) => {
    const lon = LON_MIN + (xPercent / 100) * (LON_MAX - LON_MIN);
    const lat = LAT_MAX - (yPercent / 100) * (LAT_MAX - LAT_MIN);
    return { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)) };
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'picker' || !onLocationSelect) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - svgRect.left;
    const clickY = e.clientY - svgRect.top;

    const xPercent = (clickX / svgRect.width) * 100;
    const yPercent = (clickY / svgRect.height) * 100;

    const { lat, lon } = unprojectCoords(xPercent, yPercent);

    // Approximate city detection
    let city = 'الرياض';
    let region = 'منطقة الرياض';
    if (lon < 42 && lat < 23) {
      city = 'جدة';
      region = 'منطقة مكة المكرمة';
    } else if (lon > 48) {
      city = 'الدمام';
      region = 'المنطقة الشرقية';
    } else if (lon < 42 && lat > 23) {
      city = 'المدينة المنورة';
      region = 'منطقة المدينة المنورة';
    }

    onLocationSelect({
      latitude: lat,
      longitude: lon,
      placeName: `موقع محدد على الخريطة (${lat}, ${lon})`,
      city,
      region,
      approxAddress: `بالقرب من مركز ${city}`
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Group nearby calls to compute clusters for Heatmap
  const clusters = React.useMemo(() => {
    if (mode !== 'heatmap') return [];
    // Compute proximity clusters (calls within ~40km)
    const groups: { lat: number; lon: number; count: number; calls: Call[]; city: string }[] = [];
    calls.forEach(call => {
      let matched = false;
      for (const group of groups) {
        const dist = calculateDistanceKm(call.location.latitude, call.location.longitude, group.lat, group.lon);
        if (dist < 50) {
          group.count += 1;
          group.calls.push(call);
          matched = true;
          break;
        }
      }
      if (!matched) {
        groups.push({
          lat: call.location.latitude,
          lon: call.location.longitude,
          count: 1,
          calls: [call],
          city: call.location.city
        });
      }
    });
    return groups;
  }, [calls, mode]);

  return (
    <div
      className={`relative w-full ${heightClass} bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-inner select-none`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map Control Toolbar */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 bg-stone-950/80 backdrop-blur-md p-1.5 rounded-xl border border-stone-800 shadow-lg">
        <button
          type="button"
          onClick={() => setZoom(z => Math.min(3, z + 0.3))}
          className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          title="تكبير"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(z => Math.max(0.8, z - 0.3))}
          className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          title="تصغير"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
          title="إعادة ضبط الرؤية"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Map Mode Indicator */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-stone-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800 text-xs text-stone-300 font-medium">
        <Layers className="w-3.5 h-3.5 text-emerald-400" />
        {mode === 'picker' && <span>انقر على أي نقطة لتحديد موقع النداء بدقة</span>}
        {mode === 'heatmap' && (
          <div className="flex items-center gap-2">
            <span>خريطة الكثافة:</span>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> منخفض
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block ml-1" /> متوسط
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block ml-1 animate-pulse" /> كثافة مرتفعة
            </div>
          </div>
        )}
        {mode === 'radar' && <span>رادار النداءات المحيطة بك</span>}
      </div>

      {/* SVG Canvas with Interactive Transform */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-75"
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          transform: `scale(${zoom}) translate(${pan.x / (zoom * 4)}px, ${pan.y / (zoom * 4)}px)`
        }}
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
          </pattern>
          {/* Radial Gradient for Heatmap Hotspots */}
          <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.85)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 0.4)" />
            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
          </radialGradient>
          <radialGradient id="heatMedium" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245, 158, 11, 0.75)" />
            <stop offset="60%" stopColor="rgba(245, 158, 11, 0.3)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0)" />
          </radialGradient>
        </defs>

        {/* Map Background Grid */}
        <rect width="100" height="100" fill="#141413" />
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Simplified Geographic Contour of Arabian Peninsula */}
        <path
          d="M 10,25 Q 25,18 45,20 Q 65,22 88,32 Q 95,45 92,60 Q 82,75 65,85 Q 40,88 20,80 Q 8,65 10,40 Z"
          fill="#1c1b18"
          stroke="#2d2b26"
          strokeWidth="0.8"
        />

        {/* Major City Reference Dots */}
        {[
          { name: 'الرياض', lat: 24.7136, lon: 46.6753 },
          { name: 'جدة', lat: 21.5433, lon: 39.1728 },
          { name: 'الدمام', lat: 26.4207, lon: 50.0888 },
          { name: 'مكة المكرمة', lat: 21.3891, lon: 39.8579 },
          { name: 'المدينة المنورة', lat: 24.5247, lon: 39.5692 }
        ].map(city => {
          const pt = projectCoords(city.lat, city.lon);
          return (
            <g key={city.name} className="pointer-events-none opacity-40">
              <circle cx={pt.x} cy={pt.y} r="0.8" fill="#a8a29e" />
              <text x={pt.x + 1.2} y={pt.y + 0.8} fontSize="2" fill="#78716c" fontFamily="Cairo">
                {city.name}
              </text>
            </g>
          );
        })}

        {/* Heatmap Density Circles (MOUQE ATHAR) */}
        {mode === 'heatmap' &&
          clusters.map((cluster, i) => {
            const pt = projectCoords(cluster.lat, cluster.lon);
            const isHigh = cluster.count >= 2;
            const radius = Math.min(18, 8 + cluster.count * 3);
            return (
              <g key={`cluster-${i}`} className="cursor-pointer" onClick={() => onCallClick && onCallClick(cluster.calls[0])}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={radius}
                  fill={isHigh ? 'url(#heatHigh)' : 'url(#heatMedium)'}
                  className="transition-all duration-300 hover:opacity-90"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHigh ? 3 : 2}
                  fill={isHigh ? '#ef4444' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                />
                <text
                  x={pt.x}
                  y={pt.y + 0.7}
                  fontSize="2.2"
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                  fontFamily="Cairo"
                >
                  {cluster.count}
                </text>
              </g>
            );
          })}

        {/* User Location Marker (if available) */}
        {userLocation && (
          <g>
            {(() => {
              const uPt = projectCoords(userLocation.latitude, userLocation.longitude);
              return (
                <g className="cursor-pointer">
                  {/* Outer pulse */}
                  <circle cx={uPt.x} cy={uPt.y} r="4" fill="rgba(16, 185, 129, 0.2)" />
                  <circle cx={uPt.x} cy={uPt.y} r="1.5" fill="#10b981" stroke="#ffffff" strokeWidth="0.5" />
                  <text x={uPt.x} y={uPt.y - 2.5} fontSize="2.2" fontWeight="bold" fill="#34d399" textAnchor="middle" fontFamily="Cairo">
                    موقعك الحالي
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        {/* Call Pins (in Picker, Radar, or Single Details mode) */}
        {mode !== 'heatmap' &&
          calls.map(call => {
            const pt = projectCoords(call.location.latitude, call.location.longitude);
            const isUrgent = call.priority === 'urgent';
            const isSelected = selectedCallId === call.id;

            return (
              <g
                key={call.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onClick={e => {
                  e.stopPropagation();
                  onCallClick && onCallClick(call);
                }}
                onMouseEnter={() => setHoveredCall(call)}
                onMouseLeave={() => setHoveredCall(null)}
              >
                {/* Ping animation for urgent calls */}
                {isUrgent && (
                  <circle cx={pt.x} cy={pt.y} r="3" fill="none" stroke="#ef4444" strokeWidth="0.3" opacity="0.8" />
                )}

                {/* Main pin marker */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 2.5 : 1.8}
                  fill={isUrgent ? '#ef4444' : isSelected ? '#10b981' : '#3b82f6'}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />

                {/* Call icon or count */}
                <text
                  x={pt.x}
                  y={pt.y + 0.6}
                  fontSize="1.8"
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                  fontFamily="Cairo"
                >
                  {isUrgent ? '!' : '●'}
                </text>
              </g>
            );
          })}

        {/* Selected Location in Picker Mode */}
        {mode === 'picker' && selectedLocation && (
          <g>
            {(() => {
              const selPt = projectCoords(selectedLocation.latitude, selectedLocation.longitude);
              return (
                <g className="animate-bounce">
                  <circle cx={selPt.x} cy={selPt.y} r="3" fill="rgba(239, 68, 68, 0.3)" />
                  <circle cx={selPt.x} cy={selPt.y} r="1.8" fill="#ef4444" stroke="#ffffff" strokeWidth="0.6" />
                  <text x={selPt.x} y={selPt.y - 2.8} fontSize="2.5" fontWeight="bold" fill="#ef4444" textAnchor="middle" fontFamily="Cairo">
                    موقع النداء المعتمد
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Floating Call Tooltip on Hover */}
      {hoveredCall && (
        <div className="absolute bottom-3 left-3 z-30 max-w-xs bg-stone-900/95 backdrop-blur-md p-3 rounded-xl border border-stone-700 shadow-2xl text-xs text-stone-200">
          <div className="flex items-center gap-1.5 font-bold text-white mb-1">
            <span className={`w-2 h-2 rounded-full ${hoveredCall.priority === 'urgent' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="truncate">{hoveredCall.title}</span>
          </div>
          <div className="flex items-center justify-between text-stone-400 mt-1">
            <span>{hoveredCall.location.city} - {hoveredCall.location.placeName}</span>
            {userLocation && (
              <span className="text-emerald-400 font-bold">
                {formatDistance(calculateDistanceKm(userLocation.latitude, userLocation.longitude, hoveredCall.location.latitude, hoveredCall.location.longitude))}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Location Picker Status Footer */}
      {mode === 'picker' && selectedLocation && (
        <div className="absolute bottom-3 right-3 left-16 z-20 bg-stone-950/90 backdrop-blur-md px-3 py-2 rounded-xl border border-emerald-500/40 flex items-center justify-between text-xs text-stone-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate font-medium">{selectedLocation.placeName} ({selectedLocation.city})</span>
          </div>
          <span className="text-[11px] text-stone-400 shrink-0 font-mono">
            {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
};
