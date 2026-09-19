import React, { useState, useMemo } from 'react';
import { Call } from '../../types';
import { RealInteractiveMap } from '../common/RealInteractiveMap';
import { 
  Flame, 
  Filter, 
  MapPin, 
  Eye, 
  Layers,
  X,
  Compass,
  Radio,
  Clock,
  Users
} from 'lucide-react';

interface HeatmapPageProps {
  calls: Call[];
  onSelectCall: (call: Call) => void;
}

export const HeatmapPage: React.FC<HeatmapPageProps> = ({ calls, onSelectCall }) => {
  // Filters (Category and Priority only - no wilaya lock)
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  // Filter calls freely without wilaya restriction
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      if (selectedCategory !== 'all' && call.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && call.priority !== selectedPriority) return false;
      return true;
    });
  }, [calls, selectedCategory, selectedPriority]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header - Elevated styling */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-stone-900/80 via-[#0d131a]/80 to-stone-900/80 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shadow-sm">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>الخريطة الحية للميدان - الجزائر</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              خريطة المبادرات الميدانية في الجزائر
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
              تصفح كامل القطر الجزائري دون تقييد بولاية محددة، واستكشف بؤر النشاط المجتمعي والإغاثي وحجم الاحتياج الفعلي للاستجابة.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5 bg-stone-950/70 border border-white/10 px-4 py-3 rounded-2xl text-xs text-stone-300 shadow-xl backdrop-blur-xl">
            <div className="text-center px-2">
              <span className="text-stone-400 text-[10px] block font-semibold">إجمالي المبادرات</span>
              <span className="text-base font-black text-white">{calls.length}</span>
            </div>
            <span className="w-px h-7 bg-white/10" />
            <div className="text-center px-2">
              <span className="text-red-400 text-[10px] block font-semibold">حالات عاجلة</span>
              <span className="text-base font-black text-red-400">
                {calls.filter(c => c.priority === 'urgent').length}
              </span>
            </div>
            <span className="w-px h-7 bg-white/10" />
            <div className="text-center px-2">
              <span className="text-emerald-400 text-[10px] block font-semibold">نشطة حالياً</span>
              <span className="text-base font-black text-emerald-400">
                {calls.filter(c => c.status === 'active').length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter controls row */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-400 font-bold">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>تصفية الخريطة:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-stone-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-stone-200 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
          >
            <option value="all">كافة المجالات</option>
            <option value="help">إغاثة ومساعدة</option>
            <option value="volunteer">تطوع ميداني وبيئي</option>
            <option value="tech">رقمي وتقني</option>
            <option value="event">فعاليات وأنشطة</option>
          </select>

          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="bg-stone-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-stone-200 focus:outline-none focus:border-red-500 transition-colors shadow-inner"
          >
            <option value="all">كافة درجات الأولوية</option>
            <option value="urgent">عاجل وطارئ</option>
            <option value="high">أولوية مرتفعة</option>
            <option value="medium">أولوية متوسطة</option>
          </select>

          <div className="mr-auto flex items-center gap-2 text-[11px] text-stone-400">
            <span>الظاهر على الخريطة:</span>
            <strong className="text-white font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg">
              {filteredCalls.length} نداء
            </strong>
          </div>
        </div>
      </div>

      {/* Prominent Algeria Map (اجعل خريطة فقط) */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/40 backdrop-blur-xl p-3 sm:p-4 shadow-2xl relative">
        <RealInteractiveMap
          mode="heatmap"
          calls={filteredCalls}
          onCallClick={(call) => {
            setSelectedCall(call);
          }}
          heightClass="h-[620px]"
          selectedCallId={selectedCall?.id}
        />

        {/* Selected Call Detail Overlay Card */}
        {selectedCall && (
          <div className="mt-4 p-5 rounded-2xl bg-stone-950/90 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  selectedCall.priority === 'urgent' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {selectedCall.priority === 'urgent' ? 'عاجل' : 'نشط'}
                </span>
                <span className="text-stone-400 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {selectedCall.location.placeName}
                </span>
              </div>
              <h3 className="text-base font-black text-white">{selectedCall.title}</h3>
              <p className="text-xs text-stone-300 line-clamp-2">{selectedCall.description}</p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() => onSelectCall(selectedCall)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-colors shadow-lg"
              >
                فتح بطاقة النداء الكاملة
              </button>
              <button
                type="button"
                onClick={() => setSelectedCall(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
