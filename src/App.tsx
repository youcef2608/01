import React, { useState, useEffect } from 'react';
import { 
  Call, 
  CallResponse, 
  AppNotification, 
  CallStatus,
  ActivityEvaluation,
  AppUserInboundNote,
  AuthUser
} from './types';
import { 
  INITIAL_CALLS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ACTIVITY_EVALUATIONS, 
  INITIAL_INBOUND_NOTES,
  INITIAL_LEADERBOARD,
  INITIAL_ARCHIVES
} from './data/seedData';
import { DEMO_ACCOUNTS } from './data/authData';
import { AppSidebar, ActiveTabType } from './components/web/AppSidebar';
import { WebDashboard } from './components/web/WebDashboard';
import { HeatmapPage } from './components/web/HeatmapPage';
import { InboundAppNotesView } from './components/web/InboundAppNotesView';
import { GeminiAIChatView } from './components/web/GeminiAIChatView';
import { AuthView } from './components/web/AuthView';
import { ImpactView } from './components/web/ImpactView';
import { CreateCallModal } from './components/web/CreateCallModal';
import { CallDetailModal } from './components/web/CallDetailModal';
import { ManageResponsesModal } from './components/web/ManageResponsesModal';
import { NotificationsDrawer } from './components/web/NotificationsDrawer';
import { Menu, X, Plus, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Application Data State
  const [calls, setCalls] = useState<Call[]>(INITIAL_CALLS);
  const [evaluations, setEvaluations] = useState<ActivityEvaluation[]>(INITIAL_ACTIVITY_EVALUATIONS);
  const [inboundNotes, setInboundNotes] = useState<AppUserInboundNote[]>(INITIAL_INBOUND_NOTES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Authenticated association state (defaults to accredited association account)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(DEMO_ACCOUNTS[0]);

  // Active responses pool (linked to calls)
  const [responses, setResponses] = useState<CallResponse[]>([
    {
      id: 'resp-1',
      callId: 'call-1',
      callTitle: 'توزيع وجبات وسلال غذائية للأسر المتعففة في الجزائر العاصمة',
      userId: 'user-vol-1',
      userName: 'يوسف بن بوعلام بن مهيدي',
      userPhone: '0551239876',
      responseType: 'can_help',
      message: 'سأحضر معي سيارة نقل بيك أب للمساعدة في إيصال السلال إلى منازل العائلات.',
      status: 'accepted',
      createdAt: '2026-09-18T16:00:00Z'
    },
    {
      id: 'resp-2',
      callId: 'call-1',
      callTitle: 'توزيع وجبات وسلال غذائية للأسر المتعففة في الجزائر العاصمة',
      userId: 'user-top-1',
      userName: 'خالد بن فيصل المنصور',
      userPhone: '0509876543',
      responseType: 'can_help',
      message: 'متواجد وجاهز للفرز والتنظيم الميداني مع فريق الشباب.',
      status: 'accepted',
      createdAt: '2026-09-18T16:30:00Z'
    },
    {
      id: 'resp-3',
      callId: 'call-2',
      callTitle: 'حملة تشجير وتنظيف غابة باينام بالجزائر',
      userId: 'user-top-2',
      userName: 'مريم بن زايد الجزائري',
      userPhone: '0562233445',
      responseType: 'want_to_join',
      message: 'معي 5 متطوعات من نادي البيئة وجاهزات لأعمال الغرس والتنظيف.',
      status: 'accepted',
      createdAt: '2026-09-18T18:00:00Z'
    },
    {
      id: 'resp-4',
      callId: 'call-3',
      callTitle: 'إسناد إسعافي وتنظيمي لقافلة الصحة بالبليدة',
      userId: 'user-top-3',
      userName: 'د. طارق الجزائري',
      userPhone: '0547788990',
      responseType: 'can_help',
      message: 'طبيب طوارئ، معي حقيبة الإسعافات وجاهز لنقطة الكيلو 15.',
      status: 'accepted',
      createdAt: '2026-09-18T20:15:00Z'
    }
  ]);

  // Active navigation tab (Permanent: dashboard -> heatmap -> ai_chat -> leaderboard -> inbound_notes -> auth)
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Modals & Drawers
  const [isCreateCallOpen, setIsCreateCallOpen] = useState(false);
  const [selectedCallForDetail, setSelectedCallForDetail] = useState<Call | null>(null);
  const [selectedCallForResponses, setSelectedCallForResponses] = useState<Call | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Handlers: Save Call
  const handleSaveCall = (newCall: Call) => {
    setCalls(prev => [newCall, ...prev]);

    // Dispatch notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'admin',
      title: `تم إطلاق نداء جديد: ${newCall.title}`,
      body: `تم تسجيل النداء بنجاح باسم ${newCall.creatorOrg} في ${newCall.location.city} ومتاح الآن للمتطوعين على الخريطة.`,
      type: newCall.priority === 'urgent' ? 'urgent_alert' : 'nearby_call',
      callId: newCall.id,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.3 }
      });
    } catch (e) {
      // ignore
    }
  };

  // Handlers: Update Call Status
  const handleUpdateCallStatus = (callId: string, newStatus: CallStatus) => {
    setCalls(prev =>
      prev.map(c => (c.id === callId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    );
    if (selectedCallForDetail && selectedCallForDetail.id === callId) {
      setSelectedCallForDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
    if (selectedCallForResponses && selectedCallForResponses.id === callId) {
      setSelectedCallForResponses(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Handlers: Update Response Status
  const handleUpdateResponseStatus = (
    responseId: string,
    newStatus: 'accepted' | 'rejected' | 'completed'
  ) => {
    setResponses(prev =>
      prev.map(r => (r.id === responseId ? { ...r, status: newStatus } : r))
    );

    const resp = responses.find(r => r.id === responseId);
    if (resp && (newStatus === 'accepted' || newStatus === 'completed')) {
      setCalls(prev =>
        prev.map(c =>
          c.id === resp.callId ? { ...c, confirmedCount: c.confirmedCount + 1 } : c
        )
      );
    }
  };

  // Sync initial evaluations with server knowledge base on load
  useEffect(() => {
    fetch('/api/evaluations/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluations })
    }).catch(() => {});
  }, []);

  // Handlers: Inbound Notes
  const handleUpdateInboundNoteStatus = (noteId: string, newStatus: 'new' | 'reviewed' | 'resolved') => {
    setInboundNotes(prev =>
      prev.map(n => (n.id === noteId ? { ...n, status: newStatus } : n))
    );
  };

  const handleAddNewInboundNote = (note: AppUserInboundNote) => {
    setInboundNotes(prev => [note, ...prev]);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'admin',
      title: `ملاحظة واردة جديدة من تطبيق الجوال: ${note.senderName}`,
      body: note.message.slice(0, 80) + '...',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const activeCallsCount = calls.filter(c => c.status === 'active' || c.status === 'receiving_responses').length;
  const inboundNotesCount = inboundNotes.filter(n => n.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#0c0e14] text-stone-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white antialiased">
      {/* 1. Permanent Desktop Sidebar ("اجعل هذا قائمة دائما") */}
      <div className="hidden md:block shrink-0">
        <AppSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreateCall={() => setIsCreateCallOpen(true)}
          activeCallsCount={activeCallsCount}
          inboundNotesCount={inboundNotesCount}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          currentUser={currentUser}
        />
      </div>

      {/* 2. Mobile Top Bar with Hamburger & Logo */}
      <div className="md:hidden sticky top-0 z-40 bg-[#10131a]/95 backdrop-blur-md border-b border-[#1f2430] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img 
            src="/app-logo.jpg" 
            alt="شعار المنصة" 
            className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-500/40"
          />
          <div>
            <div className="text-sm font-extrabold text-white flex items-center gap-1">
              <span>أثر</span>
              <span className="text-[10px] text-emerald-400 font-mono">Athar DZ</span>
            </div>
            <div className="text-[9px] text-stone-400">بوابة الجمعيات المعتمدة</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreateCallOpen(true)}
            className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm"
            title="إنشاء نداء"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-xl bg-[#161a22] text-stone-300 border border-white/5"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(prev => !prev)}
            className="p-2 rounded-xl bg-[#1c212c] text-stone-200 border border-white/10"
            title="فتح القائمة"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Drawer containing the exact same permanent sidebar */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start animate-in fade-in duration-200">
          <div className="w-72 bg-[#10131a] h-full shadow-2xl relative animate-in slide-in-from-right duration-200 flex flex-col">
            <div className="absolute top-4 left-4 z-50">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-stone-800/80 text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AppSidebar
              activeTab={activeTab}
              setActiveTab={tab => {
                setActiveTab(tab);
                setMobileDrawerOpen(false);
              }}
              onOpenCreateCall={() => {
                setIsCreateCallOpen(true);
                setMobileDrawerOpen(false);
              }}
              activeCallsCount={activeCallsCount}
              inboundNotesCount={inboundNotesCount}
              unreadNotificationsCount={unreadNotificationsCount}
              onOpenNotifications={() => {
                setIsNotificationsOpen(true);
                setMobileDrawerOpen(false);
              }}
              currentUser={currentUser}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
          {activeTab === 'dashboard' && (
            <WebDashboard
              calls={calls}
              onOpenCreateCall={() => setIsCreateCallOpen(true)}
              onOpenHeatmap={() => setActiveTab('heatmap')}
              onSelectCall={call => setSelectedCallForDetail(call)}
              onOpenResponses={call => setSelectedCallForResponses(call)}
              onUpdateCallStatus={handleUpdateCallStatus}
            />
          )}

          {activeTab === 'heatmap' && (
            <HeatmapPage
              calls={calls}
              onSelectCall={call => setSelectedCallForDetail(call)}
            />
          )}

          {/* دردشة Gemini الميدانية */}
          {activeTab === 'ai_chat' && (
            <GeminiAIChatView
              calls={calls}
              currentWilaya={currentUser?.wilaya || '16 - الجزائر العاصمة'}
            />
          )}

          {/* المتصدرون والأثر */}
          {activeTab === 'leaderboard' && (
            <ImpactView
              currentLeaderboard={INITIAL_LEADERBOARD}
              archives={INITIAL_ARCHIVES}
            />
          )}

          {/* ملاحظات الجوال */}
          {activeTab === 'inbound_notes' && (
            <InboundAppNotesView
              notes={inboundNotes}
              calls={calls}
              onUpdateNoteStatus={handleUpdateInboundNoteStatus}
              onAddNewNote={handleAddNewInboundNote}
            />
          )}

          {/* صفحة تسجيل الدخول وإدارة حساب الجمعية المعتمدة */}
          {activeTab === 'auth' && (
            <AuthView
              currentUser={currentUser}
              onLogin={user => {
                setCurrentUser(user);
                setActiveTab('dashboard');
              }}
              onLogout={() => setCurrentUser(null)}
              onNavigateHome={() => setActiveTab('dashboard')}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1a1d26] bg-[#0e1017] py-5 text-center text-xs text-stone-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-stone-400">منظومة أثر الجزائر الميدانية — بوابة الجمعيات</span>
            </div>
            <p>© 2026 أثر | Athar DZ — النظام الرقمي الموحد لإدارة النداءات المجتمعية بالجزائر</p>
          </div>
        </footer>
      </div>

      {/* Create Call Modal with Real Interactive Map & Current Association */}
      <CreateCallModal
        isOpen={isCreateCallOpen}
        onClose={() => setIsCreateCallOpen(false)}
        onSaveCall={handleSaveCall}
        currentUser={currentUser}
      />

      {/* Call Details Modal */}
      <CallDetailModal
        call={selectedCallForDetail}
        responses={responses}
        onClose={() => setSelectedCallForDetail(null)}
        onUpdateCallStatus={handleUpdateCallStatus}
        onUpdateResponseStatus={handleUpdateResponseStatus}
      />

      {/* Manage Responses Modal */}
      <ManageResponsesModal
        call={selectedCallForResponses}
        responses={responses}
        onClose={() => setSelectedCallForResponses(null)}
        onUpdateStatus={handleUpdateResponseStatus}
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
      />
    </div>
  );
}

export default App;
