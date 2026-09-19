import React, { useState, useMemo } from 'react';
import { Call, CallCategory, CallStatus, CallPriority } from '../../types';
import { 
  Radio, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flame, 
  Eye, 
  MessageSquare,
  ChevronLeft,
  XCircle,
  Sparkles,
  LayoutGrid,
  List,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface WebDashboardProps {
  calls: Call[];
  onOpenCreateCall: () => void;
  onOpenHeatmap: () => void;
  onSelectCall: (call: Call) => void;
  onOpenResponses: (call: Call) => void;
  onUpdateCallStatus: (callId: string, status: CallStatus) => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({
  calls,
  onOpenCreateCall,
  onOpenHeatmap,
  onSelectCall,
  onOpenResponses,
  onUpdateCallStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Computed KPIs
  const stats = useMemo(() => {
    const total = calls.length;
    const active = calls.filter(c => c.status === 'active' || c.status === 'receiving_responses').length;
    const urgent = calls.filter(c => c.priority === 'urgent' && c.status !== 'closed').length;
    const totalResponses = calls.reduce((acc, c) => acc + c.responsesCount, 0);
    const confirmedResponders = calls.reduce((acc, c) => acc + c.confirmedCount, 0);

    return { total, active, urgent, totalResponses, confirmedResponders };
  }, [calls]);

  // Filtered Calls List
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = call.title.toLowerCase().includes(q);
        const matchesDesc = call.description.toLowerCase().includes(q);
        const matchesCity = call.location.city.toLowerCase().includes(q);
        const matchesPlace = call.location.placeName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesPlace) return false;
      }
      if (selectedCategory !== 'all' && call.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && call.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && call.priority !== selectedPriority) return false;
      return true;
    });
  }, [calls, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  return (
    <div className="space-y-6 text-right">
      {/* Editorial Overview Bar */}
      <div className="bg-[#171a21] border border-[#252932] rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 tracking-wider">
              غرفة عمليات واستجابة نداءات أثر
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            متابعة النداءات الميدانية والتنسيق اللوجستي
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            منظومة رقمية تتيح لمنظمي المبادرات الإنسانية والمجتمعية إطلاق النداءات، رصد كثافة الاحتياج الجغرافي، وإدارة استجابات المتطوعين في الوقت الفعلي.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHeatmap}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#20242e] hover:bg-[#282d3a] text-red-300 border border-[#2d3240] text-xs font-bold transition-all"
          >
            <Flame className="w-4 h-4 text-red-400" />
            <span>خريطة الكثافة الميدانية</span>
          </button>

          <button
            type="button"
            onClick={onOpenCreateCall}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء نداء جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400 font-medium">النداءات النشطة</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.active}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">من أصل {stats.total} نداء مسجل</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400 font-medium">النداءات العاجلة</div>
            <div className="text-2xl font-extrabold text-red-400 mt-1">{stats.urgent}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">أولوية طارئة للميدان</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400 font-medium">الردود الميدانية</div>
            <div className="text-2xl font-extrabold text-sky-400 mt-1">{stats.totalResponses}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">استجابة من المتطوعين</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400 font-medium">المتطوعون المؤكدون</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats.confirmedResponders}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">جاهزون ميدانياً للتحرك</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="bg-[#171a21] border border-[#252932] p-4 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث في عناوين النداءات، المدن، الأحياء، أو تفاصيل الاحتياج..."
            className="w-full bg-[#121419] border border-[#262a33] rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#121419] border border-[#262a33] rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع التصنيفات</option>
            <option value="relief">إغاثي وإنساني</option>
            <option value="environment">بيئي وتشجير</option>
            <option value="health">صحي وطبي</option>
            <option value="tech">تقني ورقمي</option>
            <option value="help">مساعدة عامة</option>
          </select>

          {/* Priority */}
          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            className="bg-[#121419] border border-[#262a33] rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع الأولويات</option>
            <option value="urgent">عاجل وطارئ</option>
            <option value="high">مرتفع</option>
            <option value="normal">عادي</option>
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-[#121419] border border-[#262a33] rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="closed">مغلق</option>
          </select>

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-[#121419] border border-[#262a33] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewLayout === 'grid' ? 'bg-[#252a34] text-white' : 'text-stone-500 hover:text-stone-300'
              }`}
              title="عرض البطاقات"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewLayout('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewLayout === 'table' ? 'bg-[#252a34] text-white' : 'text-stone-500 hover:text-stone-300'
              }`}
              title="عرض الجدول"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calls Content (Grid or Table) */}
      {filteredCalls.length === 0 ? (
        <div className="bg-[#171a21] border border-[#252932] rounded-3xl p-16 text-center text-stone-500 space-y-3">
          <Radio className="w-12 h-12 mx-auto text-stone-700" />
          <div className="text-base font-bold text-stone-300">لم يتم العثور على نداءات مطابقة</div>
          <p className="text-xs text-stone-500">جرب تعديل معايير البحث أو تصفية الفئات.</p>
        </div>
      ) : viewLayout === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCalls.map(call => (
            <div
              key={call.id}
              className="bg-[#171a21] border border-[#252932] hover:border-[#343b47] rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 hover:-translate-y-0.5 shadow-sm group"
            >
              {/* Header & Badges */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    call.priority === 'urgent'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : call.priority === 'high'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-[#1e222b] text-stone-300'
                  }`}>
                    {call.priority === 'urgent' ? '🚨 طارئ عاجل' : call.priority === 'high' ? 'أولوية مرتفعة' : 'اعتيادي'}
                  </span>

                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {call.location.city}
                  </span>
                </div>

                {/* Title */}
                <h3 
                  onClick={() => onSelectCall(call)}
                  className="font-bold text-white text-base leading-snug line-clamp-2 cursor-pointer hover:text-emerald-400 transition-colors"
                >
                  {call.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {call.description}
                </p>

                {/* Location details */}
                <div className="flex items-center gap-1.5 text-xs text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate font-medium">{call.location.placeName}</span>
                </div>

                {/* Skills tags */}
                {call.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {call.requiredSkills.slice(0, 3).map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded-md text-[10px] bg-[#20242e] text-stone-300 border border-[#2b303d]">
                        {skill}
                      </span>
                    ))}
                    {call.requiredSkills.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-stone-500">
                        +{call.requiredSkills.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#222630] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onOpenResponses(call)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-bold transition-colors text-[11px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>الردود: {call.responsesCount}</span>
                  </button>

                  <span className="text-[11px] text-stone-400">
                    المؤكد: <strong className="text-emerald-400 font-mono">{call.confirmedCount}</strong> / {call.requiredCount || 5}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectCall(call)}
                    className="flex-1 py-2 rounded-xl bg-[#20242e] hover:bg-[#282d3a] text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-stone-400" />
                    <span>عرض التفاصيل</span>
                  </button>

                  <select
                    value={call.status}
                    onChange={e => onUpdateCallStatus(call.id, e.target.value as CallStatus)}
                    className="bg-[#121419] border border-[#282c36] rounded-xl px-2.5 py-2 text-[11px] text-stone-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="active">نشط</option>
                    <option value="in_progress">قيد التنفيذ</option>
                    <option value="completed">مكتمل</option>
                    <option value="closed">إغلاق</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Executive Table View */
        <div className="bg-[#171a21] border border-[#252932] rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#121419] text-stone-400 border-b border-[#252932]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">النداء</th>
                  <th className="py-3.5 px-4 font-bold">المدينة والموقع</th>
                  <th className="py-3.5 px-4 font-bold">الأولوية</th>
                  <th className="py-3.5 px-4 font-bold">الحالة</th>
                  <th className="py-3.5 px-4 font-bold">المتطوعون</th>
                  <th className="py-3.5 px-4 font-bold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222630]">
                {filteredCalls.map(call => (
                  <tr key={call.id} className="hover:bg-[#1d212a] transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div 
                        onClick={() => onSelectCall(call)}
                        className="font-bold text-white hover:text-emerald-400 cursor-pointer line-clamp-1"
                      >
                        {call.title}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{call.creatorOrg || call.creatorName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-200">{call.location.city}</div>
                      <div className="text-[11px] text-stone-500">{call.location.placeName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        call.priority === 'urgent'
                          ? 'bg-red-500/20 text-red-400'
                          : call.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-stone-800 text-stone-300'
                      }`}>
                        {call.priority === 'urgent' ? 'عاجل' : call.priority === 'high' ? 'مرتفع' : 'عادي'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={call.status}
                        onChange={e => onUpdateCallStatus(call.id, e.target.value as CallStatus)}
                        className="bg-[#121419] border border-[#262a33] rounded-lg px-2 py-1 text-[11px] text-stone-300"
                      >
                        <option value="active">نشط</option>
                        <option value="in_progress">قيد التنفيذ</option>
                        <option value="completed">مكتمل</option>
                        <option value="closed">مغلق</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-emerald-400 font-bold">{call.confirmedCount}</span>
                      <span className="text-stone-500"> / {call.requiredCount || 5}</span>
                    </td>

                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenResponses(call)}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-[11px]"
                        >
                          الردود ({call.responsesCount})
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectCall(call)}
                          className="px-2.5 py-1 rounded-lg bg-[#252a34] hover:bg-[#303643] text-stone-200 font-bold text-[11px]"
                        >
                          تفاصيل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
