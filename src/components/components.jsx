/**
 * Components.jsx
 * ─────────────────────────────────────────────────────────────────
 * Exports:
 *   LoadingScreen  — full-screen spinner shown during auth init
 *   CandleChart    — canvas-based OHLCV chart with signal markers
 *   SignalCard     — single BUY/SELL signal row
 *   StatCard       — dashboard stat tile
 *   PlanBadge      — subscription status pill
 */

import { useRef, useEffect } from 'react';

// ── LoadingScreen ─────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#080c14] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative inline-flex">
          <div className="w-16 h-16 border-2 border-[#00ff9d]/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#00ff9d] rounded-full animate-spin" />
        </div>
        <p className="mt-5 text-[#00ff9d]/50 text-xs font-mono tracking-[0.3em] uppercase">
          Initializing...
        </p>
      </div>
    </div>
  );
}

// ── CandleChart ───────────────────────────────────────────────────
/**
 * Canvas-based candlestick chart.
 * No external library — pure HTML5 Canvas for zero-bundle-cost rendering.
 *
 * Props:
 *   candles   Array<{time:number, open, high, low, close}>
 *   signals   Array<{time:number, type:'BUY'|'SELL', price, confidence}>
 *   livePrice number  — draws a gold dashed line + price tag
 */
export function CandleChart({ candles = [], signals = [], livePrice }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    // Handle hi-DPI screens
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const PAD = { top: 16, right: 72, bottom: 28, left: 8 };
    const cW  = W - PAD.left - PAD.right;
    const cH  = H - PAD.top  - PAD.bottom;

    // Background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, W, H);

    // Price scale
    const all  = candles.flatMap(c => [c.high, c.low]);
    let minP   = Math.min(...all);
    let maxP   = Math.max(...all);
    const pPad = (maxP - minP) * 0.08;
    minP -= pPad; maxP += pPad;

    const toX = i => PAD.left + (i / (candles.length - 1)) * cW;
    const toY = p => PAD.top  + ((maxP - p) / (maxP - minP)) * cH;

    // Horizontal grid + price labels
    for (let i = 0; i <= 5; i++) {
      const y = PAD.top + (cH * i) / 5;
      const p = maxP - ((maxP - minP) * i) / 5;
      ctx.beginPath();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth   = 1;
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle  = 'rgba(255,255,255,0.28)';
      ctx.font       = '9px "JetBrains Mono",monospace';
      ctx.textAlign  = 'left';
      ctx.fillText(p > 1000 ? p.toFixed(0) : p.toFixed(3), W - PAD.right + 5, y + 3);
    }

    // Area under close line
    const areaGrad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + cH);
    areaGrad.addColorStop(0, 'rgba(0,255,157,0.10)');
    areaGrad.addColorStop(1, 'rgba(0,255,157,0.00)');
    ctx.beginPath();
    candles.forEach((c, i) =>
      i === 0 ? ctx.moveTo(toX(i), toY(c.close)) : ctx.lineTo(toX(i), toY(c.close))
    );
    ctx.lineTo(toX(candles.length - 1), PAD.top + cH);
    ctx.lineTo(toX(0), PAD.top + cH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Candlestick bodies & wicks
    const cndW = Math.max(2, Math.floor(cW / candles.length) - 1);
    candles.forEach((c, i) => {
      const x     = toX(i);
      const isUp  = c.close >= c.open;
      const color = isUp ? '#00ff9d' : '#ff4d6d';

      // Wick
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1;
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      // Body
      const bTop = toY(Math.max(c.open, c.close));
      const bH   = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
      ctx.globalAlpha = isUp ? 0.85 : 0.70;
      ctx.fillStyle   = color;
      ctx.fillRect(x - cndW / 2, bTop, cndW, bH);
      ctx.globalAlpha = 1;
    });

    // BUY / SELL signal markers
    signals.forEach(sig => {
      const idx = candles.findIndex(c => c.time === sig.time);
      if (idx === -1) return;
      const x     = toX(idx);
      const isBuy = sig.type === 'BUY';
      const color = isBuy ? '#00ff9d' : '#ff4d6d';
      const y     = isBuy
        ? toY(candles[idx].low)  + 18
        : toY(candles[idx].high) - 18;

      // Glow halo
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 13);
      grd.addColorStop(0, color + '55');
      grd.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Arrow
      ctx.beginPath();
      ctx.fillStyle = color;
      if (isBuy) {
        ctx.moveTo(x,     y + 7);
        ctx.lineTo(x - 5, y - 1);
        ctx.lineTo(x + 5, y - 1);
      } else {
        ctx.moveTo(x,     y - 7);
        ctx.lineTo(x - 5, y + 1);
        ctx.lineTo(x + 5, y + 1);
      }
      ctx.closePath();
      ctx.fill();

      // Text label
      ctx.fillStyle  = color;
      ctx.font       = 'bold 7px monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(isBuy ? 'BUY' : 'SELL', x, isBuy ? y - 5 : y + 12);
    });

    // Live price dashed line + tag
    if (livePrice) {
      const y = toY(livePrice);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth   = 1;
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(W - PAD.right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ffd700';
      ctx.fillRect(W - PAD.right + 1, y - 9, PAD.right - 3, 18);
      ctx.fillStyle  = '#000';
      ctx.font       = 'bold 8px monospace';
      ctx.textAlign  = 'center';
      ctx.fillText(
        livePrice > 1000 ? livePrice.toFixed(0) : livePrice.toFixed(3),
        W - PAD.right + (PAD.right - 3) / 2, y + 3
      );
    }
  }, [candles, signals, livePrice]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

// ── SignalCard ────────────────────────────────────────────────────
export function SignalCard({ signal }) {
  const isBuy = signal.type === 'BUY';
  const col   = isBuy ? '#00ff9d' : '#ff4d6d';
  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-lg border"
      style={{
        background:   isBuy ? 'rgba(0,255,157,0.04)' : 'rgba(255,77,109,0.04)',
        borderColor:  isBuy ? 'rgba(0,255,157,0.20)' : 'rgba(255,77,109,0.20)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-7 h-7 rounded flex items-center justify-center text-xs font-black"
          style={{ background: col + '22', color: col }}
        >
          {isBuy ? '▲' : '▼'}
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-wider" style={{ color: col }}>
              {signal.type}
            </span>
            {signal.pair && (
              <span className="text-xs font-mono text-white/30">{signal.pair}</span>
            )}
          </div>
          <div className="text-[10px] font-mono text-white/25 mt-0.5">
            {new Date(signal.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-white/75 text-xs font-mono font-bold">
          ${signal.price > 1000
            ? signal.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
            : signal.price.toFixed(4)}
        </div>
        <div
          className="text-[10px] font-mono mt-0.5"
          style={{ color: signal.confidence >= 85 ? '#00ff9d' : signal.confidence >= 70 ? '#ffd700' : 'rgba(255,255,255,0.35)' }}
        >
          {signal.confidence}% conf
        </div>
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accentColor }) {
  return (
    <div className="bg-[#0d1420] border border-white/5 rounded-xl p-4 hover:border-[#00ff9d]/15 transition-colors">
      <div className="text-white/35 text-[10px] font-mono uppercase tracking-[0.12em] mb-2">{label}</div>
      <div className="text-2xl font-black" style={{ fontFamily: "'Syne',system-ui", color: accentColor || '#fff' }}>
        {value}
      </div>
      {sub && <div className="text-white/25 text-[11px] font-mono mt-1">{sub}</div>}
    </div>
  );
}

// ── PlanBadge ─────────────────────────────────────────────────────
export function PlanBadge({ plan, active }) {
  if (!active || !plan) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-white/35">
        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
        FREE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#00ff9d]/10 border border-[#00ff9d]/30 rounded-full text-[10px] font-mono text-[#00ff9d]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
      {plan.toUpperCase()} — ACTIVE
    </span>
  );
}
