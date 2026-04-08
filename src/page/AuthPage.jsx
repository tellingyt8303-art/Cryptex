/**
 * AuthPages.jsx
 * Exports: LoginPage, SignupPage
 *
 * Firebase calls:
 *   Login  → signInWithEmailAndPassword
 *   Signup → createUserWithEmailAndPassword + setDoc to Firestore
 */

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp }                       from 'firebase/firestore';
import { auth, db }                                                    from '../firebase/config';

// ─────────────────────────────────────────────────────────────────
// LoginPage
// ─────────────────────────────────────────────────────────────────
export function LoginPage({ navigate, setUser, setUserData }) {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await signInWithEmailAndPassword(auth, form.email, form.password);
      setUser(user);
      // Fetch Firestore profile
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setUserData(snap.data());
      navigate('dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      sub="Sign in to your Nexus Pro account"
      footer={
        <p className="text-white/30 text-sm font-mono">
          No account?{' '}
          <button onClick={() => navigate('signup')} className="text-[#00ff9d] hover:underline">
            Sign up free
          </button>
        </p>
      }
    >
      {error && <ErrorBox msg={error} />}
      <form onSubmit={handleLogin} className="space-y-4">
        <Field label="Email"    type="email"    ph="you@example.com"  value={form.email}    set={v => setForm(f => ({ ...f, email: v }))} />
        <Field label="Password" type="password" ph="Your password"    value={form.password} set={v => setForm(f => ({ ...f, password: v }))} />
        <Btn loading={loading} label="Sign In" />
      </form>
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// SignupPage
// ─────────────────────────────────────────────────────────────────
export function SignupPage({ navigate, setUser, setUserData }) {
  const [form, setForm]       = useState({ name: '', email: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Create Firebase Auth account
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // 2. Write user profile to Firestore
      const profile = {
        uid:       user.uid,
        name:      form.name,
        email:     form.email,
        mobile:    form.mobile,
        createdAt: serverTimestamp(),
        // Default subscription — no active plan
        subscription: {
          plan:       null,
          planId:     null,
          active:     false,
          startDate:  null,
          expiryDate: null,
        },
      };
      await setDoc(doc(db, 'users', user.uid), profile);

      setUser(user);
      setUserData(profile);
      navigate('dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full Name',      type: 'text',     ph: 'Alex Sharma' },
    { key: 'email',    label: 'Email Address',   type: 'email',    ph: 'you@example.com' },
    { key: 'mobile',   label: 'Mobile Number',   type: 'tel',      ph: '+91 98765 43210' },
    { key: 'password', label: 'Password',        type: 'password', ph: 'Min 8 characters' },
  ];

  return (
    <AuthShell
      title="Create account"
      sub="Start trading with AI precision"
      footer={
        <>
          <p className="text-white/30 text-sm font-mono">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-[#00ff9d] hover:underline">
              Sign in
            </button>
          </p>
          <p className="text-white/18 text-xs font-mono mt-2">
            By signing up you agree to our{' '}
            <button onClick={() => navigate('terms')}   className="underline hover:text-white/35">Terms</button>
            {' '}&amp;{' '}
            <button onClick={() => navigate('privacy')} className="underline hover:text-white/35">Privacy Policy</button>
          </p>
        </>
      }
    >
      {error && <ErrorBox msg={error} />}
      <form onSubmit={handleSignup} className="space-y-4">
        {fields.map(f => (
          <Field
            key={f.key} label={f.label} type={f.type} ph={f.ph}
            value={form[f.key]} set={v => setForm(prev => ({ ...prev, [f.key]: v }))}
          />
        ))}
        <Btn loading={loading} label="Create Account" />
      </form>
    </AuthShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shared sub-components (private to this file)
// ─────────────────────────────────────────────────────────────────
function AuthShell({ title, sub, children, footer }) {
  return (
    <div className="min-h-screen bg-[#080c14] flex items-center justify-center px-4 pt-16 pb-10">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-64 bg-[#00ff9d]/4 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex w-10 h-10 border border-[#00ff9d]/35 rounded-lg items-center justify-center text-[#00ff9d] mb-4">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
              <line x1="12" y1="2"   x2="12" y2="22" />
              <line x1="2"  y1="8.5" x2="22" y2="8.5" />
              <line x1="2"  y1="15.5" x2="22" y2="15.5" />
            </svg>
          </div>
          <h1
            className="text-3xl tracking-tighter"
            style={{ fontFamily: "'Syne',system-ui", fontWeight: 900 }}
          >
            {title}
          </h1>
          <p className="text-white/30 text-sm font-mono mt-2">{sub}</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d1420] border border-white/8 rounded-2xl p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-5 space-y-1">{footer}</div>
      </div>
    </div>
  );
}

function Field({ label, type, ph, value, set }) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-white/35 uppercase tracking-widest mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={ph}
        value={value}
        onChange={e => set(e.target.value)}
        required
        className="w-full px-4 py-3 bg-[#080c14] border border-white/8 rounded-lg text-white text-sm font-mono placeholder-white/18 focus:outline-none focus:border-[#00ff9d]/35 focus:ring-1 focus:ring-[#00ff9d]/10 transition-colors"
      />
    </div>
  );
}

function Btn({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 bg-[#00ff9d] text-black font-black text-sm rounded-lg hover:bg-[#00ff9d]/88 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_#00ff9d18] uppercase tracking-wider mt-1"
      style={{ fontFamily: "'Syne',system-ui" }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
              strokeDasharray="60" strokeDashoffset="20" />
          </svg>
          Processing...
        </span>
      ) : label}
    </button>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="mb-4 px-4 py-3 bg-[#ff4d6d]/10 border border-[#ff4d6d]/30 rounded-lg text-[#ff4d6d] text-sm font-mono">
      ⚠ {msg}
    </div>
  );
}

function friendlyError(code) {
  const MAP = {
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Try again.',
    'auth/email-already-in-use':   'This email is already registered.',
    'auth/weak-password':          'Password must be at least 8 characters.',
    'auth/too-many-requests':      'Too many attempts. Please wait and try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/invalid-email':          'Please enter a valid email address.',
  };
  return MAP[code] ?? 'Something went wrong. Please try again.';
}
