import React, { useState } from 'react';
import { 
  AuthUser, 
  UserRole 
} from '../../types';
import { 
  ALGERIA_WILAYAS, 
  DEMO_ACCOUNTS 
} from '../../data/authData';
import { 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  Building2, 
  MapPin, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Fingerprint, 
  ArrowRight, 
  Award, 
  Clock, 
  Sparkles, 
  LogOut, 
  RefreshCw, 
  QrCode, 
  AlertCircle,
  HelpCircle,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthViewProps {
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'demo'>('signin');

  // Sign in form state
  const [loginIdentifier, setLoginIdentifier] = useState('0550 12 34 56');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign up form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWilaya, setRegWilaya] = useState('16 - الجزائر العاصمة');
  const [regRole, setRegRole] = useState<UserRole>('association');
  const [regAssociation, setRegAssociation] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Forgot password / OTP state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Volunteer Card Modal
  const [showIdCard, setShowIdCard] = useState(false);

  // Handle Login Submit
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      // Check if matches any demo user by phone or email
      const cleanInput = loginIdentifier.replace(/\s+/g, '').toLowerCase();
      const matched = DEMO_ACCOUNTS.find(
        acc => acc.phone.replace(/\s+/g, '') === cleanInput || acc.email.toLowerCase() === cleanInput
      );

      if (matched) {
        onLogin(matched);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } });
      } else if (cleanInput.length >= 8) {
        // Create authenticated association session for custom input
        const customName = cleanInput.includes('@') ? `جمعية ${cleanInput.split('@')[0]}` : 'جمعية تطوعية معتمدة';
        const customUser: AuthUser = {
          id: `assoc-${Date.now()}`,
          name: customName,
          email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@athar.dz`,
          phone: cleanInput,
          role: 'association',
          roleTitle: 'جمعية وطنية معتمدة',
          associationName: customName,
          wilaya: '16 - الجزائر العاصمة',
          badgeNumber: `DZ-ASSOC-${Math.floor(1000 + Math.random() * 9000)}`,
          isVerified: true,
          activeInitiativesCount: 1,
          volunteerHours: 120,
          points: 850,
          avatarUrl: '/app-logo.jpg'
        };
        onLogin(customUser);
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.4 } });
      } else {
        setLoginError('يرجى إدخال رقم هاتف الجمعية أو البريد الإلكتروني الرسمي.');
      }
      setIsSubmitting(false);
    }, 500);
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const assocName = regAssociation.trim() || regName.trim();
    if (!assocName) {
      setRegError('يرجى إدخال اسم الجمعية أو المنظمة.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('يرجى إدخال رقم هاتف التواصل الرسمي للجمعية.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('كلمة المرور يجب ألا تقل عن 6 أحرف أو أرقام.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (!agreeTerms) {
      setRegError('يجب الموافقة على ميثاق الشرف والعمل الإنساني التطوعي.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const wilayaNumber = regWilaya.split('-')[0].trim();
      const newUser: AuthUser = {
        id: `dz-assoc-${Date.now()}`,
        name: assocName,
        email: regEmail || `${regPhone.replace(/\s+/g, '')}@athar.dz`,
        phone: regPhone,
        role: 'association',
        roleTitle: 'جمعية معتمدة',
        associationName: assocName,
        wilaya: regWilaya,
        badgeNumber: `DZ-ASSOC-${wilayaNumber}-${Math.floor(1000 + Math.random() * 9000)}`,
        isVerified: true,
        activeInitiativesCount: 0,
        volunteerHours: 0,
        points: 200,
        avatarUrl: '/app-logo.jpg'
      };

      onLogin(newUser);
      setIsSubmitting(false);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
    }, 600);
  };

  // Biometric login simulation
  const handleBiometricLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const defaultUser = DEMO_ACCOUNTS[0];
      onLogin(defaultUser);
      setIsSubmitting(false);
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.4 } });
    }, 400);
  };

  // If user is already logged in, show authenticated dashboard card
  if (currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-300">
        <div className="rounded-3xl bg-[#13161f] border border-[#252a36] shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-r from-emerald-950/60 via-[#151924] to-[#121622] border-b border-[#252a36]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {currentUser.avatarUrl ? (
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xl"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-emerald-600/30 border-2 border-emerald-500 flex items-center justify-center text-xl font-bold text-emerald-300">
                      DZ
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#13161f] flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-white">{currentUser.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                      {currentUser.roleTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                    <span className="flex items-center gap-1 text-stone-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {currentUser.wilaya}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-stone-400">{currentUser.badgeNumber}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowIdCard(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span>بطاقتي الرقمية</span>
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-[#252a36] bg-[#0f1118] border-b border-[#252a36]">
            <div className="p-4 text-center">
              <span className="text-[11px] text-stone-400 block mb-1">ساعات التطوع</span>
              <span className="text-xl font-black text-white font-mono">{currentUser.volunteerHours} س</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[11px] text-stone-400 block mb-1">نقاط الأثر</span>
              <span className="text-xl font-black text-emerald-400 font-mono">{currentUser.points}</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[11px] text-stone-400 block mb-1">المبادرات المنفذة</span>
              <span className="text-xl font-black text-white font-mono">{currentUser.activeInitiativesCount}</span>
            </div>
            <div className="p-4 text-center">
              <span className="text-[11px] text-stone-400 block mb-1">حالة الاعتماد</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-1">
                <ShieldCheck className="w-4 h-4" />
                معتمد رسمياً
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#171b26] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-stone-300 block">بيانات الاتصال والتواصل:</span>
                <div className="space-y-1.5 text-xs text-stone-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white font-mono">{currentUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-white">{currentUser.email}</span>
                  </div>
                  {currentUser.associationName && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300">{currentUser.associationName}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#171b26] border border-white/5 space-y-2">
                <span className="text-xs font-bold text-stone-300 block">الوصول السريع للخدمات:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center transition-colors"
                  >
                    لوحة العمليات 🏠
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('demo')}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-bold text-center border border-white/10 transition-colors"
                  >
                    تبديل الحساب 🔁
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Demo Switcher within Profile */}
            <div className="pt-4 border-t border-[#252a36]">
              <span className="text-xs font-bold text-stone-400 block mb-3">
                تبديل الحساب بنقرة واحدة لاختبار الصلاحيات:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => onLogin(acc)}
                    className={`p-3 rounded-xl border text-right transition-all text-xs flex items-center gap-2.5 ${
                      currentUser.id === acc.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                        : 'bg-[#151924] border-white/5 hover:border-white/20 text-stone-300 hover:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                      {acc.name[0]}
                    </div>
                    <div className="truncate">
                      <span className="font-bold block truncate">{acc.name}</span>
                      <span className="text-[10px] text-stone-400 truncate block">{acc.roleTitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Digital ID Card Modal */}
        {showIdCard && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-3xl bg-gradient-to-b from-[#141926] to-[#0c0e14] border border-emerald-500/30 p-6 shadow-2xl relative text-center space-y-4">
              <button
                type="button"
                onClick={() => setShowIdCard(false)}
                className="absolute top-4 left-4 text-stone-400 hover:text-white"
              >
                ✕
              </button>

              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
              </div>
              <h3 className="text-lg font-black text-white">بطاقة المتطوع الرقمية الموحدة</h3>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-2xl font-black text-emerald-300">
                  DZ
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-base">{currentUser.name}</h4>
                  <p className="text-xs text-emerald-400 font-bold">{currentUser.roleTitle}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{currentUser.wilaya}</p>
                </div>
                <div className="py-2 border-t border-b border-white/10 text-xs flex justify-around font-mono">
                  <div>
                    <span className="text-[10px] text-stone-500 block">رقم الشارة</span>
                    <span className="text-white font-bold">{currentUser.badgeNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">ساعات العمل</span>
                    <span className="text-emerald-400 font-bold">{currentUser.volunteerHours} س</span>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-full h-full border-4 border-black p-1 flex flex-col items-center justify-between">
                    <div className="flex justify-between w-full">
                      <div className="w-4 h-4 bg-black"></div>
                      <div className="w-4 h-4 bg-black"></div>
                    </div>
                    <span className="text-[9px] font-black text-black font-mono tracking-tighter">ATHAR DZ</span>
                    <div className="flex justify-between w-full">
                      <div className="w-4 h-4 bg-black"></div>
                      <div className="w-4 h-4 bg-black"></div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 block font-mono">
                  صالحة لعمليات الإسناد الميداني والتدخل في كامل التراب الوطني
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowIdCard(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                إغلاق البطاقة
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not logged in: Show the sleek, comprehensive Algerian login / registration experience
  return (
    <div className="max-w-xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span>🇩🇿</span>
          <span>منظومة أثر الجزائر الميدانية</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          بوابة الدخول الموحدة للمتطوعين والجمعيات
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          سجّل دخولك لمتابعة النداءات الميدانية، تلقي التنبيهات، وإدارة فرق الاستجابة في الـ 58 ولاية.
        </p>
      </div>

      {/* Main Form Container */}
      <div className="rounded-3xl bg-[#13161f] border border-[#252a36] shadow-2xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-[#252a36] bg-[#0f1118] text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`py-3.5 transition-all text-center ${
              activeTab === 'signin'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-[#141824]'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`py-3.5 transition-all text-center ${
              activeTab === 'signup'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-[#141824]'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            إنشاء حساب جديد
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-3.5 transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-[#141824]'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>حسابات تجريبية</span>
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Phone / Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
                  <span>رقم الهاتف الجزائري أو البريد الإلكتروني</span>
                  <span className="text-[10px] text-stone-500">DZ +213</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="0551 23 98 76 أو example@athar.dz"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-2xl bg-[#171b26] border border-white/10 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors pl-10 font-mono"
                    required
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-stone-300">كلمة المرور</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-2xl bg-[#171b26] border border-white/10 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors pl-10 pr-10"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute left-3.5 top-3.5 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>تذكرني على هذا الجهاز</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ التحقق وتأمين الجلسة...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول الميداني</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>

              {/* Biometric Quick Login */}
              <div className="pt-3 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 text-xs text-stone-400 hover:text-emerald-400 transition-colors"
                >
                  <Fingerprint className="w-4 h-4 text-emerald-500" />
                  <span>دخول سريع ببصمة الإصبع أو Face ID للمتطوع</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="مثال: يوسف بن مهيدي"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#171b26] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors pl-10"
                    required
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">صفة الحساب الميداني</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('volunteer')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      regRole === 'volunteer'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-[#171b26] border-white/5 text-stone-400 hover:text-white'
                    }`}
                  >
                    🤝 متطوع ميداني
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('association_leader')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      regRole === 'association_leader'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-[#171b26] border-white/5 text-stone-400 hover:text-white'
                    }`}
                  >
                    🏢 مسؤول جمعية
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('field_medic')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      regRole === 'field_medic'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-[#171b26] border-white/5 text-stone-400 hover:text-white'
                    }`}
                  >
                    🚑 طاقم إسعاف
                  </button>
                </div>
              </div>

              {/* Association Name if selected */}
              {regRole === 'association_leader' && (
                <div className="space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold text-stone-300">اسم الجمعية أو المبادرة المعتمدة</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={regAssociation}
                      onChange={e => setRegAssociation(e.target.value)}
                      placeholder="مثال: جمعية ناس الخير، جمعية سبل الخيرات..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#171b26] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors pl-10"
                    />
                    <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              {/* Algerian Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">رقم الهاتف الجزائري (للتنسيق والطوارئ)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="0550 00 00 00 / 0660... / 0770..."
                    dir="ltr"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#171b26] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors pl-10 font-mono"
                    required
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Wilaya Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300">الولاية الميدانية (من ولايات الجزائر الـ 58)</label>
                <div className="relative">
                  <select
                    value={regWilaya}
                    onChange={e => setRegWilaya(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#171b26] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {ALGERIA_WILAYAS.map(w => (
                      <option key={w} value={w} className="bg-[#141824] text-white">
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">كلمة المرور</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#171b26] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-300">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={regPasswordConfirm}
                    onChange={e => setRegPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#171b26] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-stone-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-700 bg-stone-900 text-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <span>
                    أوافق على ميثاق العمل التطوعي الجزائري والالتزام بمعايير السلامة والتنسيق مع الحماية المدنية.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? 'جارٍ إنشاء الحساب وإصدار الشارة...' : 'تأكيد التسجيل وإصدار بطاقة المتطوع'}
              </button>
            </form>
          )}

          {/* TAB 3: QUICK DEMO ACCOUNTS (1-Click instant test) */}
          {activeTab === 'demo' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-xs text-stone-400">
                اختر أحد الحسابات الميدانية المعتمدة للدخول الفوري وتجربة كافة وظائف المنصة:
              </p>

              <div className="space-y-2.5">
                {DEMO_ACCOUNTS.map(acc => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      onLogin(acc);
                      confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } });
                    }}
                    className="p-3.5 rounded-2xl bg-[#171b26] hover:bg-[#1f2535] border border-white/10 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {acc.avatarUrl ? (
                        <img 
                          src={acc.avatarUrl} 
                          alt={acc.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                          DZ
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs group-hover:text-emerald-300 transition-colors">
                            {acc.name}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">({acc.badgeNumber})</span>
                        </div>
                        <span className="text-[11px] text-emerald-400 block font-medium">
                          {acc.roleTitle}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {acc.wilaya} • {acc.volunteerHours} ساعة تطوع
                        </span>
                      </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      دخول فوري ➔
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-3xl bg-[#141824] border border-white/10 p-6 shadow-2xl text-center space-y-4">
            <h3 className="font-extrabold text-white text-base">استعادة كلمة المرور عبر SMS</h3>
            <p className="text-xs text-stone-400">
              أدخل رقم هاتفك الجزائري لاستلام رمز تحقق فوري مكون من 4 أرقام.
            </p>

            {!otpSent ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotPhone}
                  onChange={e => setForgotPhone(e.target.value)}
                  placeholder="0551 23 98 76"
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#1a1f2e] border border-white/10 text-xs text-white text-center font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (forgotPhone.length >= 8) {
                      setOtpSent(true);
                    } else {
                      alert('يرجى إدخال رقم هاتف صحيح.');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  إرسال رمز التحقق
                </button>
              </div>
            ) : !otpSuccess ? (
              <div className="space-y-3">
                <p className="text-xs text-emerald-400 font-bold">
                  ✓ تم إرسال الرمز (9042) إلى {forgotPhone}
                </p>
                <input
                  type="text"
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                  placeholder="أدخل الرمز 9042"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#1a1f2e] border border-white/10 text-sm text-white text-center font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (enteredOtp === '9042' || enteredOtp.length === 4) {
                      setOtpSuccess(true);
                    } else {
                      alert('الرمز الصحيح للتجربة هو 9042');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  تأكيد الرمز
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-emerald-400 font-bold">
                  ✓ تم التحقق بنجاح! كلمة المرور المؤقتة هي: Athar2026
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setOtpSent(false);
                    setOtpSuccess(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setShowForgotModal(false);
                setOtpSent(false);
              }}
              className="text-xs text-stone-500 hover:text-stone-300"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
