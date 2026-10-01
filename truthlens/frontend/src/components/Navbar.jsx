import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  History, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar() {
  const [healthStatus, setHealthStatus] = useState({
    loading: true,
    connected: false,
    service: null,
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const verifyBackendStatus = async () => {
    setHealthStatus(prev => ({ ...prev, loading: true }));
    const result = await checkHealth();
    if (result.connected && result.data) {
      setHealthStatus({
        loading: false,
        connected: true,
        service: result.data.service || 'truthlens-backend',
      });
    } else {
      setHealthStatus({
        loading: false,
        connected: false,
        service: null,
      });
    }
  };

  useEffect(() => {
    verifyBackendStatus();
    // Periodic check every 30 seconds
    const interval = setInterval(verifyBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('verify-workspace');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#verify-workspace');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <NavLink 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-900/40 group-hover:bg-sky-500 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-white">TruthLens</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    Phase 2
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Evidence-Based News &amp; Claim Verification</p>
              </div>
            </NavLink>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <span>Home</span>
            </NavLink>

            <button
              type="button"
              onClick={handleVerifyClick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Verify Claim</span>
            </button>

            <NavLink
              to="/results"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Activity className="w-4 h-4" />
              <span>Results</span>
            </NavLink>

            <NavLink
              to="/history"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 border border-slate-700/80'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </NavLink>
          </nav>

          {/* Right Area: Status and Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Backend Status Indicator */}
            <button
              onClick={verifyBackendStatus}
              title="Click to re-check backend /api/health status"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono border bg-slate-950/70 transition-colors hover:bg-slate-950 border-slate-800 cursor-pointer"
            >
              <span className="text-slate-400 text-[11px] hidden lg:inline">Backend:</span>
              {healthStatus.loading ? (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Checking...
                </span>
              ) : healthStatus.connected ? (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Offline</span>
                </span>
              )}
            </button>

            {/* Mobile menu hamburger button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1 bg-slate-900/95">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Home
            </NavLink>

            <button
              type="button"
              onClick={handleVerifyClick}
              className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/60"
            >
              <FileText className="w-4 h-4" />
              <span>Verify Claim</span>
            </button>

            <NavLink
              to="/results"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              Results Presentation
            </NavLink>

            <NavLink
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-slate-800 text-sky-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              History Placeholder
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
