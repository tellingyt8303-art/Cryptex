/**
 * SubscriptionModal.jsx
 * ─────────────────────────────────────────────────────────────────
 * Shows plan cards, handles payment via Razorpay (or mock),
 * and writes the resulting subscription to Firestore on success.
 *
 * RAZORPAY REAL INTEGRATION STEPS:
 * 1. Sign up at https://razorpay.com → get Key ID + Key Secret
 * 2. Add to .env:  VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
 * 3. Uncomment the Razorpay <script> tag in index.html
 * 4. Create a lightweight backend endpoint (Node/Express/Vercel fn):
 *      POST /api/create-order { amount, currency }
 *      → calls Razorpay API → returns { orderId }
 * 5. Replace "MOCK PAYMENT" block below with real Razorpay flow
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '₹999',
    amountPaise: 99900,   // ₹999 × 100 (Razorpay uses paise)
    period: '/month',
    months: 1,
    color: '#00b4ff',
    features: ['All AI Signals', 'BTC, ETH, BNB + 10 pairs', 'Real-time alerts', 'Email support'],
  },
  {
    id: 'biannual',
    name: '6 Months',
    price: '₹4,999',
    amountPaise: 499900,
    period: '/6 months',
    months: 6,
    color: '#00ff9d',
    popular: true,
    features: ['All AI Signals', 'All 50+ pairs', 'Real-time alerts', 'Priority support', 'Custom alerts'],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹7,999',
    amountPaise: 799900,
    period: '/year',
    months: 12,
    color: '#c400ff',
    features: ['All AI Signals', 'All 50+ pairs', 'Real-time alerts', '24/7 support', 'API access', 'Telegram bot'],
  },
];

export default function SubscriptionModal({ onClose, user, userData, setUserData }) {
  const [selected, setSelected] = useState('biannual');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const plan = PLANS.find(p => p.id === selected);

  // ── Payment handler ──────────────────────────────────────────────
  const handlePay = async () => {
    setLoading(true);
    try {

      /* ── REAL RAZORPAY FLOW (uncomment when ready) ──────────────
      // Step 1: Create order on your backend
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: plan.amountPaise, currency: 'INR' }),
      });
      const { orderId } = await res.json();

      // Step 2: Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount:      plan.amountPaise,
          currency:    'INR',
          name:        'Nexus Pro',
          description: `${plan.name} Subscription`,
          order_id:    orderId,
          prefill: {
            name:    userData?.name,
            email:   userData?.email,
            contact: userData?.mobile,
          },
          theme: { color: '#00ff9d' },
          handler: async (response) => {
            // Step 3: Verify on backend (razorpay_payment_id, signature)
            // await fetch('/api/verify-payment', { method:'POST', body: JSON.stringify(response) });
            resolve(response);
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        });
        rzp.open();
      });
      ── END RAZORPAY FLOW ─────────────────────────────────────── */

      // ── MOCK PAYMENT (remove when Razorpay is live) ─────────────
      await new Promise(r => setTimeout(r, 1600));
      // ── END MOCK ────────────────────────────────────────────────

      // Activate subscription in Firestore
      await activateSubscription(plan, user, setUserData);
      setSuccess(true);

    } catch (err) {
      if (err.message !== 'Payment cancelled') {
        console.error('Payment error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-[580px] bg-[#0d1420] border border-white/10 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/7">
          <div>
            <h2
              className="text-xl tracking-tighter"
              style={{ fontFamily: "'Syne',system-ui", fontWeight: 900 }}
            >
              Upgrade to Pro
            </h2>
            <p className="text-white/30 text-xs font-mono mt-0.5">
              Instant activation · Cancel anytime
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 flex items-center justify-center text-4xl mx-auto mb-5">
              ✓
            </div>
            <h3
              className="text-2xl text-[#00ff9d] mb-2"
              style={{ fontFamily: "'Syne',system-ui", fontWeight: 900 }}
            >
              You're now on {plan.name}!
            </h3>
            <p className="text-white/35 text-sm font-mono mb-7">
              All premium features are now unlocked. Happy trading!
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#00ff9d] text-black font-black text-sm rounded-lg uppercase tracking-wider"
              style={{ fontFamily: "'Syne',system-ui" }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Plan selector */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className="relative text-left px-4 py-4 rounded-xl border transition-all"
                  style={{
                    background:   selected === p.id ? p.color + '0a' : '#080c14',
                    borderColor:  selected === p.id ? p.color + '55' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  {p.popular && (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-black text-[9px] font-black rounded-full uppercase whitespace-nowrap"
                      style={{ background: p.color }}
                    >
                      Best Value
                    </span>
                  )}
                  <div className="text-[10px] font-mono text-white/35 mb-1">{p.name}</div>
                  <div
                    className="text-xl font-black"
                    style={{ fontFamily: "'Syne',system-ui", color: p.color }}
                  >
                    {p.price}
                  </div>
                  <div className="text-[10px] text-white/22 font-mono">{p.period}</div>
                  {selected === p.id && (
                    <div
                      className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full text-black text-[10px] font-black flex items-center justify-center"
                      style={{ background: p.color }}
                    >
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Features for selected plan */}
            <div className="bg-[#080c14] border border-white/5 rounded-xl p-4 mb-5">
              <p className="text-[10px] text-white/28 font-mono uppercase tracking-widest mb-3">
                {plan.name} Plan — Includes
              </p>
              <div className="grid grid-cols-2 gap-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/55">
                    <span className="text-[10px]" style={{ color: plan.color }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* User summary */}
            {userData && (
              <div className="flex flex-wrap gap-4 mb-5 text-xs font-mono text-white/22">
                <span>👤 {userData.name}</span>
                <span>✉ {userData.email}</span>
                {userData.mobile && <span>📱 {userData.mobile}</span>}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 font-black text-sm text-black rounded-xl hover:opacity-90 transition-all disabled:opacity-55 uppercase tracking-wider"
              style={{
                fontFamily: "'Syne',system-ui",
                background:  plan.color,
                boxShadow:  `0 0 40px ${plan.color}22`,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                      strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                `Pay ${plan.price} via Razorpay →`
              )}
            </button>
            <p className="text-center text-white/15 text-[10px] font-mono mt-3">
              Secured by Razorpay · 256-bit SSL · Cancel anytime
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Write subscription to Firestore ──────────────────────────────
async function activateSubscription(plan, user, setUserData) {
  const start  = new Date();
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + plan.months);

  const subscription = {
    plan:       plan.name,
    planId:     plan.id,
    active:     true,
    startDate:  start.toISOString().split('T')[0],
    expiryDate: expiry.toISOString().split('T')[0],
    amount:     plan.amountPaise / 100,
    currency:   'INR',
  };

  // Firestore update
  await updateDoc(doc(db, 'users', user.uid), { subscription });

  // Local state update (so UI reflects change immediately)
  setUserData(prev => ({ ...prev, subscription }));
}
