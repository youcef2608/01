import React, { useState, useMemo } from 'react';
import { LeaderboardUser, MonthlyArchiveRecord, AssociationLeaderboardEntry } from '../../types';
import { ASSOCIATIONS_LEADERBOARD } from '../../data/authData';
import { 
  Trophy, 
  Award, 
  Clock, 
  Star, 
  Calendar, 
  ChevronDown, 
  Flame, 
  ShieldCheck,
  TrendingUp,
  Heart,
  Building2,
  Users,
  FileCheck2,
  Sparkles,
  MapPin,
  Search,
  Filter,
  Plus,
  Medal,
  Target,
  CheckCircle2
} from 'lucide-react';

interface ImpactViewProps {
  currentLeaderboard: LeaderboardUser[];
  archives: MonthlyArchiveRecord[];
  associationsLeaderboard?: AssociationLeaderboardEntry[];
  onOpenCreateCall?: () => void;
}

export const ImpactView: React.FC<ImpactViewProps> = ({
  currentLeaderboard,
  archives,
  associationsLeaderboard = ASSOCIATIONS_LEADERBOARD,
  onOpenCreateCall
}) => {
  const [activeLeaderboardType, setActiveLeaderboardType] = useState<'associations' | 'volunteers'>('associations');
  const [selectedMonth, setSelectedMonth] = useState<string>('current');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWilayaFilter, setSelectedWilayaFilter] = useState<string>('all');

  const filteredAssociations = useMemo(() => {
    return associationsLeaderboard.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.associationName.toLowerCase().includes(q);
        const matchesWilaya = item.wilaya.toLowerCase().includes(q);
        const matchesBadge = item.badgeNumber.toLowerCase().includes(q);
        if (!matchesName && !matchesWilaya && !matchesBadge) return false;
      }
      if (selectedWilayaFilter !== 'all' && !item.wilaya.includes(selectedWilayaFilter)) {
        return false;
      }
      return true;
    });
  }, [associationsLeaderboard, searchQuery, selectedWilayaFilter]);

  const displayedVolunteers = useMemo(() => {
    if (selectedMonth === 'current') return currentLeaderboard;
    return archives.find(a => a.monthKey === selectedMonth)?.leaderboard || [];
  }, [selectedMonth, currentLeaderboard, archives]);

  const topThreeAssoc = associationsLeaderboard.slice(0, 3);

  const totalAssocAppeals = useMemo(() => {
    return associationsLeaderboard.reduce((acc, a) => acc + a.completedAppealsCount, 0);
  }, [associationsLeaderboard]);

  const totalAssocVolunteers = useMemo(() => {
    return associationsLeaderboard.reduce((acc, a) => acc + a.mobilizedVolunteers, 0);
  }, [associationsLeaderboard]);

  const totalAssocHours = useMemo(() => {
    return associationsLeaderboard.reduce((acc, a) => acc + a.impactHours, 0);
  }, [associationsLeaderboard]);

  const totalAssocReports = useMemo(() => {
    return associationsLeaderboard.reduce((acc, a) => acc + a.reportsSubmittedCount, 0);
  }, [associationsLeaderboard]);

  return (
    <div className="space-y-6 text-right">
      {/* Grand Competition Hero Header */}
      <div className="relative bg-gradient-to-r from-[#20190f] via-[#16141a] to-[#0f1118] p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 shadow-2xl overflow-hidden">
        {/* Ambient Lights */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[11px] shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>جائزة التميز الميداني للجمعيات المعتمدة — الجزائر 2026</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                توثيق معتمد 100%
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              لوحة الترتيب والمتصدرين بين الجمعيات الوطنية
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              منصة التنافس الرسمي بين الجمعيات المعتمدة عبر 58 ولاية. الترتيب يُحتسب بدقة وفقاً لعدد النداءات الميدانية المنجزة، وحشد المتطوعين، وإيداع التقارير العامة الإجبارية.
            </p>
          </div>

          {/* Action CTA & Tab Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            {onOpenCreateCall && (
              <button
                type="button"
                onClick={onOpenCreateCall}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-950/60 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>إطلاق نداء للمنافسة 🚀</span>
              </button>
            )}

            <div className="flex items-center bg-[#10121a] border border-[#262c3e] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveLeaderboardType('associations')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeLeaderboardType === 'associations'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>الجمعيات المعتمدة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLeaderboardType('volunteers')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  activeLeaderboardType === 'volunteers'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>المتطوعون الأفراد</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeLeaderboardType === 'associations' ? (
        /* ASSOCIATIONS LEADERBOARD VIEW */
        <div className="space-y-6">
          {/* Key Impact Stats for Associations */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between hover:border-amber-500/30 transition-all">
              <div>
                <span className="text-[11px] text-stone-400 font-bold">المشاريع المكتملة</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{totalAssocAppeals} مشروعاً</div>
                <span className="text-[10px] text-stone-500">موثقة ميدانياً</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between hover:border-emerald-500/30 transition-all">
              <div>
                <span className="text-[11px] text-stone-400 font-bold">المتطوعون المحشودون</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{totalAssocVolunteers.toLocaleString()} متطوع</div>
                <span className="text-[10px] text-stone-500">عبر ولايات الجزائر</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between hover:border-sky-500/30 transition-all">
              <div>
                <span className="text-[11px] text-stone-400 font-bold">ساعات الأثر التراكمية</span>
                <div className="text-2xl font-black text-sky-400 mt-1">{totalAssocHours.toLocaleString()} ساعة</div>
                <span className="text-[10px] text-stone-500">جهد ميداني تطوعي</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#171a21] border border-[#252932] p-5 rounded-2xl flex items-center justify-between hover:border-purple-500/30 transition-all">
              <div>
                <span className="text-[11px] text-stone-400 font-bold">التقارير العامة المعتمدة</span>
                <div className="text-2xl font-black text-purple-400 mt-1">{totalAssocReports} تقريراً</div>
                <span className="text-[10px] text-stone-500">تقييم رسمي إجباري</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Grand Top 3 Podium Cards */}
          {topThreeAssoc.length === 0 ? (
            <div className="bg-gradient-to-r from-[#171922] via-[#151720] to-[#12141c] border border-amber-500/20 rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-950/40">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-xl font-black text-white">منصة المنافسة الوطنية للجمعيات جاهزة</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  لم تسجل أي جمعية مشاريع ختامية بعد. بمجرد إطلاق النداءات الميدانية ورفع التقارير العامة الإجبارية المعتمدة، ستتولى المنظومة احتساب النقاط وتتويج الجمعيات الثلاث الأولى على منصة الشرف الوطنية.
                </p>
              </div>
              {onOpenCreateCall && (
                <button
                  type="button"
                  onClick={onOpenCreateCall}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>إطلاق أول نداء ميداني للمنافسة</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              {/* Rank 2 (Silver) */}
              {topThreeAssoc[1] && (
                <div className="bg-[#171b26] border-2 border-stone-500/40 rounded-3xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden order-2 md:order-1 shadow-lg hover:border-stone-400 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-stone-300 to-stone-400 text-stone-950 font-black text-base flex items-center justify-center shadow-md">
                        🥈 2
                      </span>
                      <span className="text-xs font-bold text-stone-300">المركز الثاني وطنياً</span>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-md border border-white/5">
                      {topThreeAssoc[1].badgeNumber}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">{topThreeAssoc[1].associationName}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{topThreeAssoc[1].wilaya}</span>
                    </div>
                  </div>
                  <div className="bg-[#11141e] rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs border border-white/5">
                    <div>
                      <span className="text-stone-400 text-[10px]">المشاريع المكتملة:</span>
                      <div className="font-mono font-bold text-white mt-0.5">{topThreeAssoc[1].completedAppealsCount} مشروع</div>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px]">المتطوعون:</span>
                      <div className="font-mono font-bold text-emerald-400 mt-0.5">{topThreeAssoc[1].mobilizedVolunteers}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <span className="text-stone-400 font-bold">نقاط الأثر المعتمدة:</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{topThreeAssoc[1].points.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold Winner - Center & Elevated) */}
              {topThreeAssoc[0] && (
                <div className="bg-gradient-to-b from-[#251f12] via-[#1c1814] to-[#12141e] border-2 border-amber-400 rounded-3xl p-7 flex flex-col justify-between space-y-4 relative overflow-hidden order-1 md:order-2 shadow-2xl scale-105 z-20">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2.5">
                    <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-stone-950 font-black text-lg flex items-center justify-center shadow-xl shadow-amber-950/60 ring-2 ring-amber-300/50">
                      👑 1
                    </span>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[11px] border border-amber-400/40">
                        بطل الترتيب الوطني
                      </span>
                      <div className="text-[10px] text-amber-200/80 mt-0.5">الصدارة الجزائرية 2026</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-500/40">
                    {topThreeAssoc[0].badgeNumber}
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-black text-white">{topThreeAssoc[0].associationName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-amber-300/90 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{topThreeAssoc[0].wilaya}</span>
                  </div>
                </div>
                <div className="bg-[#0e1017] border border-amber-500/30 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs relative z-10">
                  <div>
                    <span className="text-stone-400 text-[10px]">المشاريع المكتملة:</span>
                    <div className="font-mono font-black text-white text-base mt-0.5">{topThreeAssoc[0].completedAppealsCount} مشروع</div>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px]">المتطوعون:</span>
                    <div className="font-mono font-black text-emerald-400 text-base mt-0.5">{topThreeAssoc[0].mobilizedVolunteers}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-500/30 relative z-10">
                  <span className="text-amber-200 font-extrabold text-sm">مجموع نقاط الأثر:</span>
                  <span className="text-2xl font-black text-amber-300 font-mono tracking-wide">{topThreeAssoc[0].points.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {topThreeAssoc[2] && (
              <div className="bg-[#171b26] border-2 border-amber-700/40 rounded-3xl p-6 flex flex-col justify-between space-y-4 relative overflow-hidden order-3 shadow-lg hover:border-amber-600 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 text-white font-black text-base flex items-center justify-center shadow-md">
                      🥉 3
                    </span>
                    <span className="text-xs font-bold text-amber-500">المركز الثالث وطنياً</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-md border border-white/5">
                    {topThreeAssoc[2].badgeNumber}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{topThreeAssoc[2].associationName}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{topThreeAssoc[2].wilaya}</span>
                  </div>
                </div>
                <div className="bg-[#11141e] rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs border border-white/5">
                  <div>
                    <span className="text-stone-400 text-[10px]">المشاريع المكتملة:</span>
                    <div className="font-mono font-bold text-white mt-0.5">{topThreeAssoc[2].completedAppealsCount} مشروع</div>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px]">المتطوعون:</span>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5">{topThreeAssoc[2].mobilizedVolunteers}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                  <span className="text-stone-400 font-bold">نقاط الأثر المعتمدة:</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{topThreeAssoc[2].points.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

          {/* Competition Scoring Criteria Box (Transparent Rules for Winning) */}
          <div className="bg-[#151822] border border-[#252b3b] rounded-3xl p-5 space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="font-black text-white text-xs">معايير احتساب نقاط الترتيب المعتمدة في المسابقة الوطنية:</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#10121a] p-3 rounded-2xl border border-white/5">
                <div className="text-emerald-400 font-mono font-bold text-sm">+150 نقطة</div>
                <div className="text-stone-300 font-bold mt-0.5">لكل تقرير عام إجباري</div>
                <div className="text-[10px] text-stone-500">توثيق الأثر والدروس</div>
              </div>
              <div className="bg-[#10121a] p-3 rounded-2xl border border-white/5">
                <div className="text-amber-400 font-mono font-bold text-sm">+100 نقطة</div>
                <div className="text-stone-300 font-bold mt-0.5">لكل نداء ميداني مكتمل</div>
                <div className="text-[10px] text-stone-500">تحقيق الهدف الميداني</div>
              </div>
              <div className="bg-[#10121a] p-3 rounded-2xl border border-white/5">
                <div className="text-sky-400 font-mono font-bold text-sm">+10 نقاط</div>
                <div className="text-stone-300 font-bold mt-0.5">لكل متطوع مؤكد</div>
                <div className="text-[10px] text-stone-500">من تطبيق الهاتف الجوال</div>
              </div>
              <div className="bg-[#10121a] p-3 rounded-2xl border border-white/5">
                <div className="text-purple-400 font-mono font-bold text-sm">+5 نقاط</div>
                <div className="text-stone-300 font-bold mt-0.5">لكل ساعة عطاء ميداني</div>
                <div className="text-[10px] text-stone-500">جهد فعلي بالولاية</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar for Table */}
          <div className="bg-[#161a22] border border-[#262c3b] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الجمعية، الولاية، أو رقم الاعتماد..."
                className="w-full bg-[#11131a] border border-[#272d3d] rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedWilayaFilter}
                onChange={e => setSelectedWilayaFilter(e.target.value)}
                className="bg-[#11131a] border border-[#272d3d] rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="all">جميع الولايات الـ 58</option>
                <option value="الجزائر">الجزائر العاصمة</option>
                <option value="وهران">وهران</option>
                <option value="قسنطينة">قسنطينة</option>
                <option value="سطيف">سطيف</option>
                <option value="عنابة">عنابة</option>
                <option value="تلمسان">تلمسان</option>
                <option value="البليدة">البليدة</option>
              </select>
            </div>
          </div>

          {/* Full Associations Table */}
          <div className="bg-[#171a21] border border-[#252932] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#252932] flex items-center justify-between">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <span>الترتيب الشامل للجمعيات الوطنية المعتمدة</span>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {filteredAssociations.length} جمعية
                </span>
              </h3>
              <span className="text-xs text-stone-400">محدثة وموثقة حسب التقارير الختامية</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#121419] text-stone-400 border-b border-[#252932]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">الرتبة</th>
                    <th className="py-3.5 px-4 font-bold">الجمعية المعتمدة</th>
                    <th className="py-3.5 px-4 font-bold">الولاية</th>
                    <th className="py-3.5 px-4 font-bold">المشاريع المكتملة</th>
                    <th className="py-3.5 px-4 font-bold">المتطوعون المحشودون</th>
                    <th className="py-3.5 px-4 font-bold">ساعات الأثر</th>
                    <th className="py-3.5 px-4 font-bold">التقارير المعتمدة</th>
                    <th className="py-3.5 px-4 font-bold text-left">مجموع النقاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222630]">
                  {filteredAssociations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 px-4 text-center text-stone-400">
                        <Trophy className="w-10 h-10 mx-auto text-amber-500/30 mb-2.5" />
                        <div className="text-sm font-bold text-white">لا توجد جمعيات مسجلة في لوحة الشرف حالياً</div>
                        <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                          يتم احتساب النقاط وتصنيف الجمعيات تلقائياً فور إطلاق النداءات وتأكيد تقارير الإنجاز الميدانية.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAssociations.map((item) => (
                      <tr key={item.associationName} className="hover:bg-[#1d212b] transition-colors">
                        <td className="py-3.5 px-4 font-bold font-mono">
                          {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : `#${item.rank}`}
                        </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black">{item.associationName}</span>
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-800/80 px-1.5 py-0.5 rounded border border-white/5">
                            {item.badgeNumber}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-300">
                        {item.wilaya}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-stone-200">
                        {item.completedAppealsCount}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {item.mobilizedVolunteers.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-sky-400">
                        {item.impactHours.toLocaleString()} س
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{item.reportsSubmittedCount} تقرير معتمد</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-amber-400 text-sm text-left">
                        {item.points.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* VOLUNTEERS LEADERBOARD VIEW */
        <div className="space-y-6">
          <div className="bg-[#171a21] border border-[#252932] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#252932] flex items-center justify-between">
              <h3 className="font-black text-white text-sm">لوحة شرف المتطوعين الميدانيين</h3>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-[#121419] border border-[#262a33] rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
              >
                <option value="current">سبتمبر 2026 (الشهر الحالي)</option>
                {archives.map(arch => (
                  <option key={arch.monthKey} value={arch.monthKey}>{arch.monthName}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#121419] text-stone-400 border-b border-[#252932]">
                  <tr>
                    <th className="py-3 px-4 font-bold">الرتبة</th>
                    <th className="py-3 px-4 font-bold">المتطوع</th>
                    <th className="py-3 px-4 font-bold">الاستجابات</th>
                    <th className="py-3 px-4 font-bold">مهام مكتملة</th>
                    <th className="py-3 px-4 font-bold">ساعات العطاء</th>
                    <th className="py-3 px-4 font-bold text-left">النقاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222630]">
                  {displayedVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 px-4 text-center text-stone-400">
                        <Users className="w-10 h-10 mx-auto text-sky-500/30 mb-2.5" />
                        <div className="text-sm font-bold text-white">لا يوجد متطوعون مسجلون في هذا الشهر بعد</div>
                        <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                          يتم إدراج وترتيب المتطوعين تلقائياً عند استجابتهم لنداءات الميدان وتأكيد مشاركتهم عبر تطبيق الهاتف.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displayedVolunteers.map(vol => (
                      <tr key={vol.userId} className="hover:bg-[#1d212b] transition-colors">
                        <td className="py-3 px-4 font-bold font-mono">#{vol.rank}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {vol.avatarUrl ? (
                              <img src={vol.avatarUrl} alt={vol.userName} className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 text-[10px] font-black">
                                {vol.userName.slice(0, 1)}
                              </div>
                            )}
                            <span className="font-bold text-white">{vol.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400">{vol.responsesCount}</td>
                        <td className="py-3 px-4 font-mono text-sky-400">{vol.completedCount}</td>
                        <td className="py-3 px-4 font-mono text-stone-300">{vol.volunteerHours} ساعة</td>
                        <td className="py-3 px-4 font-mono font-black text-amber-400 text-left">{vol.points}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactView;
