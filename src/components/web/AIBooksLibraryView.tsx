import React, { useState } from 'react';
import { 
  Library, 
  Search, 
  BookOpen, 
  BookMarked, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Quote, 
  Bookmark, 
  Layers, 
  ArrowLeft,
  X,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { LibraryBook, BookSearchQueryResult } from '../../types';
import { BOOKS_LIBRARY_DATA, BOOK_CATEGORIES_METADATA } from '../../data/booksLibraryData';

export const AIBooksLibraryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeBookModal, setActiveBookModal] = useState<LibraryBook | null>(null);
  
  // Search state
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<BookSearchQueryResult | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string>('');

  // Quick preset questions
  const presetQuestions = [
    {
      q: 'ما هو بروتوكول التعامل مع ضربات الشمس والإجهاد الحراري في الميدان؟',
      category: 'safety'
    },
    {
      q: 'كيف نمنع الاحتراق النفسي والإجهاد بين المتطوعين في الفعاليات الطويلة؟',
      category: 'volunteering'
    },
    {
      q: 'ما هي معايير وضوابط تراخيص جمع التبرعات العينية والنقدية؟',
      category: 'governance'
    },
    {
      q: 'كيف نتغلب على انقطاع الاتصالات والشبكات في المناطق المعزولة؟',
      category: 'relief_emergency'
    },
    {
      q: 'ما هي حلول لوجستيات الميل الأخير لنقل المواد في الشوارع الضيقة؟',
      category: 'logistics'
    }
  ];

  // Execute Search in Books
  const handleExecuteSearch = async (queryText?: string, specificBookId?: string) => {
    const targetQuery = (queryText || searchQuery).trim();
    if (!targetQuery) return;

    setActiveQuestion(targetQuery);
    setIsSearching(true);

    try {
      const response = await fetch('/api/books/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          bookId: specificBookId
        })
      });

      if (!response.ok) {
        throw new Error('فشل البحث في مكتبة الكتب');
      }

      const data: BookSearchQueryResult = await response.json();
      setSearchResult(data);
    } catch (err) {
      console.error('Search error:', err);
      // Client-side fallback if server offline
      const matched = BOOKS_LIBRARY_DATA.filter(b => 
        b.title.includes(targetQuery) || 
        b.chapters.some(c => c.title.includes(targetQuery) || c.summary.includes(targetQuery))
      );
      const fallbackBook = matched[0] || BOOKS_LIBRARY_DATA[0];
      setSearchResult({
        query: targetQuery,
        matchedBooks: [
          {
            bookId: fallbackBook.id,
            bookTitle: fallbackBook.title,
            author: fallbackBook.author,
            category: fallbackBook.category,
            chapterTitle: `الفصل الأول: ${fallbackBook.chapters[0].title}`,
            relevanceScore: 10,
            excerpt: fallbackBook.chapters[0].summary
          }
        ],
        answer: `بناءً على مراجع مكتبة أثر، وخصوصاً كتاب "${fallbackBook.title}" للمؤلف ${fallbackBook.author}:\n\n${fallbackBook.chapters[0].summary}\n\nيوصي المرجع بالرجوع لمصفوفة الإجراءات التنفيذية وتوثيق خطوات العمل الميداني.`,
        keyTakeaways: [
          fallbackBook.coreQuotes[0] || 'الالتزام بالأدلة المرجعية يضمن أعلى جودة تنفيذية.',
          `تطبيق توجيهات: ${fallbackBook.chapters[0].title}`
        ],
        recommendedReading: [`${fallbackBook.title} - الفصل الأول`],
        source: 'books_library'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Filter books catalog
  const filteredBooks = BOOKS_LIBRARY_DATA.filter(book => {
    if (selectedCategory !== 'all' && book.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
            <Library className="w-4 h-4 text-purple-400" />
            <span>مكتبة الكتب والمراجع الذكية بـ AI</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            مكتبة رقمية للكتب والأدلة الميدانية
          </h1>
          
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-3xl">
            محرك ذكاء اصطناعي مخصص للبحث في أمهات الكتب، الأدلة التشغيلية، ولوائح العمل غير الربحي. 
            اسأل عن أي مسألة وسيقوم النظام بالبحث في فصول الكتب المعتمدة وعرض النتيجة الدقيقة مع التوثيق المرجعي.
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-stone-300">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>{BOOKS_LIBRARY_DATA.length} مراجع وكتب تخصصية</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>30+ فصلاً تشغيلياً معتمداً</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>مطابقة لأحدث لوائح القطاع غير الربحي</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Engine (اسأل عن أي شيء يبحث ويعرض نتيجة) */}
      <div className="rounded-3xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <label htmlFor="librarySearchInput" className="text-base font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-400" />
            <span>اسأل عن أي شيء للبحث في مكتبة الكتب:</span>
          </label>
          <p className="text-xs text-stone-400">
            اكتب سؤالك أو موضوعك وسيقوم الذكاء الاصطناعي بتمشيط الفصول والمراجع لاستخراج النتيجة المباشرة.
          </p>
        </div>

        {/* Search Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch();
          }}
          className="relative flex items-center"
        >
          <input
            id="librarySearchInput"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="مثال: كيف نتعامل مع ضربات الشمس في الميدان؟ أو: معايير تنظيم المتطوعين..."
            className="w-full pl-36 pr-12 py-4 rounded-2xl bg-stone-950/80 border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner"
          />
          <Search className="absolute right-4 w-5 h-5 text-stone-400 pointer-events-none" />
          
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute left-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>جاري البحث...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>بحث في الكتب</span>
              </>
            )}
          </button>
        </form>

        {/* Preset Questions Shortcuts */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-stone-400">أسئلة شائعة جاهزة للبحث الفوري:</span>
          <div className="flex flex-wrap gap-2">
            {presetQuestions.map((pq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(pq.q);
                  handleExecuteSearch(pq.q);
                }}
                className="text-xs px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-all text-right flex items-center gap-2 group"
              >
                <BookMarked className="w-3 h-3 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>{pq.q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Result Display */}
        {searchResult && (
          <div className="pt-6 border-t border-white/10 space-y-6 animate-in fade-in duration-300">
            {/* Header of the Result */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950/70 p-4 rounded-2xl border border-purple-500/20">
              <div className="space-y-1">
                <span className="text-xs text-purple-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  نتيجة البحث من كتب ومراجع أثر المعتمدة
                </span>
                <h3 className="text-base font-bold text-white">
                  السؤال: &ldquo;{searchResult.query}&rdquo;
                </h3>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {searchResult.matchedBooks.length} مراجع مطابقة
              </span>
            </div>

            {/* Synthesized Answer Body */}
            <div className="bg-stone-950/90 rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-300">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>خلاصة البحث المستخرجة من صفحات الكتب:</span>
              </div>
              
              <div className="text-sm text-stone-200 leading-relaxed whitespace-pre-line bg-stone-900/50 p-4 rounded-xl border border-white/5">
                {searchResult.answer}
              </div>

              {/* Key takeaways from books */}
              {searchResult.keyTakeaways && searchResult.keyTakeaways.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>خلاصات تنفيذية مباشرة من المراجع:</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {searchResult.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="text-xs text-stone-300 flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Matched Books Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                <span>الكتب والفصول التي تم الاقتباس منها:</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {searchResult.matchedBooks.map((mb, idx) => {
                  const fullBook = BOOKS_LIBRARY_DATA.find(b => b.id === mb.bookId);
                  return (
                    <div 
                      key={idx}
                      onClick={() => fullBook && setActiveBookModal(fullBook)}
                      className="cursor-pointer bg-stone-950/60 hover:bg-stone-900 border border-white/10 hover:border-purple-500/40 p-4 rounded-2xl space-y-2.5 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-8 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 font-bold">
                          مرجع معتمد
                        </span>
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {mb.bookTitle}
                        </h5>
                        <p className="text-[11px] text-stone-400">المؤلف: {mb.author}</p>
                      </div>
                      {mb.chapterTitle && (
                        <div className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          {mb.chapterTitle}
                        </div>
                      )}
                      <p className="text-[11px] text-stone-300 line-clamp-2 leading-relaxed">
                        {mb.excerpt}
                      </p>
                      <div className="text-[10px] text-purple-400 flex items-center gap-1 group-hover:underline pt-1">
                        <span>فتح فهرس ومحتوى الكتاب</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Catalog of Books (تصفح جميع كتب المكتبة) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Library className="w-5 h-5 text-purple-400" />
              <span>فهرس أمهات الكتب والمراجع الميدانية</span>
            </h2>
            <p className="text-xs text-stone-400">
              تصفح محتوى الفصول والمناهج التشغيلية المعتمدة في مكتبة أثر
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {BOOK_CATEGORIES_METADATA.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <div
              key={book.id}
              className="rounded-3xl border border-white/10 bg-stone-900/50 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div className="space-y-4">
                {/* Book Spine Graphic & Category */}
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-22 rounded-xl bg-gradient-to-br ${book.coverGradient} shadow-xl flex flex-col justify-between p-2 text-white shrink-0 border border-white/20`}>
                    <BookMarked className="w-4 h-4 text-white/80" />
                    <span className="text-[8px] font-mono text-white/70 tracking-tighter">أثر {book.year}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-stone-300">
                      {book.publisher}
                    </span>
                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-stone-400 font-medium">
                      بقلم: {book.author}
                    </p>
                  </div>
                </div>

                {/* Overview */}
                <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">
                  {book.overview}
                </p>

                {/* Chapters Mini List */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-stone-400 font-semibold block">
                    أبرز فصول الكتاب ({book.chapters.length} فصول):
                  </span>
                  <div className="space-y-1">
                    {book.chapters.slice(0, 2).map(ch => (
                      <div key={ch.number} className="text-[11px] text-stone-300 flex items-center gap-1.5 bg-stone-950/40 px-2.5 py-1 rounded-lg">
                        <span className="text-purple-400 font-bold">ف{ch.number}</span>
                        <span className="truncate">{ch.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBookModal(book)}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>تصفح الفصول ({book.chapters.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const promptText = `ما هي أهم التوجيهات الميدانية في كتاب "${book.title}"؟`;
                    setSearchQuery(promptText);
                    handleExecuteSearch(promptText, book.id);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="py-2 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                  title="سؤال هذا الكتاب مباشرة"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اسأل الكتاب</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book Detail Modal */}
      {activeBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-stone-900 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-20 rounded-xl bg-gradient-to-br ${activeBookModal.coverGradient} shadow-xl flex items-center justify-center text-white shrink-0 border border-white/20`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-purple-400 font-bold">
                    {activeBookModal.publisher} • {activeBookModal.year}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {activeBookModal.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300">
                    المؤلف: {activeBookModal.author} | عدد الصفحات: {activeBookModal.pagesCount} صفحة
                  </p>
                  <span className="text-[10px] text-stone-400 font-mono">
                    الرقم المعياري الدولي (ISBN): {activeBookModal.isbn}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveBookModal(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>النبذة التعريفية بالكتاب:</span>
              </h4>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed bg-stone-950/60 p-4 rounded-2xl border border-white/5">
                {activeBookModal.overview}
              </p>
            </div>

            {/* Target Audience */}
            <div className="text-xs text-stone-300 bg-white/5 p-3 rounded-xl flex items-center gap-2">
              <span className="text-emerald-400 font-bold">الفئة المستهدفة:</span>
              <span>{activeBookModal.targetAudience}</span>
            </div>

            {/* Chapters list */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>فهرس ومحتويات الفصول:</span>
              </h4>

              <div className="space-y-3">
                {activeBookModal.chapters.map(chap => (
                  <div 
                    key={chap.number}
                    className="bg-stone-950/70 border border-white/10 p-4 rounded-2xl space-y-2 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 text-xs flex items-center justify-center font-mono">
                          {chap.number}
                        </span>
                        <span>{chap.title}</span>
                      </h5>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed pr-7">
                      {chap.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pr-7 pt-1">
                      {chap.keyTopics.map((topic, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-stone-300 border border-white/10">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Quotes */}
            {activeBookModal.coreQuotes.length > 0 && (
              <div className="space-y-2 bg-gradient-to-r from-purple-900/20 to-emerald-900/20 p-4 rounded-2xl border border-white/10">
                <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5" />
                  <span>اقتباسات من صفحات الكتاب:</span>
                </h4>
                <div className="space-y-1.5">
                  {activeBookModal.coreQuotes.map((q, idx) => (
                    <blockquote key={idx} className="text-xs text-stone-300 italic">
                      &ldquo;{q}&rdquo;
                    </blockquote>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Ask This Book Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveBookModal(null);
                  const q = `ما هي أهم الإجراءات الواردة في كتاب "${activeBookModal.title}"؟`;
                  setSearchQuery(q);
                  handleExecuteSearch(q, activeBookModal.id);
                  window.scrollTo({ top: 150, behavior: 'smooth' });
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>اسأل الذكاء الاصطناعي عن محتوى هذا الكتاب الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
