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
  Building2
} from 'lucide-react';
import { AuthUser } from '../../types';

export type ActiveTabType = 
  | 'dashboard' 
  | 'heatmap' 
  | 'ai_chat'
  | 'leaderboard' 
  | 'inbound_notes' 
  | 'auth';

interface AppSidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenCreateCall: () => void;
  activeCallsCount: number;
  inboundNotesCount: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  currentUser?: AuthUser | null;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateCall,
  activeCallsCount,
  inboundNotesCount,
  unreadNotificationsCount,
  onOpenNotifications,
  currentUser
}) => {
  const currentAssocName = currentUser?.associationName || currentUser?.name || 'جمعية ناس الخير الجزائر';
  const currentRoleTitle = currentUser?.roleTitle || 'جمعية معتمدة';

  const navItems: { 
    id: ActiveTabType; 
    label: string; 
    icon: React.ReactNode; 
    badge?: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: <Home className="w-5 h-5 text-stone-300" />,
      badge: (
        <span className="px-2 py-0.5 rounded-lg bg-[#202532] text-stone-300 text-xs font-mono font-bold border border-white/5">
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
      label: 'دردشة Gemini',
      icon: <Sparkles className="w-5 h-5 text-blue-400" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold font-mono">
          AI
        </span>
      )
    },
    {
      id: 'leaderboard',
      label: 'المتصدرون والأثر',
      icon: <Trophy className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'inbound_notes',
      label: 'ملاحظات الجوال',
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
      badge: (
        <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30">
          {inboundNotesCount > 0 ? inboundNotesCount : 2}
        </span>
      )
    },
    {
      id: 'auth',
      label: 'تسجيل الدخول',
      icon: <LogIn className="w-5 h-5 text-emerald-400" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
          حساب الجمعية
        </span>
      )
    }
  ];

  return (
    <aside className="w-72 lg:w-80 bg-[#10131a] border-l border-[#1f2430] flex flex-col shrink-0 h-screen sticky top-0 z-40 select-none">
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
              className="w-11 h-11 rounded-2xl object-cover shadow-lg shadow-blue-500/20 ring-2 ring-emerald-500/40 group-hover:scale-105 transition-transform"
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

        {/* Permanent Menu Items matching the user screenshot */}
        <div className="space-y-1 pt-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#1f2432] text-white shadow-sm border border-white/10'
                    : 'text-stone-300 hover:text-white hover:bg-[#161922]'
                }`}
              >
                {/* Left side: Badge if exists */}
                <div>
                  {item.badge}
                </div>

                {/* Right side (RTL start): Label & Icon */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{item.label}</span>
                  {item.icon}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Launch CTA: إنشاء نداء الجمعية */}
        <div className="pt-3">
          <button
            type="button"
            onClick={onOpenCreateCall}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
