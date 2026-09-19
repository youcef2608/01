import React, { useState } from 'react';
import { ActivityEvaluation, Call, SmartSearchPipelineStep } from '../../../types';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Star, 
  Share2, 
  Lightbulb, 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  MessageSquare, 
  Send, 
  FileText, 
  Compass,
  ArrowRight,
  Layers,
  Server,
  Globe,
  Database,
  Search,
  ExternalLink,
  Plus,
  Mic
} from 'lucide-react';

interface AnalysisDetailStageProps {
  evaluation: ActivityEvaluation | null;
  calls: Call[];
  onUpdateEvaluation: (updated: ActivityEvaluation) => void;
  onOpenCreateCall: () => void;
  allEvaluations: ActivityEvaluation[];
}

interface AdvisorMessage {
  role: 'user' | 'assistant';
  text: string;
  source?: 'server_database' | 'web_search_grounding' | 'rule_engine';
  serverFound?: boolean;
  pipeline?: SmartSearchPipelineStep[];
  matchedRecord?: {
    id?: string;
    activityTitle: string;
    associationName: string;
    challengesFaced?: string;
    whatWentWell?: string;
    lessonsLearned?: string[];
  };
  webSources?: Array<{ title: string; uri: string }>;
  searchQueries?: string[];
}

export const AnalysisDetailStage: React.FC<AnalysisDetailStageProps> = ({
  evaluation,
  calls,
  onUpdateEvaluation,
  onOpenCreateCall,
  allEvaluations
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'advisor' | 'playbook' | 'cross_synthesis'>('diagnostic');
  
  // Real AI Action states
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeSuccess, setReanalyzeSuccess] = useState(false);

  // Playbook generation state
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  const [playbookData, setPlaybookData] = useState<{
    playbookTitle: string;
    phases: { phase: string; items: string[] }[];
  } | null>(evaluation?.aiAnalysis?.playbook || null);

  // Real-time Interactive Advisor Chat state (Server First -> Internet Fallback)
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorHistory, setAdvisorHistory] = useState<AdvisorMessage[]>([
    {
      role: 'assistant',
      text: evaluation 
        ? `أهلاً بك! أنا محرك الاستشارات الميدانية والبحث الذكي لمنظومة "أثر".\n\n📌 مسار المعالجة المزدوج (Dual-Tier Engine):\n1️⃣ يبحث في قاعدة بيانات السيرفر والتجارب الميدانية للجمعيات أولاً.\n2️⃣ إذا لم يجد سابقة مسجلة بالسيرفر، ينتقل تلقائياً للبحث المباشر في شبكة الإنترنت (Google Search Grounding) لاسترجاع أحدث البروتوكولات المعتمدة.\n\nكيف يمكنني دعمك في نشاط "${evaluation.activityTitle}"؟`
        : 'أهلاً بك في محرك البحث والاستشارات الميدانية ثنائي المراحل.',
      source: 'server_database'
    }
  ]);
  const [isAdvisorThinking, setIsAdvisorThinking] = useState(false);

  // Cross Synthesis state
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [crossReport, setCrossReport] = useState<string | null>(null);

  // Copy report state
  const [copied, setCopied] = useState(false);

  if (!evaluation) {
    return (
      <div className="flex-1 bg-stone-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-12 text-center text-stone-400 flex flex-col items-center justify-center min-h-[500px] shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
          <BrainCircuit className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">اختر نشاطاً من القائمة الجانبية</h3>
        <p className="text-xs text-stone-400 max-w-md leading-relaxed">
          انقر على أي تقييم في القائمة الجانبية لعرض التشخيص العميق للذكاء الاصطناعي، الدروس المستفادة، ومحاكي الاستشارات المباشرة.
        </p>
      </div>
    );
  }

  // Handle Live Re-analysis via Gemini
  const handleLiveReanalyze = async () => {
    setIsReanalyzing(true);
    setReanalyzeSuccess(false);

    try {
      const response = await fetch('/api/ai/analyze-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTitle: evaluation.activityTitle,
          associationName: evaluation.associationName,
          whatWentWell: evaluation.whatWentWell,
          challengesFaced: evaluation.challengesFaced,
          operationalNotes: evaluation.operationalNotes,
          pastExperiences: allEvaluations.filter(e => e.id !== evaluation.id).map(e => ({
            title: e.activityTitle,
            assoc: e.associationName,
            challenges: e.challengesFaced
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        const updated: ActivityEvaluation = {
          ...evaluation,
          aiAnalysis: {
            summary: data.summary || evaluation.aiAnalysis?.summary || '',
            lessonsLearned: data.lessonsLearned || evaluation.aiAnalysis?.lessonsLearned || [],
            futureRiskMitigations: data.futureRiskMitigations || evaluation.aiAnalysis?.futureRiskMitigations || [],
            crossAssociationAdvice: data.crossAssociationAdvice || evaluation.aiAnalysis?.crossAssociationAdvice || [],
            readinessScore: data.readinessScore || evaluation.aiAnalysis?.readinessScore || 88,
            playbook: playbookData || undefined
          }
        };

        onUpdateEvaluation(updated);
        setReanalyzeSuccess(true);
        setTimeout(() => setReanalyzeSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to re-analyze:', err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Handle Playbook Generation
  const handleGeneratePlaybook = async () => {
    setIsGeneratingPlaybook(true);
    try {
      const response = await fetch('/api/ai/generate-playbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTitle: evaluation.activityTitle,
          associationName: evaluation.associationName,
          whatWentWell: evaluation.whatWentWell,
          challengesFaced: evaluation.challengesFaced
        })
      });

      const data = await response.json();
      if (data.success && data.phases) {
        setPlaybookData({
          playbookTitle: data.playbookTitle || `دليل إجراءات: ${evaluation.activityTitle}`,
          phases: data.phases
        });
        setActiveTab('playbook');
      }
    } catch (err) {
      console.error('Failed to generate playbook:', err);
    } finally {
      setIsGeneratingPlaybook(false);
    }
  };

  // Handle Advisor Question Submission with Server First -> Internet Fallback
  const handleAskAdvisor = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    const query = customQuestion || advisorQuestion;
    if (!query.trim()) return;

    const userMessage: AdvisorMessage = { role: 'user', text: query };
    setAdvisorHistory(prev => [...prev, userMessage]);
    setAdvisorQuestion('');
    setIsAdvisorThinking(true);

    try {
      const response = await fetch('/api/ai/interactive-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTitle: evaluation.activityTitle,
          associationName: evaluation.associationName,
          whatWentWell: evaluation.whatWentWell,
          challengesFaced: evaluation.challengesFaced,
          question: query,
          history: advisorHistory.slice(-4)
        })
      });

      const data = await response.json();
      const aiReply = data.answer || 'تمت دراسة استفسارك وفق التجارب الميدانية للجمعيات المماثلة.';
      
      setAdvisorHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: aiReply,
          source: data.source,
          serverFound: data.serverFound,
          pipeline: data.pipeline,
          matchedRecord: data.matchedRecord,
          webSources: data.webSources,
          searchQueries: data.searchQueries
        }
      ]);
    } catch (err) {
      console.error('Advisor error:', err);
      setAdvisorHistory(prev => [
        ...prev,
        { 
          role: 'assistant', 
          text: 'عذراً، حدث تعثر مؤقت في الاتصال بالمستشار الذكي. يرجى المحاولة ثانية.' 
        }
      ]);
    } finally {
      setIsAdvisorThinking(false);
    }
  };

  // Handle Cross-Association Synthesis
  const handleGenerateCrossSynthesis = async () => {
    setIsSynthesizing(true);
    try {
      const response = await fetch('/api/ai/analyze-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTitle: 'التحليل التراكمي الشامل لكافة الجمعيات والمبادرات',
          associationName: 'شبكة أثر للجمعيات الشريكة',
          whatWentWell: allEvaluations.map(e => e.whatWentWell).join(' | '),
          challengesFaced: allEvaluations.map(e => e.challengesFaced).join(' | '),
          operationalNotes: 'استخلاص القواسم المشتركة ومنع تكرار الثغرات اللوجستية.',
          pastExperiences: allEvaluations
        })
      });
      const data = await response.json();
      setCrossReport(data.summary || 'تم استخلاص التقرير التراكمي للجمعيات بنجاح.');
      setActiveTab('cross_synthesis');
    } catch (err) {
      setCrossReport('الدروس الكبرى المشتركة: أهمية المسح الميداني المسبق لتفادي ضيق الشوارع، وتأمين نقاط إمداد احتياطية.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Copy full summary to clipboard
  const handleCopyReport = () => {
    const text = `تقرير تحليل نشاط: ${evaluation.activityTitle}
الجهة المنفذة: ${evaluation.associationName}
التاريخ: ${evaluation.date}
نسبة الجاهزية: ${evaluation.aiAnalysis?.readinessScore || 85}%

ملخص الذكاء الاصطناعي:
${evaluation.aiAnalysis?.summary || ''}

الدروس المستفادة:
${evaluation.aiAnalysis?.lessonsLearned.map((l, i) => `${i + 1}. ${l}`).join('\n') || ''}

الإجراءات الاحترازية للأنشطة القادمة:
${evaluation.aiAnalysis?.futureRiskMitigations.map((m, i) => `• ${m}`).join('\n') || ''}

توصيات الجمعيات الأخرى:
${evaluation.aiAnalysis?.crossAssociationAdvice.join('\n') || ''}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const readiness = evaluation.aiAnalysis?.readinessScore || 85;

  return (
    <div className="flex-1 bg-stone-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 transition-all">
      {/* Top Banner: Activity Meta & Quick Real-AI Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center gap-1.5 border border-purple-500/30">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              <span>{evaluation.associationName}</span>
            </span>

            <span className="text-xs text-stone-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{evaluation.date}</span>
            </span>

            <div className="flex items-center gap-1 text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < evaluation.ratingScore ? 'fill-amber-400' : 'text-stone-600'}`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
            {evaluation.activityTitle}
          </h2>

          {evaluation.operationalNotes && (
            <p className="text-xs text-stone-400 leading-relaxed">
              <span className="text-stone-300 font-semibold">ملاحظة ميدانية: </span>
              {evaluation.operationalNotes}
            </p>
          )}
        </div>

        {/* Readiness Meter & Real AI Action Bar */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-start xl:items-end gap-3 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-950/60 border border-white/10">
            <div className="text-right">
              <span className="text-[11px] text-stone-400 block">مؤشر الجاهزية للأنشطة المستقبلية</span>
              <span className="text-xs text-emerald-400 font-medium">تم تقييمها بواسطة Gemini AI</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center font-mono">
              <span className="text-base font-black text-emerald-400 leading-none">{readiness}%</span>
              <span className="text-[9px] text-emerald-300/80">جاهزية</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLiveReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all disabled:opacity-50"
              title="إعادة فحص التجربة وتوليد رؤى أحدث باستخدام Gemini 3.8 Flash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
              <span>{isReanalyzing ? 'جارٍ الفحص بـ AI...' : 'إعادة التحليل بـ Gemini'}</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePlaybook}
              disabled={isGeneratingPlaybook}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>{isGeneratingPlaybook ? 'جارٍ صياغة الدليل...' : 'توليد دليل الإجراءات'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white text-xs font-medium transition-colors"
              title="نسخ التقرير الكامل"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ التقرير'}</span>
            </button>
          </div>

          {reanalyzeSuccess && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3 h-3" />
              <span>تم تحديث التحليل واستخلاص الدروس عبر Gemini بنجاح</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('diagnostic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'diagnostic'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-stone-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-purple-300" />
          <span>التشخيص الشامل والدروس</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advisor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'advisor'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-stone-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>المستشار الذكي المباشر (Gemini AI)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('playbook')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'playbook'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-stone-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>دليل الإجراءات الوقائي (Playbook)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cross_synthesis')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'cross_synthesis'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
              : 'text-stone-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>التحليل التراكمي للجمعيات</span>
        </button>
      </div>

      {/* TAB 1: DIAGNOSTIC & LESSONS */}
      {activeTab === 'diagnostic' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Real Field Input Comparison: Success vs Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-500/20 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                عوامل التميز والنجاح المرصودة
              </span>
              <p className="text-stone-200 leading-relaxed">
                {evaluation.whatWentWell}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/15 border border-red-500/20 space-y-2 text-xs">
              <span className="font-bold text-red-400 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                المشاكل والعقبات التي واجهت الفريق
              </span>
              <p className="text-stone-200 leading-relaxed">
                {evaluation.challengesFaced}
              </p>
            </div>
          </div>

          {/* AI Diagnostic Output */}
          {evaluation.aiAnalysis && (
            <div className="space-y-6 pt-2">
              {/* Executive Summary */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/30 via-stone-900/80 to-purple-950/20 border border-purple-500/30 text-xs text-purple-200 leading-relaxed font-medium space-y-1.5 shadow-inner">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                  <BrainCircuit className="w-4 h-4" />
                  <span>الملخص التشخيصي لمنظومة الذكاء الاصطناعي</span>
                </div>
                <p className="leading-relaxed text-stone-200">{evaluation.aiAnalysis.summary}</p>
              </div>

              {/* Lessons Learned Cards */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>الدروس المستفادة العملية (Lessons Learned)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {evaluation.aiAnalysis.lessonsLearned.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-950/40 border border-white/5 hover:border-amber-500/30 text-xs text-stone-300 space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] text-stone-500">درس معتمد</span>
                      </div>
                      <p className="leading-relaxed">{lesson}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Future Risk Mitigations */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>إجراءات استباقية للأنشطة المستقبلية (لتفادي تكرار المعضلة)</span>
                </h4>
                <div className="space-y-2">
                  {evaluation.aiAnalysis.futureRiskMitigations.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-950/10 border border-red-500/20 text-xs text-stone-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                        !
                      </span>
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-Association Advice */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>توصية موجهة للجمعيات والمبادرات الأخرى في المستقبل</span>
                </h4>
                <div className="space-y-2.5">
                  {evaluation.aiAnalysis.crossAssociationAdvice.map((advice, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 text-xs text-blue-200 leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="text-blue-400 font-bold text-base leading-none">•</span>
                      <span>{advice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE DUAL-TIER AI ADVISOR (Server First -> Internet Fallback) */}
      {activeTab === 'advisor' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Dual-Tier Engine Architecture Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-stone-900/60 to-cyan-950/40 border border-purple-500/30 text-xs text-purple-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">محرك الاستشارات والبحث الذكي ثنائي المراحل</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    سيرفر أولاً ➔ إنترنت
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 leading-relaxed max-w-2xl">
                  يبحث المحرك في قاعدة بيانات السيرفر وسجلات الجمعيات السابقة أولاً؛ وإذا لم يجد سابقة مسجلة، ينتقل تلقائياً للبحث عبر شبكة الإنترنت (Google Search Grounding) لاسترجاع أحدث الحلول والبروتوكولات.
                </p>
              </div>
            </div>

            {/* Architecture Steps Indicator */}
            <div className="flex items-center gap-2 text-[10px] shrink-0 bg-stone-950/70 p-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Server className="w-3.5 h-3.5" />
                <span>1. السيرفر الداخلي</span>
              </div>
              <ArrowRight className="w-3 h-3 text-stone-500 rotate-180" />
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Globe className="w-3.5 h-3.5" />
                <span>2. بحث الإنترنت</span>
              </div>
            </div>
          </div>

          {/* Preset Quick Queries testing both tiers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>جرّب استعلامات فورية لاختبار مساري المحرك:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {/* Server-matching queries */}
              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <Server className="w-3 h-3" />
                  <span>استعلامات مطابقة لسجلات السيرفر الداخلي:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAskAdvisor(undefined, 'كيف نتغلب على انقطاع شبكة الاتصال وتحديد المنازل في الأزقة القديمة؟')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 text-[11px] text-right transition-colors"
                  >
                    • حل انقطاع التغطية في الأزقة القديمة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAdvisor(undefined, 'ما الحل الميداني لصعوبة حفر التربة الصخرية وازدحام مواقف زوار الحدائق؟')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 text-[11px] text-right transition-colors"
                  >
                    • معالجة التربة الصخرية ومواقف الحدائق
                  </button>
                </div>
              </div>

              {/* Internet-fallback queries */}
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400">
                  <Globe className="w-3 h-3" />
                  <span>استعلامات غير مسجلة بالسيرفر (تفعّل بحث الإنترنت التلقائي):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAskAdvisor(undefined, 'ما هو بروتوكول السلامة الميدانية للتعامل مع ضربات الشمس والإجهاد الحراري في فرق الإسناد الصيفية؟')}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-[11px] text-right transition-colors"
                  >
                    • بروتوكول ضربات الشمس والإجهاد الحراري
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAskAdvisor(undefined, 'ما هي شروط وإجراءات ترخيص جمع التبرعات العينية الفورية وفق المركز الوطني لتنمية القطاع غير الربحي؟')}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 text-[11px] text-right transition-colors"
                  >
                    • ترخيص جمع التبرعات العينية الفورية
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat History Messages */}
          <div className="space-y-4 min-h-[280px] max-h-[460px] overflow-y-auto p-4 rounded-2xl bg-stone-950/70 border border-white/10 scrollbar-thin">
            {advisorHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    {msg.source === 'server_database' ? (
                      <Server className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl max-w-2xl ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-stone-900/90 border border-white/10 text-stone-200 rounded-bl-none shadow-xl'
                  }`}
                >
                  {/* Assistant Source Pill Header */}
                  {msg.role === 'assistant' && msg.source && (
                    <div className="flex flex-wrap items-center gap-2 mb-2.5 pb-2 border-b border-white/10">
                      {msg.source === 'server_database' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          <Server className="w-3 h-3" />
                          <span>مصدر داخلي: قاعدة بيانات السيرفر</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                          <Globe className="w-3 h-3" />
                          <span>مصدر خارجي: بحث الإنترنت المباشر (Google Grounding)</span>
                        </span>
                      )}

                      {msg.matchedRecord && (
                        <span className="text-[10px] text-stone-400">
                          سابقة: <strong className="text-stone-300">{msg.matchedRecord.activityTitle}</strong> ({msg.matchedRecord.associationName})
                        </span>
                      )}
                    </div>
                  )}

                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Web Citations if fetched from internet */}
                  {msg.webSources && msg.webSources.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-white/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-bold">
                        <Globe className="w-3 h-3" />
                        <span>المصادر المرجعية المسترجعة من الإنترنت (وثائق ومواقع رسمية):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.webSources.map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-[11px] text-cyan-200 hover:text-white transition-all shadow-sm group"
                          >
                            <span className="truncate max-w-[220px]">{src.title}</span>
                            <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:text-cyan-200 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAdvisorThinking && (
              <div className="flex items-center gap-3 text-xs text-purple-300 bg-stone-900/80 p-3 rounded-2xl border border-purple-500/20 animate-pulse">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Server className="w-4 h-4 animate-spin" />
                  <span>1. فحص قاعدة بيانات السيرفر...</span>
                </div>
                <ArrowRight className="w-3 h-3 text-stone-500 rotate-180" />
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
                  <Globe className="w-4 h-4" />
                  <span>2. الانتقال التلقائي للإنترنت إذا لم يجد</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form with Gemini pill design */}
          <form 
            onSubmit={e => handleAskAdvisor(e)} 
            className="rounded-full bg-[#1e2024] hover:bg-[#23262b] border border-white/10 hover:border-white/20 transition-all shadow-2xl flex items-center px-2 py-1.5 gap-2"
          >
            <button
              type="button"
              onClick={() => setAdvisorQuestion('ما هي أول خطوة وقائية لتجنب التحديات في هذا النشاط؟')}
              className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="إضافة سؤال وقائي سريع"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={advisorQuestion}
              onChange={e => setAdvisorQuestion(e.target.value)}
              placeholder="Ask Gemini"
              dir="auto"
              className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder:text-stone-400 font-sans px-2"
            />
            <button
              type="submit"
              disabled={isAdvisorThinking || !advisorQuestion.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0 shadow-md"
              title="إرسال"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PLAYBOOK (دليل الإجراءات الوقائي) */}
      {activeTab === 'playbook' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>دليل التشغيل والوقاية الميداني المعتمد (Playbook)</span>
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                دليل معياري مولّد بالذكاء الاصطناعي موجه لأي جمعية تخطط لتنفيذ نفس النشاط في المستقبل.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGeneratePlaybook}
              disabled={isGeneratingPlaybook}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingPlaybook ? 'animate-spin' : ''}`} />
              <span>{isGeneratingPlaybook ? 'جارٍ التوليد...' : 'إعادة التوليد بـ Gemini'}</span>
            </button>
          </div>

          {playbookData ? (
            <div className="space-y-4">
              <h4 className="text-base font-extrabold text-white">{playbookData.playbookTitle}</h4>
              <div className="space-y-4">
                {playbookData.phases.map((phase, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-2xl bg-stone-950/40 border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                      <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-mono">
                        {pIdx + 1}
                      </span>
                      <span>{phase.phase}</span>
                    </div>
                    <ul className="space-y-2 pr-4 text-xs text-stone-300">
                      {phase.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-stone-950/30 border border-white/5 text-stone-400 text-xs space-y-3">
              <p>لم يتم توليد دليل الإجراءات التشغيلي لهذا النشاط بعد.</p>
              <button
                type="button"
                onClick={handleGeneratePlaybook}
                disabled={isGeneratingPlaybook}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                توليد الدليل الآن باستخدام Gemini AI
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CROSS SYNTHESIS (التحليل التراكمي للجمعيات) */}
      {activeTab === 'cross_synthesis' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>الذكاء التراكمي المتبادل لكافة الجمعيات</span>
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                تحليل شمولي يعالج كافة الأنشطة المسجلة ({allEvaluations.length} نشاط) لاستخراج الأنماط المتكررة للنجاح والخلل.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateCrossSynthesis}
              disabled={isSynthesizing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg transition-all shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'جارٍ التحليل التراكمي...' : 'تحديث التحليل التراكمي'}</span>
            </button>
          </div>

          {crossReport ? (
            <div className="p-5 rounded-2xl bg-stone-950/50 border border-amber-500/20 text-xs text-stone-200 leading-relaxed space-y-3">
              <span className="font-bold text-amber-400 block text-sm">
                ملخص الرؤية التراكمية المشتركة:
              </span>
              <p className="whitespace-pre-line text-stone-300 leading-loose">{crossReport}</p>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-stone-950/30 border border-white/5 text-stone-400 text-xs space-y-3">
              <p>اضغط لتوليد تقرير الذكاء الاصطناعي المقارن بين كافة الجمعيات وتجاربها.</p>
              <button
                type="button"
                onClick={handleGenerateCrossSynthesis}
                disabled={isSynthesizing}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
              >
                توليد التحليل التراكمي
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
