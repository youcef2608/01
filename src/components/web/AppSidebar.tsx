import React from 'react';
import { 
  Home,
  Compass,
  Trophy,
  Smartphone, 
  Plus, 
  Bell, 
  Sparkles,
  LogIn,
  Building2,
  Layers
} from 'lucide-react';
import { AuthUser } from '../../types';

export type ActiveTabType = 
  | 'home'
  | 'dashboard' 
  | 'heatmap' 
  | 'ai_chat'
  | 'leaderboard' 
  | 'auth';

interface AppSidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenCreateCall: () => void;
  activeCallsCount: number;
  inboundNotesCount?: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  currentUser?: AuthUser | null;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateCall,
  activeCallsCount,
  unreadNotificationsCount,
  onOpenNotifications,
  currentUser
}) => {
  const currentAssocName = currentUser?.associationName || currentUser?.name || 'بوابة أثر الميدانية';
  const currentRoleTitle = currentUser?.roleTitle || (currentUser ? 'حساب معتمد' : 'تسجيل الدخول');

  const navItems: { 
    id: ActiveTabType; 
    label: string; 
    icon: React.ReactNode; 
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'home',
      label: 'الرئيسية (واجهة المنظومة)',
      icon: <Home className="w-5 h-5 text-emerald-400" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
          الواجهة
        </span>
      )
    },
    {
      id: 'dashboard',
      label: 'النداءات الميدانية',
      icon: <Layers className="w-5 h-5 text-stone-300" />,
      badge: (
        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
          {activeCallsCount > 0 ? activeCallsCount : 7}
        </span>
      )
    },
    {
      id: 'heatmap',
      label: 'خريطة الجزائر',
      icon: <Compass className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'ai_chat',
      label: 'مستشار الذكاء الاصطناعي (AI)',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold font-mono">
          AI
        </span>
      )
    },
    {
      id: 'leaderboard',
      label: 'ترتيب الجمعيات والمتصدرين',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
          الوطني
        </span>
      )
    },
    {
      id: 'auth',
      label: 'حساب واعتماد الجمعية',
      icon: <LogIn className="w-5 h-5 text-emerald-400" />
    }
  ];

  return (
    <aside className="w-72 lg:w-80 bg-gradient-to-b from-[#11151f]/90 via-[#0e1119]/92 to-[#0b0e15]/95 backdrop-blur-2xl border-l border-white/[0.06] flex flex-col shrink-0 h-screen sticky top-0 z-40 select-none shadow-[-24px_0_70px_-40px_rgba(16,185,129,0.18)]">
      {/* Brand Header with New App Icon */}
      <div className="p-4 sm:p-5 border-b border-[#1f2430]/80 flex items-center justify-between gap-3">
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
          title="منصة أثر الجزائر للجمعيات"
        >
          <div className="relative">
            <img 
              src="/app-logo.jpg" 
              alt="شعار تطبيق أثر" 
              className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/50 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#10131a] shadow-sm"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl text-white tracking-tight font-sans">أثر</span>
              <span className="text-xs font-bold text-emerald-400">Athar DZ</span>
            </div>
            <span className="text-[10px] text-stone-400 font-medium">بوابة الجمعيات المعتمدة</span>
          </div>
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-[#171a22] hover:bg-[#202532] text-stone-300 hover:text-white border border-white/5 transition-colors"
          title="الإشعارات والتنبيهات الميدانية"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Permanent Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-stone-800">
        {/* Top Association Profile Card - Matching Screenshot Exactly */}
        <button
          type="button"
          onClick={() => setActiveTab('auth')}
          className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-xs font-bold transition-all text-right shadow-sm ${
            activeTab === 'auth'
              ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/30'
              : 'bg-[#161a24] hover:bg-[#1c2230] border-white/10 text-stone-200'
          }`}
          title="الملف التعريفي للجمعية"
        >
          <span className="text-[11px] font-extrabold text-emerald-400 flex items-center gap-1 shrink-0">
            فتح ➔
          </span>
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="flex flex-col text-right truncate">
              <span className="truncate text-white font-bold text-xs">
                {currentAssocName}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                ({currentRoleTitle})
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Permanent Menu Items with correct RTL alignment (Icon + Label on Right, Badge on Left) */}
        <div className="space-y-1.5 pt-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`group relative w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 text-right ${
                  isActive
                    ? 'bg-gradient-to-l from-emerald-500/15 via-[#1a2230] to-[#151c27] text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/30'
                    : 'text-stone-300 hover:text-white hover:bg-[#161922] border border-transparent'
                }`}
              >
                {/* Active Indicator Bar on the far right */}
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full bg-gradient-to-b from-emerald-300 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                )}

                {/* Right side (RTL start): Icon & Label cleanly aligned */}
                <div className="flex items-center gap-3 pr-1">
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-emerald-400 scale-105' : 'text-stone-400 group-hover:text-stone-200'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>

                {/* Left side (RTL end): Badge if exists */}
                {item.badge ? (
                  <div className="shrink-0 pl-1">
                    {item.badge}
                  </div>
                ) : <div />}
              </button>
            );
          })}
        </div>

        {/* Quick Launch CTA: إنشاء نداء الجمعية */}
        <div className="pt-3">
          <button
            type="button"
            onClick={onOpenCreateCall}
            className="sheen-btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-xl shadow-emerald-950/60 hover:shadow-emerald-500/30 ring-1 ring-emerald-400/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إطلاق نداء ميداني للجمعية</span>
          </button>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-[#1f2430]/80 bg-[#0d0f15] text-[11px] text-stone-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 -mr-4"></span>
          <span className="text-stone-300 font-semibold">بوابة الجمعيات الجزائرية</span>
        </div>
        <span className="font-mono text-[10px] text-stone-500">DZ • 2026</span>
      </div>
    </aside>
  );
};
