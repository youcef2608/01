import React, { useState, useEffect } from 'react';
import { Call, ActivityEvaluationReport, AuthUser } from '../../types';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  Users, 
  Target, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  HelpCircle,
  Lightbulb,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProjectEvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: Call | null;
  currentUser: AuthUser | null;
  onSubmitReport: (report: ActivityEvaluationReport) => void;
}

export const ProjectEvaluationReportModal: React.FC<ProjectEvaluationReportModalProps> = ({
  isOpen,
  onClose,
  call,
  currentUser,
  onSubmitReport
}) => {
  if (!isOpen || !call) return null;

  const currentAssocName = currentUser?.associationName || call.creatorOrg || call.creatorName || 'الجمعية المنظمة';
  const currentWilaya = currentUser?.wilaya || call.location?.city || 'الجزائر';

  const [targetVolunteers, setTargetVolunteers] = useState<number>(call.requiredCount || 10);
  const [actualVolunteers, setActualVolunteers] = useState<number>(call.confirmedCount || call.requiredCount || 10);
  const [beneficiariesCount, setBeneficiariesCount] = useState<number>(120);
  const [goalRate, setGoalRate] = useState<number>(95);
  const [whatWentWell, setWhatWentWell] = useState<string>(
    'التزام المتطوعين بالموعد المحدد، وتكامل المهام اللوجستية وتوزيع الأدوار بدقة وسرعة الاستجابة الميدانية.'
  );
  const [challengesFaced, setChallengesFaced] = useState<string>(
    'صعوبة وصول الشاحنات للأزقة الضيقة وبعض الضغط على نقاط التوزيع في الساعة الأولى، وتم التغلب عليها بالفرق الراجلة.'
  );
  const [operationalNotes, setOperationalNotes] = useState<string>(
    'يُوصى بتوفير عربات يدوية إضافية للشوارع الضيقة، واعتماد نظام التعبئة المسبقة لتسريع التسليم.'
  );
  const [lessonItem1, setLessonItem1] = useState<string>('تحديد مسارات الدخول والخروج مسبقاً لتفادي الازدحام.');
  const [lessonItem2, setLessonItem2] = useState<string>('تقسيم المتطوعين إلى خلايا ثنائية مرنة ومزودة بأجهزة اتصال.');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (call.evaluationReport) {
      const rep = call.evaluationReport;
      setTargetVolunteers(rep.targetVolunteers);
      setActualVolunteers(rep.actualVolunteers);
      setBeneficiariesCount(rep.beneficiariesCount || 120);
      setGoalRate(rep.goalAchievementRate || 95);
      setWhatWentWell(rep.whatWentWell);
      setChallengesFaced(rep.challengesFaced);
      setOperationalNotes(rep.operationalNotes);
      if (rep.lessonsLearned && rep.lessonsLearned.length > 0) {
        setLessonItem1(rep.lessonsLearned[0] || '');
        setLessonItem2(rep.lessonsLearned[1] || '');
      }
      setRating(rep.rating || 5);
    }
  }, [call]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const report: ActivityEvaluationReport = {
      id: `eval-rep-${Date.now()}`,
      callId: call.id,
      callTitle: call.title,
      associationName: currentAssocName,
      wilaya: currentWilaya,
      targetVolunteers: Number(targetVolunteers),
      actualVolunteers: Number(actualVolunteers),
      beneficiariesCount: Number(beneficiariesCount),
      goalAchievementRate: Number(goalRate),
      whatWentWell: whatWentWell.trim(),
      challengesFaced: challengesFaced.trim(),
      operationalNotes: operationalNotes.trim(),
      lessonsLearned: [lessonItem1.trim(), lessonItem2.trim()].filter(Boolean),
      rating: Number(rating),
      status: 'approved',
      submittedAt: new Date().toISOString()
    };

    setTimeout(() => {
      onSubmitReport(report);
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.3 }
        });
      } catch (err) {}
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-[#12151d] border border-amber-500/30 rounded-3xl max-w-3xl w-full p-6 sm:p-8 text-right shadow-2xl relative my-8 overflow-hidden space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-[#252a38] pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-black text-amber-400">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>التقرير العام الإجباري بعد انتهاء النشاط</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                +150 نقطة أثر معتمدة
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              تقييم واعتماد مخرجات: {call.title}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              الجمعية المنفذة: <strong className="text-emerald-400">{currentAssocName}</strong> | الولاية: {currentWilaya}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Box */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>إلزامية التوثيق الميداني:</strong> بموجب ميثاق العمل التكافلي لمنظومة «أثر»، يتعين على الجمعية المعتمدة إيداع هذا التقرير لتوثيق إحصائيات المشاركة، وإثراء ذاكرة العمل الخيري بالجزائر لتمكين الذكاء الاصطناعي من تقديم المشورة في الحملات اللاحقة.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#181d28] border border-[#272e3f] rounded-2xl p-4 space-y-1.5">
              <label className="text-stone-300 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>المتطوعون الفعليون:</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={actualVolunteers}
                onChange={e => setActualVolunteers(Number(e.target.value))}
                className="w-full bg-[#10131a] border border-[#2b3346] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-stone-500 block">المستهدف كان: {targetVolunteers} متطوع</span>
            </div>

            <div className="bg-[#181d28] border border-[#272e3f] rounded-2xl p-4 space-y-1.5">
              <label className="text-stone-300 font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-sky-400" />
                <span>المستفيدون المباشرون:</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={beneficiariesCount}
                onChange={e => setBeneficiariesCount(Number(e.target.value))}
                placeholder="مثال: 150 أسرة"
                className="w-full bg-[#10131a] border border-[#2b3346] rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-stone-500 block">عائلة / طفل / مستفيد</span>
            </div>

            <div className="bg-[#181d28] border border-[#272e3f] rounded-2xl p-4 space-y-1.5">
              <label className="text-stone-300 font-bold flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>نسبة إنجاز الأهداف:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="40"
                  max="100"
                  value={goalRate}
                  onChange={e => setGoalRate(Number(e.target.value))}
                  className="flex-1 accent-amber-500"
                />
                <span className="font-mono text-amber-400 font-bold text-sm min-w-[40px] text-left">{goalRate}%</span>
              </div>
              <span className="text-[10px] text-stone-500 block">تقييم نسبة التنفيذ الميداني</span>
            </div>
          </div>

          {/* What went well */}
          <div className="space-y-1.5">
            <label className="text-stone-300 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ما تم بنجاح وعوامل التميز الميداني (إجباري):</span>
            </label>
            <textarea
              required
              rows={3}
              value={whatWentWell}
              onChange={e => setWhatWentWell(e.target.value)}
              placeholder="صف باختصار أبرز النقاط الإيجابية، تجاوب المتطوعين، سرعة التوزيع، دقة التنسيق..."
              className="w-full bg-[#181d28] border border-[#272e3f] rounded-2xl p-3 text-stone-200 focus:outline-none focus:border-emerald-500 leading-relaxed text-xs"
            />
          </div>

          {/* Challenges faced */}
          <div className="space-y-1.5">
            <label className="text-stone-300 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>التحديات والعقبات الميدانية التي واجهت الفريق (إجباري):</span>
            </label>
            <textarea
              required
              rows={3}
              value={challengesFaced}
              onChange={e => setChallengesFaced(e.target.value)}
              placeholder="مثال: صعوبة وصول المركبات، نقص في مواد التغليف، تقلبات الطقس، ضعف التغطية الهاتفية..."
              className="w-full bg-[#181d28] border border-[#272e3f] rounded-2xl p-3 text-stone-200 focus:outline-none focus:border-red-500 leading-relaxed text-xs"
            />
          </div>

          {/* Operational Notes */}
          <div className="space-y-1.5">
            <label className="text-stone-300 font-bold flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>الحلول الميدانية المعتمدة والتوصيات التشغيلية:</span>
            </label>
            <textarea
              required
              rows={2}
              value={operationalNotes}
              onChange={e => setOperationalNotes(e.target.value)}
              placeholder="كيف تم حل التحدي وما هي النصيحة التشغيلية لأي جمعية تنفذ نشاطاً مماثلاً..."
              className="w-full bg-[#181d28] border border-[#272e3f] rounded-2xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 leading-relaxed text-xs"
            />
          </div>

          {/* Lessons Learned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-stone-400 font-semibold">درس مستفاد 1:</label>
              <input
                type="text"
                required
                value={lessonItem1}
                onChange={e => setLessonItem1(e.target.value)}
                placeholder="درس ميداني مستخلص..."
                className="w-full bg-[#181d28] border border-[#272e3f] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-stone-400 font-semibold">درس مستفاد 2:</label>
              <input
                type="text"
                value={lessonItem2}
                onChange={e => setLessonItem2(e.target.value)}
                placeholder="درس تنظيمي آخر..."
                className="w-full bg-[#181d28] border border-[#272e3f] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Self Rating */}
          <div className="bg-[#181d28] border border-[#272e3f] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white text-xs">التقييم الذاتي العام للنشاط:</div>
              <div className="text-[10px] text-stone-400">تقييم مستوى نجاح الحملة ورضا المستفيدين</div>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-125"
                >
                  <Star 
                    className={`w-5 h-5 ${
                      star <= rating 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-stone-600'
                    }`} 
                  />
                </button>
              ))}
              <span className="font-bold font-mono text-amber-400 mr-2 text-xs">({rating}/5)</span>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#252a38]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-[#1e2330] hover:bg-[#272e40] text-stone-400 hover:text-white font-bold transition-all text-xs"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 hover:opacity-95 text-white font-black shadow-lg shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 text-xs disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الاعتماد...' : 'اعتماد وحفظ التقرير العام الإجباري'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEvaluationReportModal;
