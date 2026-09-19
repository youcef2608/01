import React, { useState } from 'react';
import { FieldNote, Call } from '../../types';
import { Plus, Search, Trash2, Edit3, BookOpen, Link as LinkIcon, CheckCircle2, X } from 'lucide-react';

interface FieldNotesViewProps {
  notes: FieldNote[];
  calls: Call[];
  onAddNote: (note: Omit<FieldNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, title: string, content: string) => void;
}

export const FieldNotesView: React.FC<FieldNotesViewProps> = ({
  notes,
  calls,
  onAddNote,
  onDeleteNote,
  onUpdateNote
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // New note form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [newCategory, setNewCategory] = useState('ميدانية');

  const filteredNotes = notes.filter(note => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      (note.callTitle && note.callTitle.toLowerCase().includes(q))
    );
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const matchedCall = calls.find(c => c.id === selectedCallId);

    onAddNote({
      userId: 'current-user',
      title: newTitle.trim(),
      content: newContent.trim(),
      callId: selectedCallId || undefined,
      callTitle: matchedCall ? matchedCall.title : undefined,
      category: newCategory
    });

    setNewTitle('');
    setNewContent('');
    setSelectedCallId('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 pb-20 text-right">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>ملاحظاتي الميدانية والشخصية</span>
          </h3>
          <p className="text-[11px] text-stone-400">
            دوّن تفاصيل المهام، أرقام التواصل، والترتيبات الميدانية
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>ملاحظة جديدة</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث في ملاحظاتك الشخصية..."
          className="w-full bg-stone-950 border border-stone-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Add New Note Card */}
      {isAdding && (
        <form onSubmit={handleSaveNew} className="bg-stone-950 p-4 rounded-3xl border border-emerald-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400">+ تدوين ملاحظة جديدة</span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="عنوان الملاحظة (مثال: حقيبة الإسعافات، نقطة التجمع...)"
            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            required
          />

          <textarea
            rows={3}
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="اكتب الملاحظات والتفاصيل..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500"
            required
          />

          {/* Link to Call */}
          <div>
            <label className="block text-[11px] text-stone-400 mb-1">ربط الملاحظة بنداء معين (اختياري):</label>
            <select
              value={selectedCallId}
              onChange={e => setSelectedCallId(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">ملاحظة عامة غير مرتبطة بنداء</option>
              {calls.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.location.city})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            حفظ الملاحظة
          </button>
        </form>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 text-stone-500 space-y-2">
            <BookOpen className="w-10 h-10 mx-auto text-stone-700" />
            <div className="text-sm font-semibold text-stone-400">لا توجد ملاحظات مسجلة</div>
            <p className="text-xs text-stone-600">اضغط على زر "+ ملاحظة جديدة" لتدوين أفكارك الميدانية.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div
              key={note.id}
              className="bg-stone-950 p-4 rounded-2xl border border-stone-800/80 hover:border-stone-700 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{note.title}</h4>
                  <div className="text-[10px] text-stone-500">
                    {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-stone-300 whitespace-pre-line leading-relaxed text-xs">
                {note.content}
              </p>

              {note.callTitle && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 pt-1 border-t border-stone-900">
                  <LinkIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate">مرتبطة بنداء: {note.callTitle}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
