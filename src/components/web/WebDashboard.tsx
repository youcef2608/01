import React, { useState, useMemo } from 'react';
import { Call, CallCategory, CallStatus, CallPriority, AuthUser } from '../../types';
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
  ShieldCheck, 
  Compass, 
  Database, 
  Smartphone, 
  Activity, 
  RefreshCw, 
  Share2, 
  Building,
  Trophy,
  Bot,
  Award,
  AlertTriangle,
  FileCheck,
  LogIn,
  FileText
} from 'lucide-react';

interface WebDashboardProps {
  calls: Call[];
  currentUser?: AuthUser | null;
  onOpenCreateCall: () => void;
  onOpenHeatmap: () => void;
  onOpenAiChat: () => void;
  onOpenLeaderboard: () => void;
  onOpenEvaluationReport: (call: Call) => void;
  onOpenSwitchAssociation?: () => void;
  onSelectCall: (call: Call) => void;
  onOpenResponses: (call: Call) => void;
  onUpdateCallStatus: (callId: string, status: CallStatus) => void;
  onRefresh?: () => void;
}

export const WebDashboard: React.FC<WebDashboardProps> = ({
  calls,
  currentUser,
  onOpenCreateCall,
  onOpenHeatmap,
  onOpenAiChat,
  onOpenLeaderboard,
  onOpenEvaluationReport,
  onOpenSwitchAssociation,
  onSelectCall,
  onOpenResponses,
  onUpdateCallStatus,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper: check if a call is expired or completed
  const isCallEnded = (call: Call): boolean => {
    if (call.status === 'completed' || call.status === 'closed') return true;
    if (call.endTime) {
      try {
        return new Date(call.endTime) < new Date();
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  // Calls requiring mandatory general report
  const pendingReportCalls = useMemo(() => {
    return calls.filter(c => isCallEnded(c) && !c.reportCompleted);
  }, [calls]);

  // Computed KPIs
  const stats = useMemo(() => {
    const total = calls.length;
    const active = calls.filter(c => c.status === 'active' || c.status === 'receiving_responses').length;
    const urgent = calls.filter(c => c.priority === 'urgent' && c.status !== 'closed').length;
    const totalResponses = calls.reduce((acc, c) => acc + (c.responsesCount || 0), 0);
    const confirmedResponders = calls.reduce((acc, c) => acc + (c.confirmedCount || 0), 0);
    const totalRequiredVolunteers = calls.reduce((acc, c) => acc + (c.requiredCount || 10), 0);
    const completedWithReports = calls.filter(c => c.reportCompleted).length;

    return { total, active, urgent, totalResponses, confirmedResponders, totalRequiredVolunteers, completedWithReports };
  }, [calls]);

  // Filtered Calls List
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = call.title.toLowerCase().includes(q);
        const matchesDesc = (call.description || '').toLowerCase().includes(q);
        const matchesCity = (call.location?.city || '').toLowerCase().includes(q);
        const matchesPlace = (call.location?.placeName || '').toLowerCase().includes(q);
        const matchesOrg = (call.creatorOrg || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCity && !matchesPlace && !matchesOrg) return false;
      }
      if (selectedCategory !== 'all' && call.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && call.status !== selectedStatus) return false;
      if (selectedPriority !== 'all' && call.priority !== selectedPriority) return false;
      return true;
    });
  }, [calls, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const associationDisplayName = currentUser?.associationName || currentUser?.name || 'جمعية وطنية معتمدة';
  const associationBadgeNumber = currentUser?.badgeNumber || 'DZ-ASSOC-NEW';
  const associationWilaya = currentUser?.wilaya || 'الجمهورية الجزائرية الديمقراطية الشعبية';

  return (
    <div className="space-y-6 text-right">
      {/* ===== HERO موحد: هوية الجمعية + غرفة العمليات ===== */}
      <div className="glow-hero animate-rise topline relative glass-card rounded-[2rem] p-6 sm:p-8 overflow-hidden border border-emerald-500/30">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/[0.14] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-10 w-72 h-72 bg-teal-500/[0.09] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0 shadow-lg shadow-emerald-950/50">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white">{associationDisplayName}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>اعتماد وطني موثق</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              إدارة العمليات الميدانية وتنسيق الفرق والمتطوعين
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Association switch button */}
          {onOpenSwitchAssociation && (
            <button
              type="button"
              onClick={onOpenSwitchAssociation}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#1c2230] hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
              title="تبديل الجمعية أو تسجيل الدخول باسم جمعية أخرى"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>تبديل الجمعية</span>
            </button>
          )}

          {/* Real-time sync indicator */}
          <div className="flex items-center gap-2.5 bg-[#171c26] border border-[#262f3f] px-3.5 py-2 rounded-2xl shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="text-[11px]">
              <span className="text-stone-300 font-semibold">المزامنة الميدانية المباشرة</span>
              <span className="block text-[10px] text-emerald-400 font-medium">متصل ومحدث آنياً</span>
            </div>
            <button
              type="button"
              onClick={handleManualRefresh}
              className={`p-1.5 rounded-lg hover:bg-stone-700/50 text-stone-400 hover:text-white transition-all ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
              title="تحديث البيانات فوراً"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        </div>

        {/* فاصل زجاجي */}
        <div className="relative z-10 my-6 h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />

        {/* الصف 2: العنوان الرئيسي + الإجراءات */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              <span className="text-white">متابعة النداءات الميدانية و</span>
              <span className="text-gradient">التنسيق اللوجستي للجمعيات</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              منظومة موحدة تتيح للجمعيات المعتمدة إطلاق نداءات الميدان، حشد متطوعي الولايات الـ 58، وتلقي استجابات تطبيق الجوال وملاحظات الميدان في الوقت الفعلي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenHeatmap}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1e2330] hover:bg-[#272e40] text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-sm"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>خريطة الجزائر التفاعلية</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateCall}
              className="sheen-btn flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-950/60 ring-1 ring-emerald-400/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ إنشاء نداء جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory General Evaluation Report Urgent Alert Banner */}
      {pendingReportCalls.length > 0 && (
        <div className="bg-gradient-to-r from-red-950/70 via-amber-950/50 to-[#1c1410] border-2 border-amber-500/60 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start sm:items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-red-500/30 text-red-300 font-extrabold text-[10px] border border-red-500/40 uppercase tracking-wider">
                  إجراء إجباري مطلوب
                </span>
                <h3 className="text-base sm:text-lg font-black text-amber-200">
                  تنبيه: يتوجب إيداع التقرير العام لـ ({pendingReportCalls.length}) مشروع/نداء منتهي المدة
                </h3>
              </div>
              <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
                انتهى التوقيت الميداني للمشروع: <strong className="text-amber-300">{pendingReportCalls[0].title}</strong>. يرجى توثيق أعداد المتطوعين، المستفيدين، والدروس المستفادة لاعتماد الأثر رسمياً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => onOpenEvaluationReport(pendingReportCalls[0])}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-950/50 hover:scale-105 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>إيداع التقرير الإجباري الآن ({pendingReportCalls.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 Core Destinations Centerpiece (إضافة نداء + AI + المتصدرين بين الجمعيات) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">
              بوابات العمليات الميدانية الكبرى للجمعية
            </h2>
          </div>
          <span className="text-[11px] text-stone-400 font-medium">الوجهات المباشرة لإدارة النداءات والتنافس الوطني</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Destination 1: إضافة نداء */}
          <div 
            onClick={onOpenCreateCall}
            className="glass-card group relative border border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-5 cursor-pointer shadow-lg hover:shadow-emerald-950/40 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/25 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/[0.06] rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  إطلاق فوري
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                  إضافة نداء ميداني
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  إنشاء نداء عاجل أو اعتيادي، تحديد عدد المتطوعين المطلوبين، واختيار الموقع الجغرافي على خريطة الجزائر.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-500/15 mt-4 flex items-center justify-between text-xs font-bold text-emerald-400 relative z-10">
              <span className="flex items-center gap-1">
                <span>+ فتح استمارة النداء</span>
              </span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Destination 2: مستشار الذكاء الاصطناعي (AI) */}
          <div 
            onClick={onOpenAiChat}
            className="glass-card group relative border border-purple-500/30 hover:border-purple-400 rounded-3xl p-5 cursor-pointer shadow-lg hover:shadow-purple-950/40 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/25 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/[0.06] rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                  مستشار AI
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                  مستشار الذكاء الاصطناعي (AI)
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  استشارة فورية حول كل ما يخص الميدان: تخطيط الحملات، صياغة النداءات، وتوزيع المهام اللوجستية للمتطوعين.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/15 mt-4 flex items-center justify-between text-xs font-bold text-purple-400 relative z-10">
              <span className="flex items-center gap-1">
                <span>بدء المحادثة والاستشارة</span>
              </span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Destination 3: المتصدرون بين الجمعيات */}
          <div 
            onClick={onOpenLeaderboard}
            className="glass-card group relative border border-amber-500/30 hover:border-amber-400 rounded-3xl p-5 cursor-pointer shadow-lg hover:shadow-amber-950/40 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/[0.06] rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  لوحة الشرف الوطنية
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  المتصدرون بين الجمعيات
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  تصنيف الجمعيات المعتمدة عبر 58 ولاية، نقاط الأثر، عدد النداءات المكتملة، والتقارير العامة المعتمدة.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-500/15 mt-4 flex items-center justify-between text-xs font-bold text-amber-400 relative z-10">
              <span className="flex items-center gap-1">
                <span>استعراض ترتيب الجمعيات</span>
              </span>
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card animate-rise group relative p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div>
            <div className="text-[11px] text-stone-400 font-medium">النداءات النشطة</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 animate-pop">{stats.active}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">من أصل {stats.total} نداء مسجل</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card animate-rise anim-delay-1 group relative p-5 rounded-2xl flex items-center justify-between hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all pointer-events-none" />
          <div>
            <div className="text-[11px] text-stone-400 font-medium">النداءات العاجلة</div>
            <div className="text-2xl font-extrabold text-red-400 mt-1 animate-pop">{stats.urgent}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">أولوية طارئة للميدان</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card animate-rise anim-delay-2 group relative p-5 rounded-2xl flex items-center justify-between hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />
          <div>
            <div className="text-[11px] text-stone-400 font-medium">الردود الميدانية</div>
            <div className="text-2xl font-extrabold text-sky-400 mt-1 animate-pop">{stats.totalResponses}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">استجابة من تطبيق الهاتف</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card animate-rise anim-delay-3 group relative p-5 rounded-2xl flex items-center justify-between hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div>
            <div className="text-[11px] text-stone-400 font-medium">المتطوعون المؤكدون</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1 animate-pop">{stats.confirmedResponders}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">من {stats.totalRequiredVolunteers} مطلوبين إجمالاً</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          type="button"
          onClick={() => { setSelectedCategory('all'); setSelectedPriority('all'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all' && selectedPriority === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-[#161a22] text-stone-400 hover:text-white border border-white/5'
          }`}
        >
          كل النداءات ({calls.length})
        </button>

        <button
          type="button"
          onClick={() => { setSelectedPriority('urgent'); setSelectedCategory('all'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedPriority === 'urgent'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-[#161a22] text-red-400 hover:bg-red-500/10 border border-red-500/20'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>النداءات العاجلة ({stats.urgent})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedCategory('help'); setSelectedPriority('all'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'help'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-[#161a22] text-stone-400 hover:text-white border border-white/5'
          }`}
        >
          إغاثة وسلال غذائية
        </button>

        <button
          type="button"
          onClick={() => { setSelectedCategory('volunteer'); setSelectedPriority('all'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'volunteer'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-[#161a22] text-stone-400 hover:text-white border border-white/5'
          }`}
        >
          تشجير وبيئة
        </button>

        <button
          type="button"
          onClick={() => { setSelectedCategory('community'); setSelectedPriority('all'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'community'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-[#161a22] text-stone-400 hover:text-white border border-white/5'
          }`}
        >
          قوافل صحية وطبية
        </button>

        <button
          type="button"
          onClick={() => { setSelectedCategory('tech'); setSelectedPriority('all'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'tech'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-[#161a22] text-stone-400 hover:text-white border border-white/5'
          }`}
        >
          تقني ورقمي
        </button>
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
            <option value="help">مساعدات وسلال غذائية</option>
            <option value="environment">بيئي وتشجير</option>
            <option value="volunteer">حملات تطوع ميدانية</option>
            <option value="health">صحي وطبي</option>
            <option value="community">مجتمعي وقوافل</option>
            <option value="tech">تقني ورقمي</option>
            <option value="education">تعليمي وتربوي</option>
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
            <option value="receiving_responses">يستقبل الردود</option>
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
      {calls.length === 0 ? (
        <div className="relative glass-card border border-emerald-500/30 rounded-[2.5rem] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            {/* Pulsing Satellite Radar Icon */}
            <div className="relative inline-flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-emerald-400 opacity-20" />
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/60">
                <Radio className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المنصة جاهزة • قاعدة البيانات فارغة ونظيفة</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                لا توجد نداءات ميدانية مسجلة حتى الآن
              </h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-lg mx-auto">
                قاعدة البيانات فارغة تماماً ومستعدة لاستقبال نداءاتكم الحقيقية. بصفتك جمعية معتمدة، يمكنك إطلاق أول نداء ميداني الآن، تحديد موقعه بالـ GPS، وبثه لمتطوعي الميدان.
              </p>
            </div>

            {/* Prominent CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenCreateCall}
                className="sheen-btn px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black shadow-xl shadow-emerald-950/70 ring-1 ring-emerald-400/40 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span>إطلاق أول نداء ميداني الآن ➔</span>
              </button>

              <button
                type="button"
                onClick={onOpenAiChat}
                className="px-5 py-3.5 rounded-2xl bg-[#171b26] hover:bg-[#1f2535] text-stone-300 hover:text-white border border-[#2b3548] text-xs font-bold transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>استشارة المساعد الذكي AI</span>
              </button>
            </div>

            {/* 3 Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 text-right border-t border-white/5">
              <div className="p-3.5 rounded-2xl bg-[#11141e]/80 border border-white/5 text-xs space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>تحديد دقيق بـ GPS</span>
                </span>
                <p className="text-[11px] text-stone-400 leading-relaxed">تثبيت الموقع الجغرافي مباشرة على الخريطة التفاعلية.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#11141e]/80 border border-white/5 text-xs space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>تصنيف تلقائي بالذكاء الاصطناعي</span>
                </span>
                <p className="text-[11px] text-stone-400 leading-relaxed">تحليل عنوان النداء واقتراح الفئة والمواصفات فوراً.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#11141e]/80 border border-white/5 text-xs space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>ربط بتطبيق المتطوعين</span>
                </span>
                <p className="text-[11px] text-stone-400 leading-relaxed">استقبال استجابات المتطوعين وملاحظات الميدان مباشرة.</p>
              </div>
            </div>
          </div>
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="bg-[#171a21] border border-[#252932] rounded-3xl p-16 text-center text-stone-500 space-y-3">
          <Radio className="w-12 h-12 mx-auto text-stone-700" />
          <div className="text-base font-bold text-stone-300">لم يتم العثور على نداءات مطابقة للتصفية</div>
          <p className="text-xs text-stone-500">جرب تعديل معايير البحث أو اختيار كل النداءات.</p>
        </div>
      ) : viewLayout === 'grid' ? (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCalls.map(call => {
            const reqCount = call.requiredCount || 10;
            const confCount = call.confirmedCount || 0;
            const progressPct = Math.min(100, Math.round((confCount / reqCount) * 100));
            const remainingSpots = Math.max(0, reqCount - confCount);

            return (
              <div
                key={call.id}
                className="glass-card border hover:border-emerald-500/40 rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all duration-300 hover:-translate-y-1 shadow-lg group relative overflow-hidden hover:shadow-emerald-950/30"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        call.priority === 'urgent'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse'
                          : call.priority === 'high'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-[#1e222b] text-stone-300'
                      }`}>
                        {call.priority === 'urgent' ? '🚨 طارئ عاجل' : call.priority === 'high' ? 'أولوية مرتفعة' : 'اعتيادي'}
                      </span>

                      {/* Mandatory Report Status Indicator on Card */}
                      {isCallEnded(call) && (
                        call.reportCompleted ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <FileCheck className="w-3 h-3 text-emerald-400" />
                            <span>تقرير معتمد</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>تقرير عام إجباري مطلوب</span>
                          </span>
                        )
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {call.location?.city || 'الجزائر'}
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

                  {/* Organization & Location details */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-stone-300 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate font-medium">{call.location?.placeName || 'موقع ميداني'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-[#202532] text-emerald-300 text-[10px] font-bold border border-emerald-500/20 truncate max-w-[130px] shrink-0" title={call.creatorOrg || call.creatorName}>
                      {call.creatorOrg || call.creatorName || associationDisplayName}
                    </span>
                  </div>

                  {/* Required Volunteers Highlight Card */}
                  <div className="bg-[#12151c] border border-[#232836] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-stone-300 font-bold">المتطوعون المطلوبون:</span>
                      </div>
                      <div className="font-mono text-[11px]">
                        <span className="text-emerald-400 font-bold text-sm">{confCount}</span>
                        <span className="text-stone-500"> / {reqCount} مطلوب</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#1e2330] rounded-full h-2 overflow-hidden flex">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressPct >= 100 
                            ? 'bg-emerald-400' 
                            : progressPct >= 50 
                            ? 'bg-emerald-500' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span>النسبة المكتملة: <strong className="text-emerald-400">{progressPct}%</strong></span>
                      <span>
                        {remainingSpots === 0 ? (
                          <span className="text-emerald-400 font-bold">✓ الفريق مكتمل</span>
                        ) : (
                          <span>المتبقي: <strong className="text-amber-400">{remainingSpots}</strong> مقاعد</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {Array.isArray(call.requiredSkills) && call.requiredSkills.length > 0 && (
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
                  {/* Mandatory Evaluation Report Trigger Button if Call is Ended */}
                  {isCallEnded(call) && (
                    !call.reportCompleted ? (
                      <button
                        type="button"
                        onClick={() => onOpenEvaluationReport(call)}
                        className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-stone-950 font-black text-xs shadow-md shadow-amber-950/40 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <FileText className="w-4 h-4 stroke-[2.5]" />
                        <span>إيداع التقرير العام الإجباري (مطلوب)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenEvaluationReport(call)}
                        className="w-full py-2 px-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span>استعراض التقرير العام المعتمد</span>
                      </button>
                    )
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => onOpenResponses(call)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 font-bold transition-colors text-[11px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>استجابات المتطوعين: {call.responsesCount || 0}</span>
                    </button>

                    <span className="text-[10px] text-stone-500 font-mono">
                      {call.createdAt ? new Date(call.createdAt).toLocaleDateString('ar-DZ') : 'اليوم'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectCall(call)}
                      className="flex-1 py-2 rounded-xl bg-[#20242e] hover:bg-[#282d3a] text-stone-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      <span>عرض التفاصيل الميدانية</span>
                    </button>

                    <select
                      value={call.status}
                      onChange={e => onUpdateCallStatus(call.id, e.target.value as CallStatus)}
                      className="bg-[#121419] border border-[#282c36] rounded-xl px-2.5 py-2 text-[11px] text-stone-300 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="active">نشط</option>
                      <option value="receiving_responses">استقبال ردود</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="closed">إغلاق</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
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
                  <th className="py-3.5 px-4 font-bold">المتطوعون المطلوبون</th>
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
                      <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{call.creatorOrg || call.creatorName || associationDisplayName}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-200">{call.location?.city || 'الجزائر'}</div>
                      <div className="text-[11px] text-stone-500">{call.location?.placeName || 'موقع ميداني'}</div>
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
                        <option value="receiving_responses">استقبال ردود</option>
                        <option value="in_progress">قيد التنفيذ</option>
                        <option value="completed">مكتمل</option>
                        <option value="closed">مغلق</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-emerald-400 font-bold">{call.confirmedCount || 0}</span>
                      <span className="text-stone-500"> / {call.requiredCount || 10} مطلوب</span>
                    </td>

                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {isCallEnded(call) && (
                          !call.reportCompleted ? (
                            <button
                              type="button"
                              onClick={() => onOpenEvaluationReport(call)}
                              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-stone-950 font-black text-[11px] shadow-sm flex items-center gap-1 whitespace-nowrap"
                              title="إيداع التقرير العام الإجباري"
                            >
                              <FileText className="w-3 h-3" />
                              <span>تقرير إجباري</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onOpenEvaluationReport(call)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/20 flex items-center gap-1 whitespace-nowrap"
                              title="استعراض التقرير العام المعتمد"
                            >
                              <FileCheck className="w-3 h-3 text-emerald-400" />
                              <span>تقرير معتمد</span>
                            </button>
                          )
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenResponses(call)}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-[11px]"
                        >
                          الردود ({call.responsesCount || 0})
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

export default WebDashboard;
