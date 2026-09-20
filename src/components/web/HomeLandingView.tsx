import React from 'react';
import { Call, AuthUser } from '../../types';
import { RealInteractiveMap } from '../common/RealInteractiveMap';
import { 
  Plus, 
  Sparkles, 
  Trophy, 
  LogIn, 
  MapPin, 
  ShieldCheck, 
  Users, 
  ArrowLeft, 
  Building2, 
  Compass,
  Radio,
  Smartphone,
  Download
} from 'lucide-react';

interface HomeLandingViewProps {
  calls: Call[];
  currentUser?: AuthUser | null;
  onOpenCreateCall: () => void;
  onOpenAiChat: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onSelectCall: (call: Call) => void;
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({
  calls,
  currentUser,
  onOpenCreateCall,
  onOpenAiChat,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenDashboard,
  onSelectCall
}) => {
  const activeCalls = calls.filter(c => c.status === 'active' || c.status === 'receiving_responses');
  const urgentCalls = calls.filter(c => c.priority === 'urgent');
  const totalVolunteers = calls.reduce((acc, c) => acc + (c.requiredCount || 5), 0);
  const totalResponses = calls.reduce((acc, c) => acc + (c.confirmedCount || c.responsesCount || 0), 0);

  return (
    <div className="space-y-8 text-right pb-10">
      {/* 1. Human-Crafted Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-800/80 bg-gradient-to-b from-[#101520] via-[#0d111a] to-[#0a0d14] p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          {/* Official Emblem & Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>المنظومة الوطنية لتنسيق العمل الميداني والتطوعي • الجزائر</span>
          </div>

          {/* Calm, Authoritative Editorial Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-snug">
            تنسيق الاستجابة الإنسانية والمبادرات الميدانية
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-stone-400 max-w-2xl mx-auto leading-relaxed">
            منصة موحدة تربط الجمعيات المعتمدة، توجه فرق المتطوعين عبر نظام GPS، وتتابع إنجاز المهام والتقارير الميدانية في كافة ولايات الوطن.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenCreateCall}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إطلاق نداء ميداني</span>
            </button>
            <button
              type="button"
              onClick={onOpenDashboard}
              className="px-5 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 text-stone-200 font-bold text-xs sm:text-sm border border-stone-700/60 transition-all flex items-center gap-2"
            >
              <span>استعراض النداءات المفتوحة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Professional Unified Pillars (Cohesive, not rainbow-colored) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-6 text-right">
            {/* Pillar 1 */}
            <div 
              onClick={onOpenCreateCall}
              className="p-4 rounded-2xl bg-[#131824]/80 hover:bg-[#182030] border border-stone-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">01</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  إطلاق نداء جديد
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  تحديد موقع الاحتياج بدقة GPS وتوجيه الفرق الميدانية فوراً.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-stone-400 group-hover:text-emerald-400 font-medium">
                <span>فتح النموذج</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div 
              onClick={onOpenDashboard}
              className="p-4 rounded-2xl bg-[#131824]/80 hover:bg-[#182030] border border-stone-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Compass className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">02</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  لوحة النداءات الجارية
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  متابعة حالات النداء، أعداد المتطوعين، وتقارير الإنجاز الإجبارية.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-stone-400 group-hover:text-emerald-400 font-medium">
                <span>عرض اللوحة</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div 
              onClick={onOpenAiChat}
              className="p-4 rounded-2xl bg-[#131824]/80 hover:bg-[#182030] border border-stone-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">03</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  المساعد الميداني الذكي
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  استشارات فورية في إدارة الأزمات، اللوجستيات، وتوزيع المهام.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-stone-400 group-hover:text-emerald-400 font-medium">
                <span>بدء الاستشارة</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div 
              onClick={onOpenLeaderboard}
              className="p-4 rounded-2xl bg-[#131824]/80 hover:bg-[#182030] border border-stone-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">04</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  ترتيب الجمعيات الميدانية
                </h3>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                  تقييم الأثر، ساعات العمل الموثقة، ومعدلات الاستجابة عبر الوطن.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-stone-400 group-hover:text-emerald-400 font-medium">
                <span>جدول الترتيب</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Realistic, Calm Key Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#10141d] border border-stone-800/80 text-center">
          <span className="text-stone-400 text-xs block mb-1">الولايات المشمولة</span>
          <span className="text-2xl font-bold text-white font-mono">58</span>
          <span className="text-[11px] text-stone-500 block mt-1">تغطية وطنية شاملة</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#10141d] border border-stone-800/80 text-center">
          <span className="text-stone-400 text-xs block mb-1">النداءات الجارية</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">{activeCalls.length}</span>
          <span className="text-[11px] text-stone-500 block mt-1">منها {urgentCalls.length} نداء عاجل</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#10141d] border border-stone-800/80 text-center">
          <span className="text-stone-400 text-xs block mb-1">المتطوعون المسجلون</span>
          <span className="text-2xl font-bold text-white font-mono">{totalResponses}</span>
          <span className="text-[11px] text-stone-500 block mt-1">استجابة ميدانية مؤكدة</span>
        </div>
        <div className="p-4 rounded-2xl bg-[#10141d] border border-stone-800/80 text-center">
          <span className="text-stone-400 text-xs block mb-1">متوسط وقت الاستجابة</span>
          <span className="text-2xl font-bold text-emerald-400 font-mono">18 دقيقة</span>
          <span className="text-[11px] text-stone-500 block mt-1">ربط وتوجيه مباشر</span>
        </div>
      </div>

      {/* 3. Interactive Field Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              الخريطة الميدانية التفاعلية للجمهورية الجزائرية
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenCreateCall}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة نداء على الخريطة</span>
          </button>
        </div>

        {/* Leaflet Map with CARTO Key & Fallback */}
        <RealInteractiveMap
          mode="heatmap"
          calls={calls}
          onCallClick={onSelectCall}
          heightClass="h-[440px]"
        />
      </div>

      {/* 4. Active Field Appeals List Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">النداءات الميدانية الجارية الآن</h3>
            <p className="text-xs text-stone-400">انقر على أي نداء لاستعراض التفاصيل والاستجابة</p>
          </div>
          <button
            type="button"
            onClick={onOpenDashboard}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <span>عرض كافة النداءات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeCalls.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#10141d] border border-stone-800/80 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">لا توجد نداءات ميدانية نشطة حالياً</h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
                المنظومة خالية ونظيفة ومستعدة لإطلاق مبادراتك. يمكنك إطلاق نداءك الميداني الأول ليظهر على الخريطة التفاعلية ويصل لمتطوعي الميدان.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCreateCall}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إطلاق نداء ميداني الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {activeCalls.slice(0, 3).map(call => (
              <div
                key={call.id}
                onClick={() => onSelectCall(call)}
                className="p-4 rounded-2xl bg-[#10141d] hover:bg-[#141924] border border-stone-800 hover:border-stone-700 cursor-pointer transition-all space-y-2.5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    call.priority === 'urgent' ? 'bg-red-500/15 text-red-300 border border-red-500/25' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                  }`}>
                    {call.priority === 'urgent' ? 'أولوية عاجلة' : 'أولوية عادية'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {call.location.city || 'الجزائر'}
                  </span>
                </div>

                <h4 className="font-bold text-white text-sm leading-snug">
                  {call.title}
                </h4>

                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {call.description}
                </p>

                <div className="pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold text-xs">
                    مطلوب {call.requiredCount || 5} متطوعين
                  </span>
                  <span className="text-stone-500 text-[11px]">
                    {call.creatorOrg || 'جمعية معتمدة'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

