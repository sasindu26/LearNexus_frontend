"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, MessageSquare, Eye, EyeOff, CheckCircle, ChevronRight, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

function checkPassword(p: string) {
  return {
    length:    p.length >= 8,
    uppercase: /[A-Z]/.test(p),
    symbol:    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(p),
  };
}

type Step = 'request' | 'verify' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>('request');
  const [email, setEmail]             = useState('');
  const [method, setMethod]           = useState<'email' | 'whatsapp'>('email');
  const [code, setCode]               = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdFocused, setPwdFocused]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const reqs      = checkPassword(newPassword);
  const allReqsMet = reqs.length && reqs.uppercase && reqs.symbol;

  const ReqItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${met ? 'text-green-600' : 'text-slate-400'}`}>
      {met ? <CheckCircle size={12} className="shrink-0" /> : <XCircle size={12} className="shrink-0" />}
      {label}
    </div>
  );

  const requestCode = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password/request', { email: email.trim().toLowerCase(), method });
      setStep('verify');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = () => {
    if (code.length < 6) { setError('Please enter the 6-digit code'); return; }
    setError('');
    setStep('reset');
  };

  const resetPassword = async () => {
    if (!allReqsMet) { setError('Password does not meet the requirements'); return; }
    if (newPassword !== confirmPwd) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password/reset', {
        email: email.trim().toLowerCase(),
        code,
        new_password: newPassword,
      });
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, { title: string; subtitle: string }> = {
    request: { title: 'Reset Password',     subtitle: 'We\'ll send a verification code to you' },
    verify:  { title: 'Enter Code',         subtitle: `Code sent via ${method === 'whatsapp' ? 'WhatsApp' : 'email'}` },
    reset:   { title: 'New Password',       subtitle: 'Choose a strong password' },
    done:    { title: 'Password Reset!',    subtitle: 'Your password has been updated' },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/30 mb-4">
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">{stepTitles[step].title}</h1>
          <p className="text-slate-500 mt-2 font-medium">{stepTitles[step].subtitle}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Step 1: Email + Method ── */}
            {step === 'request' && (
              <motion.div key="request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-3">Send code via</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod('email')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                        method === 'email'
                          ? 'border-brand-secondary bg-brand-secondary/5 text-brand-secondary'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                      suppressHydrationWarning
                    >
                      <Mail size={22} />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod('whatsapp')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                        method === 'whatsapp'
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                      suppressHydrationWarning
                    >
                      <MessageSquare size={22} />
                      WhatsApp
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={requestCode}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all"
                  suppressHydrationWarning
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Code <ChevronRight size={16} /></>}
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Enter Code ── */}
            {step === 'verify' && (
              <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <p className="text-sm text-slate-500">
                  A 6-digit code was sent to <strong>{email}</strong> via {method === 'whatsapp' ? 'WhatsApp' : 'email'}.
                </p>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={verifyCode}
                  disabled={code.length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  Continue <ChevronRight size={16} />
                </button>
                <button type="button" onClick={() => { setStep('request'); setCode(''); }} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 font-medium">
                  ← Back
                </button>
              </motion.div>
            )}

            {/* ── Step 3: New Password ── */}
            {step === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">New Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      onFocus={() => setPwdFocused(true)}
                      onBlur={() => setPwdFocused(false)}
                      placeholder="Min 8 characters"
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {(pwdFocused || newPassword.length > 0) && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                      <ReqItem met={reqs.length}    label="At least 8 characters" />
                      <ReqItem met={reqs.uppercase} label="One uppercase letter (A–Z)" />
                      <ReqItem met={reqs.symbol}    label="One special character (!@#$%&*...)" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 transition-all ${
                        confirmPwd && confirmPwd !== newPassword
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-slate-200 focus:ring-brand-secondary/30 focus:border-brand-secondary'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPwd && confirmPwd !== newPassword && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={resetPassword}
                  disabled={loading || !allReqsMet || newPassword !== confirmPwd}
                  className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
                </button>
              </motion.div>
            )}

            {/* ── Done ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <CheckCircle size={36} className="text-green-500" />
                </div>
                <p className="text-slate-600 font-medium">Your password has been reset successfully.</p>
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  Sign In Now
                </button>
              </motion.div>
            )}

          </AnimatePresence>

          {step !== 'done' && (
            <div className="text-center">
              <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-brand-secondary transition-colors">
                ← Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
