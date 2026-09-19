import React, { useState } from 'react';
import { UserProfile, Call, FieldNote, LeaderboardUser, MonthlyArchiveRecord, ResponseType, AppNotification } from '../../types';
import { NearbyRadarView } from './NearbyRadarView';
import { MobileCallDetail } from './MobileCallDetail';
import { FieldNotesView } from './FieldNotesView';
import { MonthlyLeaderboardView } from './MonthlyLeaderboardView';
import { MobileSettingsModal } from './MobileSettingsModal';
import { 
  Navigation, 
  BookOpen, 
  Trophy, 
  Bell, 
  Settings, 
  Radio, 
  MapPin, 
  Wifi, 
  Battery, 
  Maximize2, 
  Minimize2,
  Sparkles
} from 'lucide-react';

interface MobileFrameProps {
  calls: Call[];
  user: UserProfile;
  notes: FieldNote[];
  notifications: AppNotification[];
  currentLeaderboard: LeaderboardUser[];
  archives: MonthlyArchiveRecord[];
  onAddNote: (note: Omit<FieldNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onSubmitResponse: (callId: string, responseType: ResponseType, message?: string) => void;
  onToggleSaveCall: (callId: string) => void;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetOnboarding: () => void;
  standalone?: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  calls,
  user,
  notes,
  notifications,
  currentLeaderboard,
  archives,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
  onSubmitResponse,
  onToggleSaveCall,
  onUpdateUser,
  onResetOnboarding,
  standalone = false
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'notes' | 'leaderboard' | 'notifications'>('radar');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`flex flex-col items-center justify-center transition-all ${standalone ? 'w-full py-6' : 'w-full'}`}>
      {/* Smartphone Outer Shell */}
      <div
        className={`relative bg-stone-950 border-4 border-stone-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isExpanded || standalone
            ? 'w-full max-w-lg h-[860px]'
            : 'w-full max-w-[390px] h-[780px]'
        }`}
      >
        {/* Phone Notch & Status Bar */}
        <div className="pt-2 px-6 pb-2 flex items-center justify-between text-[11px] font-semibold text-stone-400 bg-stone-950 z-20 select-none">
          <span>9:41</span>
          {/* Dynamic Island / Speaker Pill */}
          <div className="w-24 h-4 bg-stone-900 rounded-full border border-stone-800/80 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-950 border border-stone-800 mr-2" />
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* App Bar / Header */}
        <div className="px-4 py-2.5 bg-stone-900/90 backdrop-blur-md border-b border-stone-800/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-xs">تطبيق أثر</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  المستجيب
                </span>
              </div>
              <div className="text-[10px] text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{user.location.city}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand / Minimize phone toggle for viewing comfort */}
            {!standalone && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                title={isExpanded ? 'تصغير الهاتف' : 'تكبير الهاتف'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Settings button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              title="الإعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Screen Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-900/50">
          {selectedCall ? (
            <MobileCallDetail
              call={selectedCall}
              user={user}
              onBack={() => setSelectedCall(null)}
              onSubmitResponse={onSubmitResponse}
              onToggleSaveCall={onToggleSaveCall}
            />
          ) : activeTab === 'radar' ? (
            <NearbyRadarView
              calls={calls}
              user={user}
              onSelectCall={call => setSelectedCall(call)}
              onToggleSaveCall={onToggleSaveCall}
            />
          ) : activeTab === 'notes' ? (
            <FieldNotesView
              notes={notes}
              calls={calls}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
              onUpdateNote={onUpdateNote}
            />
          ) : activeTab === 'leaderboard' ? (
            <MonthlyLeaderboardView
              currentLeaderboard={currentLeaderboard}
              archives={archives}
              currentUser={user}
            />
          ) : (
            /* Notifications Tab */
            <div className="space-y-3 pb-20 text-right">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <span>تنبيهات أثر الميدانية</span>
                </h3>
                <span className="text-[10px] text-stone-400">{notifications.length} تنبيهات</span>
              </div>

              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                    !notif.read
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-stone-950/80 border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{notif.title}</span>
                    <span className="text-[10px] text-stone-500">
                      {new Date(notif.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    {notif.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="h-16 bg-stone-950/95 backdrop-blur-md border-t border-stone-800/80 px-4 flex items-center justify-around z-20">
          <button
            type="button"
            onClick={() => {
              setSelectedCall(null);
              setActiveTab('radar');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'radar' && !selectedCall
                ? 'text-emerald-400 scale-105'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span className="text-[10px] font-medium">قريب منك</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCall(null);
              setActiveTab('notes');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'notes' && !selectedCall
                ? 'text-emerald-400 scale-105'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] font-medium">ملاحظاتي</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCall(null);
              setActiveTab('leaderboard');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'leaderboard' && !selectedCall
                ? 'text-emerald-400 scale-105'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[10px] font-medium">الترتيب</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedCall(null);
              setActiveTab('notifications');
            }}
            className={`flex flex-col items-center gap-1 relative transition-all ${
              activeTab === 'notifications' && !selectedCall
                ? 'text-emerald-400 scale-105'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
            <span className="text-[10px] font-medium">التنبيهات</span>
          </button>
        </nav>

        {/* Home Indicator Bar */}
        <div className="h-4 bg-stone-950 flex items-center justify-center">
          <div className="w-32 h-1 bg-stone-700 rounded-full" />
        </div>
      </div>

      {/* Settings Modal */}
      <MobileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onSave={onUpdateUser}
        onResetOnboarding={onResetOnboarding}
      />
    </div>
  );
};
