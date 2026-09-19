import React from 'react';
import { AppNotification } from '../../types';
import { Bell, X, CheckCircle2, AlertCircle, Clock, Trash2 } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start text-right">
      <div className="w-full max-w-md bg-[#171a21] border-l border-[#262a33] h-full shadow-2xl flex flex-col text-stone-100">
        {/* Header */}
        <div className="p-5 border-b border-[#252932] flex items-center justify-between bg-[#14161c]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">إشعارات غرفة العمليات</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono">
              {notifications.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-[#252a34]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions bar */}
        <div className="p-3 bg-[#121419] border-b border-[#222630] flex items-center justify-between text-xs text-stone-400">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="hover:text-emerald-400 transition-colors"
          >
            تعيين الكل كمقروء
          </button>
          <button
            type="button"
            onClick={onClearAll}
            className="hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>مسح السجل</span>
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-stone-500 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-stone-700" />
              <div className="text-sm font-semibold text-stone-400">لا توجد إشعارات جديدة</div>
              <p className="text-xs text-stone-600">سيتم إشعارك فور إطلاق نداء جديد أو ورود استجابة ميدانية.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-colors ${
                  !n.read
                    ? 'bg-[#1e232e] border-emerald-500/30'
                    : 'bg-[#13151b] border-[#22252e]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {n.type === 'urgent_alert' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span>{n.title}</span>
                  </span>

                  <span className="text-[10px] text-stone-500 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <p className="text-stone-300 leading-relaxed text-[11px]">
                  {n.body}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
