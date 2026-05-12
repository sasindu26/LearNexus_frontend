"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useSession } from '@/context/SessionContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.status === 'success') {
        login(res.data.token, res.data.user);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      setError(err.response?.data?.message || 'Google sign-in failed. Please try again.');
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/30 mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Sign in to continue your learning journey</p>
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

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  suppressHydrationWarning
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  suppressHydrationWarning
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  suppressHydrationWarning
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              suppressHydrationWarning
              className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/40 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm font-medium text-slate-400 hover:text-brand-secondary transition-colors">
              Forgot password?
            </Link>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-semibold text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="mt-4">
            <GoogleAuthButton onSuccess={handleGoogleSuccess} text="signin_with" />
          </div>

          <div className="mt-4 text-center">
            <p className="text-slate-500 text-sm font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-brand-secondary font-bold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
