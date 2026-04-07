/**
 * DashboardPage.jsx
 * ─────────────────────────────────────────────────────────────────
 * Full protected dashboard. Tabs:
 *   Overview     — stats, market prices, recent signals
 *   Live Chart   — candlestick chart + pair switcher + signals
 *   AI Signals   — all signals grouped by pair
 *   Subscription — plan selection + upgrade CTA
 *   Profile      — user details from Firestore
 */

import { useState, useMemo }              from 'react';
import { useLivePrices, useCandles,
         useAISignals, useSubscription }  from '../hooks/hooks';
import { CandleChart, SignalCard,
         StatCard, PlanBadge }            from '../components/Components';
import SubscriptionModal                  from './SubscriptionModal';

// ─────────────────────────────────────────────────────────────────
const PAIRS = [
  { sym: 'BTCUSDT', label: 'BTC/USDT', icon: '₿', color: '#f7931a' },
  { sym: 'ETHUSDT', label: 'ETH/USDT', icon: 'Ξ', color: '#627eea' },
  { sym: 'BNBUSDT', label: 'BNB/USDT', icon: '◆', color: '#f3ba2f' },
];

const TABS = [
  { id: 'overview',      icon: '⬡', label: 'Overview'     },
  { id: 'chart',         icon: '◈', label: 'Live Chart'   },
  { id: 'signals',       icon: '◉', label: 'AI Signals'   },
  { id: 'subscription',  icon: '◇', label: 'Subscription' },
  { id: 'profile',       icon: '◎', label: 'Profile'      },
];

// ─────────────────────────────────────────────────────────────────
export default function DashboardPage({ navigate, user, userData, setUserData, onLogout }) {
  const [tab,         setTab]         = useState('overview');
  const [activePair,  setActivePair]  = useState('BTCUSDT');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Live prices for all pairs
  const prices   = useLivePrices();
  const liveData = prices[activePair] ?? {};

  // Candles & signals for the active chart pair
  const candles  = useCandles(activePair, liveData.price);
  const signals  = useAISignals(candles, activePair);

  // Candles & signals for all pairs (used in Signals tab & Overview)
  const btcC = useCandles('BTCUSDT', prices.BTCUSDT?.price);
  const ethC = useCandles('ETHUSDT', prices.ETHUSDT?.price);
  const bnbC = useCandles('BNBUSDT', prices.BNBUSDT?.price);
  const btcS = useAISignals(btcC, 'BTCUSDT');
  const ethS = useAISignals(ethC, 'ETHUSDT');
  const bnbS = useAISignals(bnbC, 'BNBUSDT');

  const allSignals = useMemo(
    () => [
      ...btcS.map(s => ({ ...s, pairLabel: 'BTC/USDT' })),
      ...ethS.map(s => ({ ...s, pairLabel: 'ETH/USDT' })),
      ...bnbS.map(s => ({ ...s, pairLabel: 'BNB/USDT' })),
    ].sort((a, b) => b.time - a.time),
    [btcS, ethS, bnbS]
  );

  const sigsByPair = { BTCUSDT: btcS, ETHUSDT: ethS, BNBUSDT: bnbS };

  // Subscription status
  const sub      = useSubscription(userData);
  const isActive = sub.isActive;

  const pairMeta = PAIRS.find(p => p.sym === activePair);

  // Helper: price formatted
  const fmtPrice = (sym, price) =>
    '$' + (price ?? 0).toLocaleString(undefined, {
      maximumFractionDigits: sym === 'BNBUSDT' ? 2 : 0,
    });

  return (
    <div className="flex h-screen bg-[#080c14] overflow-hidden" style={{ fontFamily: "'DM Sans',system-ui" }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-56 flex flex-col
          bg-[#0a0f1a] border-r border-white/5
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo + close */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <span style={{ fontFamily: "'Syne',system-ui", fontWeight: 900, fontSize: 16, letterSpacing: -0.5 }}>
            <span className="text-[#00ff9d]">NEXUS</span>
            <span className="text-white/25">PRO</span>
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/30 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* User mini-card */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/20 flex items-center justify-center font-black text-[#00ff9d] text-sm flex-shrink-0">
              {(userData?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight">
                {userData?.name ?? 'Trader'}
              </p>
              <PlanBadge plan={sub.plan} active={isActive} />
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${tab === t.id
                  ? 'bg-[#00ff9d]/8 text-[#00ff9d] border border-[#00ff9d]/15'
                  : 'text-white/38 hover:text-white hover:bg-white/4 border border-transparent'}
              `}
            >
              <span className="text-sm leading-none">{t.icon}</span>
              {t.label}
              {t.id === 'signals' && (
                <span className="ml-auto text-[9px] bg-[#00ff9d]/15 text-[#00ff9d] px-1.5 py-0.5 rounded font-mono">
                  {allSignals.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-white/5 space-y-0.5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/28 hover:text-white hover:bg-white/4 transition-all"
          >
            <span>↩</span> Logout
          </button>
          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/20 hover:text-white/45 transition-all"
          >
            <span>←</span> Back to Site
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/55 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN AREA ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/5 bg-[#0a0f1a] gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-white/38 hover:text-white p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <div className="font-black text-lg tracking-tight" style={{ fontFamily: "'Syne',system-ui" }}>
                {TABS.find(t => t.id === tab)?.label}
              </div>
              <div className="text-white/22 text-[11px] font-mono hidden sm:block">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>

          {/* Mini price tickers */}
          <div className="hidden lg:flex items-center gap-5">
            {PAIRS.map(p => {
              const d  = prices[p.sym] ?? {};
              const up = (d.change24h ?? 0) >= 0;
              return (
                <button
                  key={p.sym}
                  onClick={() => { setActivePair(p.sym); setTab('chart'); }}
                  className="text-right hover:opacity-75 transition-opacity"
                >
                  <div className="text-[10px] font-mono text-white/28">{p.label}</div>
                  <div className="text-sm font-mono font-black tabular-nums">{fmtPrice(p.sym, d.price)}</div>
                  <div className="text-[10px] font-mono font-bold" style={{ color: up ? '#00ff9d' : '#ff4d6d' }}>
                    {up ? '▲' : '▼'} {Math.abs(d.change24h ?? 0).toFixed(2)}%
                  </div>
                </button>
              );
            })}
          </div>

          {/* Upgrade pill */}
          {!isActive && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="ml-auto px-4 py-2 bg-[#00ff9d]/8 border border-[#00ff9d]/25 text-[#00ff9d] text-xs font-mono font-bold rounded-lg hover:bg-[#00ff9d]/15 transition-colors"
            >
              ↑ Upgrade
            </button>
          )}
        </header>

        {/* ── TAB CONTENT ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ═══ OVERVIEW ═══════════════════════════════════════ */}
          {tab === 'overview' && (
            <div className="space-y-5">

              {/* Upgrade banner for free users */}
              {!isActive && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#00ff9d]/5 to-[#00b4ff]/5 border border-[#00ff9d]/14 rounded-xl px-5 py-4">
                  <div>
                    <p className="font-bold text-white/80 text-sm">You're on the Free Plan</p>
                    <p className="text-white/32 text-xs font-mono mt-0.5">
                      Upgrade to unlock all AI signals, all pairs &amp; priority alerts
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="shrink-0 px-5 py-2.5 bg-[#00ff9d] text-black font-black text-xs rounded-lg uppercase tracking-wider hover:bg-[#00ff9d]/88 transition-all"
                    style={{ fontFamily: "'Syne',system-ui" }}
                  >
                    Upgrade Plan
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Active BUY Signals"
                  value={allSignals.filter(s => s.type === 'BUY').length}
                  sub="Across all pairs"
                  accentColor="#00ff9d"
                />
                <StatCard
                  label="BTC Price"
                  value={fmtPrice('BTCUSDT', prices.BTCUSDT?.price)}
                  sub={`${(prices.BTCUSDT?.change24h ?? 0) >= 0 ? '▲' : '▼'} ${Math.abs(prices.BTCUSDT?.change24h ?? 0).toFixed(2)}% 24h`}
                  accentColor={(prices.BTCUSDT?.change24h ?? 0) >= 0 ? '#00ff9d' : '#ff4d6d'}
                />
                <StatCard
                  label="Plan Status"
                  value={isActive ? sub.plan : 'Free'}
                  sub={isActive ? `${sub.daysLeft} days left` : 'No active plan'}
                  accentColor={isActive ? '#00ff9d' : 'rgba(255,255,255,0.4)'}
                />
                <StatCard
                  label="ETH Price"
                  value={fmtPrice('ETHUSDT', prices.ETHUSDT?.price)}
                  sub={`${(prices.ETHUSDT?.change24h ?? 0) >= 0 ? '▲' : '▼'} ${Math.abs(prices.ETHUSDT?.change24h ?? 0).toFixed(2)}% 24h`}
                  accentColor={(prices.ETHUSDT?.change24h ?? 0) >= 0 ? '#00ff9d' : '#ff4d6d'}
                />
              </div>

              {/* Market overview cards */}
              <div>
                <h3 className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-3">Market Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PAIRS.map(p => {
                    const d  = prices[p.sym] ?? {};
                    const up = (d.change24h ?? 0) >= 0;
                    return (
                      <button
                        key={p.sym}
                        onClick={() => { setActivePair(p.sym); setTab('chart'); }}
                        className="text-left bg-[#0d1420] border border-white/5 rounded-xl p-4 hover:border-white/10 hover:-translate-y-0.5 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border"
                              style={{ color: p.color, borderColor: p.color + '40', background: p.color + '18' }}
                            >
                              {p.icon}
                            </span>
                            <span className="text-white/55 text-sm font-mono font-bold">{p.label}</span>
                          </div>
                          <span
                            className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                            style={{
                              color:      up ? '#00ff9d' : '#ff4d6d',
                              background: up ? 'rgba(0,255,157,0.1)' : 'rgba(255,77,109,0.1)',
                            }}
                          >
                            {up ? '+' : ''}{(d.change24h ?? 0).toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-2xl font-black tabular-nums" style={{ fontFamily: "'Syne',system-ui" }}>
                          {fmtPrice(p.sym, d.price)}
                        </div>
                        <div className="flex gap-3 mt-2 text-[10px] font-mono text-white/22">
                          <span>H: {fmtPrice(p.sym, d.high)}</span>
                          <span>L: {fmtPrice(p.sym, d.low)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent signals */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-mono text-white/28 uppercase tracking-widest">Recent AI Signals</h3>
                  <button
                    onClick={() => setTab('signals')}
                    className="text-[#00ff9d] text-xs font-mono hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-2">
                  {/* Show 5 if subscribed, 2 if free */}
                  {allSignals.slice(0, isActive ? 5 : 2).map((sig, i) => (
                    <SignalCard key={i} signal={{ ...sig, pair: sig.pairLabel }} />
                  ))}

                  {/* Locked blur overlay */}
                  {!isActive && (
                    <div className="relative">
                      <div className="filter blur-sm pointer-events-none space-y-2">
                        {allSignals.slice(2, 5).map((sig, i) => (
                          <SignalCard key={i} signal={{ ...sig, pair: sig.pairLabel }} />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-[#080c14]/60 rounded-xl">
                        <button
                          onClick={() => setShowUpgrade(true)}
                          className="px-5 py-2.5 bg-[#00ff9d] text-black font-black text-xs rounded-lg uppercase tracking-wider"
                          style={{ fontFamily: "'Syne',system-ui" }}
                        >
                          🔒 Upgrade to Unlock
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ LIVE CHART ══════════════════════════════════════ */}
          {tab === 'chart' && (
            <div className="space-y-4">

              {/* Pair header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base border"
                      style={{ color: pairMeta?.color, borderColor: pairMeta?.color + '40', background: pairMeta?.color + '18' }}
                    >
                      {pairMeta?.icon}
                    </span>
                    <span className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Syne',system-ui" }}>
                      {pairMeta?.label}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
                      <span className="text-[#00ff9d] text-[10px] font-mono">LIVE</span>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black tabular-nums" style={{ fontFamily: "'Syne',system-ui" }}>
                      {fmtPrice(activePair, liveData.price)}
                    </span>
                    <span
                      className="text-sm font-mono font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        color:      (liveData.change24h ?? 0) >= 0 ? '#00ff9d' : '#ff4d6d',
                        background: (liveData.change24h ?? 0) >= 0 ? 'rgba(0,255,157,0.1)' : 'rgba(255,77,109,0.1)',
                      }}
                    >
                      {(liveData.change24h ?? 0) >= 0 ? '+' : ''}{(liveData.change24h ?? 0).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Pair switcher */}
                <div className="flex gap-2 flex-wrap">
                  {PAIRS.map(p => (
                    <button
                      key={p.sym}
                      onClick={() => setActivePair(p.sym)}
                      className="px-4 py-2 rounded-lg text-xs font-mono font-bold border transition-all"
                      style={activePair === p.sym
                        ? { background: p.color, color: '#000', border: 'none', boxShadow: `0 0 18px ${p.color}40` }
                        : { background: 'transparent', color: 'rgba(255,255,255,0.38)', borderColor: 'rgba(255,255,255,0.1)' }
                      }
                    >
                      {p.label.replace('/USDT', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                {/* Candlestick chart */}
                <div
                  className="lg:col-span-3 bg-[#080c14] border border-white/5 rounded-xl overflow-hidden"
                  style={{ height: 400 }}
                >
                  <CandleChart
                    candles={candles}
                    signals={isActive ? signals : signals.slice(0, 3)}
                    livePrice={liveData.price}
                  />
                </div>

                {/* Signal sidebar */}
                <div className="bg-[#0d1420] border border-white/5 rounded-xl p-4 flex flex-col" style={{ minHeight: 200 }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-white/28 uppercase tracking-widest">Signals</span>
                    <span className="text-[10px] font-mono text-[#00ff9d]">{signals.length} total</span>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-3 mb-3">
                    {[['#00ff9d','BUY'],['#ff4d6d','SELL'],['#ffd700','Live']].map(([c,l]) => (
                      <div key={l} className="flex items-center gap-1">
                        <div style={{ width: l === 'Live' ? 12 : 6, height: l === 'Live' ? 1 : 6, background: c, borderRadius: l === 'Live' ? 0 : 2 }} />
                        <span className="text-[9px] font-mono text-white/25">{l}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                    {(isActive ? signals : signals.slice(0, 4)).slice(-10).reverse().map((sig, i) => (
                      <SignalCard key={i} signal={{ ...sig, pair: pairMeta?.label }} />
                    ))}
                    {!isActive && (
                      <div className="text-center py-3">
                        <p className="text-white/22 text-[10px] font-mono mb-2">
                          +{Math.max(0, signals.length - 4)} more locked
                        </p>
                        <button
                          onClick={() => setShowUpgrade(true)}
                          className="text-[#00ff9d] text-xs font-mono underline"
                        >
                          Upgrade →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="24h High"    value={fmtPrice(activePair, liveData.high)} />
                <StatCard label="24h Low"     value={fmtPrice(activePair, liveData.low)} />
                <StatCard label="BUY Signals"  value={signals.filter(s => s.type === 'BUY').length}  accentColor="#00ff9d" />
                <StatCard label="SELL Signals" value={signals.filter(s => s.type === 'SELL').length} accentColor="#ff4d6d" />
              </div>
            </div>
          )}

          {/* ═══ AI SIGNALS ══════════════════════════════════════ */}
          {tab === 'signals' && (
            <div className="space-y-4">

              {/* Lock wall for free users */}
              {!isActive && (
                <div className="bg-[#0d1420] border border-[#00ff9d]/10 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">🔒</div>
                  <h3 className="text-xl font-black mb-2" style={{ fontFamily: "'Syne',system-ui" }}>
                    Premium Feature
                  </h3>
                  <p className="text-white/30 text-sm font-mono mb-5 max-w-sm mx-auto">
                    Upgrade to see all {allSignals.length} signals across BTC, ETH, BNB with full confidence data and history.
                  </p>
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="px-7 py-3 bg-[#00ff9d] text-black font-black text-sm rounded-lg uppercase tracking-wider"
                    style={{ fontFamily: "'Syne',system-ui" }}
                  >
                    Upgrade Now
                  </button>
                </div>
              )}

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total" value={allSignals.length} />
                <StatCard label="BUY"   value={allSignals.filter(s => s.type === 'BUY').length}  accentColor="#00ff9d" />
                <StatCard label="SELL"  value={allSignals.filter(s => s.type === 'SELL').length} accentColor="#ff4d6d" />
              </div>

              {/* Signals per pair */}
              {PAIRS.map(p => {
                const pSigs = sigsByPair[p.sym] ?? [];
                const shown = isActive ? pSigs : pSigs.slice(0, 2);
                return (
                  <div key={p.sym} className="bg-[#0d1420] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center font-black text-xs"
                        style={{ color: p.color, background: p.color + '20' }}
                      >
                        {p.icon}
                      </span>
                      <span className="text-white/60 font-mono font-bold text-sm">{p.label}</span>
                      <span className="ml-auto text-[10px] font-mono text-white/22">
                        {pSigs.length} signals
                      </span>
                    </div>
                    <div className="space-y-2">
                      {shown.slice(-5).reverse().map((sig, i) => (
                        <SignalCard key={i} signal={{ ...sig, pair: p.label }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ SUBSCRIPTION ════════════════════════════════════ */}
          {tab === 'subscription' && (
            <SubTab sub={sub} isActive={isActive} onUpgrade={() => setShowUpgrade(true)} />
          )}

          {/* ═══ PROFILE ═════════════════════════════════════════ */}
          {tab === 'profile' && (
            <ProfileTab user={user} userData={userData} sub={sub} isActive={isActive} />
          )}

        </main>
      </div>

      {/* Upgrade modal */}
      {showUpgrade && (
        <SubscriptionModal
          onClose={() => setShowUpgrade(false)}
          user={user}
          userData={userData}
          setUserData={setUserData}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sub-tab: Subscription
// ─────────────────────────────────────────────────────────────────
const PLANS_INFO = [
  { id: 'monthly',  name: 'Monthly',   price: '₹999',   period: '/month',    color: '#00b4ff' },
  { id: 'biannual', name: '6 Months',  price: '₹4,999', period: '/6 months', color: '#00ff9d', popular: true },
  { id: 'yearly',   name: 'Yearly',    price: '₹7,999', period: '/year',     color: '#c400ff' },
];
const PLAN_FEATURES = ['All AI Signals', 'All 50+ pairs', 'Real-time alerts', 'Priority support'];

function SubTab({ sub, isActive, onUpgrade }) {
  return (
    <div className="space-y-5">
      {/* Current plan status */}
      <div
        className="rounded-xl p-5 border flex items-center justify-between"
        style={{
          background:   isActive ? 'rgba(0,255,157,0.04)' : '#0d1420',
          borderColor:  isActive ? 'rgba(0,255,157,0.20)' : 'rgba(255,255,255,0.06)',
        }}
      >
        <div>
          <p className="text-[10px] font-mono text-white/28 uppercase tracking-widest mb-1">Current Plan</p>
          <p className="text-2xl font-black" style={{ fontFamily: "'Syne',system-ui" }}>
            {isActive ? sub.plan : 'Free'}
          </p>
          {isActive && (
            <p className="text-xs font-mono text-white/28 mt-1">
              Expires {sub.expiryDate} · {sub.daysLeft} days remaining
            </p>
          )}
        </div>
        <PlanBadge plan={sub.plan} active={isActive} />
      </div>

      <h3 className="text-xl font-black tracking-tight" style={{ fontFamily: "'Syne',system-ui" }}>
        Choose a Plan
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS_INFO.map(plan => (
          <div
            key={plan.id}
            className="relative bg-[#0d1420] rounded-xl p-6 flex flex-col border"
            style={{ borderColor: plan.popular ? plan.color + '45' : 'rgba(255,255,255,0.07)' }}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span
                  className="px-3 py-0.5 text-black text-[9px] font-black rounded-full uppercase tracking-widest"
                  style={{ background: plan.color }}
                >
                  Best Value
                </span>
              </div>
            )}
            <div className="text-sm font-black mb-1" style={{ fontFamily: "'Syne',system-ui" }}>
              {plan.name}
            </div>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black" style={{ fontFamily: "'Syne',system-ui", color: plan.color }}>
                {plan.price}
              </span>
              <span className="text-white/25 text-xs font-mono">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {PLAN_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/48">
                  <span className="text-[10px]" style={{ color: plan.color }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onUpgrade}
              className="w-full py-3 rounded-lg font-black text-sm uppercase tracking-wider transition-all"
              style={plan.popular
                ? { background: plan.color, color: '#000', boxShadow: `0 0 24px ${plan.color}22` }
                : { border: `1px solid ${plan.color}45`, color: plan.color, background: 'transparent' }
              }
            >
              Subscribe — {plan.price}
            </button>
          </div>
        ))}
      </div>
      <p className="text-center text-white/18 text-xs font-mono">
        Payments via Razorpay · Secure &amp; encrypted · Cancel anytime
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Sub-tab: Profile
// ─────────────────────────────────────────────────────────────────
function ProfileTab({ user, userData, sub, isActive }) {
  const fields = [
    { label: 'Full Name',     value: userData?.name   ?? '—',              icon: '◎' },
    { label: 'Email Address', value: userData?.email  ?? user?.email ?? '—', icon: '◈' },
    { label: 'Mobile Number', value: userData?.mobile ?? '—',              icon: '◉' },
    {
      label: 'Member Since',
      value: userData?.createdAt?.toDate
        ? userData.createdAt.toDate().toLocaleDateString('en-IN')
        : '—',
      icon: '◇',
    },
    {
      label: 'Subscription',
      value: isActive ? `${sub.plan} (expires ${sub.expiryDate})` : 'Free plan',
      icon: '★',
    },
  ];

  return (
    <div className="max-w-lg space-y-4">
      {/* Avatar card */}
      <div className="bg-[#0d1420] border border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/5">
          <div
            className="w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl font-black flex-shrink-0"
            style={{ background: 'rgba(0,255,157,0.1)', borderColor: 'rgba(0,255,157,0.2)', color: '#00ff9d', fontFamily: "'Syne',system-ui" }}
          >
            {(userData?.name ?? 'T').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-xl font-black tracking-tight" style={{ fontFamily: "'Syne',system-ui" }}>
              {userData?.name ?? 'Trader'}
            </div>
            <div className="mt-1.5">
              <PlanBadge plan={sub.plan} active={isActive} />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {fields.map(f => (
            <div key={f.label} className="flex items-center gap-3 bg-[#080c14] border border-white/5 rounded-lg px-4 py-3">
              <span className="text-white/20 text-base w-5 text-center flex-shrink-0">{f.icon}</span>
              <div className="min-w-0">
                <p className="text-[9px] font-mono text-white/22 uppercase tracking-widest">{f.label}</p>
                <p className="text-sm font-mono text-white/62 mt-0.5 truncate">{f.value}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-5 w-full py-3 border border-white/8 rounded-lg text-sm font-mono text-white/28 hover:text-white hover:border-white/18 transition-all">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
