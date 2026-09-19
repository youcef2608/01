import React, { useState } from 'react';
import { 
  Settings, 
  Radio, 
  Bell, 
  MapPin, 
  ShieldCheck, 
  Moon, 
  Check, 
  Sparkles,
  Sliders,
  Volume2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [liveReplacesBooks, setLiveReplacesBooks] = useState(true);
  const [nearbyAlerts, setNearbyAlerts] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [autoPlayLive, setAutoPlayLive] = useState(true);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const handleSave = () => {
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">إعدادات المنصة والتخصيص</h1>
            <p className="text-xs text-stone-400 mt-0.5">تخصيص تجربة التصفح الميداني والبث المباشر</p>
          </div>
        </div>

        {showSavedNotification && (
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            تم حفظ التفضيلات بنجاح
          </span>
        )}
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Navigation & Layout Setting (Explicit user request) */}
        <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Radio className="w-4 h-4 text-red-500" />
            <span>ترتيب القوائم والمحتوى الميداني</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
            <div className="space-y-1 max-w-lg">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">تفعيل البث المباشر الميداني (مباشر مكان كتب)</span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                  مفعل
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                تم تثبيت خيار "مباشر" في القائمة العلوية والجانبية في موضع مكتبة الكتب وبشكل موحد دون فصل، لعرض غرف العمليات والتغطيات الحية مباشرة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLiveReplacesBooks(!liveReplacesBooks)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                liveReplacesBooks ? 'bg-red-600' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  liveReplacesBooks ? 'translate-x-0' : '-translate-x-6'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
            <div className="space-y-1 max-w-lg">
              <span className="font-bold text-white text-sm">تشغيل البث المباشر تلقائياً</span>
              <p className="text-xs text-stone-400 leading-relaxed">
                بدء معاينة التغطيات الحية وغرف الطوارئ تلقائياً عند فتح شاشة المباشر.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoPlayLive(!autoPlayLive)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                autoPlayLive ? 'bg-emerald-600' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  autoPlayLive ? 'translate-x-0' : '-translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications Setting */}
        <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>تنبيهات النداءات الميدانية</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
            <div className="space-y-1 max-w-lg">
              <span className="font-bold text-white text-sm">تنبيهات النداءات القريبة في الجزائر</span>
              <p className="text-xs text-stone-400 leading-relaxed">
                إرسال إشعار فوري عند نشر نداء ميداني أو استغاثة تطوعية قريبة من موقعك الجغرافي.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNearbyAlerts(!nearbyAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                nearbyAlerts ? 'bg-emerald-600' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  nearbyAlerts ? 'translate-x-0' : '-translate-x-6'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
            <div className="space-y-1 max-w-lg">
              <span className="font-bold text-white text-sm">حصر التنبيهات على النداءات العاجلة والطارئة فقط</span>
              <p className="text-xs text-stone-400 leading-relaxed">
                كتم التنبيهات الروتينية واستقبال إشعارات الطوارئ والكوارث المناخية فقط.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                urgentOnly ? 'bg-emerald-600' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  urgentOnly ? 'translate-x-0' : '-translate-x-6'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Location & Defaults */}
        <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>نطاق التغطية الجغرافية</span>
          </div>

          <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-sm block">الخريطة المفتوحة (القطر الجزائري)</span>
              <span className="text-xs text-stone-400">
                الخريطة التفاعلية مهيأة للاستعراض الحر دون أقفال أو تقييد بولاية محددة.
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              حر ونشط
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all hover:scale-105"
          >
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};
