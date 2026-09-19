import React, { useState } from 'react';
import { Call, UserProfile, ResponseType } from '../../types';
import { calculateDistanceKm, formatDistance } from '../../utils/geo';
import { InteractiveMap } from '../common/InteractiveMap';
import confetti from 'canvas-confetti';
import { 
  ChevronRight, 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  Bookmark, 
  BookmarkCheck, 
  Flag, 
  Send,
  MessageSquare,
  Sparkles,
  Phone
} from 'lucide-react';

interface MobileCallDetailProps {
  call: Call;
  user: UserProfile;
  onBack: () => void;
  onSubmitResponse: (callId: string, responseType: ResponseType, message?: string) => void;
  onToggleSaveCall: (callId: string) => void;
}

export const MobileCallDetail: React.FC<MobileCallDetailProps> = ({
  call,
  user,
  onBack,
  onSubmitResponse,
  onToggleSaveCall
}) => {
  const [selectedResponse, setSelectedResponse] = useState<ResponseType | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const distanceKm = calculateDistanceKm(
    user.location.latitude,
    user.location.longitude,
    call.location.latitude,
    call.location.longitude
  );

  const isSaved = user.savedCallIds.includes(call.id);

  // Trigger Google Maps directions URL
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${call.location.latitude},${call.location.longitude}`;

  const handleSendResponse = (type: ResponseType) => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitResponse(call.id, type, customMessage);
      setIsSubmitting(false);
      setHasResponded(true);

      if (type === 'can_help' || type === 'want_to_join') {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        } catch (e) {
          // fallback
        }
      }
    }, 400);
  };

  return (
    <div className="space-y-4 pb-24 text-right">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-stone-300 hover:text-white font-medium p-1"
        >
          <ChevronRight className="w-4 h-4" />
          <span>العودة للرادار</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleSaveCall(call.id)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 transition-colors"
            title="حفظ في المحفوظات"
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-red-400 transition-colors"
            title="إبلاغ عن محتوى"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Call Banner */}
      <div className="bg-stone-950 p-5 rounded-3xl border border-stone-800 space-y-3">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
            call.priority === 'urgent'
              ? 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
          }`}>
            {call.priority === 'urgent' ? '🔴 استجابة عاجلة جداً' : '🟢 نداء نشط'}
          </span>

          <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
            <Navigation className="w-3 h-3" />
            <span>يبعد {formatDistance(distanceKm)} عنك</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-white leading-snug">
          {call.title}
        </h2>

        {/* Creator Identity */}
        <div className="flex items-center gap-2 text-xs text-stone-400 pt-1 border-t border-stone-800/80">
          <span className="text-stone-300 font-semibold">{call.creatorName}</span>
          <span>•</span>
          <span>{call.creatorOrg}</span>
        </div>
      </div>

      {/* Description & Goal */}
      <div className="bg-stone-950 p-5 rounded-3xl border border-stone-800 space-y-3 text-xs">
        <div>
          <h3 className="font-bold text-stone-200 mb-1">وصف النداء والمهام المطلوبة:</h3>
          <p className="text-stone-300 leading-relaxed whitespace-pre-line">
            {call.description}
          </p>
        </div>

        {call.goal && (
          <div className="p-3 bg-stone-900/80 rounded-2xl border border-stone-800 text-stone-300">
            <strong className="text-emerald-400 block mb-1">الهدف الرئيسي:</strong>
            {call.goal}
          </div>
        )}
      </div>

      {/* Mini Map & Navigation to Google Maps */}
      <div className="bg-stone-950 p-5 rounded-3xl border border-stone-800 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>موقع النداء الميداني</span>
          </div>

          {/* External Google Maps Button */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>الاتجاهات عبر Google Maps</span>
          </a>
        </div>

        <p className="text-stone-400 text-xs">
          {call.location.placeName} - {call.location.city} ({call.location.approxAddress})
        </p>

        {/* Mini Interactive Map Component */}
        <InteractiveMap
          mode="radar"
          calls={[call]}
          userLocation={{ latitude: user.location.latitude, longitude: user.location.longitude }}
          heightClass="h-44"
          selectedCallId={call.id}
        />
      </div>

      {/* Requirements & Skills */}
      <div className="bg-stone-950 p-5 rounded-3xl border border-stone-800 space-y-3 text-xs">
        <h3 className="font-bold text-white">المهارات والمتطلبات:</h3>
        <div className="flex flex-wrap gap-1.5">
          {call.requiredSkills.map(sk => {
            const hasSkill = user.skills.includes(sk);
            return (
              <span
                key={sk}
                className={`px-3 py-1 rounded-xl text-xs font-medium border ${
                  hasSkill
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold'
                    : 'bg-stone-900 text-stone-400 border-stone-800'
                }`}
              >
                {sk} {hasSkill && '★'}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-stone-400">
          <div>
            العدد المطلوب:{' '}
            <strong className="text-white">{call.requiredCount || 'مفتوح'}</strong>
          </div>
          <div>
            المؤكدون حالياً:{' '}
            <strong className="text-emerald-400">{call.confirmedCount}</strong>
          </div>
        </div>

        {call.contactInfo && (
          <div className="flex items-center gap-2 pt-2 border-t border-stone-800 text-stone-300">
            <Phone className="w-3.5 h-3.5 text-stone-500" />
            <span>للاستفسار: {call.contactInfo}</span>
          </div>
        )}
      </div>

      {/* Response Action Card */}
      <div className="bg-stone-950 p-5 rounded-3xl border border-emerald-500/30 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>تحديد استجابتك وتفاعلك مع النداء</span>
        </h3>

        {hasResponded ? (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">تم إرسال استجابتك بنجاح!</div>
            <p className="text-xs text-stone-300 leading-relaxed">
              وصل ردك إلى منسق النداء في الموقع، وحصلت على <strong>+40 نقطة أثر</strong> في الترتيب الشهري.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-stone-400">
              اختر نوع استجابتك لمساعدة المنسقين على تنظيم الجهد الميداني:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Option 1: Can help */}
              <button
                type="button"
                onClick={() => setSelectedResponse('can_help')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                  selectedResponse === 'can_help'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
              >
                أستطيع المساعدة فوراً ⚡
              </button>

              {/* Option 2: Want to join */}
              <button
                type="button"
                onClick={() => setSelectedResponse('want_to_join')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all text-center ${
                  selectedResponse === 'want_to_join'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800'
                }`}
              >
                أرغب في المشاركة 🤝
              </button>

              {/* Option 3: Need info */}
              <button
                type="button"
                onClick={() => setSelectedResponse('need_info')}
                className={`p-3 rounded-2xl border text-xs font-medium transition-all text-center ${
                  selectedResponse === 'need_info'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md'
                    : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800'
                }`}
              >
                أحتاج معلومات إضافية ❓
              </button>

              {/* Option 4: Cannot now */}
              <button
                type="button"
                onClick={() => setSelectedResponse('cannot_now')}
                className={`p-3 rounded-2xl border text-xs font-medium transition-all text-center ${
                  selectedResponse === 'cannot_now'
                    ? 'bg-stone-800 text-white border-stone-700'
                    : 'bg-stone-900 border-stone-800 text-stone-500 hover:bg-stone-800'
                }`}
              >
                لا أستطيع المشاركة حالياً ✕
              </button>
            </div>

            {/* Custom message input */}
            {selectedResponse && (
              <div className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="أضف ملاحظة للمنسق (مثل: سأصل خلال 20 دقيقة، معي سيارة نقل...)"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSendResponse(selectedResponse)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد وإرسال الاستجابة</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-400" />
              <span>الإبلاغ عن محتوى غير لائق</span>
            </h4>
            <textarea
              rows={3}
              value={reportReason}
              onChange={e => setReportReason(e.target.value)}
              placeholder="وضح سبب البلاغ (معلومات غير صحيحة، محتوى مخالف...)"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('شكراً لك، تم استلام بلاغك وستتم مراجعته من قِبل المشرفين.');
                  setShowReportModal(false);
                }}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                إرسال البلاغ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
