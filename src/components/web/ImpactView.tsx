import React, { useState, useMemo } from 'react';
import { LeaderboardUser, MonthlyArchiveRecord } from '../../types';
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
  Heart
} from 'lucide-react';

interface ImpactViewProps {
  currentLeaderboard: LeaderboardUser[];
  archives: MonthlyArchiveRecord[];
}

export const ImpactView: React.FC<ImpactViewProps> = ({
  currentLeaderboard,
  archives
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current');

  const displayedList = useMemo(() => {
    if (selectedMonth === 'current') return currentLeaderboard;
    return archives.find(a => a.monthKey === selectedMonth)?.leaderboard || [];
  }, [selectedMonth, currentLeaderboard, archives]);

  const topThree = displayedList.slice(0, 3);
  const others = displayedList.slice(3);

  const totalCommunityHours = useMemo(() => {
    return displayedList.reduce((acc, curr) => acc + curr.volunteerHours, 0);
  }, [displayedList]);

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>لوحة الشرف ومؤشرات الأثر المجتمعي</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            توثيق وتكريم جهود المتطوعين وساعات العطاء الميداني المحققة عبر منصة أثر
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-[#181a20] border border-[#262a33] rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
          >
            <option value="current">سبتمبر 2026 (الشهر الحالي)</option>
            {archives.map(arch => (
              <option key={arch.monthKey} value={arch.monthKey}>
                {arch.monthName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Community KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181a20] border border-[#262a33] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">إجمالي ساعات العطاء الموثقة</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{totalCommunityHours} ساعة تطوع</div>
            <span className="text-[11px] text-stone-500">تم رصدها عبر استجابات الميدان</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#181a20] border border-[#262a33] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">المستجيبون الفاعلون</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{displayedList.length} متطوع نشط</div>
            <span className="text-[11px] text-stone-500">سجلوا حضوراً ميدانياً مؤكداً</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#181a20] border border-[#262a33] p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400">إجمالي نقاط الأثر التراكمية</span>
            <div className="text-2xl font-bold text-sky-400 mt-1">
              {displayedList.reduce((sum, u) => sum + u.points, 0).toLocaleString()} نقطة
            </div>
            <span className="text-[11px] text-stone-500">مقياس التفاعل والسرعة في تلبية النداء</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 items-end">
          {/* 2nd Place */}
          <div className="bg-[#181a20] border border-[#262a33] rounded-3xl p-6 text-center flex flex-col items-center space-y-3 order-2 md:order-1">
            <div className="relative">
              <img
                src={topThree[1].avatarUrl}
                alt={topThree[1].userName}
                className="w-16 h-16 rounded-full border-2 border-stone-400 object-cover shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-stone-400 text-stone-950 font-bold text-xs flex items-center justify-center">
                2
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">{topThree[1].userName}</h3>
            <div className="text-sm font-bold text-amber-400">{topThree[1].points} نقطة أثر</div>
            <div className="text-xs text-stone-400">{topThree[1].volunteerHours} ساعة تطوع ميداني</div>
            <div className="flex flex-wrap justify-center gap-1">
              {topThree[1].badges.map(b => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-[#121419] text-stone-300 border border-[#262a33]">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* 1st Place (Winner) */}
          <div className="bg-gradient-to-b from-[#241f15] to-[#181a20] border-2 border-amber-500/40 rounded-3xl p-8 text-center flex flex-col items-center space-y-3 order-1 md:order-2 -translate-y-2 shadow-2xl shadow-amber-950/20">
            <div className="relative">
              <img
                src={topThree[0].avatarUrl}
                alt={topThree[0].userName}
                className="w-20 h-20 rounded-full border-2 border-amber-400 object-cover shadow-xl"
              />
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</span>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center">
                1
              </span>
            </div>
            <div>
              <span className="text-[10px] px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                فارس العطاء للشهر
              </span>
              <h3 className="text-base font-bold text-white mt-2">{topThree[0].userName}</h3>
            </div>
            <div className="text-base font-bold text-amber-300">{topThree[0].points} نقطة أثر</div>
            <div className="text-xs text-stone-300 font-semibold">{topThree[0].volunteerHours} ساعة تطوع ميداني</div>
            <div className="flex flex-wrap justify-center gap-1">
              {topThree[0].badges.map(b => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-[#121419] text-amber-200 border border-amber-500/30">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="bg-[#181a20] border border-[#262a33] rounded-3xl p-6 text-center flex flex-col items-center space-y-3 order-3">
            <div className="relative">
              <img
                src={topThree[2].avatarUrl}
                alt={topThree[2].userName}
                className="w-16 h-16 rounded-full border-2 border-amber-700 object-cover shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-stone-100 font-bold text-xs flex items-center justify-center">
                3
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">{topThree[2].userName}</h3>
            <div className="text-sm font-bold text-amber-400">{topThree[2].points} نقطة أثر</div>
            <div className="text-xs text-stone-400">{topThree[2].volunteerHours} ساعة تطوع ميداني</div>
            <div className="flex flex-wrap justify-center gap-1">
              {topThree[2].badges.map(b => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-[#121419] text-stone-300 border border-[#262a33]">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Honor Roll Table */}
      <div className="bg-[#181a20] border border-[#262a33] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#262a33] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">ترتيب بقية المتطوعين الفاعلين</h3>
          <span className="text-xs text-stone-400">{displayedList.length} متطوع مسجل</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#121419] text-stone-400 border-b border-[#262a33]">
              <tr>
                <th className="py-3 px-4">الترتيب</th>
                <th className="py-3 px-4">المستجيب</th>
                <th className="py-3 px-4">الأوسمة</th>
                <th className="py-3 px-4">ساعات التطوع</th>
                <th className="py-3 px-4 text-left">نقاط الأثر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a33]">
              {others.map(item => (
                <tr key={item.userId} className="hover:bg-[#1d2027] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-stone-400">#{item.rank}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {item.avatarUrl && (
                        <img
                          src={item.avatarUrl}
                          alt={item.userName}
                          className="w-8 h-8 rounded-full object-cover border border-stone-700"
                        />
                      )}
                      <span className="font-bold text-white">{item.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.badges.map(b => (
                        <span key={b} className="text-[10px] px-2 py-0.5 rounded bg-[#121419] text-stone-300 border border-[#262a33]">
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-300">{item.volunteerHours} ساعة</td>
                  <td className="py-3 px-4 text-left font-mono font-bold text-emerald-400">{item.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
