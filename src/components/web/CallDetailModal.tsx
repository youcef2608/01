import React, { useState } from 'react';
import { Call, CallResponse, CallStatus, ResponseType } from '../../types';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Tag, 
  FileText, 
  Share2, 
  Check, 
  Phone,
  MessageSquare
} from 'lucide-react';
import { InteractiveMap } from '../common/InteractiveMap';

interface CallDetailModalProps {
  call: Call | null;
  responses: CallResponse[];
  onClose: () => void;
  onUpdateCallStatus: (callId: string, newStatus: CallStatus) => void;
  onUpdateResponseStatus: (responseId: string, status: 'accepted' | 'rejected' | 'completed') => void;
  onOpenCreateNote?: (call: Call) => void;
}

export const CallDetailModal: React.FC<CallDetailModalProps> = ({
  call,
  responses,
  onClose,
  onUpdateCallStatus,
  onUpdateResponseStatus,
  onOpenCreateNote
}) => {
  const [copied, setCopied] = useState(false);

  if (!call) return null;

  const callResponses = responses.filter(r => r.callId === call.id);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/call/${call.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${call.location.latitude},${call.location.longitude}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 text-right">
      <div className="w-full max-w-4xl bg-[#171a21] border border-[#282d38] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-stone-100">
        {/* Header bar */}
        <div className="p-6 border-b border-[#252932] flex items-start justify-between gap-4 bg-[#1b1f27]">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                call.priority === 'urgent'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : call.priority === 'high'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-stone-800 text-stone-300'
              }`}>
                {call.priority === 'urgent' ? '🚨 أولوية طارئة عاجلة' : call.priority === 'high' ? 'أولوية مرتفعة' : 'أولوية اعتيادية'}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {call.category === 'volunteer' ? 'تطوع وميدان' : call.category === 'community' ? 'مبادرة مجتمعية' : call.category === 'education' ? 'تعليم وتدريب' : call.category === 'tech' ? 'تقني ورقمي' : 'مساعدة وإسناد'}
              </span>

              <span className="text-xs text-stone-400">
                مُنشأ بواسطة: <strong className="text-stone-200">{call.creatorOrg || call.creatorName}</strong>
              </span>
            </div>

            <h2 className="text-xl font-bold text-white leading-snug">{call.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-[#222731] hover:bg-[#2b313e] text-stone-300 transition-colors"
              title="نسخ رابط النداء"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#222731] hover:bg-[#2b313e] text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Grid: Info + Map */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left 7 cols: Description & details */}
            <div className="md:col-span-7 space-y-5">
              {/* Description */}
              <div className="bg-[#1c2028] p-4 rounded-2xl border border-[#2a2f3b] space-y-2">
                <h4 className="text-xs font-bold text-stone-300">تفاصيل النداء</h4>
                <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                  {call.description}
                </p>
              </div>

              {/* Goal & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {call.goal && (
                  <div className="bg-[#1c2028] p-3.5 rounded-2xl border border-[#2a2f3b] space-y-1">
                    <span className="text-[11px] font-bold text-emerald-400 block">الهدف من النداء:</span>
                    <p className="text-xs text-stone-300">{call.goal}</p>
                  </div>
                )}
                {call.targetAudience && (
                  <div className="bg-[#1c2028] p-3.5 rounded-2xl border border-[#2a2f3b] space-y-1">
                    <span className="text-[11px] font-bold text-sky-400 block">الفئة المستهدفة:</span>
                    <p className="text-xs text-stone-300">{call.targetAudience}</p>
                  </div>
                )}
              </div>

              {/* Skills required */}
              {call.requiredSkills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-300 block">المهارات والخبرات المطلوبة:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {call.requiredSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg text-xs bg-[#242934] text-stone-200 border border-[#313745]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Timing and quota stats */}
              <div className="bg-[#1c2028] p-4 rounded-2xl border border-[#2a2f3b] grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-stone-500 block">العدد المطلوب</span>
                  <span className="text-base font-bold text-white mt-0.5 block">{call.requiredCount || 'مفتوح'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">المتطوعين المؤكدين</span>
                  <span className="text-base font-bold text-emerald-400 mt-0.5 block">{call.confirmedCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 block">إجمالي الردود</span>
                  <span className="text-base font-bold text-sky-400 mt-0.5 block">{call.responsesCount}</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Location & Map */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-[#1c2028] p-4 rounded-2xl border border-[#2a2f3b] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>موقع النداء الميداني</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400">{call.location.city}</span>
                </div>

                <div className="text-xs text-stone-300 space-y-1">
                  <div className="font-semibold text-white">{call.location.placeName}</div>
                  {call.location.approxAddress && (
                    <p className="text-stone-400 text-[11px]">{call.location.approxAddress}</p>
                  )}
                  <div className="text-[10px] font-mono text-stone-500 pt-1">
                    {call.location.latitude.toFixed(4)}, {call.location.longitude.toFixed(4)}
                  </div>
                </div>

                {/* Map preview */}
                <div className="h-44 rounded-xl overflow-hidden border border-[#2b303c]">
                  <InteractiveMap
                    mode="heatmap"
                    calls={[call]}
                    selectedCallId={call.id}
                  />
                </div>

                {/* External link to Google Maps */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#222731] hover:bg-[#2b313e] text-emerald-400 border border-[#2f3542] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح في خرائط Google Maps</span>
                </a>
              </div>

              {/* Status Update Control */}
              <div className="bg-[#1c2028] p-4 rounded-2xl border border-[#2a2f3b] space-y-2">
                <label className="block text-xs font-bold text-stone-300">حالة النداء التشغيلية:</label>
                <select
                  value={call.status}
                  onChange={e => onUpdateCallStatus(call.id, e.target.value as CallStatus)}
                  className="w-full bg-[#12141a] border border-[#2a2f3b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="active">نشط (يستقبل استجابات)</option>
                  <option value="in_progress">قيد التنفيذ الميداني</option>
                  <option value="completed">مكتمل ومنجز</option>
                  <option value="closed">مغلق ومؤرشف</option>
                </select>
              </div>
            </div>
          </div>

          {/* Volunteers / Responses for this Call */}
          <div className="space-y-3 pt-4 border-t border-[#252932]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>المستجيبون لهذا النداء ({callResponses.length})</span>
              </h3>
            </div>

            {callResponses.length === 0 ? (
              <div className="p-8 text-center bg-[#1c2028] rounded-2xl border border-[#282d38] text-stone-400 text-xs">
                لم تسجل استجابات بعد لهذا النداء. يتم استقبال ردود المتطوعين عبر الشبكة الميدانية.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {callResponses.map(resp => (
                  <div key={resp.id} className="p-3.5 bg-[#1c2028] rounded-2xl border border-[#282d38] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white">{resp.userName}</div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        resp.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : resp.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {resp.status === 'accepted' ? 'معتمد' : resp.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </div>

                    {resp.userPhone && (
                      <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                        <Phone className="w-3 h-3 text-stone-500" />
                        <span dir="ltr">{resp.userPhone}</span>
                      </div>
                    )}

                    {resp.message && (
                      <p className="text-stone-300 italic bg-[#14161c] p-2 rounded-lg text-[11px]">
                        "{resp.message}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {resp.status !== 'accepted' && (
                        <button
                          type="button"
                          onClick={() => onUpdateResponseStatus(resp.id, 'accepted')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors"
                        >
                          اعتماد المتطوع
                        </button>
                      )}
                      {resp.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => onUpdateResponseStatus(resp.id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-[#252932] hover:bg-red-900/30 text-stone-400 hover:text-red-400 text-[11px] transition-colors"
                        >
                          استبعاد
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#252932] bg-[#14161c] flex items-center justify-between text-xs">
          <span className="text-stone-400">
            تاريخ النشر: {new Date(call.createdAt).toLocaleDateString('ar-SA')}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
