import React, { useState, useEffect } from 'react';
import { 
  Call, 
  CallResponse, 
  AppNotification, 
  CallStatus,
  ActivityEvaluation,
  ActivityEvaluationReport,
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
import { HomeLandingView } from './components/web/HomeLandingView';
import { WebDashboard } from './components/web/WebDashboard';
import { HeatmapPage } from './components/web/HeatmapPage';
import { GeminiAIChatView } from './components/web/GeminiAIChatView';
import { AuthView } from './components/web/AuthView';
import { ImpactView } from './components/web/ImpactView';
import { CreateCallModal } from './components/web/CreateCallModal';
import { CallDetailModal } from './components/web/CallDetailModal';
import { ManageResponsesModal } from './components/web/ManageResponsesModal';
import { NotificationsDrawer } from './components/web/NotificationsDrawer';
import { AssociationWelcomeModal } from './components/web/AssociationWelcomeModal';
import { ProjectEvaluationReportModal } from './components/web/ProjectEvaluationReportModal';
import { Menu, X, Plus, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Application Data State
  const [calls, setCalls] = useState<Call[]>(INITIAL_CALLS);
  const [evaluations, setEvaluations] = useState<ActivityEvaluation[]>(INITIAL_ACTIVITY_EVALUATIONS);
  const [inboundNotes, setInboundNotes] = useState<AppUserInboundNote[]>(INITIAL_INBOUND_NOTES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Authenticated association state (persisted in localStorage, defaults to null)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('athar_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('athar_current_user', JSON.stringify(currentUser));
      } catch (e) {}
    } else {
      localStorage.removeItem('athar_current_user');
    }
  }, [currentUser]);

  // Active responses pool (starts clean and empty)
  const [responses, setResponses] = useState<CallResponse[]>([]);

  // Active navigation tab (defaults to 'auth' on entry so user sees real login immediately)
  const [activeTab, setActiveTab] = useState<ActiveTabType>(() => {
    try {
      const saved = localStorage.getItem('athar_current_user');
      if (saved) return 'dashboard';
    } catch (e) {}
    return 'auth';
  });
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);


  // Modals & Drawers
  const [isCreateCallOpen, setIsCreateCallOpen] = useState(false);
  const [selectedCallForDetail, setSelectedCallForDetail] = useState<Call | null>(null);
  const [selectedCallForResponses, setSelectedCallForResponses] = useState<Call | null>(null);
  const [selectedCallForReport, setSelectedCallForReport] = useState<Call | null>(null);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync with Backend Database (Supabase / Server) on mount and periodically
  const fetchSync = async () => {
    try {
      const res = await fetch('/api/sync');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.calls)) {
          setCalls(data.calls);
        }
        if (Array.isArray(data.responses)) {
          setResponses(data.responses);
        }
        if (Array.isArray(data.notes)) {
          setInboundNotes(data.notes);
        }
      }
    } catch (e) {
      // Fallback to local state if offline
    }
  };

  useEffect(() => {
    fetchSync();
    const interval = setInterval(fetchSync, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handlers: Save Call
  const handleSaveCall = async (newCall: Call) => {
    setCalls(prev => [newCall, ...prev]);

    // Send to Server DB / Supabase
    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCall)
      });
    } catch (e) {
      console.error('Failed to post call to server', e);
    }

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
  const handleUpdateCallStatus = async (callId: string, newStatus: CallStatus) => {
    setCalls(prev =>
      prev.map(c => (c.id === callId ? { ...c, status: newStatus, updatedAt: new Date().toISOString() } : c))
    );
    if (selectedCallForDetail && selectedCallForDetail.id === callId) {
      setSelectedCallForDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
    if (selectedCallForResponses && selectedCallForResponses.id === callId) {
      setSelectedCallForResponses(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      await fetch(`/api/calls/${callId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  // Handlers: Update Response Status
  const handleUpdateResponseStatus = async (
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

    if (resp) {
      try {
        await fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...resp, status: newStatus })
        });
      } catch (e) {}
    }
  };

  // Handlers: Submit Mandatory Project Evaluation Report
  const handleSubmitEvaluationReport = async (report: ActivityEvaluationReport) => {
    // 1. Update call with report and marked as completed
    setCalls(prev =>
      prev.map(c =>
        c.id === report.callId
          ? {
              ...c,
              status: 'completed',
              reportCompleted: true,
              evaluationReport: report,
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );

    // 2. Award +150 points and increment volunteer statistics for the association
    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        points: (currentUser.points || 0) + 150,
        volunteerHours: (currentUser.volunteerHours || 0) + 30,
        activeInitiativesCount: (currentUser.activeInitiativesCount || 0) + 1
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('athar_current_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    // 3. Post to server evaluations sync
    try {
      await fetch('/api/evaluations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluations: [report] })
      });
    } catch (e) {
      console.error('Failed to sync evaluation report', e);
    }

    // 4. Create official notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: currentUser?.id || 'admin',
      title: `تم توثيق واعتماد التقرير العام الإجباري: ${report.callTitle}`,
      body: `تم إيداع التقرير العام بنجاح (${report.actualVolunteers} متطوع، ${report.beneficiariesCount} مستفيد، تحقيق ${report.goalAchievementRate}% للأهداف) واحتساب +150 نقطة أثر للجمعية.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
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

  const handleAddNewInboundNote = async (note: AppUserInboundNote) => {
    setInboundNotes(prev => [note, ...prev]);

    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
      });
    } catch (e) {}

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
    <div className="min-h-screen bg-[#0b0e14] text-stone-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white antialiased relative">
      {/* Aurora ambient background layers */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="animate-aurora-1 absolute -top-40 right-[-10%] w-[38rem] h-[38rem] rounded-full bg-emerald-500/[0.16] blur-3xl" />
        <div className="animate-aurora-2 absolute top-1/3 left-[-12%] w-[34rem] h-[34rem] rounded-full bg-teal-400/[0.11] blur-3xl" />
        <div className="animate-aurora-3 absolute bottom-[-10%] left-1/3 w-[30rem] h-[30rem] rounded-full bg-sky-500/[0.09] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05),transparent_55%)]" />
      </div>

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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
          {activeTab === 'home' && (
            <HomeLandingView
              calls={calls}
              currentUser={currentUser}
              onOpenCreateCall={() => setIsCreateCallOpen(true)}
              onOpenAiChat={() => setActiveTab('ai_chat')}
              onOpenLeaderboard={() => setActiveTab('leaderboard')}
              onOpenAuth={() => setActiveTab('auth')}
              onOpenDashboard={() => setActiveTab('dashboard')}
              onSelectCall={call => setSelectedCallForDetail(call)}
            />
          )}

          {activeTab === 'dashboard' && (
            <WebDashboard
              calls={calls}
              currentUser={currentUser}
              onOpenCreateCall={() => setIsCreateCallOpen(true)}
              onOpenHeatmap={() => setActiveTab('heatmap')}
              onOpenAiChat={() => setActiveTab('ai_chat')}
              onOpenLeaderboard={() => setActiveTab('leaderboard')}
              onOpenEvaluationReport={call => setSelectedCallForReport(call)}
              onOpenSwitchAssociation={() => setIsWelcomeModalOpen(true)}
              onSelectCall={call => setSelectedCallForDetail(call)}
              onOpenResponses={call => setSelectedCallForResponses(call)}
              onUpdateCallStatus={handleUpdateCallStatus}
              onRefresh={fetchSync}
            />
          )}

          {activeTab === 'heatmap' && (
            <HeatmapPage
              calls={calls}
              onSelectCall={call => setSelectedCallForDetail(call)}
            />
          )}

          {/* مستشار الذكاء الاصطناعي (AI) */}
          {activeTab === 'ai_chat' && (
            <GeminiAIChatView
              calls={calls}
            />
          )}

          {/* المتصدرون والأثر والترتيب الوطني */}
          {activeTab === 'leaderboard' && (
            <ImpactView
              currentLeaderboard={INITIAL_LEADERBOARD}
              archives={INITIAL_ARCHIVES}
              onOpenCreateCall={() => setIsCreateCallOpen(true)}
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
        <footer className="border-t border-white/[0.06] bg-[#0e1017]/80 backdrop-blur-xl py-5 text-center text-xs text-stone-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)] animate-pulse"></span>
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

      {/* Association Welcome & Login Modal on Entry ("طلب اسم جمعية") */}
      <AssociationWelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onLoginSuccess={user => {
          setCurrentUser(user);
          try {
            localStorage.setItem('athar_association_configured', 'true');
            localStorage.setItem('athar_current_user', JSON.stringify(user));
          } catch (e) {}
        }}
      />

      {/* Mandatory General Evaluation Report Modal ("تقرير عام إجباري بعد كل مشروع انتهاء وقت") */}
      <ProjectEvaluationReportModal
        isOpen={!!selectedCallForReport}
        onClose={() => setSelectedCallForReport(null)}
        call={selectedCallForReport}
        currentUser={currentUser}
        onSubmitReport={handleSubmitEvaluationReport}
      />
    </div>
  );
}

export default App;
