import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Sparkles, MapPin, CheckCircle2, ChevronLeft, ShieldCheck, Heart, Wrench, GraduationCap, Car } from 'lucide-react';

interface MobileOnboardingProps {
  user: UserProfile;
  onComplete: (updated: Partial<UserProfile>) => void;
  onSkip: () => void;
}

const COMMON_SKILLS = [
  'إسعافات أولية',
  'تنظيم ميداني',
  'دعم تقني',
  'قيادة سيارة ونقل',
  'أعمال صيانة وكهرباء',
  'تدريس ومراجعات',
  'طبخ وتوزيع وجبات',
  'تواصل وإرشاد'
];

const COMMON_INTERESTS = [
  'مساعدة إغاثية وعاجلة',
  'دعم كبار السن والأيتام',
  'تعليم وتقنية',
  'بيئة وتشجير',
  'فعاليات مجتمعية وثقافية'
];

export const MobileOnboarding: React.FC<MobileOnboardingProps> = ({
  user,
  onComplete,
  onSkip
}) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(user.skills || []);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests || []);
  const [radiusKm, setRadiusKm] = useState<number>(user.location.maxRadiusKm || 15);
  const [useGps, setUseGps] = useState<boolean>(user.location.useGps);
  const [city, setCity] = useState<string>(user.location.city || 'الرياض');
  const [step, setStep] = useState<1 | 2>(1);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleFinish = () => {
    onComplete({
      skills: selectedSkills,
      interests: selectedInterests,
      location: {
        ...user.location,
        city,
        maxRadiusKm: radiusKm,
        useGps
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-100 flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تخصيص تجربة أثر الذكية</h3>
              <p className="text-[11px] text-stone-400">لترشيح النداءات الأنسب والأقرب إليك</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
          >
            تخطي الآن
          </button>
        </div>

        {/* Step 1: Skills & Interests */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                1. ما المهارات أو القدرات التي يمكنك تقديمها؟
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SKILLS.map(sk => {
                  const isSelected = selectedSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {sk} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                2. ما المجالات التي تفضل مساندتها؟
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_INTERESTS.map(item => {
                  const isSelected = selectedInterests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-stone-950 border border-stone-800 text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      {item} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
            >
              متابعة: ضبط الموقع الجغرافي ←
            </button>
          </div>
        )}

        {/* Step 2: Location & Proximity */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>إذن الموقع الجغرافي الشفاف</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                نستخدم موقعك لحساب المسافة الجغرافية وعرض النداءات القريبة منك فور حدوثها. لن تتم مشاركة موقعك الدقيق مع أي جهة.
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs">تفعيل نظام تحديد المواقع (GPS):</span>
                <input
                  type="checkbox"
                  checked={useGps}
                  onChange={e => setUseGps(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </div>
            </div>

            {/* City Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                المدينة الأساسية
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="الرياض">الرياض</option>
                <option value="جدة">جدة</option>
                <option value="الدمام">الدمام والخبر</option>
                <option value="مكة المكرمة">مكة المكرمة</option>
                <option value="المدينة المنورة">المدينة المنورة</option>
              </select>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-stone-300 font-semibold">نطاق الحركة المفضل:</span>
                <span className="text-emerald-400 font-bold">{radiusKm} كم</span>
              </div>
              <input
                type="range"
                min={2}
                max={50}
                value={radiusKm}
                onChange={e => setRadiusKm(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-stone-800"
              />
              <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                <span>2 كم (الحي المباشر)</span>
                <span>50 كم (المدينة وضواحيها)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-colors"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
              >
                حفظ وبدء استقبال النداءات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
