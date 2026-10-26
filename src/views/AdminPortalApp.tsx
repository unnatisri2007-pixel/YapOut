import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, AlertTriangle, KeyRound, ArrowLeft, RefreshCw, CheckCircle2, UserX } from 'lucide-react';
import { AdminPortalView } from './AdminPortalView';
import { Hangout } from '../types';
import { useToast } from '../context/ToastContext';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: string;
}

interface AdminPortalAppProps {
  hangouts: Hangout[];
  onRefreshHangouts: () => void;
  onOpenHangoutDetails: (hangout: Hangout) => void;
  onReturnToApp: () => void;
}

const ADMIN_TOKEN_KEY = 'yapout_admin_session_token';

export const AdminPortalApp: React.FC<AdminPortalAppProps> = ({
  hangouts,
  onRefreshHangouts,
  onOpenHangoutDetails,
  onReturnToApp,
}) => {
  const { showToast } = useToast();

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Validate active admin session against the server
  const verifyAdminSession = useCallback(async (tokenToVerify: string | null) => {
    if (!tokenToVerify) {
      setAdminUser(null);
      setIsVerifyingSession(false);
      return;
    }

    try {
      setIsVerifyingSession(true);
      const res = await fetch('/api/admin/session', {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success && data.isAdmin) {
        setAdminUser(data.user);
      } else {
        // Token invalid or role not admin
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setAdminToken(null);
        setAdminUser(null);
      }
    } catch (err) {
      console.error('Session verification error:', err);
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setAdminToken(null);
      setAdminUser(null);
    } finally {
      setIsVerifyingSession(false);
    }
  }, []);

  useEffect(() => {
    verifyAdminSession(adminToken);
  }, [verifyAdminSession, adminToken]);

  // Handle Admin Login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Display server-enforced rejection message
        setLoginError(data.error || 'Administrator login failed.');
        showToast(data.error || 'Access denied', 'error');
        return;
      }

      // Valid admin session created
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setAdminToken(data.token);
      setAdminUser(data.user);
      showToast(`Welcome back, ${data.user.name}. Admin session authenticated.`, 'success');
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Network error connecting to auth server.');
      showToast('Network error during authentication', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = async () => {
    try {
      if (adminToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      setAdminToken(null);
      setAdminUser(null);
      showToast('Administrator session ended. Portal locked.', 'info');
    }
  };

  // Helper presets for testing and owner access
  const fillOwnerCredentials = () => {
    setEmail('unnatisri2007@gmail.com');
    setPassword('AdminYapOut2026!');
    setLoginError(null);
  };

  const fillAdminCredentials = () => {
    setEmail('admin@yapout.com');
    setPassword('AdminYapOut2026!');
    setLoginError(null);
  };

  const fillRegularUserCredentials = () => {
    setEmail('alex@yapout.local');
    setPassword('user123');
    setLoginError(null);
  };

  // If verifying session on initial mount
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center p-6 text-gray-300">
        <RefreshCw className="w-8 h-8 text-[#a855f7] animate-spin mb-4" />
        <p className="text-sm font-mono tracking-wide text-gray-400">
          Verifying server-side administrator authorization...
        </p>
      </div>
    );
  }

  // If authenticated as an administrator on the server, render full AdminPortalView
  if (adminToken && adminUser) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-[#f1f2f6]">
        {/* Dedicated Admin Portal Shell Banner */}
        <div className="bg-[#12141f] border-b border-[#232736] px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">RBAC: ACCESS_GRANTED</span>
              <span className="text-gray-500 hidden sm:inline">|</span>
              <span className="text-gray-400 hidden sm:inline">User ID: {adminUser.id}</span>
              <span className="text-gray-500 hidden sm:inline">|</span>
              <span className="text-purple-300 font-semibold hidden md:inline">Account: {adminUser.email}</span>
            </div>
            <button
              onClick={onReturnToApp}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public App</span>
            </button>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminPortalView
            hangouts={hangouts}
            onRefreshHangouts={onRefreshHangouts}
            onOpenHangoutDetails={onOpenHangoutDetails}
            adminToken={adminToken}
            adminUser={adminUser}
            onLogout={handleAdminLogout}
            onReturnToApp={onReturnToApp}
          />
        </main>
      </div>
    );
  }

  // Otherwise, render the dedicated, isolated Admin Gateway Screen
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f1f2f6] flex flex-col justify-between selection:bg-[#a855f7]/30 selection:text-white">
      {/* Admin Gateway Top Bar */}
      <header className="border-b border-[#1f2333] bg-[#0c0d14]/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-purple-600/20">
              <div className="w-full h-full bg-[#0c0d14] rounded-[10px] flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#bef264]" />
              </div>
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white">
                Yap<span className="text-[#a855f7]">Out</span>
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 font-semibold">
                ADMIN GATEWAY
              </span>
            </div>
          </div>

          <button
            onClick={onReturnToApp}
            className="btn-genz-dark rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#B99AFF] stroke-[2.5]" />
            <span>Return to YapOut App</span>
          </button>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#12141e] border-2 border-[#232736] rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_#12131A] space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border-2 border-[#B99AFF] text-[#C9FF59] mx-auto flex items-center justify-center shadow-[2.5px_2.5px_0px_#12131A]">
              <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              YapOut Admin Portal
            </h1>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Restricted access for safety moderators and systems engineers. Authenticate with an explicitly assigned administrator account.
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border-2 border-red-500/40 text-red-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-0.5">
                <span className="font-bold block">Authorization Denied</span>
                <span className="text-red-200/90">{loginError}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 block">
                Administrator Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yapout.com"
                className="w-full bg-[#0a0b10] border-2 border-[#232736] focus:border-[#B99AFF] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300 block">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a0b10] border-2 border-[#232736] focus:border-[#B99AFF] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-2xl btn-genz-lime text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#12131A]" />
                  <span>Authenticating Role on Server...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-[#12131A] stroke-[2.5]" />
                  <span>Verify Credentials & Enter Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick RBAC Test Presets */}
          <div className="pt-4 border-t-2 border-[#232736]/70 space-y-2.5">
            <span className="text-[11px] font-mono uppercase text-gray-400 tracking-wider block text-center font-bold">
              Testing & RBAC Demonstration Presets
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={fillOwnerCredentials}
                className="p-2.5 rounded-2xl bg-[#161926] hover:bg-[#1e2233] border-2 border-[#B99AFF]/50 text-left transition-all shadow-[2px_2px_0px_#090a0f] hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <div className="flex items-center justify-between text-purple-300 font-extrabold mb-0.5">
                  <span>Owner Admin</span>
                  <CheckCircle2 className="w-3 h-3 text-[#C9FF59]" />
                </div>
                <span className="text-[11px] text-gray-300 block font-mono truncate">unnatisri2007@gmail.com</span>
                <span className="text-[10px] text-gray-500 block">Role: 'admin'</span>
              </button>

              <button
                type="button"
                onClick={fillAdminCredentials}
                className="p-2.5 rounded-2xl bg-[#161926] hover:bg-[#1e2233] border-2 border-[#B99AFF]/30 text-left transition-all shadow-[2px_2px_0px_#090a0f] hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <div className="flex items-center justify-between text-purple-300 font-extrabold mb-0.5">
                  <span>Ops Admin</span>
                  <CheckCircle2 className="w-3 h-3 text-[#C9FF59]" />
                </div>
                <span className="text-[11px] text-gray-400 block font-mono">admin@yapout.com</span>
                <span className="text-[10px] text-gray-500 block">Role: 'admin'</span>
              </button>

              <button
                type="button"
                onClick={fillRegularUserCredentials}
                className="p-2.5 rounded-2xl bg-[#161926] hover:bg-[#1e2233] border-2 border-red-500/30 text-left transition-all shadow-[2px_2px_0px_#090a0f] hover:-translate-y-0.5 active:translate-y-0.5"
              >
                <div className="flex items-center justify-between text-red-300 font-extrabold mb-0.5">
                  <span>Regular User</span>
                  <UserX className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-[11px] text-gray-400 block font-mono">alex@yapout.local</span>
                <span className="text-[10px] text-gray-500 block">Role: 'user' (403)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Gateway Footer */}
      <footer className="border-t border-[#1f2333] px-4 py-3 text-center text-[11px] text-gray-500 font-mono">
        Server Role-Based Access Control Active · Unauthorized attempts logged
      </footer>
    </div>
  );
};
