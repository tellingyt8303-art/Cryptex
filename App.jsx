/**
 * App.jsx — Root component
 * Handles: Firebase auth state, routing, page guard
 */

import { useState, useEffect }                            from 'react';
import { onAuthStateChanged }                             from 'firebase/auth';
import { doc, getDoc }                                    from 'firebase/firestore';
import { auth, db }                                       from './firebase/config';

import HomePage                                           from './pages/HomePage';
import { LoginPage, SignupPage }                          from './pages/AuthPages';
import DashboardPage                                      from './pages/DashboardPage';
import { PricingPage, AboutPage,
         TermsPage, PrivacyPage, SupportPage }            from './pages/StaticPages';
import Navbar                                             from './components/Navbar';
import { LoadingScreen }                                  from './components/Components';

export default function App() {
  const [user, setUser]         = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState('home');

  // Listen for Firebase auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid));
          if (snap.exists()) setUserData(snap.data());
        } catch (e) {
          console.error('Firestore read error:', e);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Redirect unauthenticated users away from dashboard
  useEffect(() => {
    if (!loading && !user && page === 'dashboard') setPage('login');
  }, [user, loading, page]);

  const navigate = (p) => {
    if (p === 'dashboard' && !user) { setPage('login'); return; }
    setPage(p);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setUserData(null);
    setPage('home');
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#080c14] text-white" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      {page !== 'dashboard' && (
        <Navbar page={page} navigate={navigate} user={user} onLogout={handleLogout} />
      )}

      {page === 'home'      && <HomePage   navigate={navigate} user={user} />}
      {page === 'login'     && <LoginPage  navigate={navigate} setUser={setUser} setUserData={setUserData} />}
      {page === 'signup'    && <SignupPage navigate={navigate} setUser={setUser} setUserData={setUserData} />}
      {page === 'dashboard' && (
        <DashboardPage
          navigate={navigate} user={user}
          userData={userData}  setUserData={setUserData}
          onLogout={handleLogout}
        />
      )}
      {page === 'pricing'  && <PricingPage navigate={navigate} user={user} />}
      {page === 'about'    && <AboutPage   navigate={navigate} />}
      {page === 'terms'    && <TermsPage   navigate={navigate} />}
      {page === 'privacy'  && <PrivacyPage navigate={navigate} />}
      {page === 'support'  && <SupportPage navigate={navigate} />}
    </div>
  );
}
