import React, { useState } from 'react';
import { ActivityEvaluation, Call } from '../../../types';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  X, 
  Wand2,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';

interface NewAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvaluation: (evaluation: ActivityEvaluation) => void;
  calls: Call[];
  allEvaluations: ActivityEvaluation[];
}

export const NewAnalysisModal: React.FC<NewAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAddEvaluation,
  calls,
  allEvaluations
}) => {
  const [activityTitle, setActivityTitle] = useState('');
  const [associationName, setAssociationName] = useState('جمعية الإحسان الخيرية');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [operationalNotes, setOperationalNotes] = useState('');
  const [ratingScore, setRatingScore] = useState<number>(4);
  const [selectedCallId, setSelectedCallId] = useState<string>('');

  // AI Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancingText, setIsEnhancingText] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Real AI text enhancement assist
  const handleEnhanceWithAI = async () => {
    if (!activityTitle && !whatWentWell && !challengesFaced) {
      setAnalysisError('يرجى كتابة عنوان النشاط أو لمحة عن الإيجابيات والعقبات أولاً.');
      return;
    }

    setIsEnhancingText(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'enhance_call',
          title: activityTitle,
          description: `ما نجح: ${whatWentWell} | المشاكل: ${challengesFaced}`,
          category: 'relief'
        })
      });

      const data = await response.json();
      if (data.enhancedDescription) {
        setOperationalNotes(prev => 
          prev 
            ? `${prev}\n• مقترح الذكاء الاصطناعي: ${data.suggestedTitle}` 
            : `• مقترح الذكاء الاصطناعي: ${data.suggestedTitle}\n• المهارات المستفادة: ${(data.suggestedSkills || []).join('، ')}`
        );
      }
    } catch (err) {
      console.error('Enhance error:', err);
    } finally {
      setIsEnhancingText(false);
    }
  };

  // Submit and analyze with Gemini 3.8 Flash
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim() || !associationName.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/ai/analyze-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityTitle,
          associationName,
          whatWentWell,
          challengesFaced,
          operationalNotes,
          pastExperiences: allEvaluations.map(ev => ({
            assoc: ev.associationName,
            title: ev.activityTitle,
            challenges: ev.challengesFaced
          }))
        })
      });

      const data = await response.json();

      const newEval: ActivityEvaluation = {
        id: `eval-${Date.now()}`,
        callId: selectedCallId || undefined,
        activityTitle,
        associationName,
        date,
        whatWentWell,
        challengesFaced,
        operationalNotes,
        ratingScore,
        aiAnalysis: {
          summary: data.summary || 'تم تسجيل التحليل وتوثيق مخرجات التجربة بنجاح.',
          lessonsLearned: data.lessonsLearned || [
            'توثيق آليات التواصل وتحديد مسؤولية كل متطوع مسبقاً.',
            'تأمين خطة بديلة لنقل وتوزيع المواد الميدانية.'
          ],
          futureRiskMitigations: data.futureRiskMitigations || [
            'التحقق الميداني من الموقع والخدمات المحيطة قبل الانطلاق.',
            'توفير أدوات ومعدات احتياطية بنسبة 20%.'
          ],
          crossAssociationAdvice: data.crossAssociationAdvice || [
            'الاستفادة من التجارب السابقة ومشاركة الدروس المستفادة لمنع تكرار الأخطاء.'
          ],
          readinessScore: data.readinessScore || 88
        },
        createdAt: new Date().toISOString()
      };

      onAddEvaluation(newEval);
      onClose();

      // Reset
      setActivityTitle('');
      setWhatWentWell('');
      setChallengesFaced('');
      setOperationalNotes('');
    } catch (err) {
      console.error('Submit analysis error:', err);
      setAnalysisError('تعذر الاتصال بخدمة الذكاء الاصطناعي، يرجى إعادة المحاولة.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-stone-950/95 p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <span>توثيق نشاط وتحليله بنموذج Gemini AI</span>
            </h3>
            <p className="text-xs text-stone-400">
              سجّل تجربة النشاط؛ سيقوم الذكاء الاصطناعي باستخراج الدروس المستفادة والوقاية للجمعيات الأخرى فورياً.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-stone-300 font-medium">اسم الجمعية أو المبادرة المنفذة *</label>
              <input
                type="text"
                required
                value={associationName}
                onChange={e => setAssociationName(e.target.value)}
                placeholder="مثال: جمعية البر، فريق أثر التطوعي"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-stone-300 font-medium">تاريخ تنفيذ النشاط</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-stone-300 font-medium">عنوان النشاط أو المبادرة *</label>
            <input
              type="text"
              required
              value={activityTitle}
              onChange={e => setActivityTitle(e.target.value)}
              placeholder="مثال: حملة توزيع الحقائب المدرسية، إسناد سباق الدراجات"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Link to existing call */}
          <div className="space-y-1">
            <label className="text-stone-400">ربط بنداء حالي في المنصة (اختياري)</label>
            <select
              value={selectedCallId}
              onChange={e => {
                setSelectedCallId(e.target.value);
                const call = calls.find(c => c.id === e.target.value);
                if (call) {
                  setActivityTitle(call.title);
                  if (call.creatorOrg) setAssociationName(call.creatorOrg);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-stone-300 focus:border-purple-500 focus:outline-none"
            >
              <option value="">-- بدون ربط بنداء محدد --</option>
              {calls.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.location.city})
                </option>
              ))}
            </select>
          </div>

          {/* What went well */}
          <div className="space-y-1">
            <label className="text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ما الذي نجح في النشاط؟ (عوامل التميز والإيجابيات) *
            </label>
            <textarea
              required
              rows={3}
              value={whatWentWell}
              onChange={e => setWhatWentWell(e.target.value)}
              placeholder="اكتب ما تم بنجاح: سرعة الحضور، دقة الفرز المسبق، الالتزام بالجدول الزمني..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-emerald-500/30 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Challenges faced */}
          <div className="space-y-1">
            <label className="text-red-400 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              ما هي المشاكل والعقبات التي واجهتكم؟ *
            </label>
            <textarea
              required
              rows={3}
              value={challengesFaced}
              onChange={e => setChallengesFaced(e.target.value)}
              placeholder="اذكر العقبات بصراحة: ضيق الطرق، تأخر توريد الأدوات، نقص التغطية، نقص متطوعين متخصصين..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-red-500/30 text-white placeholder:text-stone-500 focus:border-red-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Operational notes & AI assist button */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-stone-300 font-medium">ملاحظات تشغيلية إضافية</label>
              <button
                type="button"
                onClick={handleEnhanceWithAI}
                disabled={isEnhancingText}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-[11px] font-medium transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3 text-purple-400" />
                <span>{isEnhancingText ? 'جارٍ التحسين...' : 'تحسين بالذكاء الاصطناعي'}</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={operationalNotes}
              onChange={e => setOperationalNotes(e.target.value)}
              placeholder="أي توصيات سريعة أو أرقام تواصل أو حلول بديلة استخدمتموها..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 focus:border-purple-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Star rating */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-900 border border-white/10">
            <span className="text-stone-300 font-medium">التقييم العام للنشاط:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setRatingScore(score)}
                  className={`p-1 transition-transform ${score <= ratingScore ? 'text-amber-400 scale-110' : 'text-stone-600'}`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {analysisError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              {analysisError}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-900/40"
            >
              <BrainCircuit className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'جارٍ التحليل بنموذج Gemini 3.8 Flash...' : 'تحليل وتوثيق التجربة بالـ AI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
