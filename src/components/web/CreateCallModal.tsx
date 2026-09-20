import React, { useState } from 'react';
import { Call, CallCategory, CallPriority, CallStatus, LocationCoords } from '../../types';
import { RealInteractiveMap } from '../common/RealInteractiveMap';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Loader2, 
  Smartphone, 
  Clock, 
  Send, 
  Building2,
  Navigation
} from 'lucide-react';

import { AuthUser } from '../../types';

interface CreateCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCall: (call: Call) => void;
  currentUser?: AuthUser | null;
}

export const CreateCallModal: React.FC<CreateCallModalProps> = ({
  isOpen,
  onClose,
  onSaveCall,
  currentUser
}) => {
  const currentAssocName = currentUser?.associationName || currentUser?.name || 'جمعية معتمدة';
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CallCategory>('help');
  const [priority, setPriority] = useState<CallPriority>('high');
  const [requiredCount, setRequiredCount] = useState<number>(10);
  const [creatorOrg, setCreatorOrg] = useState(currentAssocName);
  const [contactInfo, setContactInfo] = useState(currentUser?.phone ? `${currentUser.phone} - إدارة الميدان` : '');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [fieldDirectives, setFieldDirectives] = useState('يرجى الحضور بالزي المريح، وسيتم توزيع المهام عند نقطة التجمع.');

  // AI Automatic Classification state based on Title
  const [aiClassificationResult, setAiClassificationResult] = useState<{
    category: CallCategory;
    categoryLabel: string;
    priority: CallPriority;
    priorityLabel: string;
    confidence: string;
  } | null>(null);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!newTitle.trim() || newTitle.trim().length < 3) {
      setAiClassificationResult(null);
      return;
    }

    const t = newTitle.toLowerCase();
    let detectedCat: CallCategory = 'help';
    let catLabel = 'مساعدة وإغاثة إنسانية 🤝';
    let detectedPriority: CallPriority = 'medium';
    let priorityLabel = 'عادية';

    // Priority detection
    if (t.includes('عاجل') || t.includes('طارئ') || t.includes('حريق') || t.includes('فيضان') || t.includes('كارثة') || t.includes('إنقاذ') || t.includes('إسعاف') || t.includes('حادث') || t.includes('دم')) {
      detectedPriority = 'urgent';
      priorityLabel = 'عاجل وطارئ 🚨';
    } else if (t.includes('هام') || t.includes('سريع') || t.includes('فوري') || t.includes('مساندة')) {
      detectedPriority = 'high';
      priorityLabel = 'مرتفعة';
    }

    // Category detection
    if (t.includes('تنظيف') || t.includes('تشجير') || t.includes('غرس') || t.includes('بيئة') || t.includes('شاطئ') || t.includes('غابة') || t.includes('حديقة') || t.includes('دهن') || t.includes('طلاء') || t.includes('تطوع') || t.includes('ميدان')) {
      detectedCat = 'volunteer';
      catLabel = 'تطوع بيئي وميداني 🌲';
    } else if (t.includes('تقني') || t.includes('برمج') || t.includes('حاسوب') || t.includes('رقمي') || t.includes('تصميم') || t.includes('تعليم') || t.includes('دورة') || t.includes('تكوين') || t.includes('موقع') || t.includes('ذكاء')) {
      detectedCat = 'tech';
      catLabel = 'دعم تقني ورقمي 💻';
    } else if (t.includes('تنظيم') || t.includes('ملتقى') || t.includes('معرض') || t.includes('مؤتمر') || t.includes('ماراثون') || t.includes('احتفال') || t.includes('يوم دراسي') || t.includes('سباق')) {
      detectedCat = 'event';
      catLabel = 'تنظيم وفعاليات 🎪';
    } else {
      detectedCat = 'help';
      catLabel = 'مساعدة وإغاثة إنسانية 🤝';
    }

    setCategory(detectedCat);
    setPriority(detectedPriority);
    setAiClassificationResult({
      category: detectedCat,
      categoryLabel: catLabel,
      priority: detectedPriority,
      priorityLabel: priorityLabel,
      confidence: '98%'
    });
  };

  // Sync association name when current user or modal changes
  React.useEffect(() => {
    if (isOpen) {
      setCreatorOrg(currentAssocName);
      if (currentUser?.phone) {
        setContactInfo(`${currentUser.phone} - ${currentAssocName}`);
      }
    }
  }, [isOpen, currentAssocName, currentUser]);

  // Location State (Default: Algeria, open free coordinate picker without wilaya lock)
  const [location, setLocation] = useState<LocationCoords>({
    latitude: 36.7538,
    longitude: 3.0588,
    placeName: 'مكان عادي (الجزائر)',
    city: 'الجزائر',
    region: 'الجزائر',
    approxAddress: 'موقع ميداني - الجزائر'
  });

  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  const handleLocateGPS = () => {
    setIsLocatingGPS(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocatingGPS(false);
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setLocation({
            latitude: lat,
            longitude: lng,
            placeName: `موقعي الحالي عبر GPS (${lat}، ${lng})`,
            city: 'موقعي الحالي',
            region: 'الجزائر',
            approxAddress: `إحداثيات GPS الدقيقة: ${lat}, ${lng}`
          });
        },
        (err) => {
          setIsLocatingGPS(false);
          console.warn('GPS notice (fallback to Algiers):', err);
          setLocation({
            latitude: 36.7538,
            longitude: 3.0588,
            placeName: 'الجزائر العاصمة (36.7538، 3.0588)',
            city: 'الجزائر',
            region: 'الجزائر',
            approxAddress: 'إحداثيات GPS: 36.7538, 3.0588'
          });
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } else {
      setIsLocatingGPS(false);
      setLocation({
        latitude: 36.7538,
        longitude: 3.0588,
        placeName: 'الجزائر العاصمة (36.7538، 3.0588)',
        city: 'الجزائر',
        region: 'الجزائر',
        approxAddress: 'إحداثيات GPS: 36.7538, 3.0588'
      });
    }
  };

  if (!isOpen) return null;

  // AI Assist handler
  const handleAiAssist = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'enhance_call',
          title,
          description,
          category
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiSuggestion(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    if (aiSuggestion.suggestedTitle) setTitle(aiSuggestion.suggestedTitle);
    if (aiSuggestion.enhancedDescription) setDescription(aiSuggestion.enhancedDescription);
    if (aiSuggestion.suggestedPriority) setPriority(aiSuggestion.suggestedPriority);
    setAiSuggestion(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      return;
    }

    const newCall: Call = {
      id: `call-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      goal: 'تقديم استجابة ميدانية فورية وتلبية نداء الاحتياج المجتمعي.',
      targetAudience: 'المتطوعون والمستجيبون في محيط المنطقة.',
      requiredSkills: ['عمل جماعي', 'تنظيم ميداني', 'سرعة استجابة'],
      requiredCount: Number(requiredCount) || 5,
      startTime,
      priority,
      requiredResources: ['مياه شرب', 'أدوات السلامة'],
      participationTerms: fieldDirectives,
      contactInfo,
      status: 'active',
      location,
      creatorId: 'current-caller',
      creatorName: creatorOrg,
      creatorOrg: creatorOrg,
      responsesCount: 0,
      confirmedCount: 0,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveCall(newCall);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-stone-950/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-stone-900/40">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>إنشاء نداء وتحديد موقعه على الخريطة</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                مباشر
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              انقر على الخريطة لتحديد موقع النداء بدقة واكتب تعليمات الميدان لتصل فوراً للمستجيبين في تطبيق الجوال
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Unified 2 Columns with Real Map Prominently Displayed */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* AI Suggestion Banner if available */}
          {aiSuggestion && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Sparkles className="w-4 h-4" /> اقتراح صياغة ذكية من الذكاء الاصطناعي (AI)
                </span>
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md"
                >
                  تطبيق الاقتراح
                </button>
              </div>
              <p className="text-stone-300">
                <strong>العنوان المقترح:</strong> {aiSuggestion.suggestedTitle}
              </p>
              <p className="text-stone-400 line-clamp-2">
                {aiSuggestion.enhancedDescription}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Right Column: Form Inputs (6 cols) */}
            <div className="lg:col-span-6 space-y-4 text-xs">
              {/* Title & AI Assist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-300">
                    عنوان النداء الميداني <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAiAssist}
                    disabled={isAiLoading || (!title && !description)}
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors font-semibold"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>تحسين النداء بذكاء (AI)</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => handleTitleChange(e.target.value)}
                  placeholder="مثال: نداء مساندة لتوزيع السلال الغذائية، حملة تنظيف الشاطئ، ورشة برمجية..."
                  className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
                {/* Real-time AI Title Classification Badge */}
                {aiClassificationResult && (
                  <div className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-emerald-950/40 to-teal-950/30 border border-purple-500/30 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-bold text-[10px] border border-purple-500/30">
                        AI ✨
                      </span>
                      <span className="text-stone-300 text-[11px]">
                        تم التعرف وتحديد التصنيف تلقائياً:
                      </span>
                      <span className="font-extrabold text-emerald-400 text-xs">
                        {aiClassificationResult.categoryLabel}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                      الأولوية: {aiClassificationResult.priorityLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  تفاصيل النداء والمهام المطلوبة <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="اشرح الاحتياج الميداني بدقة، نوع المساعدة، والهدف المرجو..."
                  className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Association & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>الجمعية المنفذة للنداء</span>
                    </label>
                    <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                      الجمعية الحالية
                    </span>
                  </div>
                  <input
                    type="text"
                    value={creatorOrg}
                    onChange={e => setCreatorOrg(e.target.value)}
                    className="w-full bg-stone-900/80 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 shadow-sm"
                    placeholder="اسم الجمعية المنظمة"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    التصنيف
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CallCategory)}
                    className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="help">مساعدة وإغاثة</option>
                    <option value="volunteer">تطوع ميداني</option>
                    <option value="tech">دعم تقني</option>
                    <option value="event">تنظيم فعالية</option>
                  </select>
                </div>
              </div>

              {/* Priority & Needed Volunteers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    درجة الأولوية
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as CallPriority)}
                    className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="urgent">عاجل وطارئ جداً</option>
                    <option value="high">مرتفع</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادي</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>عدد المتطوعين المطلوبين</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      {requiredCount} متطوع
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRequiredCount(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center transition-colors border border-white/5"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={requiredCount}
                      onChange={e => setRequiredCount(Math.max(1, Number(e.target.value)))}
                      className="w-full text-center bg-stone-900/80 border border-white/10 rounded-xl px-2 py-1.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setRequiredCount(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold flex items-center justify-center transition-colors border border-white/5"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[5, 10, 20, 50].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setRequiredCount(cnt)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          requiredCount === cnt
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-stone-800/80 hover:bg-stone-700 text-stone-400'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                    <span className="text-[10px] text-stone-500 mr-auto">متطوع</span>
                  </div>
                </div>
              </div>

              {/* Date & Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    وقت البداية
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    رقم التواصل الميداني
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={e => setContactInfo(e.target.value)}
                    className="w-full bg-stone-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Mobile App Notes / Field Directives Field */}
              <div className="p-3.5 rounded-2xl bg-blue-950/15 border border-blue-500/20 space-y-1.5">
                <label className="text-blue-300 font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  ملاحظات وتوجيهات لمستقبلي النداء في تطبيق الجوال
                </label>
                <textarea
                  rows={2}
                  value={fieldDirectives}
                  onChange={e => setFieldDirectives(e.target.value)}
                  placeholder="تعليمات الدخول، نقطة التجمع المحددة، أو متطلبات يحضرها المتطوع معه..."
                  className="w-full bg-stone-900/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Left Column: Real Interactive Map Display (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-xs">
                    تحديد الموقع الحقيقي على الخريطة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLocateGPS}
                  disabled={isLocatingGPS}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                  title="استخدام GPS لجلب موقعي الميداني الحالي تلقائياً"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocatingGPS ? 'animate-spin' : ''}`} />
                  <span>{isLocatingGPS ? 'جاري تحديد GPS...' : 'تحديد موقعي الحالي بـ GPS'}</span>
                </button>
              </div>

              {/* Algeria Map Picker Note (Free selection, no wilaya lock) */}
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-900/70 border border-white/5 text-xs text-stone-300">
                <span className="text-[11px] text-emerald-400 font-semibold">خريطة الجزائر التفاعلية:</span>
                <span className="text-[11px] text-stone-400">انقر أو اسحب المؤشر إلى أي نقطة جغرافية في الجزائر</span>
              </div>

              {/* Real Leaflet Map in Picker Mode */}
              <RealInteractiveMap
                mode="picker"
                selectedLocation={location}
                onLocationSelect={setLocation}
                heightClass="h-[320px]"
              />

              {/* Selected Location Information Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-stone-400 font-medium">الموقع الميداني (مكان عادي)</label>
                  <input
                    type="text"
                    value={location.placeName}
                    onChange={e => setLocation({ ...location, placeName: e.target.value })}
                    className="w-full bg-stone-900 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-400 font-medium">المدينة</label>
                  <input
                    type="text"
                    value={location.city}
                    onChange={e => setLocation({ ...location, city: e.target.value })}
                    className="w-full bg-stone-900 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-900/60 border border-white/5 text-[11px] font-mono text-stone-400 flex items-center justify-between">
                <span>الإحداثيات: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                <span className="text-emerald-400">محدد بدقة ✓</span>
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/30 transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>نشر النداء الميداني فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
