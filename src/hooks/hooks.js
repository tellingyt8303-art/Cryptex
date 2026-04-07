/**
 * hooks.js — All custom React hooks
 * ─────────────────────────────────────────────────────────────────
 * Exports:
 *   useLivePrices    — Binance WebSocket live ticker (auto-fallback to mock)
 *   useCandles       — OHLCV candle data per symbol
 *   useAISignals     — AI BUY/SELL signal generator
 *   useSubscription  — Parse subscription status from userData
 */

import { useState, useEffect, useRef, useMemo } from 'react';

// ─────────────────────────────────────────────────────────────────
// useLivePrices
// Connects to Binance WebSocket streams. Falls back to mock if WS fails.
//
// Production WebSocket URL:
//   wss://stream.binance.com:9443/ws/<symbol>@ticker
// ─────────────────────────────────────────────────────────────────
export function useLivePrices(symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']) {
  const [prices, setPrices] = useState({
    BTCUSDT: { price: 68450, change24h:  2.31, high: 69200, low: 67100, volume: '28.4B' },
    ETHUSDT: { price: 3524,  change24h: -0.84, high: 3610,  low: 3490,  volume: '14.2B' },
    BNBUSDT: { price: 601.2, change24h:  1.15, high: 615,   low: 592,   volume: '1.8B'  },
  });

  const mockTimers = useRef({});
  const wsRefs     = useRef({});

  useEffect(() => {
    symbols.forEach(sym => {
      try {
        const ws = new WebSocket(
          `wss://stream.binance.com:9443/ws/${sym.toLowerCase()}@ticker`
        );

        ws.onmessage = (e) => {
          const d = JSON.parse(e.data);
          setPrices(prev => ({
            ...prev,
            [sym]: {
              price:     parseFloat(d.c),
              change24h: parseFloat(d.P),
              high:      parseFloat(d.h),
              low:       parseFloat(d.l),
              volume:    fmtVol(parseFloat(d.v) * parseFloat(d.c)),
            },
          }));
        };

        // If WebSocket fails → start mock simulation
        ws.onerror = () => startMock(sym, setPrices, mockTimers);
        ws.onclose = () => {};

        wsRefs.current[sym] = ws;
      } catch (_) {
        startMock(sym, setPrices, mockTimers);
      }
    });

    return () => {
      // Cleanup WebSockets
      Object.values(wsRefs.current).forEach(ws => {
        try { ws.close(); } catch (_) {}
      });
      // Cleanup mock timers
      Object.values(mockTimers.current).forEach(t => clearInterval(t));
    };
  }, []); // eslint-disable-line

  return prices;
}

/** Simulate realistic price movement when Binance WS is unavailable */
function startMock(sym, setPrices, mockTimers) {
  if (mockTimers.current[sym]) return; // already running
  const BASE = { BTCUSDT: 68450, ETHUSDT: 3524, BNBUSDT: 601.2 };
  mockTimers.current[sym] = setInterval(() => {
    setPrices(prev => {
      const cur    = prev[sym]?.price ?? BASE[sym];
      const drift  = (Math.random() - 0.495) * 0.003;
      const np     = cur * (1 + drift);
      const dec    = sym === 'BTCUSDT' ? 0 : sym === 'ETHUSDT' ? 1 : 2;
      return {
        ...prev,
        [sym]: {
          ...prev[sym],
          price:     parseFloat(np.toFixed(dec)),
          change24h: parseFloat(((prev[sym]?.change24h ?? 0) + (Math.random() - 0.5) * 0.05).toFixed(2)),
        },
      };
    });
  }, 1000 + Math.random() * 500);
}

function fmtVol(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  return v.toFixed(0);
}

// ─────────────────────────────────────────────────────────────────
// useCandles
// Returns OHLCV candle array for a given symbol.
// Appends a live candle every 5 s from the WebSocket price.
//
// Production: replace with Binance REST API call:
//   GET https://api.binance.com/api/v3/klines
//       ?symbol=BTCUSDT&interval=1h&limit=80
// ─────────────────────────────────────────────────────────────────
export function useCandles(symbol, livePrice) {
  const BASE = { BTCUSDT: 68450, ETHUSDT: 3524, BNBUSDT: 601.2 };
  const cache = useRef({});

  const [candles, setCandles] = useState(() => {
    if (!cache.current[symbol]) {
      cache.current[symbol] = buildCandles(BASE[symbol] ?? 1000, 80);
    }
    return cache.current[symbol];
  });

  // Reset candles when pair changes
  useEffect(() => {
    if (!cache.current[symbol]) {
      cache.current[symbol] = buildCandles(BASE[symbol] ?? 1000, 80);
    }
    setCandles(cache.current[symbol]);
  }, [symbol]); // eslint-disable-line

  // Append live candle every 5 s
  useEffect(() => {
    if (!livePrice) return;
    const t = setInterval(() => {
      setCandles(prev => {
        const last = prev[prev.length - 1];
        const newC = {
          time:  last.time + 3600,
          open:  last.close,
          high:  Math.max(last.close, livePrice) * (1 + Math.random() * 0.003),
          low:   Math.min(last.close, livePrice) * (1 - Math.random() * 0.003),
          close: livePrice,
        };
        const next = [...prev.slice(-79), newC];
        cache.current[symbol] = next;
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [livePrice, symbol]);

  return candles;
}

function buildCandles(base, count) {
  const now = Math.floor(Date.now() / 1000);
  let p = base;
  return Array.from({ length: count }, (_, i) => {
    const open  = p;
    const chg   = (Math.random() - 0.48) * p * 0.022;
    const close = open + chg;
    const high  = Math.max(open, close) + Math.random() * p * 0.007;
    const low   = Math.min(open, close) - Math.random() * p * 0.007;
    p = close;
    return { time: now - (count - i) * 3600, open, high, low, close };
  });
}

// ─────────────────────────────────────────────────────────────────
// useAISignals
// Generates BUY/SELL signals from candle data using simplified
// momentum-crossover logic (5-bar avg vs 14-bar avg).
//
// Production: swap with an API call to your ML backend:
//   POST /api/signals { symbol, candles } → [{ type, time, price, confidence }]
// ─────────────────────────────────────────────────────────────────
export function useAISignals(candles, symbol) {
  return useMemo(() => {
    if (candles.length < 20) return [];
    const out  = [];
    let last   = null;

    for (let i = 14; i < candles.length - 3; i++) {
      const slice5  = candles.slice(i - 4,  i + 1).map(c => c.close);
      const slice14 = candles.slice(i - 13, i + 1).map(c => c.close);
      const avg5    = slice5.reduce((a, b)  => a + b, 0) / slice5.length;
      const avg14   = slice14.reduce((a, b) => a + b, 0) / slice14.length;
      const mom     = (avg5 - avg14) / avg14;

      const c       = candles[i];
      const isGreen = c.close > c.open;
      const body    = Math.abs(c.close - c.open) / c.open;

      if (mom >  0.003 && isGreen  && body > 0.004 && last !== 'BUY'  && Math.random() > 0.28) {
        out.push({ type: 'BUY',  time: c.time, price: c.close, pair: symbol, confidence: Math.floor(75 + Math.random() * 21) });
        last = 'BUY';
      } else if (mom < -0.003 && !isGreen && body > 0.004 && last !== 'SELL' && Math.random() > 0.28) {
        out.push({ type: 'SELL', time: c.time, price: c.close, pair: symbol, confidence: Math.floor(72 + Math.random() * 23) });
        last = 'SELL';
      }
    }
    return out;
  }, [candles, symbol]);
}

// ─────────────────────────────────────────────────────────────────
// useSubscription
// Parses subscription object from Firestore userData and returns
// convenience flags used throughout the dashboard.
// ─────────────────────────────────────────────────────────────────
export function useSubscription(userData) {
  return useMemo(() => {
    const sub = userData?.subscription;
    if (!sub?.expiryDate) return { isActive: false, plan: null, daysLeft: 0 };

    const now    = new Date();
    const expiry = new Date(sub.expiryDate);
    const active = !!sub.active && expiry > now;
    const days   = active
      ? Math.ceil((expiry - now) / 86400000)
      : 0;

    return {
      isActive:   active,
      plan:       sub.plan   ?? null,
      planId:     sub.planId ?? null,
      daysLeft:   days,
      expiryDate: sub.expiryDate ?? null,
    };
  }, [userData]);
}
