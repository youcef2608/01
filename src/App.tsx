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
import { WebNavbar, ActiveTabType } from './components/web/WebNavbar';
import { WebDashboard } from './components/web/WebDashboard';
import { LiveStreamView } from './components/web/LiveStreamView';
import { HeatmapPage } from './components/web/HeatmapPage';
import { InboundAppNotesView } from './components/web/InboundAppNotesView';
import { ActivityAnalysisView } from './components/web/ActivityAnalysisView';
import { GeminiAIChatView } from './components/web/GeminiAIChatView';
import { AuthView } from './components/web/AuthView';
import { ImpactView } from './components/web/ImpactView';
import { SettingsView } from './components/web/SettingsView';
import { CreateCallModal } from './components/web/CreateCallModal';
import { CallDetailModal } from './components/web/CallDetailModal';
import { ManageResponsesModal } from './components/web/ManageResponsesModal';
import { NotificationsDrawer } from './components/web/NotificationsDrawer';
import confetti from 'canvas-confetti';

export function App() {
  // Application Data State
  const [calls, setCalls] = useState<Call[]>(INITIAL_CALLS);
  const [evaluations, setEvaluations] = useState<ActivityEvaluation[]>(INITIAL_ACTIVITY_EVALUATIONS);
  const [inboundNotes, setInboundNotes] = useState<AppUserInboundNote[]>(INITIAL_INBOUND_NOTES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Authenticated user state (defaults to verified volunteer demo account)
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

  // Active navigation tab (ordered: dashboard -> live [instead of books] -> heatmap -> analysis -> leaderboard -> inbound_notes -> settings)
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

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
      body: `تم تسجيل النداء بنجاح في ${newCall.location.city} (${newCall.location.placeName}) وهو متاح الآن للمتطوعين على الخريطة.`,
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

  // Handlers: Evaluations
  const handleAddEvaluation = (newEval: ActivityEvaluation) => {
    setEvaluations(prev => [newEval, ...prev]);

    fetch('/api/evaluations/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluations: [newEval] })
    }).catch(() => {});

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: 'admin',
      title: `تم توثيق وتحليل نشاط: ${newEval.activityTitle}`,
      body: `قام الذكاء الاصطناعي باستخراج الدروس المستفادة ونقاط القوة والفرص لخدمة الجمعيات الأخرى.`,
      type: 'general',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdateEvaluation = (updated: ActivityEvaluation) => {
    setEvaluations(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    
    fetch('/api/evaluations/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluations: [updated] })
    }).catch(() => {});
  };

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

  return (
    <div className="min-h-screen bg-[#0e1015] text-stone-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Sleek Athar Web Navigation Bar */}
      <WebNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateCall={() => setIsCreateCallOpen(true)}
        activeCallsCount={calls.filter(c => c.status === 'active' || c.status === 'receiving_responses').length}
        inboundNotesCount={inboundNotes.filter(n => n.status === 'new').length}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content View */}
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

        {/* مباشر (In place of كتب as requested, without a split) */}
        {activeTab === 'live' && (
          <LiveStreamView
            calls={calls}
            onSelectCall={call => setSelectedCallForDetail(call)}
            onOpenCreateCall={() => setIsCreateCallOpen(true)}
          />
        )}

        {activeTab === 'heatmap' && (
          <HeatmapPage
            calls={calls}
            onSelectCall={call => setSelectedCallForDetail(call)}
          />
        )}

        {/* دردشة Gemini الميدانية (Matching user's requested screenshot layout) */}
        {activeTab === 'ai_chat' && (
          <GeminiAIChatView
            calls={calls}
            currentWilaya={currentUser?.wilaya || '16 - الجزائر العاصمة'}
          />
        )}

        {activeTab === 'analysis' && (
          <ActivityAnalysisView
            evaluations={evaluations}
            calls={calls}
            onAddEvaluation={handleAddEvaluation}
            onUpdateEvaluation={handleUpdateEvaluation}
            onOpenCreateCall={() => setIsCreateCallOpen(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <ImpactView
            currentLeaderboard={INITIAL_LEADERBOARD}
            archives={INITIAL_ARCHIVES}
          />
        )}

        {activeTab === 'inbound_notes' && (
          <InboundAppNotesView
            notes={inboundNotes}
            calls={calls}
            onUpdateNoteStatus={handleUpdateInboundNoteStatus}
            onAddNewNote={handleAddNewInboundNote}
          />
        )}

        {/* صفحة تسجيل الدخول وإدارة حساب المتطوع الميداني */}
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

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e222b] bg-[#12141a] py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-stone-400">منظومة أثر الجزائر الميدانية</span>
          </div>
          <p>© 2026 أثر | Athar DZ — جميع الحقوق محفوظة لفرق العمل الإنساني والتطوعي بالجزائر</p>
        </div>
      </footer>

      {/* Create Call Modal with Real Interactive Map */}
      <CreateCallModal
        isOpen={isCreateCallOpen}
        onClose={() => setIsCreateCallOpen(false)}
        onSaveCall={handleSaveCall}
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
