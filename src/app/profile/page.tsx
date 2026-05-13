"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, BookOpen, Mail, MessageSquare, LogOut,
  Camera, ChevronRight, Loader2, CheckCircle, AlertCircle,
  Star, Send, Trash2, Eye, EyeOff, Phone, ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/context/SessionContext';
import api from '@/lib/api';

type Tab = 'personal' | 'security' | 'courses' | 'contact' | 'feedback';

// ─── helpers ────────────────────────────────────────────
function checkPw(p: string) {
  return {
    length:    p.length >= 8,
    uppercase: /[A-Z]/.test(p),
    symbol:    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(p),
  };
}

function ReqItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${ok ? 'text-green-600' : 'text-slate-400'}`}>
      <CheckCircle size={11} className={ok ? 'text-green-500' : 'text-slate-300'} />
      {text}
    </div>
  );
}

function Alert({ type, msg }: { type: 'success' | 'error'; msg: string }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
      type === 'success' ? 'bg-green-50 border border-green-200 text-green-700'
                         : 'bg-red-50 border border-red-200 text-red-600'
    }`}>
      {type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {msg}
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'personal',  label: 'Personal Details', icon: <User size={17} /> },
  { id: 'security',  label: 'Security',          icon: <Shield size={17} /> },
  { id: 'courses',   label: 'My Courses',        icon: <BookOpen size={17} /> },
  { id: 'contact',   label: 'Contact Us',        icon: <Mail size={17} /> },
  { id: 'feedback',  label: 'Feedback',          icon: <Star size={17} /> },
];

// ─── COUNTRY CODES ──────────────────────────────────────
const COUNTRY_CODES = ['+94','+1','+44','+61','+91','+65','+60','+49','+33','+81'];

// ─── MAIN PAGE ──────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isLoggedIn, logout, refreshProfile } = useSession();
  const [tab, setTab] = useState<Tab>('personal');
  const [courses, setCourses] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return; }
    const load = async () => {
      await refreshProfile();
      try {
        const [pr, prog] = await Promise.all([
          api.get('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/api/auth/progress', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCourses(pr.data.user?.enrolled_courses?.filter((c: any) => c.name) || []);
        setProgress(prog.data.courses || []);
      } catch {}
    };
    load();
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;

  const initials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase()
    || user?.name?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen px-4 sm:px-8 xl:px-16 py-8 pb-16">

      {/* Header card */}
      <div className="bg-gradient-to-br from-brand-primary to-[#283593] rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar — display only */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/20 flex items-center justify-center shrink-0">
            {user?.picture
              ? <img src={user.picture} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-2xl font-black text-white">{initials}</span>
            }
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">

        {/* Sidebar */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap w-full text-left ${
                  tab === t.id
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
            <div className="hidden lg:block flex-1" />
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-all whitespace-nowrap w-full text-left mt-2"
            >
              <LogOut size={17} /> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'personal'  && <PersonalTab />}
              {tab === 'security'  && <SecurityTab />}
              {tab === 'courses'   && <CoursesTab courses={courses} progress={progress} />}
              {tab === 'contact'   && <ContactTab />}
              {tab === 'feedback'  && <FeedbackTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── PERSONAL DETAILS TAB ───────────────────────────────
function PersonalTab() {
  const { user, token, refreshProfile } = useSession();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName,  setLastName]  = useState(user?.last_name  || '');
  const [loading,   setLoading]   = useState(false);
  const [alert,     setAlert]     = useState<{type:'success'|'error';msg:string}|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`.toUpperCase()
    || user?.name?.substring(0, 2).toUpperCase() || 'U';

  useEffect(() => {
    if (user?.first_name) setFirstName(user.first_name);
    if (user?.last_name)  setLastName(user.last_name);
  }, [user]);

  const handlePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        try {
          await api.post('/api/auth/profile/picture',
            { picture: compressed },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await refreshProfile();
        } catch {}
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setAlert({ type: 'error', msg: 'First and last name are required' }); return;
    }
    setLoading(true); setAlert(null);
    try {
      await api.put('/api/auth/profile/personal',
        { first_name: firstName.trim(), last_name: lastName.trim(), parent_number: user?.parent_number || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshProfile();
      setAlert({ type: 'success', msg: 'Personal details saved!' });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to save' });
    } finally { setLoading(false); }
  };

  return (
    <Card title="Personal Details" icon={<User size={18} className="text-brand-primary" />}>
      <div className="space-y-4">
        {alert && <Alert type={alert.type} msg={alert.msg} />}

        {/* Profile picture */}
        <div className="flex items-center gap-4 pb-2">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
            {user?.picture
              ? <img src={user.picture} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-2xl font-black text-slate-400">{initials}</span>
            }
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 mb-1">Profile Picture</p>
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:underline">
              <Camera size={14} /> {user?.picture ? 'Change picture' : 'Upload picture'}
            </button>
            <p className="text-xs text-slate-400 mt-0.5">JPG or PNG, max 2MB</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicture} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input value={firstName} onChange={e => setFirstName(e.target.value)}
              className="input" placeholder="First name" />
          </Field>
          <Field label="Last Name">
            <input value={lastName} onChange={e => setLastName(e.target.value)}
              className="input" placeholder="Last name" />
          </Field>
        </div>
        <Field label="Email" hint="Change in Security tab">
          <input value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
        </Field>
        <Field label="WhatsApp Number" hint="Change in Security tab">
          <input value={user?.whatsapp_number || ''} disabled className="input opacity-60 cursor-not-allowed" />
        </Field>
        <button onClick={save} disabled={loading}
          className="w-full btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
        </button>
      </div>
    </Card>
  );
}

// ─── SECURITY TAB ───────────────────────────────────────
function SecurityTab() {
  const { user, logout } = useSession();
  const router = useRouter();
  const [section, setSection] = useState<'menu'|'email'|'whatsapp'|'parent'|'password'|'delete'>('menu');

  return (
    <Card title="Security" icon={<Shield size={18} className="text-brand-primary" />}>
      <AnimatePresence mode="wait">
        {section === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3">
            {[
              { id: 'email',    icon: <Mail size={16} />,           label: 'Change Email',                    sub: user?.email },
              { id: 'whatsapp', icon: <Phone size={16} />,        label: user?.whatsapp_number ? 'Change WhatsApp Number' : 'Add WhatsApp Number',          sub: user?.whatsapp_number || 'Not set' },
              { id: 'parent',   icon: <MessageSquare size={16} />, label: "Parent's WhatsApp Number",        sub: user?.parent_number || 'Not set' },
              { id: 'password', icon: <Shield size={16} />,        label: 'Change Password',                 sub: '••••••••' },
              { id: 'delete',   icon: <Trash2 size={16} />,        label: 'Delete Account',                  sub: 'Permanently remove your account', danger: true },
            ].map(item => (
              <button key={item.id} onClick={() => setSection(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  (item as any).danger
                    ? 'border-red-100 hover:bg-red-50 hover:border-red-200'
                    : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  (item as any).danger ? 'bg-red-100 text-red-500' : 'bg-brand-primary/10 text-brand-primary'
                }`}>{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${(item as any).danger ? 'text-red-600' : 'text-slate-800'}`}>{item.label}</p>
                  <p className="text-xs text-slate-400 truncate">{item.sub}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </motion.div>
        )}
        {section === 'email'    && <ChangeEmail    back={() => setSection('menu')} />}
        {section === 'whatsapp' && <ChangeWhatsApp back={() => setSection('menu')} />}
        {section === 'parent'   && <ChangeParent   back={() => setSection('menu')} />}
        {section === 'password' && <ChangePassword back={() => setSection('menu')} />}
        {section === 'delete'   && <DeleteAccount  back={() => setSection('menu')}
          onDeleted={() => { logout(); router.push('/'); }} />}
      </AnimatePresence>
    </Card>
  );
}

function ChangeEmail({ back }: { back: () => void }) {
  const { token, refreshProfile } = useSession();
  const [newEmail, setNewEmail] = useState('');
  const [otp,      setOtp]      = useState('');
  const [sent,     setSent]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState<{type:'success'|'error';msg:string}|null>(null);

  const sendCode = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-email/request', { new_email: newEmail },
        { headers: { Authorization: `Bearer ${token}` } });
      setSent(true);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to send code' });
    } finally { setLoading(false); }
  };

  const verify = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-email/verify', { otp },
        { headers: { Authorization: `Bearer ${token}` } });
      await refreshProfile();
      setAlert({ type: 'success', msg: 'Email updated successfully!' });
      setTimeout(back, 1500);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Invalid code' });
    } finally { setLoading(false); }
  };

  return (
    <SubSection title="Change Email" onBack={back}>
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      <Field label="New Email Address">
        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
          disabled={sent} className="input" placeholder="new@email.com" />
      </Field>
      {!sent ? (
        <button onClick={sendCode} disabled={loading || !newEmail}
          className="w-full btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification Code'}
        </button>
      ) : (
        <>
          <Field label="Verification Code">
            <input type="text" inputMode="numeric" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-xl tracking-[0.4em] font-bold"
              placeholder="------" />
          </Field>
          <button onClick={verify} disabled={loading || otp.length < 6}
            className="w-full btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Update'}
          </button>
        </>
      )}
    </SubSection>
  );
}

function ChangeWhatsApp({ back }: { back: () => void }) {
  const { user, token, refreshProfile } = useSession();
  const [code,    setCode]   = useState('+94');
  const [num,     setNum]    = useState('');
  const [otp,     setOtp]    = useState('');
  const [sent,    setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]  = useState<{type:'success'|'error';msg:string}|null>(null);

  const fullPhone = `${code}${num.replace(/^0/, '')}`;

  const sendCode = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-whatsapp/request', { new_phone: fullPhone },
        { headers: { Authorization: `Bearer ${token}` } });
      setSent(true);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to send OTP' });
    } finally { setLoading(false); }
  };

  const verify = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-whatsapp/verify', { otp },
        { headers: { Authorization: `Bearer ${token}` } });
      await refreshProfile();
      setAlert({ type: 'success', msg: 'WhatsApp number updated!' });
      setTimeout(back, 1500);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Invalid code' });
    } finally { setLoading(false); }
  };

  return (
    <SubSection title={user?.whatsapp_number ? "Change WhatsApp" : "Add WhatsApp"} onBack={back}>
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      <Field label="New WhatsApp Number">
        <div className="flex gap-2">
          <select value={code} onChange={e => setCode(e.target.value)} disabled={sent} className="w-24 input">
            {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="tel" value={num} disabled={sent}
            onChange={e => setNum(e.target.value.replace(/\D/g, ''))}
            className="input flex-1" placeholder="7XXXXXXXX" />
        </div>
      </Field>
      {!sent ? (
        <button onClick={sendCode} disabled={loading || !num}
          className="w-full btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP'}
        </button>
      ) : (
        <>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle size={12} /> Code sent to {fullPhone}
          </p>
          <Field label="OTP Code">
            <input type="text" inputMode="numeric" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-xl tracking-[0.4em] font-bold"
              placeholder="------" />
          </Field>
          <button onClick={verify} disabled={loading || otp.length < 6}
            className="w-full btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Update'}
          </button>
        </>
      )}
    </SubSection>
  );
}

function ChangeParent({ back }: { back: () => void }) {
  const { user, token, refreshProfile } = useSession();
  const [code,    setCode]    = useState('+94');
  const [num,     setNum]     = useState('');
  const [otp,     setOtp]     = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState<{type:'success'|'error';msg:string}|null>(null);

  const fullPhone = `${code}${num.replace(/^0/, '')}`;

  const sendCode = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-parent/request', { new_phone: fullPhone },
        { headers: { Authorization: `Bearer ${token}` } });
      setSent(true);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to send OTP' });
    } finally { setLoading(false); }
  };

  const verify = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-parent/verify', { otp },
        { headers: { Authorization: `Bearer ${token}` } });
      await refreshProfile();
      setAlert({ type: 'success', msg: "Parent's WhatsApp number updated!" });
      setTimeout(back, 1500);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Invalid code' });
    } finally { setLoading(false); }
  };

  return (
    <SubSection title="Parent's WhatsApp Number" onBack={back}>
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      <p className="text-xs text-slate-400 mb-1">
        {user?.parent_number
          ? `Current: ${user.parent_number} — enter a new number below to update.`
          : "Parent will receive a notification if you're inactive for 7+ days."}
      </p>
      <Field label="Parent's WhatsApp Number">
        <div className="flex gap-2">
          <select value={code} onChange={e => setCode(e.target.value)} disabled={sent} className="w-24 input">
            {COUNTRY_CODES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="tel" value={num} disabled={sent}
            onChange={e => setNum(e.target.value.replace(/\D/g, ''))}
            className="input flex-1" placeholder="7XXXXXXXX" />
        </div>
      </Field>
      {!sent ? (
        <button onClick={sendCode} disabled={loading || !num}
          className="w-full btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send OTP to Parent'}
        </button>
      ) : (
        <>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle size={12} /> OTP sent to parent's number {fullPhone}
          </p>
          <Field label="OTP Code">
            <input type="text" inputMode="numeric" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-xl tracking-[0.4em] font-bold"
              placeholder="------" />
          </Field>
          <button onClick={verify} disabled={loading || otp.length < 6}
            className="w-full btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Save'}
          </button>
        </>
      )}
    </SubSection>
  );
}

function ChangePassword({ back }: { back: () => void }) {
  const { user, token } = useSession();
  const [oldPw,    setOldPw]    = useState('');
  const [newPw,    setNewPw]    = useState('');
  const [method,   setMethod]   = useState<'email'|'whatsapp'>('email');
  const [otp,      setOtp]      = useState('');
  const [sent,     setSent]     = useState(false);
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState<{type:'success'|'error';msg:string}|null>(null);
  const req = checkPw(newPw);
  const pwOk = req.length && req.uppercase && req.symbol;

  const sendCode = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-password/request',
        { old_password: oldPw, new_password: newPw, method },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSent(true);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed' });
    } finally { setLoading(false); }
  };

  const verify = async () => {
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/change-password/verify', { otp },
        { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: 'success', msg: 'Password changed successfully!' });
      setTimeout(back, 1500);
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Invalid code' });
    } finally { setLoading(false); }
  };

  return (
    <SubSection title="Change Password" onBack={back}>
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      {!sent ? (
        <>
          <Field label="Current Password">
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={oldPw}
                onChange={e => setOldPw(e.target.value)}
                className="input pr-10" placeholder="Enter current password" />
              <button onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </Field>
          <Field label="New Password">
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="input pr-10" placeholder="New password" />
              <button onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {newPw && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <ReqItem ok={req.length}    text="8+ characters" />
                <ReqItem ok={req.uppercase} text="Uppercase letter" />
                <ReqItem ok={req.symbol}    text="Special character" />
              </div>
            )}
          </Field>
          <Field label="Send verification code via">
            <div className="flex gap-2">
              <button onClick={() => setMethod('email')}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                  method === 'email' ? 'bg-brand-primary text-white border-brand-primary' : 'border-slate-200 text-slate-500'
                }`}>
                <Mail size={14} className="inline mr-1" /> Email
              </button>
              <button onClick={() => setMethod('whatsapp')} disabled={!user?.whatsapp_number}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all disabled:opacity-40 ${
                  method === 'whatsapp' ? 'bg-green-500 text-white border-green-500' : 'border-slate-200 text-slate-500'
                }`}>
                <MessageSquare size={14} className="inline mr-1" /> WhatsApp
              </button>
            </div>
          </Field>
          <button onClick={sendCode} disabled={loading || !oldPw || !pwOk}
            className="w-full btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Verification Code'}
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle size={12} /> Code sent via {method}
          </p>
          <Field label="Verification Code">
            <input type="text" inputMode="numeric" maxLength={6} value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input text-center text-xl tracking-[0.4em] font-bold"
              placeholder="------" />
          </Field>
          <button onClick={verify} disabled={loading || otp.length < 6}
            className="w-full btn-primary">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Password Change'}
          </button>
        </>
      )}
    </SubSection>
  );
}

function DeleteAccount({ back, onDeleted }: { back: () => void; onDeleted: () => void }) {
  const { token } = useSession();
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState<{type:'success'|'error';msg:string}|null>(null);

  const del = async () => {
    if (confirm !== 'DELETE') {
      setAlert({ type: 'error', msg: 'Type DELETE to confirm' }); return;
    }
    setLoading(true); setAlert(null);
    try {
      await api.delete('/api/auth/profile/delete',
        { data: { password }, headers: { Authorization: `Bearer ${token}` } }
      );
      onDeleted();
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to delete account' });
    } finally { setLoading(false); }
  };

  return (
    <SubSection title="Delete Account" onBack={back}>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
        <p className="font-bold mb-1">⚠️ This action cannot be undone</p>
        <p>All your data, courses, and progress will be permanently deleted.</p>
      </div>
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      <Field label="Current Password">
        <div className="relative">
          <input type={show ? 'text' : 'password'} value={password}
            onChange={e => setPassword(e.target.value)}
            className="input pr-10" placeholder="Enter your password" />
          <button onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </Field>
      <Field label='Type "DELETE" to confirm'>
        <input value={confirm} onChange={e => setConfirm(e.target.value)}
          className="input" placeholder="DELETE" />
      </Field>
      <button onClick={del} disabled={loading || !password || confirm !== 'DELETE'}
        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={15} /> Delete My Account</>}
      </button>
    </SubSection>
  );
}

// ─── MY COURSES TAB ─────────────────────────────────────
function CoursesTab({ courses, progress }: { courses: any[]; progress: any[] }) {
  const progMap = Object.fromEntries(progress.map(p => [p.course_name, p]));

  return (
    <Card title="My Courses" icon={<BookOpen size={18} className="text-brand-primary" />}>
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold mb-1">No courses yet</p>
          <p className="text-slate-400 text-sm mb-6">Chat with Mento AI to find your perfect degree!</p>
          <Link href="/chat"
            className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-primary/90 transition-all">
            Talk to Mento AI <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((c, i) => {
            const pg = progMap[c.name];
            const pct = pg?.progress_pct ?? 0;
            return (
              <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:border-brand-secondary/30 transition-all">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.total_modules} modules</p>
                  </div>
                  <span className="text-sm font-black text-brand-secondary">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-secondary rounded-full transition-all"
                    style={{ width: `${pct}%` }} />
                </div>
                {pg && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    {pg.completed_topics} / {pg.total_topics} topics completed
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── CONTACT US TAB ─────────────────────────────────────
function ContactTab() {
  const { user, token } = useSession();
  const [name,    setName]    = useState(user?.name || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState<{type:'success'|'error';msg:string}|null>(null);

  const send = async () => {
    if (!message.trim()) { setAlert({ type: 'error', msg: 'Please enter a message' }); return; }
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/contact', { name, email, message },
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage('');
      setAlert({ type: 'success', msg: 'Message sent! We\'ll get back to you soon.' });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to send' });
    } finally { setLoading(false); }
  };

  return (
    <Card title="Contact Us" icon={<Mail size={18} className="text-brand-primary" />}>
      <p className="text-sm text-slate-500 mb-4">
        Have a question or need help? We'll reply to your email within 24 hours.
      </p>
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name">
            <input value={name} onChange={e => setName(e.target.value)} className="input" />
          </Field>
          <Field label="Email">
            <input value={email} onChange={e => setEmail(e.target.value)} className="input" />
          </Field>
        </div>
        <Field label="Message">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
            className="input resize-none" placeholder="How can we help you?" />
        </Field>
        <button onClick={send} disabled={loading || !message.trim()}
          className="w-full btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Send Message</>}
        </button>
      </div>
    </Card>
  );
}

// ─── FEEDBACK TAB ───────────────────────────────────────
const CATEGORIES = ['Feature Request', 'Bug Report', 'Content Quality', 'UI/UX', 'Performance', 'Other'];

function FeedbackTab() {
  const { token } = useSession();
  const [category, setCategory] = useState('');
  const [message,  setMessage]  = useState('');
  const [rating,   setRating]   = useState(0);
  const [hovered,  setHovered]  = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState<{type:'success'|'error';msg:string}|null>(null);

  const submit = async () => {
    if (!message.trim()) { setAlert({ type: 'error', msg: 'Please enter your feedback' }); return; }
    setLoading(true); setAlert(null);
    try {
      await api.post('/api/auth/profile/feedback', { category, message, rating: rating || null },
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage(''); setCategory(''); setRating(0);
      setAlert({ type: 'success', msg: 'Thank you for your feedback!' });
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.response?.data?.message || 'Failed to submit' });
    } finally { setLoading(false); }
  };

  return (
    <Card title="Help Us Improve" icon={<Star size={18} className="text-brand-primary" />}>
      <p className="text-sm text-slate-500 mb-4">
        Your feedback helps make LearNexus better for everyone worldwide. 🌍
      </p>
      {alert && <Alert type={alert.type} msg={alert.msg} />}
      <div className="space-y-4">
        <Field label="Rating (optional)">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl transition-transform hover:scale-110">
                <Star size={28} className={`transition-colors ${
                  n <= (hovered || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                }`} />
              </button>
            ))}
          </div>
        </Field>
        <Field label="Category (optional)">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(category === c ? '' : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  category === c
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>{c}</button>
            ))}
          </div>
        </Field>
        <Field label="Your Feedback">
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
            className="input resize-none"
            placeholder="Tell us what you think, what's missing, or how we can do better..." />
        </Field>
        <button onClick={submit} disabled={loading || !message.trim()}
          className="w-full btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Submit Feedback</>}
        </button>
      </div>
    </Card>
  );
}

// ─── SHARED UI ──────────────────────────────────────────
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center">{icon}</div>
        <h2 className="text-lg font-black text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SubSection({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <motion.div key={title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-brand-primary hover:underline">
        ← Back
      </button>
      <h3 className="font-black text-slate-800 text-base">{title}</h3>
      {children}
    </motion.div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-bold text-slate-600">{label}</label>
        {hint && <span className="text-xs text-slate-400">({hint})</span>}
      </div>
      {children}
    </div>
  );
}
