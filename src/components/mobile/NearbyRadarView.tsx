import React, { useState, useMemo } from 'react';
import { Call, UserProfile } from '../../types';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { 
  Navigation, 
  MapPin, 
  Sparkles, 
  Search, 
  Filter, 
  Clock, 
  Flame, 
  ChevronLeft, 
  Bookmark, 
  BookmarkCheck,
  AlertTriangle,
  Compass
} from 'lucide-react';

interface NearbyRadarViewProps {
  calls: Call[];
  user: UserProfile;
  onSelectCall: (call: Call) => void;
  onToggleSaveCall: (callId: string) => void;
}

export const NearbyRadarView: React.FC<NearbyRadarViewProps> = ({
  calls,
  user,
  onSelectCall,
  onToggleSaveCall
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'nearby' | 'recommended'>('nearby');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compute distance and match score for each call
  const processedCalls = useMemo(() => {
    return calls
      .map(call => {
        const distanceKm = calculateDistanceKm(
          user.location.latitude,
          user.location.longitude,
          call.location.latitude,
          call.location.longitude
        );

        // Compute match score based on user skills & interests
        let matchScore = 0;
        const matchingSkills = call.requiredSkills.filter(sk => user.skills.includes(sk));
        matchScore += matchingSkills.length * 30;

        if (user.interests.some(int => call.category.includes('help') && int.includes('إغاثة'))) {
          matchScore += 25;
        }
        if (call.priority === 'urgent') {
          matchScore += 15;
        }
        // Closeness bonus
        if (distanceKm < 5) matchScore += 20;

        return {
          ...call,
          distanceKm,
          matchScore: Math.min(99, Math.max(35, matchScore)),
          isSaved: user.savedCallIds.includes(call.id)
        };
      })
      .filter(call => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            call.title.toLowerCase().includes(q) ||
            call.description.toLowerCase().includes(q) ||
            call.location.placeName.toLowerCase().includes(q);
          if (!matches) return false;
        }

        if (selectedFilter === 'urgent') return call.priority === 'urgent';
        if (selectedFilter === 'saved') return call.isSaved;
        if (selectedFilter !== 'all') return call.category === selectedFilter;
        return true;
      })
      .sort((a, b) => {
        if (activeSubTab === 'nearby') {
          return a.distanceKm - b.distanceKm;
        } else {
          return b.matchScore - a.matchScore;
        }
      });
  }, [calls, user, activeSubTab, selectedFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-20">
      {/* Search & Location Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-stone-950/70 px-3.5 py-2 rounded-2xl border border-stone-800 text-xs">
          <div className="flex items-center gap-2 text-stone-300">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">
              نطاق رادارك: <strong className="text-white">{user.location.city}</strong> (حتى {user.location.maxRadiusKm} كم)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            GPS نشط
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في النداءات القريبة أو المهارات..."
            className="w-full bg-stone-950 border border-stone-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Sub Tabs: الأقرب إليك vs مقترحة لك */}
      <div className="grid grid-cols-2 bg-stone-950 p-1 rounded-2xl border border-stone-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('nearby')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'nearby'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>الأقرب إليك (جغرافياً)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('recommended')}
          className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'recommended'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>مقترحة لمهاراتك</span>
        </button>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'urgent', label: '🔴 عاجل جداً' },
          { id: 'help', label: 'مساعدة وإغاثة' },
          { id: 'volunteer', label: 'تطوع' },
          { id: 'tech', label: 'تقنية' },
          { id: 'education', label: 'تعليم' },
          { id: 'saved', label: 'المحفوظات' }
        ].map(chip => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setSelectedFilter(chip.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl transition-all ${
              selectedFilter === chip.id
                ? 'bg-stone-800 text-white border border-stone-700 font-bold'
                : 'bg-stone-950 text-stone-400 border border-stone-800/80 hover:bg-stone-900'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Calls Feed */}
      <div className="space-y-3">
        {processedCalls.length === 0 ? (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <Compass className="w-10 h-10 text-stone-600 mx-auto" />
            <div className="text-sm font-semibold text-stone-300">لا توجد نداءات قريبة مطابقة</div>
            <p className="text-xs text-stone-500">جرب توسيع نطاق المسافة أو تغيير الفلتر.</p>
          </div>
        ) : (
          processedCalls.map(call => {
            const isUltraClose = call.distanceKm < 3;
            const isUrgent = call.priority === 'urgent';

            return (
              <div
                key={call.id}
                onClick={() => onSelectCall(call)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden text-right ${
                  isUrgent
                    ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/50'
                    : 'bg-stone-950/80 border-stone-800/90 hover:border-stone-700'
                }`}
              >
                {/* Distance & Matching Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Distance Pill */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                      isUltraClose
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        : 'bg-stone-800 text-stone-300 border border-stone-700'
                    }`}>
                      <Navigation className="w-3 h-3 text-emerald-400" />
                      <span>{formatDistance(call.distanceKm)}</span>
                      {isUltraClose && <span className="text-[10px] text-emerald-300 mr-1">(قريب جداً)</span>}
                    </span>

                    {/* Match Score Badge */}
                    {activeSubTab === 'recommended' && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                        {call.matchScore}% ملاءمة
                      </span>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onToggleSaveCall(call.id);
                    }}
                    className="p-1.5 text-stone-400 hover:text-amber-400 rounded-lg transition-colors"
                  >
                    {call.isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Call Title */}
                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                  {call.title}
                </h4>

                {/* Call Description */}
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed mb-3">
                  {call.description}
                </p>

                {/* Place & Stats Footer */}
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800/80">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="truncate">{call.location.placeName}</span>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                    <span>عرض والاستجابة</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
