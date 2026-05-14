"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle, ChevronRight, Loader2, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useSession } from '@/context/SessionContext';

// Defined OUTSIDE the page so it never gets recreated on re-render
const COUNTRY_CODES = ['+94','+1','+44','+61','+91','+65','+60','+49','+33','+81'];

function PhoneInput({
  code, onCode, number, onNumber, placeholder, disabled,
}: {
  code: string; onCode: (v: string) => void;
  number: string; onNumber: (v: string) => void;
  placeholder: string; disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <select
        value={code}
        onChange={e => onCode(e.target.value)}
        disabled={disabled}
        className="w-24 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all disabled:opacity-50"
      >
        {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="relative flex-1">
        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="tel"
          value={number}
          onChange={e => onNumber(e.target.value.replace(/\D/g, ''))}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all disabled:opacity-50"
        />
      </div>
    </div>
  );
}

export default function WhatsAppSetupPage() {
  const router = useRouter();
  const { token } = useSession();

  const [countryCode,   setCountryCode]   = useState('+94');
  const [phoneNumber,   setPhoneNumber]   = useState('');
  const [otp,           setOtp]           = useState('');
  const [parentCode,    setParentCode]    = useState('+94');
  const [parentNumber,  setParentNumber]  = useState('');
  const [otpSent,       setOtpSent]       = useState(false);
  const [verified,      setVerified]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [otpError,      setOtpError]      = useState('');
  const [skipWhatsApp,  setSkipWhatsApp]  = useState(false);

  const fullPhone  = `${countryCode}${phoneNumber.replace(/^0/, '')}`;
  const fullParent = parentNumber ? `${parentCode}${parentNumber.replace(/^0/, '')}` : '';

  const sendOtp = async () => {
    if (!phoneNumber.trim()) { setError('Please enter your WhatsApp number'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/whatsapp/send-otp', { phone: fullPhone });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) { setOtpError('Please enter the code'); return; }
    setOtpError('');
    setLoading(true);
    try {
      await api.post('/api/auth/whatsapp/verify-otp', { phone: fullPhone, otp });
      setVerified(true);
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Invalid or expired code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const complete = async () => {
    if (skipWhatsApp) {
      router.push('/');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/whatsapp/save',
        { whatsapp_number: fullPhone, parent_number: fullParent || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl shadow-lg shadow-green-500/30 mb-4">
            <MessageSquare size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Connect WhatsApp</h1>
          <p className="text-slate-500 mt-2 font-medium">Get updates, alerts, and reminders via WhatsApp <span className="text-slate-400">(optional)</span></p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black ${otpSent ? 'bg-green-500' : 'bg-brand-secondary'}`}>
              {otpSent ? <CheckCircle size={14} /> : '1'}
            </div>
            <span className={otpSent ? 'text-green-600' : 'text-slate-600'}>Enter number</span>
            <div className="flex-1 h-px bg-slate-200" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black ${verified ? 'bg-green-500' : otpSent ? 'bg-brand-secondary' : 'bg-slate-200'}`}>
              {verified ? <CheckCircle size={14} /> : '2'}
            </div>
            <span className={verified ? 'text-green-600' : otpSent ? 'text-slate-600' : 'text-slate-300'}>Verify</span>
            <div className="flex-1 h-px bg-slate-200" />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black ${verified ? 'bg-brand-secondary' : 'bg-slate-200'}`}>3</div>
            <span className={verified ? 'text-slate-600' : 'text-slate-300'}>Finish</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* WhatsApp number */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">
              Your WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              code={countryCode} onCode={setCountryCode}
              number={phoneNumber} onNumber={setPhoneNumber}
              placeholder="7XXXXXXXX"
              disabled={otpSent && !verified}
            />

            {!otpSent && (
              <button
                type="button"
                onClick={sendOtp}
                disabled={loading || !phoneNumber.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Verification Code <ChevronRight size={16} /></>}
              </button>
            )}

            {otpSent && !verified && (
              <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircle size={12} /> Code sent to {fullPhone}
                <button onClick={() => { setOtpSent(false); setOtp(''); }} className="ml-auto text-slate-400 hover:text-slate-600 underline">Change</button>
              </p>
            )}
          </div>

          {/* OTP input */}
          <AnimatePresence>
            {otpSent && !verified && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-sm font-bold text-slate-600 mb-2">Verification Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-center text-xl tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all"
                />
                {otpError && <p className="mt-1.5 text-xs font-medium text-red-500">{otpError}</p>}
                <button
                  type="button"
                  onClick={verifyOtp}
                  disabled={loading || otp.length < 6}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>Verify <CheckCircle size={16} /></>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verified badge */}
          {verified && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle size={18} className="text-green-500 shrink-0" />
              <p className="text-sm font-bold text-green-700">WhatsApp number verified!</p>
            </div>
          )}

          {/* Parent number */}
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Parent&apos;s WhatsApp Number <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <p className="text-xs text-slate-400 mb-2">Parent will receive a notification if you&apos;re inactive for 7+ days</p>
            <PhoneInput
              code={parentCode} onCode={setParentCode}
              number={parentNumber} onNumber={setParentNumber}
              placeholder="7XXXXXXXX"
            />
          </div>

          {/* Complete Setup — enabled if verified OR skipped */}
          <div className="pt-2">
            {!verified && !skipWhatsApp && (
              <p className="text-center text-xs text-slate-400 font-medium mb-3">
                Verify your WhatsApp number above to continue, or choose to skip.
              </p>
            )}

            {/* Skip Checkbox */}
            <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={skipWhatsApp}
                onChange={(e) => setSkipWhatsApp(e.target.checked)}
                className="w-4 h-4 text-brand-secondary rounded border-slate-300 focus:ring-brand-secondary cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
                Skip for now <span className="text-xs font-normal text-slate-400">(add later in Profile Settings)</span>
              </span>
            </label>

            <button
              type="button"
              onClick={complete}
              disabled={loading || (!verified && !skipWhatsApp)}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Setup'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
