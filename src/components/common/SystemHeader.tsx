import React from 'react';
import { Radio, Smartphone, Columns, Zap, CheckCircle2, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

interface SystemHeaderProps {
  currentSystemView: 'web' | 'mobile' | 'split';
  onChangeSystemView: (view: 'web' | 'mobile' | 'split') => void;
  onSimulateEmergency: () => void;
  callsCount: number;
  userCity: string;
}

export const SystemHeader: React.FC<SystemHeaderProps> = ({
  currentSystemView,
  onChangeSystemView,
  onSimulateEmergency,
  callsCount,
  userCity
}) => {
  return (
    <div className="bg-stone-950 border-b border-stone-800/80 px-4 py-2 text-xs text-stone-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-white">منظومة أثر الموحدة | Athar Platform</span>
          </div>
          <span className="hidden sm:inline-block text-stone-600">•</span>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>قاعدة بيانات وواجهة API مشتركة متزامنة</span>
          </div>
        </div>

        {/* Center: View Mode Switcher (Web, Mobile, Split) */}
        <div className="flex items-center bg-stone-900 p-1 rounded-2xl border border-stone-800">
          <button
            type="button"
            onClick={() => onChangeSystemView('web')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              currentSystemView === 'web'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>موقع أثر (للإدارة والخريطة)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeSystemView('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              currentSystemView === 'mobile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>تطبيق أثر (للمستجيبين)</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeSystemView('split')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              currentSystemView === 'split'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
            title="عرض الموقع والتطبيق معاً في شاشة واحدة لمشاهدة التزامن المباشر"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>عرض متزامن (موقع + تطبيق)</span>
          </button>
        </div>

        {/* Right: Quick Simulation Tool */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSimulateEmergency}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 text-xs font-bold transition-colors"
            title="محاكاة ورود نداء طارئ فوري لاختبار سرعة استجابة الرادار والتنبيهات"
          >
            <Zap className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>محاكاة نداء طارئ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
