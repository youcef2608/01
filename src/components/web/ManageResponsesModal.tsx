import React from 'react';
import { Call, CallResponse } from '../../types';
import { X, CheckCircle2, Clock, Phone, User, MessageSquare, AlertCircle } from 'lucide-react';

interface ManageResponsesModalProps {
  call: Call | null;
  responses: CallResponse[];
  onClose: () => void;
  onUpdateStatus: (responseId: string, status: 'accepted' | 'rejected' | 'completed') => void;
}

export const ManageResponsesModal: React.FC<ManageResponsesModalProps> = ({
  call,
  responses,
  onClose,
  onUpdateStatus
}) => {
  if (!call) return null;

  const callResponses = responses.filter(r => r.callId === call.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>متابعة الردود والاستجابات الميدانية</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-normal">
                {callResponses.length} ردود
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{call.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Call Summary Banner */}
        <div className="bg-stone-950/40 p-4 border-b border-stone-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-400">الاحتياج المطلوب:</span>{' '}
            <strong className="text-white">{call.requiredCount || 'غير محدد'} متطوعين</strong>
          </div>
          <div>
            <span className="text-stone-400">المؤكدون حالياً:</span>{' '}
            <strong className="text-emerald-400">{call.confirmedCount} مستجيبين</strong>
          </div>
          <div>
            <span className="text-stone-400">الحالة:</span>{' '}
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
              {call.status === 'active' ? 'نشط' : 'قيد المتابعة'}
            </span>
          </div>
        </div>

        {/* Responses List */}
        <div className="overflow-y-auto p-6 flex-1 space-y-3">
          {callResponses.length === 0 ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <Clock className="w-10 h-10 text-stone-600 mx-auto" />
              <div className="text-sm font-semibold text-stone-300">لم تصل ردود ميدانية حتى الآن</div>
              <p className="text-xs text-stone-500">
                النداء منشور ومتاح للمستجيبين في تطبيق أثر. ستظهر الردود هنا فور تسجيلها.
              </p>
            </div>
          ) : (
            callResponses.map(resp => (
              <div
                key={resp.id}
                className="bg-stone-950 p-4 rounded-2xl border border-stone-800/80 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-300 font-bold">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{resp.userName}</div>
                      <div className="text-[10px] text-stone-400">
                        {new Date(resp.createdAt).toLocaleString('ar-SA')}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    resp.status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : resp.status === 'completed'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {resp.status === 'accepted'
                      ? 'معتمد ميدانياً'
                      : resp.status === 'completed'
                      ? 'مكتمل بنجاح'
                      : 'قيد المراجعة'}
                  </span>
                </div>

                {/* Response Type & Message */}
                <div className="bg-stone-900/70 p-3 rounded-xl border border-stone-800/50">
                  <div className="font-semibold text-stone-300 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      نوع الاستجابة:{' '}
                      {resp.responseType === 'can_help'
                        ? 'أستطيع المساعدة فورياً'
                        : resp.responseType === 'want_to_join'
                        ? 'أرغب في المشاركة'
                        : resp.responseType === 'need_info'
                        ? 'استفسار وطلب معلومات إضافية'
                        : 'اعتذار'}
                    </span>
                  </div>
                  {resp.message && (
                    <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                      "{resp.message}"
                    </p>
                  )}
                  {resp.userPhone && (
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px] mt-2">
                      <Phone className="w-3 h-3 text-stone-500" />
                      <span>رقم التواصل: {resp.userPhone}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {resp.status !== 'accepted' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(resp.id, 'accepted')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      اعتماد المستجيب
                    </button>
                  )}
                  {resp.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(resp.id, 'completed')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      تأكيد إتمام المساهمة
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
