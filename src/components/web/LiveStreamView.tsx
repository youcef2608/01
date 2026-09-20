import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Tv, 
  Users, 
  MessageSquare, 
  Send, 
  Heart, 
  ThumbsUp, 
  Share2, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Play, 
  Pause, 
  AlertTriangle, 
  MapPin, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  Phone,
  Clock,
  ShieldCheck,
  Video
} from 'lucide-react';
import { Call } from '../../types';

interface LiveMessage {
  id: string;
  sender: string;
  avatar: string;
  role: string;
  text: string;
  time: string;
  isUrgent?: boolean;
}

interface LiveStreamItem {
  id: string;
  title: string;
  channel: string;
  channelAvatar: string;
  location: string;
  viewers: number;
  thumbnailUrl: string;
  priority: 'urgent' | 'high' | 'normal';
  category: string;
  description: string;
  streamUrl?: string;
  isMain?: boolean;
}

const LIVE_STREAMS: LiveStreamItem[] = [
  {
    id: 'stream-1',
    title: 'بث مباشر: توزيع قفف وسلال غذائية للأسر المعوزة في الجزائر العاصمة',
    channel: 'فريق الإغاثة الميداني',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
    location: 'مكان عادي (الجزائر العاصمة)',
    viewers: 412,
    thumbnailUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    priority: 'urgent',
    category: 'إغاثة وسلال غذائية',
    description: 'تغطية حية لعمليات فرز وتوزيع 200 سلة غذائية للأسر المحتاجة بالتعاون مع الهلال الأحمر الجزائري وفرق المتطوعين.',
    isMain: true
  },
  {
    id: 'stream-2',
    title: 'بث حي: حملة غرس وتنظيف غابة الصنوبر بوهران',
    channel: 'فريق أصدقاء البيئة',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    location: 'مكان عادي (وهران)',
    viewers: 184,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    priority: 'high',
    category: 'بيئة وتشجير',
    description: 'متابعة مباشرة لغرس 200 شجيرة بمشاركة العائلات والكشافة الإسلامية الجزائرية.'
  },
  {
    id: 'stream-3',
    title: 'بث مباشر: تدخل عاجل لإغاثة المتضررين من السيول بسطيف',
    channel: 'الهلال الأحمر الجزائري',
    channelAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    location: 'مكان عادي (سطيف)',
    viewers: 650,
    thumbnailUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    priority: 'urgent',
    category: 'إغاثة طوارئ',
    description: 'غرفة العمليات الميدانية وتنسيق نقل المياه الصالحة للشرب والأغطية للعائلات.'
  },
  {
    id: 'stream-4',
    title: 'بث مباشر: قافلة أمل الطبية المتنقلة بواحات غرداية',
    channel: 'جمعية سبل الخيرات',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
    location: 'مكان عادي (غرداية)',
    viewers: 128,
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    priority: 'normal',
    category: 'صحي واجتماعي',
    description: 'فحوصات طبية وتوزيع نظارات قراءة ومستلزمات صحية للأسر في المناطق النائية.'
  }
];

const INITIAL_CHAT: LiveMessage[] = [
  {
    id: 'msg-1',
    sender: 'كريم مرابط',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80',
    role: 'منسق الميدان',
    text: 'السلام عليكم، تم تفريغ الدفعة الأولى من السلال ووصلت شاحنة الدعم الثانية بحمد الله.',
    time: 'منذ دقيقة',
    isUrgent: false
  },
  {
    id: 'msg-2',
    sender: 'أمينة بن زينة',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&q=80',
    role: 'متطوعة طبية',
    text: 'حقائب الإسعاف الأولية جاهزة مع فريق الاستجابة عند المدخل الغربي.',
    time: 'منذ دقيقتين',
    isUrgent: false
  },
  {
    id: 'msg-3',
    sender: 'ياسين بلخير',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=60&q=80',
    role: 'مستجيب أول',
    text: 'نحتاج متطوعين إضافيين لتنظيم دخول الأسر عند نقطة التوزيع رقم 3.',
    time: 'منذ 3 دقائق',
    isUrgent: true
  }
];

interface LiveStreamViewProps {
  onSelectCall?: (call: Call) => void;
  calls?: Call[];
  onOpenCreateCall?: () => void;
}

export const LiveStreamView: React.FC<LiveStreamViewProps> = ({ onSelectCall, calls = [], onOpenCreateCall }) => {
  const [activeStream, setActiveStream] = useState<LiveStreamItem>(LIVE_STREAMS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likesCount, setLikesCount] = useState(248);
  const [hasLiked, setHasLiked] = useState(false);
  const [chatMessages, setChatMessages] = useState<LiveMessage[]>(INITIAL_CHAT);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: LiveMessage = {
      id: `msg-${Date.now()}`,
      sender: 'يوسف بن علي (أنت)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=60&q=80',
      role: 'متطوع ميداني',
      text: inputMessage.trim(),
      time: 'الآن',
      isUrgent: inputMessage.includes('عاجل') || inputMessage.includes('طوارئ')
    };

    setChatMessages(prev => [...prev, newMsg]);
    setInputMessage('');
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                البث المباشر الميداني في الجزائر
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wide uppercase flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                مباشر
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              تغطية حية وغرف عمليات تفاعلية لنشاط المتطوعين ومشاريع الإغاثة في كافة أرجاء القطر
            </p>
          </div>
        </div>

        {/* Live status badge */}
        <div className="flex items-center gap-2 text-xs bg-stone-900/80 border border-stone-800 px-3.5 py-2 rounded-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-stone-300 font-bold">
            {LIVE_STREAMS.reduce((acc, s) => acc + s.viewers, 0)} متطوع ومتابع الآن
          </span>
        </div>
      </div>

      {/* Main Stream & Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Main Column: Video Player & Stream Details (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Video Viewport (16:9 YouTube style) */}
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-stone-800 shadow-2xl group">
            {/* Background Image / Stream canvas */}
            <img 
              src={activeStream.thumbnailUrl} 
              alt={activeStream.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-100' : 'brightness-75'}`}
            />

            {/* Video dark gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Top Bar inside player */}
            <div className="absolute top-4 right-4 left-4 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-wide flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  مباشر الآن
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-stone-200 text-xs font-medium flex items-center gap-1.5 border border-white/10">
                  <Users className="w-3.5 h-3.5 text-stone-300" />
                  {activeStream.viewers} مشاهد
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  {activeStream.category}
                </span>
              </div>
            </div>

            {/* Center Play/Pause indicator on hover or pause */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-2xl"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
            </button>

            {/* Bottom Stream Controls Bar */}
            <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white pointer-events-auto">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>تغطية حية 1080p</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-300 hidden sm:inline-block font-mono">
                  {activeStream.location}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      document.documentElement.requestFullscreen().catch(() => {});
                    }
                  }}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/10 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Stream Information Card (YouTube Style) */}
          <div className="p-5 rounded-3xl bg-stone-900/60 border border-stone-800 backdrop-blur-xl space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                {activeStream.title}
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                {/* Channel details */}
                <div className="flex items-center gap-3">
                  <img 
                    src={activeStream.channelAvatar} 
                    alt={activeStream.channel} 
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-sm">{activeStream.channel}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-stone-400">جمعية معتمدة في الجزائر • 12 ألف عضو</span>
                  </div>
                  <button 
                    type="button"
                    className="mr-2 px-4 py-1.5 rounded-full bg-white text-stone-950 font-black text-xs hover:bg-stone-200 transition-colors"
                  >
                    متابعة
                  </button>
                </div>

                {/* Actions (Like, Share, Call link) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                      hasLiked 
                        ? 'bg-red-600/20 text-red-400 border-red-500/40' 
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-400' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                        alert('تم نسخ رابط البث المباشر!');
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description & Location */}
            <div className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800/80 text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-stone-400 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>الموقع الميداني: {activeStream.location}</span>
                <span>•</span>
                <span>بدأ البث منذ 45 دقيقة</span>
              </div>
              <p className="leading-relaxed text-stone-200">{activeStream.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Chat & Dispatch Room (4 Cols - YouTube Live style) */}
        <div className="lg:col-span-4 h-[640px] flex flex-col rounded-3xl bg-stone-900/60 border border-stone-800 backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="p-4 border-b border-stone-800 bg-stone-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="font-black text-white text-sm">المحادثة الميدانية المباشرة</h3>
            </div>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              متصل الآن
            </span>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            <div className="text-center py-2">
              <span className="px-3 py-1 rounded-full bg-stone-800 text-[10px] text-stone-400 font-medium">
                مرحباً بك في المحادثة المباشرة للمتطوعين بالجزائر
              </span>
            </div>

            {chatMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`p-3 rounded-2xl transition-all ${
                  msg.isUrgent 
                    ? 'bg-red-950/40 border border-red-500/30' 
                    : 'bg-stone-950/40 border border-stone-800/60 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <img 
                      src={msg.avatar} 
                      alt={msg.sender} 
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="font-extrabold text-white text-xs">{msg.sender}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                      {msg.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">{msg.time}</span>
                </div>
                <p className="text-stone-200 text-xs leading-relaxed pr-7">{msg.text}</p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Quick Reactions */}
          <div className="px-4 py-2 bg-stone-950/40 border-t border-stone-800/80 flex items-center justify-between text-xs">
            <span className="text-stone-400 text-[11px]">تفاعل سريع:</span>
            <div className="flex items-center gap-1.5">
              {['💪 همة عالية', '❤️ بارك الله فيكم', '🚨 جاهز للإسناد', '📍 أين الموقع؟'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setInputMessage(tag);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] transition-colors whitespace-nowrap"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
            <input 
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="اكتب رسالة للميدان أو إبلاغاً عاجلاً..."
              className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg disabled:opacity-50"
              disabled={!inputMessage.trim()}
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      </div>

      {/* Other Active Live Streams in Algeria (Horizontal Cards) */}
      <div className="space-y-4 pt-6 border-t border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">غرف وبثوث مباشرة أخرى في الجزائر</h3>
          </div>
          <span className="text-xs text-stone-400">انقر للتبديل الفوري للبث</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LIVE_STREAMS.filter(s => s.id !== activeStream.id).map(stream => (
            <div
              key={stream.id}
              onClick={() => setActiveStream(stream)}
              className="group cursor-pointer rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-emerald-500/40 p-3 transition-all hover:bg-stone-800/60 flex flex-col gap-3 shadow-lg"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <img 
                  src={stream.thumbnailUrl} 
                  alt={stream.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  مباشر
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono">
                  {stream.viewers} متابع
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-xs line-clamp-2 group-hover:text-emerald-400 transition-colors leading-snug">
                  {stream.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>{stream.channel}</span>
                  <span className="text-stone-500 font-mono">{stream.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
