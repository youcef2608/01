import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Trash2, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Image as ImageIcon, 
  Flame, 
  HeartHandshake, 
  ShieldCheck, 
  Compass,
  ArrowDown
} from 'lucide-react';
import { GeminiChatMessage, Call } from '../../types';
import { ALGERIA_WILAYAS } from '../../data/authData';

interface GeminiAIChatViewProps {
  calls?: Call[];
  currentWilaya?: string;
}

export const GeminiAIChatView: React.FC<GeminiAIChatViewProps> = ({
  calls = [],
  currentWilaya = '16 - الجزائر العاصمة'
}) => {
  const [messages, setMessages] = useState<GeminiChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      text: 'مرحباً بك! أنا مستشارك الميداني **Gemini** لمنظومة «أثر» بالجزائر 🇩🇿.\n\nأنا جاهز لتقديم المشورة الفورية حول:\n• بروتوكولات الحماية المدنية والإسعاف الطبي الأولي\n• لوجستيات قوافل الإغاثة وتوزيع السلال الغذائية\n• خطط السلامة الميدانية وحملات التشجير وإدارة المتطوعين\n\nاسألني في أي وقت أو اختر أحد المواضيع السريعة أدناه.',
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      source: 'gemini-3.8-flash'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [selectedWilaya, setSelectedWilaya] = useState(currentWilaya);
  const [activeMode, setActiveMode] = useState<'general' | 'emergency' | 'volunteering'>('general');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [activeAttachment, setActiveAttachment] = useState<{
    type: 'call' | 'wilaya' | 'document' | 'emergency';
    title: string;
    details?: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-DZ';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(prev => prev ? `${prev} ${transcript}` : transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      alert('التعرف الصوتي غير مدعوم في متصفحك الحالي، يمكنك الكتابة في الحقل مباشرة.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech (Web Speech Synthesis)
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*#_`>]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessage: GeminiChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      attachment: activeAttachment || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setActiveAttachment(null);
    setShowAttachMenu(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map(m => ({
            role: m.role,
            text: m.text
          })),
          wilaya: selectedWilaya,
          mode: activeMode,
          attachment: activeAttachment
        })
      });

      const data = await res.json();

      const aiMessage: GeminiChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.answer || 'تمت معالجة الاستفسار بنجاح.',
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const fallbackAi: GeminiChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'model',
        text: 'عذراً، حدث تعذر مؤقت في الاتصال بالخادم. يرجى إعادة المحاولة أو التحقق من شبكة الاتصال.',
        timestamp: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        source: 'system'
      };
      setMessages(prev => [...prev, fallbackAi]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      title: 'تنظيم قفة رمضان وسلال الإغاثة',
      prompt: 'كيف نضع خطة ميدانية منظمة لتوزيع 300 قفة إغاثية في أحياء القصبة وباب الواد دون حدوث ازدحام؟',
      icon: <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
    },
    {
      title: 'خطة إسناد طبي وطوارئ',
      prompt: 'ما هي الترتيبات الإسعافية الأولية المطلوبة لتغطية سباق ماراثون خيري بحضور 500 متسابق في وهران؟',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
    },
    {
      title: 'حملة تشجير غابي بالبليدة',
      prompt: 'ما هي المعايير الميدانية لغرس 400 شجرة صنوبر وخروب في جبال الشريعة مع تدابير السلامة والري؟',
      icon: <Compass className="w-3.5 h-3.5 text-blue-400" />
    },
    {
      title: 'إسعافات ضربات الشمس والإجهاد',
      prompt: 'بروتوكول التدخل السريع للتعامل مع متطوع أصيب بإجهاد حراري أو ضربة شمس خلال العمل الميداني بالجنوب.',
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />
    }
  ];

  return (
    <div 
      className="relative flex flex-col w-full h-[calc(100vh-8.5rem)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all"
      style={{
        background: 'radial-gradient(ellipse at 50% 100%, rgba(13, 34, 88, 0.6) 0%, rgba(8, 16, 42, 0.95) 45%, #05070c 100%)'
      }}
    >
      {/* Top Floating Context Header */}
      <div className="z-10 flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#070b14]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-wide font-sans">Gemini</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-300 font-mono font-bold">
                Flash 3.8
              </span>
            </div>
            <p className="text-[11px] text-stone-400">مستشار أثر الذكي للمبادرات الميدانية بالجزائر</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 text-xs">
          {/* Wilaya Filter Picker */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-stone-300 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(e.target.value)}
              className="bg-transparent text-white text-xs border-none outline-none cursor-pointer pr-1"
            >
              {ALGERIA_WILAYAS.map(w => (
                <option key={w} value={w} className="bg-[#121622] text-white">
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Mode toggle */}
          <button
            type="button"
            onClick={() => setActiveMode(prev => prev === 'emergency' ? 'general' : 'emergency')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeMode === 'emergency'
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 animate-pulse'
                : 'bg-white/5 text-stone-300 hover:text-white border border-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{activeMode === 'emergency' ? 'نمط الطوارئ نشط' : 'نمط الطوارئ'}</span>
          </button>

          {/* Clear history */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل تريد مسح سجل المحادثة الحالي؟')) {
                setMessages([messages[0]]);
              }
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-red-400 transition-colors"
            title="مسح المحادثة"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {/* Gemini Central Greeting if few messages */}
        {messages.length <= 1 && (
          <div className="max-w-2xl mx-auto my-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                كيف يمكن لـ <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Gemini</span> مساعدتك اليوم؟
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto mt-2 leading-relaxed">
                استشارات فورية حول النداءات، التنسيق بين الجمعيات الجزائرية، وتدابير السلامة الميدانية.
              </p>
            </div>

            {/* Quick prompt cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 text-right">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(qp.prompt)}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#141824]/80 hover:bg-[#1a2133] border border-white/10 hover:border-blue-500/40 text-stone-200 transition-all text-xs group shadow-sm hover:shadow-lg"
                >
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform shrink-0">
                    {qp.icon}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-white block text-[13px] group-hover:text-blue-300 transition-colors">
                      {qp.title}
                    </span>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {qp.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Items */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row'} group`}
            >
              {/* Avatar */}
              <div className="shrink-0 mt-1">
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-300 shadow">
                    DZ
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className="space-y-1.5 max-w-[85%] sm:max-w-[78%]">
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-[13px] leading-relaxed transition-all ${
                    isUser
                      ? 'bg-[#1b233a] border border-blue-500/20 text-stone-100 rounded-tr-none shadow-md'
                      : 'bg-[#121622]/90 border border-white/10 text-stone-200 rounded-tl-none shadow-lg'
                  }`}
                >
                  {/* Attached context badge if exists */}
                  {msg.attachment && (
                    <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-[11px] text-emerald-300">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{msg.attachment.title}</span>
                    </div>
                  )}

                  {/* Message Content formatted */}
                  <div className="whitespace-pre-line font-sans leading-relaxed selection:bg-blue-600 selection:text-white">
                    {msg.text}
                  </div>
                </div>

                {/* Footer Controls for AI messages */}
                {!isUser && (
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 px-2">
                    <span>{msg.timestamp}</span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => copyMessage(msg.text, msg.id)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                      title="نسخ النص"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`hover:text-white flex items-center gap-1 transition-colors ${
                        isSpeaking === msg.id ? 'text-blue-400 font-bold' : ''
                      }`}
                      title="قراءة صوتية"
                    >
                      {isSpeaking === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-blue-400" />
                          <span>إيقاف الصوت</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>استماع</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-xl items-start animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shrink-0 mt-1">
              <Sparkles className="w-4 h-4 animate-spin text-white" />
            </div>
            <div className="p-4 rounded-3xl rounded-tl-none bg-[#121622]/90 border border-blue-500/30 text-stone-300 text-xs shadow-lg space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>Gemini يفكر ويحلل البروتوكول الميداني...</span>
              </div>
              <p className="text-[11px] text-stone-400">
                مراجعة السجلات والبيانات الميدانية لولاية {selectedWilaya}...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Bar (Exactly matching the screenshot aesthetic) */}
      <div className="relative z-20 w-full px-4 pb-4 pt-2">
        {/* Attachment menu popover if opened */}
        {showAttachMenu && (
          <div className="max-w-xl mx-auto mb-2 p-3 rounded-2xl bg-[#1a1d26] border border-white/10 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-150 text-xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-white/10 text-stone-400 text-[11px]">
              <span>إرفاق سياق ميداني مع استفسار Gemini:</span>
              <button 
                type="button" 
                onClick={() => setShowAttachMenu(false)}
                className="hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveAttachment({
                    type: 'emergency',
                    title: '🚨 نداء طوارئ عاجل (أولوية قصوى)',
                    details: 'طلب تدخل إسعافي أو إسناد ميداني عاجل'
                  });
                  setShowAttachMenu(false);
                }}
                className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-200 text-right space-y-1"
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="font-bold block text-[11px]">نداء طوارئ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveAttachment({
                    type: 'wilaya',
                    title: `📍 حصر الاستفسار في: ${selectedWilaya}`,
                    details: `البيانات الخاصة بولاية ${selectedWilaya}`
                  });
                  setShowAttachMenu(false);
                }}
                className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-200 text-right space-y-1"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="font-bold block text-[11px]">تثبيت الولاية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (calls.length > 0) {
                    const firstCall = calls[0];
                    setActiveAttachment({
                      type: 'call',
                      title: `📋 نداء: ${firstCall.title.slice(0, 30)}...`,
                      details: firstCall.description
                    });
                  } else {
                    setActiveAttachment({
                      type: 'call',
                      title: '📋 استيراد بيانات نداء من المنظومة',
                      details: 'النداءات الحالية المسجلة'
                    });
                  }
                  setShowAttachMenu(false);
                }}
                className="p-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-200 text-right space-y-1"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold block text-[11px]">إرفاق نداء</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*,.pdf';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setActiveAttachment({
                        type: 'document',
                        title: `📎 ملف: ${file.name}`,
                        details: `الحجم: ${(file.size / 1024).toFixed(1)} KB`
                      });
                    }
                  };
                  input.click();
                  setShowAttachMenu(false);
                }}
                className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-200 text-right space-y-1"
              >
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span className="font-bold block text-[11px]">صورة أو مستند</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected attachment chip above pill if present */}
        {activeAttachment && (
          <div className="max-w-xl mx-auto mb-2 flex items-center justify-between px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-200 text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="truncate">{activeAttachment.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveAttachment(null)}
              className="text-stone-400 hover:text-white px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Listening Voice Wave Indicator */}
        {isListening && (
          <div className="max-w-md mx-auto mb-2 px-4 py-2 rounded-full bg-red-600/90 text-white text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
            <span>جارٍ الاستماع لصوتك باللغة العربية... تكلّم الآن</span>
          </div>
        )}

        {/* THE PILL INPUT CONTAINER (Faithfully matching the uploaded screenshot) */}
        <div 
          className="max-w-2xl mx-auto w-full rounded-full bg-[#1e2024] hover:bg-[#23262b] border border-white/10 hover:border-white/20 transition-all shadow-2xl flex items-center px-2 py-1.5 gap-2"
        >
          {/* Plus Button (+) on the left */}
          <button
            type="button"
            onClick={() => setShowAttachMenu(prev => !prev)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0"
            title="إرفاق ملف أو سياق"
          >
            <Plus className={`w-5 h-5 transition-transform ${showAttachMenu ? 'rotate-45 text-white' : ''}`} />
          </button>

          {/* Text Input with placeholder "Ask Gemini" */}
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask Gemini"
            dir="auto"
            className="flex-1 bg-transparent border-none outline-none text-white text-sm sm:text-base placeholder:text-stone-400 font-sans px-2 selection:bg-blue-600"
          />

          {/* Right Action Icons: Microphone (🎙️) and Send (➤) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'text-stone-300 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              title={isListening ? 'إيقاف الاستماع' : 'إملاء صوتي'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Send Button when query has text */}
            {inputQuery.trim() && (
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-all active:scale-95 shrink-0"
                title="إرسال إلى Gemini"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footnote branding */}
        <p className="text-center text-[10px] text-stone-500 mt-2 font-sans">
          Gemini may display inaccurate info, so verify critical emergency responses with Protection Civile (14).
        </p>
      </div>
    </div>
  );
};
