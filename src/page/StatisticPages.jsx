/**
 * StaticPages.jsx
 * ─────────────────────────────────────────────────────────────────
 * Exports:
 *   PricingPage, AboutPage, SupportPage, TermsPage, PrivacyPage
 */

import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────
function PageShell({ tag, title, sub, children }) {
  return (
    <div className="min-h-screen bg-[#080c14] text-white pt-24 pb-16 px-4" style={{ fontFamily: "'DM Sans',system-ui" }}>
      <div className="max-w-5xl mx-auto">
        {tag && (
          <p className="text-[#00ff9d] font-mono text-xs uppercase tracking-widest mb-3">
            // {tag}
          </p>
        )}
        <h1
          className="text-4xl md:text-5xl tracking-tighter mb-3"
          style={{ fontFamily: "'Syne',system-ui", fontWeight: 900 }}
        >
          {title}
        </h1>
        {sub && <p className="text-white/30 font-mono text-sm mb-10">{sub}</p>}
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PricingPage
// ─────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'monthly',  name: 'Monthly',   price: '₹999',   period: '/month',
    color: '#00b4ff',
    features: ['All AI Signals', 'BTC, ETH, BNB + 10 pairs', 'Real-time alerts', 'Email support'],
  },
  {
    id: 'biannual', name: '6 Months',  price: '₹4,999', period: '/6 months',
    color: '#00ff9d', popular: true,
    features: ['All AI Signals', 'All 50+ pairs', 'Real-time alerts', 'Priority support', 'Custom alerts'],
  },
  {
    id: 'yearly',   name: 'Yearly',    price: '₹7,999', period: '/year',
    color: '#c400ff',
    features: ['All AI Signals', 'All 50+ pairs', 'Real-time alerts', '24/7 support', 'API access', 'Telegram bot'],
  },
];

const FAQ = [
  ['Is there a free trial?',       '7 days free on any plan. No credit card required to start.'],
  ['Can I cancel anytime?',        "Yes. Cancel before renewal and you won't be charged again. Pro-rata refunds available within 24h."],
  ['Which pairs are supported?',   'BTC, ETH, BNB, SOL, XRP, DOGE + 45 more on paid plans. Free tier: BTC only.'],
  ['How are signals generated?',   'Ensemble ML: gradient boosting (XGBoost) + LSTM neural networks + technical momentum indicators.'],
  ['Is this financial advice?',    'No. Signals are educational tools. Always do your own research before trading.'],
  ['Payment methods?',             'UPI, credit/debit card, net banking via Razorpay. Indian Rupee (₹INR) only.'],
];

export function PricingPage({ navigate, user }) {
  return (
    <PageShell tag="pricing" title="Transparent Pricing" sub="No hidden fees. No lock-ins. Cancel anytime.">

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            className="relative bg-[#0d1420] rounded-2xl p-7 flex flex-col border"
            style={{
              borderColor:  plan.popular ? plan.color + '50' : 'rgba(255,255,255,0.07)',
              transform:    plan.popular ? 'scale(1.03)' : 'none',
            }}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span
                  className="px-4 py-1 text-black text-[10px] font-black rounded-full uppercase tracking-widest"
                  style={{ background: plan.color }}
                >
                  Most Popular
                </span>
              </div>
            )}

            <h3 className="text-xl font-black mb-1" style={{ fontFamily: "'Syne',system-ui" }}>{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-5">
              <span className="text-4xl font-black" style={{ fontFamily: "'Syne',system-ui", color: plan.color }}>
                {plan.price}
              </span>
              <span className="text-white/25 text-xs font-mono">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/50">
                  <span style={{ color: plan.color, fontSize: 11 }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate(user ? 'dashboard' : 'signup')}
              className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all"
              style={plan.popular
                ? { background: plan.color, color: '#000', boxShadow: `0 0 28px ${plan.color}22` }
                : { border: `1px solid ${plan.color}40`, color: plan.color, background: 'transparent' }
              }
            >
              {user ? 'Upgrade Now' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h2
          className="text-3xl font-black text-center tracking-tighter mb-8"
          style={{ fontFamily: "'Syne',system-ui" }}
        >
          Frequently Asked
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQ.map(([q, a]) => (
            <div key={q} className="bg-[#0d1420] border border-white/5 rounded-xl p-5">
              <p className="font-bold text-white/80 text-sm mb-2">{q}</p>
              <p className="text-white/32 text-sm font-mono leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// AboutPage
// ─────────────────────────────────────────────────────────────────
export function AboutPage({ navigate }) {
  const stats = [
    { value: '12,400+', label: 'Active Traders',  color: '#00ff9d' },
    { value: '87%',     label: 'Accuracy Rate',   color: '#00b4ff' },
    { value: '₹85Cr+',  label: 'P&L Generated',  color: '#ff9d00' },
    { value: '<200ms',  label: 'Signal Latency',  color: '#c400ff' },
  ];

  const cards = [
    { icon: '⚙️', title: 'Our Technology',  body: 'Ensemble ML: gradient boosting (XGBoost), LSTM neural networks for sequence modelling, and classical technical indicators. Models retrained weekly on fresh Binance OHLCV data.' },
    { icon: '🎯', title: 'Our Mission',     body: 'Democratize access to institutional-grade trading intelligence. What quant funds pay crores for, we deliver for less than ₹33/day.' },
    { icon: '🔒', title: 'Security',        body: 'Firebase Authentication + Firestore with encryption at rest. Razorpay handles all payments — we never store card data. DPDP Act 2023 compliant.' },
    { icon: '📍', title: 'Bangalore HQ',   body: "Registered in Bangalore, Karnataka. Bootstrapped and profitable since month 6. GSTIN: 29ABCDE1234F1Z5. We're proudly building in India." },
  ];

  return (
    <PageShell tag="about" title={<>Built by traders,<br /><span className="text-[#00ff9d]">for traders.</span></>}>

      <p className="text-white/40 text-lg max-w-2xl leading-relaxed mb-12">
        Nexus Pro was founded in 2023 by a team of quantitative analysts and ML engineers who were tired of
        expensive, opaque signal services. We decided to build the tool we always wanted.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-[#080c14] px-5 py-8 text-center">
            <div className="text-3xl md:text-4xl mb-1.5 font-black" style={{ fontFamily: "'Syne',system-ui", color: s.color }}>{s.value}</div>
            <div className="text-white/25 text-[10px] font-mono uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {cards.map(c => (
          <div key={c.title} className="bg-[#0d1420] border border-white/5 rounded-xl p-6">
            <div className="text-2xl mb-3">{c.icon}</div>
            <h3 className="font-black text-base mb-2" style={{ fontFamily: "'Syne',system-ui" }}>{c.title}</h3>
            <p className="text-white/32 text-sm leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate('signup')}
          className="px-8 py-4 bg-[#00ff9d] text-black font-black text-sm rounded-lg uppercase tracking-wider hover:bg-[#00ff9d]/88 transition"
          style={{ fontFamily: "'Syne',system-ui" }}
        >
          Join Nexus Pro
        </button>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// SupportPage
// ─────────────────────────────────────────────────────────────────
export function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Production: POST to /api/contact or use EmailJS / Firestore collection
    setSent(true);
  };

  const contacts = [
    { icon: '✉', label: 'Email',    value: 'support@nexuspro.in' },
    { icon: '📱', label: 'Telegram', value: '@nexusprosupport' },
    { icon: '🕐', label: 'Hours',   value: 'Mon–Sat, 9 AM–9 PM IST' },
  ];

  return (
    <PageShell tag="support" title="How can we help?" sub="We typically respond within 4 hours on business days.">
      <div className="max-w-4xl">

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {contacts.map(c => (
            <div key={c.label} className="flex items-center gap-4 bg-[#0d1420] border border-white/5 rounded-xl p-4">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">{c.label}</p>
                <p className="text-white/65 text-sm font-mono mt-0.5">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="bg-[#0d1420] border border-white/8 rounded-2xl p-8 max-w-xl">
          {sent ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-black text-[#00ff9d] mb-2" style={{ fontFamily: "'Syne',system-ui" }}>
                Message Sent!
              </h3>
              <p className="text-white/30 font-mono text-sm">
                We'll get back to you within 4 business hours.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black mb-6" style={{ fontFamily: "'Syne',system-ui" }}>Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { k: 'name',  l: 'Your Name',  t: 'text',  ph: 'Alex Sharma' },
                    { k: 'email', l: 'Your Email', t: 'email', ph: 'you@example.com' },
                  ].map(f => (
                    <div key={f.k}>
                      <label className="block text-[10px] font-mono text-white/28 uppercase tracking-widest mb-2">{f.l}</label>
                      <input
                        type={f.t} placeholder={f.ph} required
                        value={form[f.k]}
                        onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                        className="w-full px-4 py-3 bg-[#080c14] border border-white/8 rounded-lg text-white text-sm font-mono placeholder-white/18 focus:outline-none focus:border-[#00ff9d]/30 transition-colors"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/28 uppercase tracking-widest mb-2">Subject</label>
                  <input
                    type="text" placeholder="Brief description of your issue" required
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#080c14] border border-white/8 rounded-lg text-white text-sm font-mono placeholder-white/18 focus:outline-none focus:border-[#00ff9d]/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-white/28 uppercase tracking-widest mb-2">Message</label>
                  <textarea
                    rows={5} placeholder="Describe your issue in detail..." required
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#080c14] border border-white/8 rounded-lg text-white text-sm font-mono placeholder-white/18 focus:outline-none focus:border-[#00ff9d]/30 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#00ff9d] text-black font-black text-sm rounded-lg uppercase tracking-wider hover:bg-[#00ff9d]/88 transition"
                  style={{ fontFamily: "'Syne',system-ui" }}
                >
                  Send Message →
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// TermsPage
// ─────────────────────────────────────────────────────────────────
export function TermsPage() {
  const sections = [
    ['1. Acceptance',        'By accessing Nexus Pro you agree to these Terms. If you disagree with any part, do not use the Service.'],
    ['2. Service',           'Nexus Pro provides AI-generated cryptocurrency trading signals for educational and informational purposes only. We are not a registered broker, investment adviser, or financial institution.'],
    ['3. Not Financial Advice', 'All signals, data, and analysis are for informational purposes only. Cryptocurrency trading involves substantial risk of loss. You are solely responsible for all trading decisions. Past signal performance does not guarantee future results.'],
    ['4. Subscriptions',     'Plans are billed in advance and renew automatically. You may cancel at any time. Refunds are issued within 24 hours of purchase if requested. No partial-period refunds after 24 hours.'],
    ['5. Prohibited Use',    'You may not: resell or redistribute signals commercially; scrape data via bots; reverse-engineer our models; share account credentials; use the Service for any illegal purpose.'],
    ['6. Intellectual Property', 'All AI models, algorithms, platform code, and design are proprietary to Nexus Pro Pvt Ltd. You receive a limited, non-transferable licence for personal trading use only.'],
    ['7. Limitation of Liability', 'To the maximum extent permitted by Indian law, Nexus Pro shall not be liable for any direct, indirect, incidental, or consequential damages arising from use of the Service.'],
    ['8. Privacy',           'Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.'],
    ['9. Modifications',     'We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance. Material changes will be notified via email.'],
    ['10. Governing Law',    'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka, India.'],
  ];

  return (
    <PageShell tag="legal" title="Terms & Conditions" sub="Last updated: March 15, 2025">
      <div className="max-w-3xl space-y-6">
        {sections.map(([h, b]) => (
          <div key={h} className="border-l-2 border-[#00ff9d]/20 pl-5">
            <h3 className="font-black text-white/80 text-sm mb-2" style={{ fontFamily: "'Syne',system-ui" }}>{h}</h3>
            <p className="text-white/32 text-sm font-mono leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────
// PrivacyPage
// ─────────────────────────────────────────────────────────────────
export function PrivacyPage() {
  const sections = [
    ['Data We Collect',       'Name, email, mobile number (at signup). Usage data: pages visited, signals viewed, pairs analysed (anonymised). Payment metadata via Razorpay (no card numbers stored on our servers). Device type and browser for security.'],
    ['How We Use Your Data',  'To create and manage your account; deliver AI signals; process subscriptions; send service and alert notifications (opt-out available); improve our ML models using anonymised aggregate data.'],
    ['Firebase & Third Parties', 'Data is stored in Google Firebase Firestore with AES-256 encryption at rest. Auth via Firebase Auth. Payments by Razorpay — subject to their privacy policy. We do not sell personal data to any third party, ever.'],
    ['Data Retention',        'Account data is retained while your account is active. You can request deletion at any time; data is removed within 30 days from all systems. Anonymised aggregate data may be retained indefinitely for ML research.'],
    ['Your Rights',           'Under the DPDP Act 2023 (India) you have the right to: access your personal data, correct inaccuracies, withdraw consent, request deletion, and file a complaint with the Data Protection Board of India.'],
    ['Cookies',               'We use essential session cookies only. No advertising or tracking cookies. No cross-site tracking pixels. Disable cookies in your browser settings — note this may break authentication.'],
    ['Security',              'HTTPS/TLS for all data in transit. Firebase security rules enforce per-user data isolation. Role-based access control. Regular dependency audits. No system is 100% secure — use a strong, unique password.'],
    ['Contact',               'Data Controller: Nexus Pro Pvt Ltd, Bangalore, Karnataka 560001, India. Privacy enquiries: privacy@nexuspro.in. We respond within 30 calendar days.'],
  ];

  return (
    <PageShell tag="legal" title="Privacy Policy" sub="Last updated: March 15, 2025">
      <div className="max-w-3xl space-y-6">
        {sections.map(([h, b]) => (
          <div key={h} className="border-l-2 border-[#00b4ff]/20 pl-5">
            <h3 className="font-black text-white/80 text-sm mb-2" style={{ fontFamily: "'Syne',system-ui" }}>{h}</h3>
            <p className="text-white/32 text-sm font-mono leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
