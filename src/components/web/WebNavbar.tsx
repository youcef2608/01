import React, { useState } from 'react';
import { 
  Home,
  Radio, 
  Compass,
  FileCheck2,
  Trophy,
  Smartphone, 
  Settings,
  Plus, 
  Bell, 
  Menu,
  X,
  Sparkles,
  LogIn,
  UserCheck
} from 'lucide-react';
import { AuthUser } from '../../types';

export type ActiveTabType = 
  | 'dashboard' 
  | 'live' 
  | 'heatmap' 
  | 'analysis' 
  | 'ai_chat'
  | 'leaderboard' 
  | 'inbound_notes' 
  | 'auth'
  | 'settings';

interface WebNavbarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenCreateCall: () => void;
  activeCallsCount: number;
  inboundNotesCount: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  currentUser?: AuthUser | null;
}

export const WebNavbar: React.FC<WebNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateCall,
  activeCallsCount,
  inboundNotesCount,
  unreadNotificationsCount,
  onOpenNotifications,
  currentUser
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTabType; label: string; icon: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: <Home className="w-4 h-4" />,
      badge: activeCallsCount > 0 ? (
        <span className="px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[10px] font-mono font-bold">
          {activeCallsCount}
        </span>
      ) : undefined
    },
    {
      id: 'live',
      label: 'مباشر',
      icon: <Radio className="w-4 h-4 text-red-500 animate-pulse" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black tracking-wider">
          حي
        </span>
      )
    },
    {
      id: 'heatmap',
      label: 'خريطة الجزائر',
      icon: <Compass className="w-4 h-4 text-emerald-400" />
    },
    {
      id: 'ai_chat',
      label: 'دردشة Gemini',
      icon: <Sparkles className="w-4 h-4 text-blue-400" />,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold font-mono">
          AI
        </span>
      )
    },
    {
      id: 'analysis',
      label: 'تحليل الأنشطة',
      icon: <FileCheck2 className="w-4 h-4 text-sky-400" />
    },
    {
      id: 'leaderboard',
      label: 'المتصدرون والأثر',
      icon: <Trophy className="w-4 h-4 text-amber-400" />
    },
    {
      id: 'inbound_notes',
      label: 'ملاحظات الجوال',
      icon: <Smartphone className="w-4 h-4 text-blue-400" />,
      badge: inboundNotesCount > 0 ? (
        <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
          {inboundNotesCount}
        </span>
      ) : undefined
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: <Settings className="w-4 h-4 text-stone-400" />
    }
  ];

  const handleSelectTab = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#12141a]/95 backdrop-blur-md border-b border-[#252932] text-stone-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => handleSelectTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="منصة أثر الجزائر"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <span className="font-black text-sm text-white font-sans">DZ</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-white tracking-tight font-sans">أثر</span>
                <span className="text-xs font-bold text-emerald-400">Athar</span>
              </div>
              <span className="text-[10px] text-stone-400 -mt-1 font-medium">المنظومة الميدانية التطوعية</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 mr-2">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#20242e] text-white shadow-sm border border-[#2e3340]'
                      : 'text-stone-400 hover:text-white hover:bg-[#1a1d24]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge}
                </button>
              );
            })}
          </nav>

          {/* Mid-screen scrollable navigation (LG screen) */}
          <nav className="hidden md:flex xl:hidden items-center gap-1 overflow-x-auto scrollbar-none py-1 max-w-md">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#20242e] text-white border border-[#2e3340]'
                      : 'text-stone-400 hover:text-white hover:bg-[#1a1d24]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Auth / Profile button */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => handleSelectTab('auth')}
              className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all ${
                activeTab === 'auth'
                  ? 'bg-[#20242e] border-emerald-500/60 text-white shadow-sm'
                  : 'bg-[#161922] border-white/10 hover:border-white/20 text-stone-300 hover:text-white'
              }`}
              title="الملف الشخصي للمتطوع"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-lg object-cover border border-emerald-500/50 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                  DZ
                </div>
              )}
              <div className="hidden sm:flex flex-col text-right leading-tight">
                <span className="text-xs font-bold text-white truncate max-w-[110px]">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[9px] text-emerald-400 truncate max-w-[110px]">{currentUser.roleTitle}</span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectTab('auth')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                activeTab === 'auth'
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500'
                  : 'bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border-white/10'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </button>
          )}

          {/* Notifications button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl hover:bg-[#1a1d24] text-stone-300 hover:text-white border border-transparent hover:border-[#262a33] transition-colors"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Primary Create Call CTA */}
          <button
            type="button"
            onClick={onOpenCreateCall}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إنشاء نداء</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl hover:bg-[#1a1d24] text-stone-300 hover:text-white border border-[#262a33]"
            title="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#252932] bg-[#12141a] px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
          {/* Mobile User Profile Link */}
          <button
            type="button"
            onClick={() => handleSelectTab('auth')}
            className={`w-full mb-2 flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
              activeTab === 'auth'
                ? 'bg-emerald-950/40 border-emerald-500 text-white'
                : 'bg-[#181c26] border-white/10 text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>{currentUser ? `${currentUser.name} (${currentUser.roleTitle})` : 'تسجيل الدخول / إنشاء حساب'}</span>
            </div>
            <span className="text-[10px] text-emerald-400">فتح ➔</span>
          </button>

          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#20242e] text-white border border-[#2e3340]'
                    : 'text-stone-300 hover:text-white hover:bg-[#1a1d24]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
