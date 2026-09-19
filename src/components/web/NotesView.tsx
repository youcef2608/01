import React, { useState } from 'react';
import { FieldNote, Call } from '../../types';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Link as LinkIcon, 
  CheckCircle2, 
  X,
  Clock,
  Tag
} from 'lucide-react';

interface NotesViewProps {
  notes: FieldNote[];
  calls: Call[];
  onAddNote: (note: Omit<FieldNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
  onSelectCall: (call: Call) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  calls,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
  onSelectCall
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCallId, setSelectedCallId] = useState('');
  const [category, setCategory] = useState('ميدانية');

  const filteredNotes = notes.filter(n => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.callTitle && n.callTitle.toLowerCase().includes(q))
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const matchedCall = calls.find(c => c.id === selectedCallId);

    onAddNote({
      userId: 'admin-user',
      title: title.trim(),
      content: content.trim(),
      callId: selectedCallId || undefined,
      callTitle: matchedCall ? matchedCall.title : undefined,
      category
    });

    setTitle('');
    setContent('');
    setSelectedCallId('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <span>الملاحظات والتنسيق الميداني</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            سجل توثيق التعليمات الميدانية، نقاط التجمع، وجهات الاتصال، ومستجدات النداءات
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-900/40"
        >
          <Plus className="w-4 h-4" />
          <span>+ إضافة ملاحظة جديدة</span>
        </button>
      </div>

      {/* Add New Note Drawer / Card */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-[#181a20] border border-amber-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#252932] pb-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>تدوين ملاحظة ميدانية جديدة</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">عنوان الملاحظة</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: نقطة تسليم السلال الغذائية، تصريح الدخول..."
                className="w-full bg-[#121419] border border-[#282c36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">تصنيف الملاحظة</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#121419] border border-[#282c36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ميدانية">ميدانية وتوجيهية</option>
                <option value="لوجستية">لوجستية ومعدات</option>
                <option value="أرقام تواصل">أرقام وجهات اتصال</option>
                <option value="طوارئ">طوارئ وتنبيهات سلامة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">ربط الملاحظة بنداء محدد (اختياري)</label>
            <select
              value={selectedCallId}
              onChange={e => setSelectedCallId(e.target.value)}
              className="w-full bg-[#121419] border border-[#282c36] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">ملاحظة عامة غير مرتبطة بنداء معين</option>
              {calls.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} — ({c.location.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">تفاصيل الملاحظة الميدانية</label>
            <textarea
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب التوجيهات، الملاحظات الإضافية، وأي تفاصيل ميدانية هامة..."
              className="w-full bg-[#121419] border border-[#282c36] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold hover:bg-stone-700"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md"
            >
              حفظ الملاحظة
            </button>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث في عناوين ونصوص الملاحظات الميدانية..."
          className="w-full bg-[#181a20] border border-[#262a33] rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#181a20] rounded-3xl border border-[#262a33] text-stone-500 text-xs">
            لا توجد ملاحظات مسجلة حالياً.
          </div>
        ) : (
          filteredNotes.map(note => {
            const matchedCall = calls.find(c => c.id === note.callId);

            return (
              <div
                key={note.id}
                className="bg-[#181a20] border border-[#262a33] hover:border-[#333845] p-5 rounded-2xl flex flex-col justify-between space-y-3 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {note.category || 'ميدانية'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-sm">{note.title}</h3>
                  <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-line">
                    {note.content}
                  </p>
                </div>

                {note.callTitle && (
                  <div className="pt-3 border-t border-[#22252e] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px] truncate">
                      <LinkIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{note.callTitle}</span>
                    </div>
                    {matchedCall && (
                      <button
                        type="button"
                        onClick={() => onSelectCall(matchedCall)}
                        className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] shrink-0"
                      >
                        عرض
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
