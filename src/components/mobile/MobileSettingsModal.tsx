import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { X, Settings, MapPin, Bell, Shield, User, Check, Sparkles } from 'lucide-react';

interface MobileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updated: Partial<UserProfile>) => void;
  onResetOnboarding: () => void;
}

export const MobileSettingsModal: React.FC<MobileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  onResetOnboarding
}) => {
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.location.city);
  const [maxRadiusKm, setMaxRadiusKm] = useState(user.location.maxRadiusKm);
  const [nearbyAlerts, setNearbyAlerts] = useState(user.notificationSettings.nearbyAlerts);
  const [urgentOnly, setUrgentOnly] = useState(user.notificationSettings.urgentOnly);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      name,
      location: {
        ...user.location,
        city,
        maxRadiusKm
      },
      notificationSettings: {
        ...user.notificationSettings,
        nearbyAlerts,
        urgentOnly
      }
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 text-right">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5 text-stone-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">إعدادات تطبيق أثر</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-stone-300">الاسم المعروض</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Location & Radius */}
        <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-white">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>نطاق رادار النداءات الجغرافي</span>
          </div>

          <div>
            <label className="block text-[11px] text-stone-400 mb-1">المدينة الحالية</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="الدمام">الدمام والخبر</option>
              <option value="مكة المكرمة">مكة المكرمة</option>
              <option value="المدينة المنورة">المدينة المنورة</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-stone-300">أقصى مسافة لاستقبال التنبيهات:</span>
              <span className="font-bold text-emerald-400">{maxRadiusKm} كم</span>
            </div>
            <input
              type="range"
              min={2}
              max={50}
              value={maxRadiusKm}
              onChange={e => setMaxRadiusKm(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-white">
            <Bell className="w-4 h-4 text-sky-400" />
            <span>إشعارات النداءات القريبة</span>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-stone-300">تنبيهات النداءات القريبة من موقعي</span>
            <input
              type="checkbox"
              checked={nearbyAlerts}
              onChange={e => setNearbyAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-stone-300">تنبيهات النداءات العاجلة فقط (الحمراء)</span>
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={e => setUrgentOnly(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded"
            />
          </label>
        </div>

        {/* Re-run onboarding */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onResetOnboarding();
          }}
          className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>إعادة تشغيل حوار التعرف على المهارات (Onboarding)</span>
        </button>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>تم حفظ الإعدادات بنجاح</span>
            </>
          ) : (
            <span>حفظ التعديلات</span>
          )}
        </button>
      </div>
    </div>
  );
};
