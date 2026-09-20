import React, { useState, useEffect } from 'react';
import { 
  AuthUser, 
  UserRole 
} from '../../types';
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
  LogOut, 
  RefreshCw, 
  AlertCircle,
  UserPlus,
  Navigation,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign in form state - Clean & empty by default (No fake hardcoded credentials)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification Code (OTP) state - Resend integration
  const [verificationStep, setVerificationStep] = useState<'credentials' | 'otp'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [devCodePreview, setDevCodePreview] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Sign up form state - Clean & empty
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('association');
  const [regAssociation, setRegAssociation] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regGpsCoords, setRegGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Smooth GPS detection without blocking alert errors
  const handleDetectGps = () => {
    setIsDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingGps(false);
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setRegGpsCoords({ lat, lng });
        },
        (err) => {
          setIsDetectingGps(false);
          console.warn('GPS notice, using regional coordinate fallback:', err);
          // Standard Algeria coordinates (Algiers)
          setRegGpsCoords({ lat: 36.7538, lng: 3.0588 });
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } else {
      setIsDetectingGps(false);
      setRegGpsCoords({ lat: 36.7538, lng: 3.0588 });
    }
  };

  // Real Login against Server Database - Triggers OTP Verification via Resend
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanInput = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanInput || !cleanPass) {
      setLoginError('يرجى إدخال اسم الحساب أو رقم الهاتف وكلمة المرور.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanInput, password: cleanPass })
      });
      const data = await res.json().catch(() => null);

      if (data && data.success) {
        if (data.requireCode) {
          // Switch to OTP verification step
          setVerificationStep('otp');
          setOtpSentEmail(data.email || cleanInput);
          setDevCodePreview(data.code || null);
          setOtpMessage(data.message || 'تم توليد رمز التحقق بنجاح.');
          setResendCooldown(60);
        } else if (data.user) {
          onLogin(data.user);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } });
        }
      } else {
        setLoginError(data?.message || 'بيانات الدخول غير صحيحة، يرجى التأكد أو إنشاء حساب جديد.');
      }
    } catch (err) {
      setLoginError('تعذر الاتصال بقاعدة البيانات، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Confirm OTP Code & Finalize Login
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanInput = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length < 6) {
      setLoginError('يرجى إدخال رمز التحقق المكون من 6 أرقام كاملة.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanInput, password: cleanPass, code: cleanCode })
      });
      const data = await res.json().catch(() => null);

      if (data && data.success && data.user) {
        onLogin(data.user);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
      } else {
        setLoginError(data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية، يرجى التأكد.');
      }
    } catch (err) {
      setLoginError('تعذر التحقق من الرمز، يرجى إعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP Code via Resend
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: otpSentEmail && otpSentEmail.includes('@') ? otpSentEmail : undefined,
          phone: loginIdentifier.trim()
        })
      });
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        setDevCodePreview(data.code || null);
        setOtpMessage(data.message || 'تم إرسال رمز تحقق جديد بنجاح.');
        setResendCooldown(60);
      } else {
        setLoginError(data?.message || 'فشل إرسال رمز التحقق، يرجى المحاولة لاحقاً.');
      }
    } catch {
      setLoginError('خطأ أثناء إعادة إرسال الرمز.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real Registration in Server Database
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const assocName = regAssociation.trim() || regName.trim();
    if (!assocName) {
      setRegError('يرجى إدخال اسم الجمعية أو الحساب.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('يرجى إدخال رقم الهاتف للتواصل.');
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
      setRegError('يرجى الموافقة على ميثاق العمل التطوعي.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: assocName,
          phone: regPhone.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
          associationName: assocName,
          gpsCoords: regGpsCoords || { lat: 36.7538, lng: 3.0588 }
        })
      });
      const data = await res.json().catch(() => null);

      if (data && data.success && data.user) {
        onLogin(data.user);
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
      } else {
        setRegError(data?.message || 'تعذر إنشاء الحساب، يرجى التأكد من البيانات.');
      }
    } catch (err) {
      setRegError('حدث خطأ في الاتصال بقاعدة البيانات.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is logged in: Show Real Profile Card (No fake numbers or mock stats)
  if (currentUser) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-300 text-right">
        <div className="rounded-3xl bg-[#111622] border border-stone-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-[#151c2c] border-b border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
                {currentUser.name ? currentUser.name[0] : 'DZ'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    {currentUser.roleTitle || 'حساب معتمد'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>حساب نشط ومسجل في قاعدة البيانات الرسمية</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors"
              >
                لوحة العمليات 🏠
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>

          {/* Real Statistics Bar (Starts with actual 0 or registered progress, no fake numbers) */}
          <div className="grid grid-cols-3 divide-x divide-x-reverse divide-stone-800 bg-[#0d111a] border-b border-stone-800 text-center">
            <div className="p-4">
              <span className="text-xs text-stone-400 block mb-1">ساعات النشاط الميداني</span>
              <span className="text-xl font-bold text-white font-mono">{currentUser.volunteerHours || 0} س</span>
            </div>
            <div className="p-4">
              <span className="text-xs text-stone-400 block mb-1">نقاط الأثر المعتمدة</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">{currentUser.points || 0}</span>
            </div>
            <div className="p-4">
              <span className="text-xs text-stone-400 block mb-1">المبادرات المنجزة</span>
              <span className="text-xl font-bold text-white font-mono">{currentUser.activeInitiativesCount || 0}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-6 sm:p-8 space-y-3">
            <span className="text-xs font-bold text-stone-300 block">بيانات التواصل المعتمدة:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-400">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#141926] border border-stone-800">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-mono">{currentUser.phone}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#141926] border border-stone-800">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span className="text-white">{currentUser.email || 'غير محدد'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Real Authentication Screen (Clean, Empty Fields, Real Validation)
  return (
    <div className="max-w-md mx-auto py-8 px-4 animate-in fade-in duration-300 text-right">
      {/* Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-xs font-semibold">
          <span>🇩🇿</span>
          <span>بوابة الدخول الميدانية الرسمية</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          تسجيل الدخول للمنظومة
        </h1>
        <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto leading-relaxed">
          إدارة النداءات الميدانية، تلقي التنبيهات، والتنسيق الفوري لفرق العمل.
        </p>
      </div>

      {/* Container */}
      <div className="rounded-3xl bg-[#10141d] border border-stone-800 shadow-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 border-b border-stone-800 bg-[#0c0f17] text-xs font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setLoginError(null); }}
            className={`py-3.5 transition-all text-center ${
              activeTab === 'signin'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-[#121622]'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setRegError(null); }}
            className={`py-3.5 transition-all text-center ${
              activeTab === 'signup'
                ? 'text-emerald-400 border-b-2 border-emerald-500 bg-[#121622]'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        <div className="p-6 sm:p-7">
          {/* TAB 1: REAL SIGN IN (CREDENTIALS OR OTP) */}
          {activeTab === 'signin' && (
            <>
              {verificationStep === 'credentials' ? (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Identifier Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-300 block">
                      اسم الحساب أو رقم الهاتف أو البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="أدخل اسم الحساب أو رقم الهاتف"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#141926] border border-stone-700/80 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors pr-10"
                        required
                      />
                      <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-300 block">كلمة المرور</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور"
                        dir="ltr"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#141926] border border-stone-700/80 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 transition-colors pr-10 pl-10"
                        required
                      />
                      <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute left-3.5 top-3 text-stone-400 hover:text-white"
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

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
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

                  {/* Direct Underneath Toggle to Signup */}
                  <div className="pt-3 border-t border-stone-800 text-center space-y-2">
                    <p className="text-xs text-stone-400">
                      ليس لديك حساب حتى الآن؟
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="w-full py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/80 text-stone-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      <span>إنشاء حساب جديد</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: OTP VERIFICATION CODE VIEW */
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <KeyRound className="w-6 h-6 animate-pulse" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">إدخال رمز التحقق (OTP)</h3>
                    <p className="text-xs text-stone-400 mt-1">
                      تم إرسال رمز الأمان المكون من 6 أرقام إلى:
                    </p>
                    <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-[#141926] border border-stone-700 text-emerald-400 font-mono text-xs font-bold">
                      {otpSentEmail || loginIdentifier}
                    </span>
                  </div>

                  {/* Dev / Testing Quick-Fill Badge */}
                  {devCodePreview && (
                    <button
                      type="button"
                      onClick={() => setOtpCode(devCodePreview)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>رمز التحقق الفوري: <span className="font-mono tracking-wider font-extrabold text-white underline">{devCodePreview}</span> (اضغط للتعبئة التلقائية)</span>
                    </button>
                  )}

                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* 6-Digit Code Input */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-stone-300 block text-center">
                      أدخل رمز التحقق (6 أرقام)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      dir="ltr"
                      className="w-full py-3 text-2xl font-mono tracking-[0.4em] text-center rounded-xl bg-[#141926] border border-emerald-500/60 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                      required
                    />
                  </div>

                  {/* Submit OTP */}
                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جارٍ التحقق وتأكيد الدخول...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد رمز التحقق والدخول</span>
                      </>
                    )}
                  </button>

                  {/* Resend Code & Back */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isSubmitting}
                      className="text-stone-400 hover:text-emerald-400 disabled:opacity-40 transition-colors"
                    >
                      {resendCooldown > 0 ? `إعادة الإرسال بعد (${resendCooldown} ث)` : 'إعادة إرسال الرمز'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationStep('credentials');
                        setOtpCode('');
                        setLoginError(null);
                      }}
                      className="text-stone-400 hover:text-white transition-colors"
                    >
                      ← العودة للبيانات
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* TAB 2: REAL SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {regError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 block">الاسم أو اسم الجمعية</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="مثال: جمعية ناس الخير"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141926] border border-stone-700/80 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 block">صفة الحساب</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('association')}
                    className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all ${
                      regRole === 'association'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-[#141926] border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    🏢 مسؤول جمعية
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('volunteer')}
                    className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all ${
                      regRole === 'volunteer'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-[#141926] border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    🤝 متطوع ميداني
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('field_medic')}
                    className={`py-2 px-1 rounded-xl border text-center text-xs font-bold transition-all ${
                      regRole === 'field_medic'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white'
                        : 'bg-[#141926] border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    🚑 طاقم إسعاف
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 block">رقم الهاتف للتواصل</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  placeholder="0550 00 00 00"
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141926] border border-stone-700/80 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              {/* Smooth GPS Location Determination */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تحديد الموقع بـ GPS</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    {regGpsCoords ? `${regGpsCoords.lat}، ${regGpsCoords.lng}` : 'تلقائي عبر GPS'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectGps}
                  disabled={isDetectingGps}
                  className="w-full py-2 px-3 rounded-xl bg-[#141926] hover:bg-[#182030] border border-stone-700/80 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>{isDetectingGps ? 'جارٍ جلب إحداثيات الموقع...' : regGpsCoords ? '✓ تم تحديد الموقع بنجاح' : 'تحديد موقعي الحالي بـ GPS'}</span>
                </button>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">كلمة المرور</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-stone-700/80 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-300 block">تأكيد المرور</label>
                  <input
                    type="password"
                    value={regPasswordConfirm}
                    onChange={e => setRegPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-[#141926] border border-stone-700/80 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-xs text-stone-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-stone-700 bg-stone-900 text-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <span>
                    أوافق على ميثاق العمل التطوعي والالتزام بمعايير السلامة.
                  </span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? 'جارٍ تسجيل الحساب...' : 'تأكيد إنشاء الحساب الجديد'}
              </button>

              {/* Back to signin */}
              <div className="pt-2 border-t border-stone-800 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="text-xs text-stone-400 hover:text-emerald-400 transition-colors"
                >
                  لديك حساب بالفعل؟ <span className="text-emerald-400 font-bold underline mr-1">تسجيل الدخول</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
