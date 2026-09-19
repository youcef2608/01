import React, { useState } from 'react';
import { AppUserInboundNote, Call } from '../../types';
import { 
  MessageSquare, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Lightbulb, 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  Phone,
  Send,
  Check
} from 'lucide-react';

interface InboundAppNotesViewProps {
  notes: AppUserInboundNote[];
  calls: Call[];
  onUpdateNoteStatus: (id: string, newStatus: 'new' | 'reviewed' | 'resolved') => void;
  onAddNewNote: (note: AppUserInboundNote) => void;
}

export const InboundAppNotesView: React.FC<InboundAppNotesViewProps> = ({
  notes,
  calls,
  onUpdateNoteStatus,
  onAddNewNote
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Simulated note form state
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [type, setType] = useState<AppUserInboundNote['type']>('field_observation');
  const [message, setMessage] = useState('');
  const [cityName, setCityName] = useState('الرياض');
  const [locationName, setLocationName] = useState('');
  const [selectedCallId, setSelectedCallId] = useState('');

  const filteredNotes = notes.filter(n => {
    const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.cityName && n.cityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (n.callTitle && n.callTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleCreateSimulatedNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    const matchedCall = calls.find(c => c.id === selectedCallId);

    const newNote: AppUserInboundNote = {
      id: `inbound-${Date.now()}`,
      senderName,
      senderPhone: senderPhone || undefined,
      type,
      message,
      cityName,
      locationName: locationName || undefined,
      callId: selectedCallId || undefined,
      callTitle: matchedCall?.title,
      status: 'new',
      appVersion: 'v1.4 (تطبيق أثر للمستجيبين)',
      createdAt: new Date().toISOString()
    };

    onAddNewNote(newNote);
    setShowSimulateModal(false);
    setMessage('');
    setSenderName('');
    setSenderPhone('');
    setLocationName('');
  };

  const getTypeLabel = (t: AppUserInboundNote['type']) => {
    switch (t) {
      case 'field_observation':
        return { text: 'ملاحظة ميدانية', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: MapPin };
      case 'issue_report':
        return { text: 'بلاغ عن مشكلة', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: AlertCircle };
      case 'suggestion':
        return { text: 'اقتراح تطوير', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: Lightbulb };
      case 'emergency_tip':
        return { text: 'تنبيه عاجل', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: AlertCircle };
      default:
        return { text: 'ملاحظة', color: 'text-stone-400 bg-stone-500/10 border-stone-500/20', icon: MessageSquare };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-stone-900/70 via-blue-950/20 to-stone-900/70 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>صندوق استقبال ملاحظات تطبيق الجوال الميداني</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              ملاحظات مستخدمي التطبيق القادمة من الميدان
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              هنا تصل كافة الملاحظات، البلاغات، الاقتراحات، وتحديثات الميدان التي يرسلها المتطوعون والمستخدمون عبر تطبيق الجوال في الوقت الفعلي لاتخاذ الإجراء الفوري.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02]"
            >
              <Send className="w-4 h-4" />
              <span>محاكاة إرسال ملاحظة من تطبيق الجوال</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/40 backdrop-blur-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في الملاحظات أو اسم المرسل..."
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-stone-950/60 border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <div className="flex items-center bg-stone-950/60 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              الكل ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('new')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'new' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              جديدة ({notes.filter(n => n.status === 'new').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('reviewed')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterStatus === 'reviewed' ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-white'
              }`}
            >
              تمت المراجعة
            </button>
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-950/60 border border-white/10 text-stone-300 text-xs focus:outline-none"
          >
            <option value="all">جميع أنواع الملاحظات</option>
            <option value="field_observation">ملاحظات ميدانية</option>
            <option value="issue_report">بلاغات مشاكل</option>
            <option value="suggestion">اقتراحات تطوير</option>
            <option value="emergency_tip">تنبيهات عاجلة</option>
          </select>
        </div>
      </div>

      {/* Notes Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNotes.map(note => {
          const typeBadge = getTypeLabel(note.type);
          const Icon = typeBadge.icon;

          return (
            <div
              key={note.id}
              className={`rounded-2xl border p-5 space-y-4 transition-all ${
                note.status === 'new'
                  ? 'border-blue-500/40 bg-stone-900/60 shadow-xl'
                  : 'border-white/10 bg-stone-900/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${typeBadge.color}`}>
                      <Icon className="w-3 h-3" />
                      {typeBadge.text}
                    </span>
                    {note.appVersion && (
                      <span className="text-[10px] text-stone-400 font-mono">
                        {note.appVersion}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {note.senderName}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {note.status === 'new' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateNoteStatus(note.id, 'reviewed')}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-colors"
                      title="تحديد كمقروء"
                    >
                      تحديد كمقروء
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                      <Check className="w-3 h-3" />
                      تمت المراجعة
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="p-3.5 rounded-xl bg-stone-950/40 border border-white/5 text-stone-200 text-xs leading-relaxed">
                "{note.message}"
              </div>

              {/* Linked Call or Location */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-white/5">
                <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                  <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                  <span className="truncate">
                    {note.cityName} {note.locationName ? `• ${note.locationName}` : ''}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-stone-400">
                  {new Date(note.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {note.callTitle && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 truncate">
                  نداء مرتبط: {note.callTitle}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredNotes.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-stone-900/20 p-12 text-center text-stone-400 text-xs">
          لا توجد ملاحظات مطابقة للتصفية الحالية
        </div>
      )}

      {/* Modal: Simulate Incoming Note from Mobile App */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-blue-500/30 bg-stone-950/95 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <span>محاكاة إرسال ملاحظة من تطبيق الجوال</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  أرسل تقريراً ميدانياً أو ملاحظة مستخدم لتجربة تدفق البيانات في الوقت الفعلي
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-stone-400 hover:text-white text-xl p-1"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSimulatedNote} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">اسم المتطوع / المستخدم *</label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="مثال: عبد العزيز، ريم الشريف"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">نوع الملاحظة</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="field_observation">ملاحظة ميدانية</option>
                    <option value="issue_report">بلاغ عن مشكلة</option>
                    <option value="suggestion">اقتراح تطوير</option>
                    <option value="emergency_tip">تنبيه عاجل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">المدينة</label>
                  <select
                    value={cityName}
                    onChange={e => setCityName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                    <option value="الدمام">الدمام</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">اسم الموقع أو الحي</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={e => setLocationName(e.target.value)}
                    placeholder="مثال: حي البطحاء، كورنيش جدة"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Associated Call */}
              <div className="space-y-1">
                <label className="text-stone-400">ربط بنداء حالي (اختياري)</label>
                <select
                  value={selectedCallId}
                  onChange={e => setSelectedCallId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">-- عام (بدون نداء محدد) --</option>
                  {calls.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-stone-300 font-medium">نص الملاحظة أو البلاغ *</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="اكتب تفاصيل الملاحظة الميدانية..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/10 text-white placeholder:text-stone-500 focus:border-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-900/30"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال الآن للصندوق</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
