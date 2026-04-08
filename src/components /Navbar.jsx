/**
 * Navbar.jsx
 * Fixed top navigation bar shown on all non-dashboard pages.
 * Mobile: hamburger menu.  Desktop: inline links.
 */

import { useState } from 'react';

const LINKS = [
  { label: 'Home',    page: 'home' },
  { label: 'Pricing', page: 'pricing' },
  { label: 'About',   page: 'about' },
  { label: 'Support', page: 'support' },
];

export default function Navbar({ page, navigate, user, onLogout }) {
  const [open, setOpen] = useState(false);

  const go = (p) => { navigate(p); setOpen(false); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080c14]/90 backdrop-blur-xl border-b border-[#00ff9d]/8">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">

        {/* Logo */}
        <button onClick={() => go('home')} className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-[#00ff9d]/40 rounded-md flex items-center justify-center text-[#00ff9d] group-hover:bg-[#00ff9d]/8 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2"  y1="8.5" x2="22" y2="8.5" />
              <line x1="2"  y1="15.5" x2="22" y2="15.5" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Syne',system-ui", fontWeight: 900, fontSize: 17, letterSpacing: -0.5 }}>
            <span className="text-[#00ff9d]">NEXUS</span>
            <span className="text-white/30">PRO</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-7">
          {LINKS.map(l => (
            <button
              key={l.page}
              onClick={() => go(l.page)}
              className={`text-sm font-medium transition-colors relative ${
                page === l.page ? 'text-[#00ff9d]' : 'text-white/45 hover:text-white'
              }`}
            >
              {l.label}
              {page === l.page && (
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#00ff9d] shadow-[0_0_6px_#00ff9d]" />
              )}
            </button>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => go('dashboard')}
                className="px-4 py-2 text-sm font-semibold text-[#00ff9d] border border-[#00ff9d]/35 rounded-md hover:bg-[#00ff9d]/8 transition-all"
              >
                Dashboard
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-white/35 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => go('login')}
                className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => go('signup')}
                className="px-5 py-2 text-sm font-black text-black bg-[#00ff9d] rounded-md hover:bg-[#00ff9d]/90 transition-all shadow-[0_0_20px_#00ff9d30]"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white/50 hover:text-white p-1.5" onClick={() => setOpen(!open)}>
          {open
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#00ff9d]/8 bg-[#080c14]/96 backdrop-blur-xl px-4 py-3 space-y-1">
          {LINKS.map(l => (
            <button
              key={l.page}
              onClick={() => go(l.page)}
              className={`block w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                page === l.page
                  ? 'bg-[#00ff9d]/8 text-[#00ff9d] border border-[#00ff9d]/15'
                  : 'text-white/50 hover:text-white hover:bg-white/4'
              }`}
            >
              {l.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/8 flex gap-2">
            {user ? (
              <>
                <button onClick={() => go('dashboard')} className="flex-1 py-2.5 text-sm font-black text-black bg-[#00ff9d] rounded-md">Dashboard</button>
                <button onClick={() => { onLogout(); setOpen(false); }} className="flex-1 py-2.5 text-sm font-medium text-white/50 border border-white/15 rounded-md">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => go('login')}  className="flex-1 py-2.5 text-sm font-medium text-white/50 border border-white/15 rounded-md">Sign In</button>
                <button onClick={() => go('signup')} className="flex-1 py-2.5 text-sm font-black text-black bg-[#00ff9d] rounded-md">Sign Up</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
