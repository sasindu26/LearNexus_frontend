"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useSession } from '@/context/SessionContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';

function checkPassword(p: string) {
  return {
    length:    p.length >= 8,
    uppercase: /[A-Z]/.test(p),
    symbol:    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(p),
  };
}

export default function SignupPage() {
  const router = useRouter();
  const { login } = useSession();

  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError]                   = useState('');
  const [loading, setLoading]               = useState(false);

  const reqs = checkPassword(password);
  const allReqsMet = reqs.length && reqs.uppercase && reqs.symbol;

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/google', { credential });
      if (res.data.status === 'success') {
        login(res.data.token, res.data.user);
        router.push(res.data.is_new_user ? '/signup/whatsapp' : '/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allReqsMet) {
      setError('Password does not meet the requirements below');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', {
        first_name: firstName,
        last_name:  lastName,
        email,
        password,
      });
      if (res.data.status === 'success') {
        login(res.data.token, res.data.user);
        router.push('/signup/whatsapp');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ReqItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${met ? 'text-green-600' : 'text-slate-400'}`}>
      {met
        ? <CheckCircle size={12} className="shrink-0" />
        : <XCircle size={12} className="shrink-0" />}
      {label}
    </div>
  );

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-secondary rounded-2xl shadow-lg shadow-brand-secondary/30 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2 font-medium">Start your personalized learning journey</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            {/* First + Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Last Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Min 8 characters"
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password requirements box */}
              {(passwordFocused || password.length > 0) && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <ReqItem met={reqs.length}    label="At least 8 characters" />
                  <ReqItem met={reqs.uppercase} label="One uppercase letter (A–Z)" />
                  <ReqItem met={reqs.symbol}    label="One special character (!@#$%&*...)" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                      : 'border-slate-200 focus:ring-brand-secondary/30 focus:border-brand-secondary'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="mt-1.5 text-xs font-medium text-red-500">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-secondary/30 hover:shadow-xl hover:shadow-brand-secondary/40 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="mt-4">
            <GoogleAuthButton onSuccess={handleGoogleSuccess} text="signup_with" />
          </div>

          <div className="mt-4 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-primary font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
