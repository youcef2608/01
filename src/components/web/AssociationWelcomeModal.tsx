import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { DEMO_ACCOUNTS } from '../../data/authData';
import { 
  Building2, 
  Lock, 
  LogIn, 
  Sparkles, 
  X,
  CheckCircle2,
  UserPlus,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssociationWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AssociationWelcomeModal: React.FC<AssociationWelcomeModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State - Clean & Empty
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regAssocName, setRegAssocName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick select
  const handleSelectQuickAccredited = (acc: AuthUser) => {
    setLoginIdentifier(acc.associationName || acc.name);
    setLoginPassword('athar2026');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const cleanName = loginIdentifier.trim() || 'جمعية معتمدة';
    const foundDemo = DEMO_ACCOUNTS.find(
      a => a.associationName.toLowerCase() === cleanName.toLowerCase() ||
           a.name.toLowerCase() === cleanName.toLowerCase()
    );

    const user: AuthUser = foundDemo ? {
      ...foundDemo,
      associationName: cleanName
    } : {
      id: `assoc-${Date.now()}`,
      name: cleanName,
      email: `${cleanName.replace(/\s+/g, '').slice(0, 10)}@athar.dz`,
      phone: '0550000000',
      role: 'association',
      roleTitle: 'جمعية معتمدة',
      associationName: cleanName,
      wilaya: 'الجزائر',
      badgeNumber: `DZ-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true,
      activeInitiativesCount: 0,
      volunteerHours: 0,
      points: 0,
      avatarUrl: '/app-logo.jpg'
    };

    setTimeout(() => {
      onLoginSuccess(user);
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.4 }
        });
      } catch (e) {}
      onClose();
    }, 250);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword && regConfirmPassword && regPassword !== regConfirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const cleanName = regAssocName.trim() || 'جمعية جديدة';
    const newUser: AuthUser = {
      id: `assoc-${Date.now()}`,
      name: cleanName,
      email: regUsername.trim() || `${cleanName.replace(/\s+/g, '').slice(0, 10)}@athar.dz`,
      phone: regPhone.trim() || '0550000000',
      role: 'association',
      roleTitle: 'جمعية معتمدة',
      associationName: cleanName,
      wilaya: 'الجزائر',
      badgeNumber: `DZ-${Math.floor(1000 + Math.random() * 9000)}`,
      isVerified: true,
      activeInitiativesCount: 0,
      volunteerHours: 0,
      points: 0,
      avatarUrl: '/app-logo.jpg'
    };

    setTimeout(() => {
      onLoginSuccess(newUser);
      setIsSubmitting(false);
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.4 }
        });
      } catch (e) {}
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-gradient-to-b from-[#141824] via-[#10131c] to-[#0c0e14] border-2 border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-right shadow-[0_0_60px_rgba(16,185,129,0.18)] relative my-6 overflow-hidden space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-72 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-60 h-30 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[#242b3b] pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400 font-mono">ATHAR DZ</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold">
                  بوابة الجمعيات
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                {authMode === 'login' ? 'تسجيل الدخول إلى حساب الجمعية' : 'إنشاء حساب جديد للجمعية'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Click Login Selector in Login Mode */}
        {authMode === 'login' && DEMO_ACCOUNTS.length > 0 && (
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>حسابات سريعة للتجربة الفورية:</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.slice(0, 4).map(acc => {
                const isSelected = loginIdentifier === (acc.associationName || acc.name);
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectQuickAccredited(acc)}
                    className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between gap-1 text-xs truncate ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-400 text-white shadow-sm'
                        : 'bg-[#151924] border-[#252c3c] text-stone-300 hover:bg-[#1c2232]'
                    }`}
                  >
                    <span className="truncate font-bold text-[11px]">{acc.associationName || acc.name}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold text-center">
            {errorMessage}
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {authMode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs relative z-10">
            {/* Account / Username or Email */}
            <div className="space-y-1.5">
              <label className="text-stone-200 font-extrabold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>اسم الحساب / الجمعية أو البريد:</span>
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="اسم الجمعية أو البريد الإلكتروني"
                className="w-full bg-[#131620] border-2 border-[#283042] focus:border-emerald-500 rounded-2xl px-4 py-3 text-white text-sm font-bold focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-stone-200 font-extrabold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>كلمة المرور:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#131620] border-2 border-[#283042] focus:border-emerald-500 rounded-2xl pr-4 pl-11 py-3 text-white text-sm font-mono focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3.5 top-3.5 text-stone-500 hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-stone-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول ➔'}</span>
            </button>

            {/* Switch to Register (Underneath) */}
            <div className="pt-3 border-t border-[#222838] text-center space-y-2">
              <div className="text-stone-400 text-xs">
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                  className="text-emerald-400 font-extrabold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>إنشاء حساب جديد</span>
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* 2. REGISTER / CREATE ACCOUNT FORM (No Wilaya, No Accreditation Number) */
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs relative z-10">
            {/* Association Name */}
            <div className="space-y-1">
              <label className="text-stone-200 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>اسم الجمعية الرسمي:</span>
              </label>
              <input
                type="text"
                required
                value={regAssocName}
                onChange={e => setRegAssocName(e.target.value)}
                placeholder="مثال: جمعية الإحسان الخيرية"
                className="w-full bg-[#131620] border-2 border-[#283042] focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none transition-colors"
              />
            </div>

            {/* Username or Email */}
            <div className="space-y-1">
              <label className="text-stone-200 font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>اسم المستخدم أو البريد الإلكتروني:</span>
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={e => setRegUsername(e.target.value)}
                placeholder="assoc_ihsan أو info@ihsan.dz"
                className="w-full bg-[#131620] border-2 border-[#283042] focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-none transition-colors"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-stone-200 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>رقم الهاتف للتواصل الميداني:</span>
              </label>
              <input
                type="text"
                required
                value={regPhone}
                onChange={e => setRegPhone(e.target.value)}
                placeholder="0550 12 34 56"
                className="w-full bg-[#131620] border-2 border-[#283042] focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-stone-200 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>كلمة المرور:</span>
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131620] border-2 border-[#283042] focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-none transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-stone-200 font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>تأكيد كلمة المرور:</span>
              </label>
              <input
                type="password"
                required
                value={regConfirmPassword}
                onChange={e => setRegConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131620] border-2 border-[#283042] focus:border-emerald-500 rounded-2xl px-3.5 py-2.5 text-white text-xs font-mono focus:outline-none transition-colors"
              />
            </div>

            {/* Submit Create Account */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-stone-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب والدخول ➔'}</span>
            </button>

            {/* Switch back to Login */}
            <div className="pt-2 border-t border-[#222838] text-center">
              <div className="text-stone-400 text-xs">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                  className="text-emerald-400 font-extrabold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>تسجيل الدخول</span>
                  <LogIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssociationWelcomeModal;
