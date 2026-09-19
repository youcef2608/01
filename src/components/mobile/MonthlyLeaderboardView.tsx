import React, { useState } from 'react';
import { LeaderboardUser, MonthlyArchiveRecord, UserProfile } from '../../types';
import { Trophy, Award, Clock, Star, Calendar, ChevronDown, Flame, ShieldCheck } from 'lucide-react';

interface MonthlyLeaderboardViewProps {
  currentLeaderboard: LeaderboardUser[];
  archives: MonthlyArchiveRecord[];
  currentUser: UserProfile;
}

export const MonthlyLeaderboardView: React.FC<MonthlyLeaderboardViewProps> = ({
  currentLeaderboard,
  archives,
  currentUser
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('current');

  const displayedLeaderboard =
    selectedMonth === 'current'
      ? currentLeaderboard
      : archives.find(a => a.monthKey === selectedMonth)?.leaderboard || [];

  const topThree = displayedLeaderboard.slice(0, 3);
  const others = displayedLeaderboard.slice(3);

  return (
    <div className="space-y-5 pb-20 text-right">
      {/* Header & Month Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>لوحة الشرف والترتيب الشهري</span>
          </h3>
          <p className="text-[11px] text-stone-400">
            تكريم المتفاعلين وساعات العطاء الميدانية في مجتمع أثر
          </p>
        </div>

        {/* Month Archive Selector */}
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
        >
          <option value="current">سبتمبر 2026 (الشهر الحالي)</option>
          {archives.map(arch => (
            <option key={arch.monthKey} value={arch.monthKey}>
              {arch.monthName}
            </option>
          ))}
        </select>
      </div>

      {/* User's Personal Rank Card */}
      {selectedMonth === 'current' && (
        <div className="bg-gradient-to-r from-emerald-950/60 to-stone-900 p-4 rounded-3xl border border-emerald-500/30 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-lg">
              #4
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{currentUser.name} (أنت)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  مستجيب نشط
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                <span>نقاطك هذا الشهر: <strong className="text-emerald-400">{currentUser.monthlyPoints}</strong></span>
                <span>•</span>
                <span>ساعات التطوع: <strong>12 ساعة</strong></span>
              </div>
            </div>
          </div>

          <div className="text-left">
            <span className="text-[10px] text-stone-400 block">إجمالي أثرك:</span>
            <span className="text-xs font-bold text-amber-400">{currentUser.totalImpactPoints} نقطة</span>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-2 items-end">
          {/* 2nd Place */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 text-center flex flex-col items-center space-y-1.5">
            <div className="relative">
              <img
                src={topThree[1].avatarUrl}
                alt={topThree[1].userName}
                className="w-12 h-12 rounded-full border-2 border-stone-400 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-stone-400 text-stone-950 font-bold text-[10px] flex items-center justify-center">
                2
              </span>
            </div>
            <div className="text-xs font-bold text-white line-clamp-1">{topThree[1].userName}</div>
            <div className="text-[11px] font-bold text-amber-400">{topThree[1].points} نقطة</div>
            <div className="text-[9px] text-stone-500">{topThree[1].volunteerHours} ساعة تطوع</div>
          </div>

          {/* 1st Place (Winner) */}
          <div className="bg-gradient-to-b from-amber-950/30 to-stone-950 border-2 border-amber-500/40 rounded-2xl p-3.5 text-center flex flex-col items-center space-y-2 -translate-y-2 shadow-xl shadow-amber-950/30">
            <div className="relative">
              <img
                src={topThree[0].avatarUrl}
                alt={topThree[0].userName}
                className="w-14 h-14 rounded-full border-2 border-amber-400 object-cover"
              />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">👑</span>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] flex items-center justify-center">
                1
              </span>
            </div>
            <div className="text-xs font-bold text-white line-clamp-1">{topThree[0].userName}</div>
            <div className="text-xs font-bold text-amber-300">{topThree[0].points} نقطة</div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
              فارس الشهر
            </span>
          </div>

          {/* 3rd Place */}
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3 text-center flex flex-col items-center space-y-1.5">
            <div className="relative">
              <img
                src={topThree[2].avatarUrl}
                alt={topThree[2].userName}
                className="w-12 h-12 rounded-full border-2 border-amber-700 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-stone-100 font-bold text-[10px] flex items-center justify-center">
                3
              </span>
            </div>
            <div className="text-xs font-bold text-white line-clamp-1">{topThree[2].userName}</div>
            <div className="text-[11px] font-bold text-amber-400">{topThree[2].points} نقطة</div>
            <div className="text-[9px] text-stone-500">{topThree[2].volunteerHours} ساعة تطوع</div>
          </div>
        </div>
      )}

      {/* Rest of Leaderboard */}
      <div className="bg-stone-950 rounded-3xl border border-stone-800 p-4 space-y-2">
        <div className="text-xs font-bold text-stone-400 px-2 pb-1 border-b border-stone-800 flex items-center justify-between">
          <span>المستجيب</span>
          <div className="flex items-center gap-6">
            <span>ساعات العطاء</span>
            <span>النقاط</span>
          </div>
        </div>

        {others.map(item => (
          <div
            key={item.userId}
            className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors ${
              item.userId === currentUser.id
                ? 'bg-emerald-950/40 border border-emerald-500/30'
                : 'hover:bg-stone-900/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-5 font-bold text-stone-500 text-center">#{item.rank}</span>
              {item.avatarUrl && (
                <img
                  src={item.avatarUrl}
                  alt={item.userName}
                  className="w-8 h-8 rounded-full object-cover border border-stone-700"
                />
              )}
              <div>
                <div className="font-bold text-white">{item.userName}</div>
                <div className="text-[10px] text-stone-400 flex items-center gap-1">
                  {item.badges.slice(0, 2).map(b => (
                    <span key={b} className="text-[9px] px-1.5 py-0.2 rounded bg-stone-900 text-stone-300">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <span className="text-stone-400 text-[11px]">{item.volunteerHours} س</span>
              <span className="font-bold text-emerald-400 min-w-[40px] text-left">{item.points}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
