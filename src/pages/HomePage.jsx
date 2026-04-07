/**
 * HomePage.jsx — Public landing page
 * Sections: Hero, Live Ticker, Stats, Features, CTA, Footer
 */

import { useLivePrices } from '../hooks/hooks';

const PAIRS = [
  { sym: 'BTCUSDT', label: 'BTC/USDT', icon: '₿', color: '#f7931a' },
  { sym: 'ETHUSDT', label: 'ETH/USDT', icon: 'Ξ', color: '#627eea' },
  { sym: 'BNBUSDT', label: 'BNB/USDT', icon: '◆', color: '#f3ba2f' },
];

const STATS = [
  { value: '12,400+', label: 'Active Traders',  color: '#00ff9d' },
  { value: '87%',     label: 'Signal Accuracy', color: '#00b4ff' },
  { value: '₹85Cr+',  label: 'P&L Generated',  color: '#ff9d00' },
  { value: '<200ms',  label: 'Signal Latency',  color: '#c400ff' },
];

const FEATURES = [
  { icon: '⚡', title: 'AI Signal Engine',    color: '#00ff9d', desc: 'ML models trained on 5+ years of OHLCV data generate high-confidence BUY/SELL signals with momentum crossover and volume analysis.' },
  { icon: '📡', title: 'Live WebSocket Feed', color: '#00b4ff', desc: 'Direct Binance WebSocket connection delivers sub-second price updates across BTC, ETH, BNB and 50+ pairs. Zero polling delays.' },
  { icon: '🛡️', title: 'Risk Management',    color: '#ff9d00', desc: 'Every signal ships with take-profit and stop-loss levels computed from ATR volatility bands and key support/resistance zones.' },
  { icon: '📊', title: 'Multi-Pair Charts',  color: '#c400ff', desc: 'Professional candlestick charts rendered on Canvas for maximum performance. BUY/SELL arrows overlaid directly on price action.' },
  { icon: '🔔', title: 'Smart Alerts',       color: '#00ff9d', desc: 'Get notified the moment a high-confidence signal fires. Email alerts, in-app notifications, and Telegram bot integration.' },
  { icon: '🏆', title: '87% Accuracy',       color: '#00b4ff', desc: 'Backtested across 10,000+ historical trades. Ensemble models consistently outperform single-indicator strategies by 2-3x.' },
];

export default function HomePage({ navigate, user }) {
  const prices = useLivePrices();

  return (
    <div className="min-h-screen bg-[#080c14] text-white" style={{ fontFamily: "'DM Sans',system-ui" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(rgba(0,255,157,0.07) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow blob */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[700px] h-[360px] bg-[#00ff9d]/4 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#00ff9d]/20 bg-[#00ff9d]/5 rounded-full text-xs font-mono text-[#00ff9d] mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
            AI-Powered Crypto Intelligence — Live Now
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl leading-[0.93] tracking-tighter mb-6"
            style={{ fontFamily: "'Syne',system-ui", fontWeight: 900 }}
          >
            Trade With
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(130deg,#00ff9d 0%,#00b4ff 45%,#c400ff 100%)' }}
            >
              Machine Precision
            </span>
          </h1>

          <p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Real-time AI signals for BTC, ETH, BNB &amp; 50+ pairs.
            Professional-grade analysis. Zero noise. Pure alpha.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(user ? 'dashboard' : 'signup')}
              className="px-9 py-4 bg-[#00ff9d] text-black font-black text-sm rounded-lg hover:bg-[#00ff9d]/90 transition-all shadow-[0_0_40px_#00ff9d28] uppercase tracking-wide"
              style={{ fontFamily: "'Syne',system-ui" }}
            >
              {user ? 'Open Dashboard' : 'Start Free Trial'}
            </button>
            <button
              onClick={() => navigate('pricing')}
              className="px-9 py-4 border border-white/10 text-white/55 font-semibold text-sm rounded-lg hover:border-white/25 hover:text-white transition-all"
            >
              View Pricing →
            </button>
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER ──────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-[#0a0f1a] py-5 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PAIRS.map(p => {
            const d  = prices[p.sym] ?? {};
            const up = (d.change24h ?? 0) >= 0;
            return (
              <button
                key={p.sym}
                onClick={() => navigate(user ? 'dashboard' : 'signup')}
                className="flex items-center justify-between bg-[#0d1420] border border-white/5 rounded-xl px-5 py-4 hover:border-[#00ff9d]/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm border"
                    style={{ color: p.color, borderColor: p.color + '40', background: p.color + '18' }}
                  >
                    {p.icon}
                  </div>
                  <div>
                    <div className="text-white/60 text-sm font-mono font-bold">{p.label}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                      <span className="text-[10px] font-mono text-white/25">LIVE</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-black text-xl tabular-nums" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
                    ${(d.price ?? 0).toLocaleString(undefined, {
                      maximumFractionDigits: p.sym === 'BNBUSDT' ? 1 : 0,
                    })}
                  </div>
                  <div
                    className="text-xs font-mono font-bold mt-0.5"
                    style={{ color: up ? '#00ff9d' : '#ff4d6d' }}
                  >
                    {up ? '▲ +' : '▼ '}{Math.abs(d.change24h ?? 0).toFixed(2)}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
          {STATS.map((s, i) => (
            <div key={i} className="bg-[#080c14] px-6 py-9 text-center">
              <div
                className="text-3xl md:text-4xl mb-2"
                style={{ fontFamily: "'Syne',system-ui", fontWeight: 900, color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-white/25 text-[10px] font-mono uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-10 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-4xl md:text-5xl tracking-tighter mb-3"
              style={{ fontFamily: "'Syne',system-ui", fontWeight: 900 }}
            >
              Built for <span className="text-[#00ff9d]">Serious</span> Traders
            </h2>
            <p className="text-white/30 font-mono text-sm">Everything you need. Nothing you don't.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-[#0d1420] border border-white/5 rounded-xl p-6 hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-5 border"
                  style={{ background: f.color + '16', borderColor: f.color + '30' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-black text-base mb-2 tracking-tight" style={{ fontFamily: "'Syne',system-ui" }}>
                  {f.title}
                </h3>
                <p className="text-white/32 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-4 pb-24">
        <div
          className="max-w-3xl mx-auto rounded-2xl p-12 text-center border border-[#00ff9d]/10"
          style={{ background: 'linear-gradient(135deg,rgba(0,255,157,0.04) 0%,rgba(0,180,255,0.04) 100%)' }}
        >
          <h2
            className="text-4xl tracking-tighter mb-4"
            style={{ fontFamily: "'Syne',system-ui", fontWeight: 900 }}
          >
            Start trading smarter today
          </h2>
          <p className="text-white/35 mb-8 leading-relaxed">
            Join 12,400+ traders already using Nexus Pro signals. First 7 days completely free.
          </p>
          <button
            onClick={() => navigate('signup')}
            className="px-10 py-4 bg-[#00ff9d] text-black font-black text-sm rounded-lg hover:bg-[#00ff9d]/90 transition shadow-[0_0_40px_#00ff9d25] uppercase tracking-wide"
            style={{ fontFamily: "'Syne',system-ui" }}
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span style={{ fontFamily: "'Syne',system-ui", fontWeight: 900, letterSpacing: -0.5 }}>
            <span className="text-[#00ff9d]">NEXUS</span>
            <span className="text-white/25">PRO</span>
          </span>
          <div className="flex gap-6 text-white/25 text-xs font-mono">
            {[
              { label: 'Terms',   page: 'terms'   },
              { label: 'Privacy', page: 'privacy' },
              { label: 'Support', page: 'support' },
              { label: 'About',   page: 'about'   },
            ].map(l => (
              <button
                key={l.page}
                onClick={() => navigate(l.page)}
                className="hover:text-white/55 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>
          <span className="text-white/18 text-xs font-mono">
            © 2025 Nexus Pro · Not financial advice.
          </span>
        </div>
      </footer>
    </div>
  );
}
