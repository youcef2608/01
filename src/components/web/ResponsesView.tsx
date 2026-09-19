import React, { useState, useMemo } from 'react';
import { CallResponse, Call } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  MessageSquare, 
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ResponsesViewProps {
  responses: CallResponse[];
  calls: Call[];
  onUpdateStatus: (responseId: string, status: 'accepted' | 'rejected' | 'completed') => void;
  onSelectCall: (call: Call) => void;
}

export const ResponsesView: React.FC<ResponsesViewProps> = ({
  responses,
  calls,
  onUpdateStatus,
  onSelectCall
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'rejected'>('all');

  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.userName.toLowerCase().includes(q) ||
          r.callTitle.toLowerCase().includes(q) ||
          (r.message && r.message.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [responses, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: responses.length,
      pending: responses.filter(r => r.status === 'pending').length,
      accepted: responses.filter(r => r.status === 'accepted').length,
      completed: responses.filter(r => r.status === 'completed').length
    };
  }, [responses]);

  return (
    <div className="space-y-6 text-right">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" />
            <span>إدارة الاستجابات الميدانية والمتطوعين</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            متابعة واعتماد ردود المستجيبين وتوزيع المهام الميدانية عبر مختلف النداءات
          </p>
        </div>
      </div>

      {/* KPI Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#181a20] border border-[#262a33] p-4 rounded-2xl">
          <div className="text-[11px] text-stone-400">إجمالي الاستجابات</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
        </div>

        <div className="bg-[#181a20] border border-[#262a33] p-4 rounded-2xl">
          <div className="text-[11px] text-stone-400">قيد المراجعة</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</div>
        </div>

        <div className="bg-[#181a20] border border-[#262a33] p-4 rounded-2xl">
          <div className="text-[11px] text-stone-400">المعتمدون للميدان</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.accepted}</div>
        </div>

        <div className="bg-[#181a20] border border-[#262a33] p-4 rounded-2xl">
          <div className="text-[11px] text-stone-400">أنجزوا المهام</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{stats.completed}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#181a20] border border-[#262a33] p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="البحث باسم المتطوع، عنوان النداء، أو الملاحظة..."
            className="w-full bg-[#121419] border border-[#282c36] rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'all' ? 'bg-[#262b36] text-white font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            الكل ({responses.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'pending' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            قيد المراجعة ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'accepted' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            معتمد ({stats.accepted})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              statusFilter === 'completed' ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            مكتمل ({stats.completed})
          </button>
        </div>
      </div>

      {/* Responses List */}
      <div className="space-y-3">
        {filteredResponses.length === 0 ? (
          <div className="p-12 text-center bg-[#181a20] rounded-3xl border border-[#262a33] text-stone-500 text-xs">
            لا توجد استجابات تطابق معايير البحث الحالية.
          </div>
        ) : (
          filteredResponses.map(resp => {
            const matchedCall = calls.find(c => c.id === resp.callId);

            return (
              <div
                key={resp.id}
                className="bg-[#181a20] border border-[#262a33] hover:border-[#333845] p-5 rounded-2xl space-y-3 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center font-bold text-sky-400 text-sm">
                      {resp.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{resp.userName}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          resp.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : resp.status === 'completed'
                            ? 'bg-sky-500/20 text-sky-400'
                            : resp.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {resp.status === 'accepted' ? 'معتمد للميدان' : resp.status === 'completed' ? 'أنجز المهمة بنجاح' : resp.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                        <span>نوع الاستجابة: {resp.responseType === 'can_help' ? 'مستعد للمساعدة الفورية' : 'راغب في المشاركة'}</span>
                        {resp.userPhone && (
                          <>
                            <span>•</span>
                            <span dir="ltr" className="font-mono text-stone-300">{resp.userPhone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left text-[11px] text-stone-500 font-mono">
                    {new Date(resp.createdAt).toLocaleString('ar-SA', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </div>
                </div>

                {/* Linked Call */}
                <div className="p-3 bg-[#13151a] rounded-xl border border-[#20232a] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-stone-500 shrink-0">النداء المرتبط:</span>
                    <span className="font-semibold text-stone-200 truncate">{resp.callTitle}</span>
                  </div>

                  {matchedCall && (
                    <button
                      type="button"
                      onClick={() => onSelectCall(matchedCall)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold shrink-0 flex items-center gap-1 text-[11px]"
                    >
                      <span>عرض النداء</span>
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Message */}
                {resp.message && (
                  <p className="text-xs text-stone-300 bg-[#15171d] p-3 rounded-xl leading-relaxed">
                    "{resp.message}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-[#22252e]">
                  <div className="flex items-center gap-2">
                    {resp.status !== 'accepted' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(resp.id, 'accepted')}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>اعتماد وموافقة</span>
                      </button>
                    )}

                    {resp.status === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(resp.id, 'completed')}
                        className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تأكيد إنجاز المهمة ميدانياً</span>
                      </button>
                    )}

                    {resp.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(resp.id, 'rejected')}
                        className="px-3 py-1.5 rounded-xl bg-[#222630] hover:bg-red-950/30 text-stone-400 hover:text-red-400 text-xs transition-colors"
                      >
                        استبعاد
                      </button>
                    )}
                  </div>

                  {resp.userPhone && (
                    <a
                      href={`tel:${resp.userPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-[#222630] text-stone-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>اتصال هاتفي</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
