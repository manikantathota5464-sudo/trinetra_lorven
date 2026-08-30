import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Phone, ShieldCheck, Globe, AlertCircle, Shield } from 'lucide-react';
import { StateEmblem } from './StateEmblem';

interface LoginPageProps {
  onLogin: () => void;
  textSize: 'sm' | 'base' | 'lg';
  setTextSize: (size: 'sm' | 'base' | 'lg') => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  textSize,
  setTextSize,
  language,
  setLanguage,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [captchaCode, setCaptchaCode] = useState('7K9M2');
  const [enteredCaptcha, setEnteredCaptcha] = useState('7K9M2');

  const refreshCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setEnteredCaptcha('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError(language === 'hi' ? 'कृपया उपयोगकर्ता नाम और पासवर्ड दर्ज करें।' : 'Please enter both username and password.');
      return;
    }
    if (enteredCaptcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setError(language === 'hi' ? 'अमान्य सुरक्षा कोड (Captcha)। कृपया पुन: प्रयास करें।' : 'Invalid security Captcha code. Please try again.');
      return;
    }
    setError('');
    onLogin();
  };

  const getScaleClass = () => {
    if (textSize === 'sm') return 'text-xs';
    if (textSize === 'lg') return 'text-base';
    return 'text-sm';
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between font-sans select-none overflow-x-hidden ${getScaleClass()}`}>

      {/* ── 1. WATERMARK BACKGROUND ── */}
      <div className="gov-watermark-overlay">
        <img src="./assets/login/emblem_clean_no_black.png" alt="State Emblem of India" />
      </div>

      {/* ── 2. TOP NATIONAL FLAG TIRANGA RIBBON ── */}
      <div className="tiranga-strip shadow-xs relative z-20" />

      {/* ── 3. OFFICIAL GOVERNMENT MASTHEAD ── */}
      <div className="bg-[#06182C] text-slate-300 px-4 sm:px-8 py-1 text-[10px] font-semibold border-b border-[#0A2540] flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <span className="text-[#FF9933]">🇮🇳</span>
          <span>
            {language === 'hi'
              ? 'भारत सरकार का आधिकारिक राष्ट्रीय पोर्टल'
              : 'An Official Portal of the Ministry of Road Transport & Highways, Government of India'}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[9.5px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            VAHAN 4.0: CONNECTED
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            NCIC / CCTNS: LINKED
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300 font-mono">CERT-In AUDITED</span>
        </div>
      </div>

      {/* ── 4. OFFICIAL GOVERNMENT HEADER ── */}
      <header className="w-full bg-white border-b border-[#E2E8F0] shadow-xs z-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap justify-between items-center gap-3">

          {/* Left: State Emblem & Ministry Title */}
          <div className="flex items-center gap-3.5">
            <StateEmblem className="h-13 w-auto" />
            <div className="border-l-2 border-[#0A2540]/20 pl-3.5 flex flex-col justify-center">
              <div className="text-[11px] font-bold text-slate-600 tracking-wide leading-tight uppercase">
                {language === 'hi' ? 'भारत सरकार' : 'Government of India'}
                <span className="mx-1.5 text-slate-300">|</span>
                <span className="text-[#0A2540]">
                  {language === 'hi' ? 'सड़क परिवहन एवं राजमार्ग मंत्रालय' : 'Ministry of Road Transport & Highways'}
                </span>
              </div>
              <div className="text-sm sm:text-base font-black text-[#0A2540] tracking-tight leading-tight mt-0.5 flex items-center gap-2">
                <span>त्रिनेत्र TRINETHRA</span>
                <span className="text-[10px] font-bold text-[#FF9933] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  National AI Surveillance Grid
                </span>
              </div>
            </div>
          </div>

          {/* Right: Helpline, Font & Language */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* National Highway Helpline 1033 */}
            <a
              href="tel:1033"
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF9933]/10 to-[#FF9933]/20 border border-[#FF9933]/40 px-3 py-1 rounded-full text-[#0A2540] hover:border-[#FF9933] transition"
              title="National Highway 24x7 Emergency Helpline"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Phone size={13} className="text-[#FF9933]" />
              <div className="leading-tight text-left">
                <span className="text-[9px] font-black uppercase text-slate-500 block">Toll-Free 24x7</span>
                <span className="text-xs font-black text-[#0A2540]">1033</span>
              </div>
            </a>

            {/* Font Size */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 px-1">Font:</span>
              {(['sm', 'base', 'lg'] as const).map((size, i) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTextSize(size)}
                  className={`px-2 py-0.5 text-xs font-black rounded transition ${
                    textSize === size ? 'bg-[#0A2540] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {['A-', 'A', 'A+'][i]}
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
              <Globe size={13} className="text-[#0A2540]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

          </div>
        </div>
      </header>

      {/* ── 5. MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-8 py-6 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-14 z-10 my-auto">

        {/* ── LEFT HERO PANEL ── */}
        <div className="w-full lg:w-1/2 max-w-[560px] flex flex-col items-center justify-center space-y-4">

          {/* Main hero image in a clean card */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-[#E2E8F0] bg-white p-3 gov-card-interactive">
            <img
              src="./assets/login/left_panel_clean.png"
              alt="TRINETHRA Intelligent Traffic Management"
              className="w-full h-auto max-h-[380px] object-contain rounded-xl"
            />
            {/* Trust badges below image */}
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#FAF8F5] border border-slate-200/80 rounded-lg p-1.5">
                <div className="text-[9px] font-black uppercase text-slate-500">Live ANPR Nodes</div>
                <div className="text-sm font-black text-[#0A2540]">1,284+ Active</div>
              </div>
              <div className="bg-[#FAF8F5] border border-slate-200/80 rounded-lg p-1.5">
                <div className="text-[9px] font-black uppercase text-slate-500">Accuracy Rate</div>
                <div className="text-sm font-black text-emerald-700">99.8% Certified</div>
              </div>
              <div className="bg-[#FAF8F5] border border-slate-200/80 rounded-lg p-1.5">
                <div className="text-[9px] font-black uppercase text-slate-500">Grid Compliance</div>
                <div className="text-sm font-black text-blue-700">MoRTH / NIC</div>
              </div>
            </div>
          </div>

          {/* NATIONAL SECURITY COMMAND Bar */}
          <div className="w-full bg-[#0D1F35] rounded-xl p-3.5 shadow-md flex items-center justify-between border border-[#1A3050]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1A3050] border border-[#243D5E]">
                <Shield className="text-[#FF4444]" size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white uppercase tracking-wider">National Security Command</span>
                <span className="text-[9.5px] font-medium text-slate-400 mt-0.5">
                  Secured by National Informatics Centre (NIC) &amp; CERT-In Protocols
                </span>
              </div>
            </div>
            <div className="text-[8.5px] font-black uppercase bg-emerald-900/60 text-emerald-400 border border-emerald-700/50 px-2 py-1 rounded tracking-wider whitespace-nowrap">
              ISO-27001 GOV
            </div>
          </div>
        </div>

        {/* ── RIGHT LOGIN CARD ── */}
        <div className="w-full lg:w-1/2 max-w-[460px] flex justify-center">
          <div className="w-full bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden gov-card-interactive">

            {/* Tiranga Top Border */}
            <div className="tiranga-strip-sm" />

            {/* Header */}
            <div className="px-8 pt-6 pb-4 text-center bg-gradient-to-b from-[#F8FAFC] to-white border-b border-slate-100">
              <div className="inline-flex items-center justify-center p-2 rounded-xl bg-[#0A2540] text-[#FF9933] shadow-md mb-2">
                <Lock size={18} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0A2540] tracking-tight">
                {language === 'hi' ? 'अधिकारी लॉगिन' : 'Authorized Operator Login'}
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-semibold">
                {language === 'hi' ? 'त्रिनेत्र राष्ट्रीय यातायात कमांड पोर्टल' : 'TRINETHRA National Traffic Command Portal'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-5 space-y-3.5">
              {error && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2 font-bold">
                  <AlertCircle size={15} className="flex-shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'उपयोगकर्ता नाम / ऑपरेटर आईडी' : 'Username / Operator ID'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Gov/MoRTH ID</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="E.g., admin or MoRTH-OP-892"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'पासवर्ड' : 'Password'}</span>
                  <a href="#" className="text-[10px] text-[#0A2540] hover:underline font-bold">
                    {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                  </a>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A2540] focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'सुरक्षा कोड (Captcha)' : 'Security Verification (Captcha)'}</span>
                  <button type="button" onClick={refreshCaptcha} className="text-[10px] text-blue-600 hover:underline font-bold">
                    ↻ Refresh
                  </button>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={enteredCaptcha}
                    onChange={(e) => setEnteredCaptcha(e.target.value)}
                    placeholder="Enter code"
                    maxLength={6}
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0A2540]"
                  />
                  <div
                    onClick={refreshCaptcha}
                    className="w-1/2 py-2 px-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg text-center font-mono font-black text-sm text-[#0A2540] tracking-widest cursor-pointer select-none border border-slate-300 relative overflow-hidden"
                    title="Click to refresh"
                  >
                    <span className="line-through decoration-slate-400">{captchaCode}</span>
                  </div>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs font-semibold pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-400 w-3.5 h-3.5 text-[#0A2540] focus:ring-[#0A2540]"
                  />
                  <span>{language === 'hi' ? 'मुझे याद रखें' : 'Remember this session'}</span>
                </label>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full bg-[#0A2540] hover:bg-[#163E66] active:bg-[#06182C] text-white py-3 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-3 cursor-pointer"
              >
                <Lock size={14} />
                <span>{language === 'hi' ? 'सुरक्षित साइन इन करें' : 'Sign In Securely'}</span>
              </button>

              {/* IT Act Warning */}
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[10px] text-amber-900 leading-tight">
                <span className="font-bold">⚠️ Official Government System:</span> Unauthorized access or tampering is strictly
                prohibited and punishable under Sections 43 &amp; 66 of the Information Technology Act, 2000.
              </div>
            </form>

            {/* Helpline Bar */}
            <div className="bg-[#FAF8F5] border-t border-[#EDE5D8] px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0A2540]">
                <Phone size={14} className="text-[#FF9933]" />
                <span className="text-xs font-black">National Helpdesk: 1033</span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">24x7 MoRTH Support</span>
            </div>

          </div>
        </div>

      </main>

      {/* ── 6. FOOTER ── */}
      <footer className="bg-[#0A2540] text-slate-300 py-4 px-6 sm:px-10 z-20 border-t border-[#06182C]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">

          <div className="flex items-center gap-3">
            <StateEmblem className="h-7 w-auto brightness-200" />
            <div className="text-slate-300 font-medium text-[11px] leading-tight">
              <div>© 2026 Ministry of Road Transport &amp; Highways, Government of India.</div>
              <div className="text-[10px] text-slate-400">
                Portal designed, developed and hosted by National Informatics Centre (NIC) on MeghRaj Cloud.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-emerald-400">✓ CERT-In ISO 27001</span>
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-blue-400">✓ NIC Cloud Verified</span>
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[#FF9933]">✓ Digital India</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-[11px] font-semibold text-slate-300">
            <a href="#" className="hover:text-[#FF9933] transition">RTI Act</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:text-[#FF9933] transition">Terms &amp; Conditions</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:text-[#FF9933] transition">Privacy Policy</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:text-[#FF9933] transition">Hyperlink Policy</a>
            <span className="text-slate-500">|</span>
            <a href="#" className="hover:text-[#FF9933] transition">Helpdesk</a>
          </div>

        </div>
      </footer>

    </div>
  );
};
