import React, { useState, useMemo } from 'react';
import { ActivityEvaluation } from '../../../types';
import { 
  Search, 
  Plus, 
  Sparkles, 
  Building2, 
  Calendar, 
  BrainCircuit, 
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Server,
  Globe
} from 'lucide-react';

interface AnalysisSidebarProps {
  evaluations: ActivityEvaluation[];
  selectedEvaluation: ActivityEvaluation | null;
  onSelectEvaluation: (evaluation: ActivityEvaluation) => void;
  onOpenNewModal: () => void;
  aiStatus: {
    ready: boolean;
    model: string;
    hasKey: boolean;
  };
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const AnalysisSidebar: React.FC<AnalysisSidebarProps> = ({
  evaluations,
  selectedEvaluation,
  onSelectEvaluation,
  onOpenNewModal,
  aiStatus,
  isCollapsed,
  setIsCollapsed
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssoc, setSelectedAssoc] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const uniqueAssociations = useMemo(() => {
    return Array.from(new Set(evaluations.map(e => e.associationName)));
  }, [evaluations]);

  const filteredEvaluations = useMemo(() => {
    return evaluations
      .filter(item => {
        const matchesSearch = 
          item.activityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.associationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.whatWentWell.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.challengesFaced.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAssoc = selectedAssoc === 'all' || item.associationName === selectedAssoc;
        return matchesSearch && matchesAssoc;
      })
      .sort((a, b) => {
        if (sortBy === 'score') {
          return (b.aiAnalysis?.readinessScore || 0) - (a.aiAnalysis?.readinessScore || 0);
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [evaluations, searchQuery, selectedAssoc, sortBy]);

  // Average readiness score across evaluations
  const avgScore = useMemo(() => {
    if (!evaluations.length) return 0;
    const total = evaluations.reduce((acc, curr) => acc + (curr.aiAnalysis?.readinessScore || 80), 0);
    return Math.round(total / evaluations.length);
  }, [evaluations]);

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-stone-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 flex flex-col items-center gap-4 shadow-2xl shrink-0 transition-all">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-all"
          title="فتح القائمة الجانبية للتحليلات"
        >
          <ChevronLeft className="w-5 h-5 text-purple-400" />
        </button>

        <button
          type="button"
          onClick={onOpenNewModal}
          className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40 transition-all hover:scale-105"
          title="إضافة نشاط وتحليل جديد"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="w-8 h-[1px] bg-white/10 my-1" />

        {/* Vertical miniature representations */}
        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto max-h-[500px] scrollbar-none py-1">
          {filteredEvaluations.map(ev => {
            const isSelected = selectedEvaluation?.id === ev.id;
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => onSelectEvaluation(ev)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all relative ${
                  isSelected 
                    ? 'bg-purple-600 text-white ring-2 ring-purple-400/50' 
                    : 'bg-white/5 hover:bg-white/10 text-stone-400'
                }`}
                title={`${ev.activityTitle} - ${ev.associationName}`}
              >
                {ev.aiAnalysis?.readinessScore || 85}%
                {isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-stone-950" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400" title="ذكاء اصطناعي حقيقي">
          <BrainCircuit className="w-5 h-5" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-96 bg-stone-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 shrink-0 transition-all">
      {/* Top Header with AI status & Collapse button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">قائمة تحليلات الأنشطة</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{aiStatus.model}</span>
              <span className="text-[10px] text-emerald-400 font-medium">مباشر</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenNewModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>نشاط جديد</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
            title="تصغير القائمة الجانبية"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Banner inside sidebar */}
      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-stone-950/50 border border-white/5 text-xs">
        <div>
          <span className="text-[11px] text-stone-400 block">إجمالي التحليلات</span>
          <span className="text-lg font-black text-white">{evaluations.length} نشاط</span>
        </div>
        <div>
          <span className="text-[11px] text-stone-400 block">متوسط الجاهزية</span>
          <span className="text-lg font-black text-emerald-400 font-mono">{avgScore}%</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم أو الجمعية أو التحدي..."
          className="w-full pl-3 pr-9 py-2.5 rounded-2xl bg-stone-950/60 border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
          >
            ×
          </button>
        )}
      </div>

      {/* Association Filter & Sort Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Association dropdown or pill filter */}
        <select
          value={selectedAssoc}
          onChange={e => setSelectedAssoc(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-xl bg-stone-950/60 border border-white/10 text-xs text-stone-300 focus:border-purple-500 focus:outline-none"
        >
          <option value="all">كافة الجمعيات ({evaluations.length})</option>
          {uniqueAssociations.map(assoc => (
            <option key={assoc} value={assoc}>
              {assoc}
            </option>
          ))}
        </select>

        {/* Sort toggle */}
        <button
          type="button"
          onClick={() => setSortBy(prev => prev === 'date' ? 'score' : 'date')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 text-xs font-medium transition-colors shrink-0"
          title={`الترتيب حسب: ${sortBy === 'date' ? 'التاريخ' : 'نسبة الجاهزية'}`}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
          <span>{sortBy === 'date' ? 'الأحدث' : 'الجاهزية'}</span>
        </button>
      </div>

      {/* List of Analysis Cards in Sidebar */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-stone-800">
        {filteredEvaluations.length === 0 ? (
          <div className="text-center py-10 text-stone-500 text-xs space-y-1">
            <p>لا توجد تحليلات مطابقة للبحث</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedAssoc('all'); }}
              className="text-purple-400 hover:underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          filteredEvaluations.map(ev => {
            const isSelected = selectedEvaluation?.id === ev.id;
            const score = ev.aiAnalysis?.readinessScore || 80;
            const scoreColor = score >= 85 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                               score >= 70 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                                             'text-red-400 bg-red-500/10 border-red-500/20';

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvaluation(ev)}
                className={`cursor-pointer rounded-2xl border p-3.5 space-y-2 transition-all group ${
                  isSelected
                    ? 'border-purple-500/70 bg-gradient-to-r from-purple-950/40 to-stone-900/90 shadow-lg shadow-purple-950/50'
                    : 'border-white/5 bg-stone-950/40 hover:bg-stone-950/70 hover:border-white/20'
                }`}
              >
                {/* Association & Readiness Score Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-purple-300 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-purple-400 shrink-0" />
                    <span className="truncate">{ev.associationName}</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded-lg border font-mono font-bold text-[10px] shrink-0 ${scoreColor}`}>
                    جاهزية {score}%
                  </span>
                </div>

                {/* Title */}
                <h4 className={`font-bold text-xs leading-snug transition-colors line-clamp-2 ${
                  isSelected ? 'text-white' : 'text-stone-200 group-hover:text-purple-200'
                }`}>
                  {ev.activityTitle}
                </h4>

                {/* Snippets of Success & Challenges */}
                <div className="space-y-1 text-[11px] text-stone-400">
                  <div className="flex items-start gap-1 line-clamp-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="truncate">{ev.whatWentWell}</span>
                  </div>
                  <div className="flex items-start gap-1 line-clamp-1">
                    <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                    <span className="truncate">{ev.challengesFaced}</span>
                  </div>
                </div>

                {/* Date and Arrow */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {ev.date}
                  </span>
                  <span className={`font-medium transition-colors ${isSelected ? 'text-purple-400' : 'text-stone-400'}`}>
                    {isSelected ? 'المحدد حالياً' : 'عرض التحليل ←'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dual-Tier Engine Status Indicator */}
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-400">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold" title="سجلات السيرفر المتاحة للمطابقة الفورية">
          <Server className="w-3 h-3" />
          <span>السيرفر: {evaluations.length} سجلات</span>
        </div>
        <div className="flex items-center gap-1 text-cyan-400 font-semibold" title="البحث عبر الإنترنت متاح إذا لم يتم العثور بالسيرفر">
          <Globe className="w-3 h-3" />
          <span>بحث الويب: جاهز</span>
        </div>
      </div>
    </aside>
  );
};
