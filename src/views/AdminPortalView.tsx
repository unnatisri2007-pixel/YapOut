import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Server,
  Database,
  Terminal,
  Activity,
  Trash2,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Play,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Layers,
  Users,
  Search,
  Sliders,
  Sparkles,
  Download,
  ShieldCheck,
  Smartphone,
  UserCheck,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Hangout, GemmaRuntimeStatus, AdminMetrics, AdminReportItem, AdminVerificationItem } from '../types';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { useToast } from '../context/ToastContext';

interface AdminPortalViewProps {
  hangouts: Hangout[];
  onRefreshHangouts: () => void;
  onOpenHangoutDetails: (hangout: Hangout) => void;
  adminToken?: string;
  adminUser?: { id: string; email: string; name: string; handle: string; role: string } | null;
  onLogout?: () => void;
  onReturnToApp?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  hangouts,
  onRefreshHangouts,
  onOpenHangoutDetails,
  adminToken,
  adminUser,
  onLogout,
  onReturnToApp,
}) => {
  const { showToast } = useToast();
  const [activeAdminTab, setActiveAdminTab] = useState<
    'overview' | 'hangouts' | 'reports' | 'verifications' | 'gemma' | 'database' | 'api'
  >('overview');

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [verifications, setVerifications] = useState<AdminVerificationItem[]>([]);
  const [verificationSearch, setVerificationSearch] = useState('');
  const [rawDb, setRawDb] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Authenticated admin fetch wrapper
  const adminFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    if (adminToken) {
      headers.set('Authorization', `Bearer ${adminToken}`);
    }
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 || res.status === 403) {
      showToast('Administrator session expired or unauthorized. Please re-authenticate.', 'error');
      onLogout?.();
    }
    return res;
  };

  // Gemma config state
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemma-4');
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Gemma Diagnostic Tester state
  const [testLocation, setTestLocation] = useState('Brooklyn Navy Yard');
  const [testVibe, setTestVibe] = useState('Hardware Hackathon & Late Night Tacos');
  const [testResult, setTestResult] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [isTestingGemma, setIsTestingGemma] = useState(false);

  // Hangout management filter
  const [hangoutSearch, setHangoutSearch] = useState('');

  // Fetch admin dashboard data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, reportsRes, verifsRes, rawDbRes, rawConfigRes] = await Promise.all([
        adminFetch('/api/admin/metrics'),
        adminFetch('/api/admin/reports'),
        adminFetch('/api/admin/verifications'),
        adminFetch('/api/admin/database'),
        adminFetch('/api/admin/gemma/raw-config'),
      ]);

      const [metricsData, reportsData, verifsData, rawDbData, rawConfigData] = await Promise.all([
        metricsRes.json(),
        reportsRes.json(),
        verifsRes.json(),
        rawDbRes.json(),
        rawConfigRes.json(),
      ]);

      if (metricsData.success) setMetrics(metricsData.data);
      if (reportsData.success) setReports(reportsData.data);
      if (verifsData.success) setVerifications(verifsData.data);
      if (rawDbData.success) setRawDb(rawDbData.data);
      if (rawConfigData.success && rawConfigData.data) {
        setEndpointUrl(rawConfigData.data.endpointUrl || '');
        setModelName(rawConfigData.data.modelName || 'gemma-4');
        setTimeoutMs(rawConfigData.data.timeoutMs || 30000);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      showToast('Error loading admin portal data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminToken]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Delete Hangout Action
  const handleDeleteHangout = async (hangoutId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await adminFetch(`/api/admin/hangouts/${hangoutId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Hangout deleted from database.', 'success');
        onRefreshHangouts();
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to delete hangout', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting hangout', 'error');
    }
  };

  // Resolve Report Action
  const handleResolveReport = async (reportId: string, action: 'dismissed' | 'deleted_hangout') => {
    try {
      const res = await adminFetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          action === 'dismissed' ? 'Report marked as dismissed.' : 'Hangout taken down & report resolved.',
          'success'
        );
        onRefreshHangouts();
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to resolve report', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error resolving report', 'error');
    }
  };

  // Verification Moderation Handlers
  const handleApproveVerification = async (userId: string, userName: string) => {
    try {
      const res = await adminFetch(`/api/admin/verifications/${userId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Approved ID verification for ${userName}! Badge is now live.`, 'success');
        onRefreshHangouts();
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to approve verification', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error approving verification', 'error');
    }
  };

  const handleRejectVerification = async (userId: string, userName: string) => {
    const reason = prompt(`Enter rejection reason for ${userName}:`, 'Document unreadable or name mismatch');
    if (!reason) return;

    try {
      const res = await adminFetch(`/api/admin/verifications/${userId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Verification for ${userName} rejected. Reason recorded.`, 'info');
        onRefreshHangouts();
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to reject verification', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error rejecting verification', 'error');
    }
  };

  const handleResetVerification = async (userId: string, userName: string) => {
    if (!confirm(`Reset verification status and attempts for ${userName}?`)) return;

    try {
      const res = await adminFetch(`/api/admin/verifications/${userId}/reset`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Verification status reset for ${userName}.`, 'info');
        onRefreshHangouts();
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to reset verification', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error resetting verification', 'error');
    }
  };

  // Save Gemma Config
  const handleSaveGemmaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingConfig(true);
    try {
      const res = await adminFetch('/api/admin/gemma/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl,
          apiKey,
          modelName,
          timeoutMs,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Gemma 4 runtime configuration updated!', 'success');
        fetchAdminData();
      } else {
        showToast(data.error || 'Failed to update config', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating config', 'error');
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  // Run Diagnostic Test
  const handleRunDiagnosticTest = async () => {
    setIsTestingGemma(true);
    setTestResult(null);
    setTestLatency(null);

    try {
      const res = await adminFetch('/api/admin/gemma/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupSize: 4,
          vibes: [testVibe],
          budget: '$$',
          timeOfDay: 'Evening',
          durationHours: 3,
          environment: 'Hybrid',
          location: testLocation,
          notes: 'Admin diagnostic run verification',
        }),
      });
      const data = await res.json();
      setTestLatency(data.latencyMs);
      if (data.success) {
        setTestResult(data.data);
        showToast(`Diagnostic completed in ${data.latencyMs}ms!`, 'success');
      } else {
        setTestResult({ error: data.error });
        showToast('Diagnostic failed: ' + data.error, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error testing Gemma', 'error');
    } finally {
      setIsTestingGemma(false);
    }
  };

  // Reset DB
  const handleResetDatabase = async () => {
    if (!confirm('Reset entire in-memory database back to initial 6 curated sample hangouts?')) return;

    try {
      const res = await adminFetch('/api/admin/database/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Database reset to initial seed!', 'success');
        onRefreshHangouts();
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Error resetting database', 'error');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    if (!rawDb) return;
    const blob = new Blob([JSON.stringify(rawDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yapout-data-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database JSON exported!', 'success');
  };

  const filteredHangouts = hangouts.filter(
    (h) =>
      h.title.toLowerCase().includes(hangoutSearch.toLowerCase()) ||
      h.location.neighborhood.toLowerCase().includes(hangoutSearch.toLowerCase()) ||
      h.host.name.toLowerCase().includes(hangoutSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Portal Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#232736] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#a855f7]/20 text-[#bef264] border border-[#a855f7]/40 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
              Verified Administrator Portal
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Port: 3000 · Protected REST Endpoints
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            YapOut Moderation & Admin Portal
          </h1>
          <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
            <span>
              Operator: <strong className="text-white">{adminUser?.name || 'Administrator'}</strong> ({adminUser?.email || 'admin@yapout.com'})
            </span>
            <span>•</span>
            <span className="text-[#c084fc] font-mono">Role: {adminUser?.role?.toUpperCase() || 'ADMIN'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
          {onReturnToApp && (
            <button
              onClick={onReturnToApp}
              className="btn-genz-dark rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#B99AFF]" />
              <span>Public App</span>
            </button>
          )}
          <button
            onClick={fetchAdminData}
            aria-label="Refresh admin data"
            className="btn-genz-dark w-9 h-9 rounded-xl flex items-center justify-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C9FF59]' : 'text-gray-300'}`} />
          </button>
          <button
            onClick={handleExportJson}
            className="btn-genz-blue rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#12131A] stroke-[2.5]" />
            <span>Export DB</span>
          </button>
          <button
            onClick={handleResetDatabase}
            className="btn-genz-danger rounded-xl px-3.5 py-2 text-xs"
          >
            Reset Seed Data
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-genz-pink rounded-xl px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <span>Sign Out & Lock</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Total Hangouts
          </span>
          <p className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {metrics?.totalHangouts ?? hangouts.length}
          </p>
          <span className="text-[11px] text-gray-500">Active public events</span>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Total RSVPs
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#bef264] tabular-nums">
            {metrics?.totalActiveRSVPs ?? 0}
          </p>
          <span className="text-[11px] text-gray-500">Confirmed spots</span>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Spots Open
          </span>
          <p className="text-2xl font-extrabold font-mono text-white tabular-nums">
            {metrics?.totalSpotsAvailable ?? 0}
          </p>
          <span className="text-[11px] text-gray-500">Capacity remaining</span>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Verified Users
          </span>
          <p className="text-2xl font-extrabold font-mono text-[#c084fc] tabular-nums">
            {metrics?.verifiedUsersCount ?? 0}
          </p>
          <span className="text-[11px] text-gray-500">
            {(metrics?.pendingVerificationsCount || 0) > 0 ? (
              <span className="text-amber-400 font-bold">{metrics?.pendingVerificationsCount} pending review</span>
            ) : (
              'Trust network active'
            )}
          </span>
        </div>

        <div className="p-4 bg-[#141620] border border-[#232736] rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Safety Reports
          </span>
          <p className={`text-2xl font-extrabold font-mono tabular-nums ${
            (metrics?.pendingReportsCount || 0) > 0 ? 'text-amber-400' : 'text-gray-400'
          }`}>
            {metrics?.pendingReportsCount ?? 0}
          </p>
          <span className="text-[11px] text-gray-500">Pending review</span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 bg-[#141620] border border-[#232736] rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">
            Gemma 4 Runtime
          </span>
          <div className="flex items-center gap-2 pt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                metrics?.gemmaStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <p className="text-xs font-bold text-white font-mono uppercase">
              {metrics?.gemmaStatus?.configured ? 'Live' : 'Simulated'}
            </p>
          </div>
          <span className="text-[11px] text-gray-500 truncate block">
            {metrics?.gemmaStatus?.endpointUrl || 'Simulated Mode'}
          </span>
        </div>
      </div>

      {/* Admin Module Tabs (Segmented control) */}
      <div className="flex items-center gap-2 p-1.5 bg-[#141620] border-2 border-[#232736] rounded-2xl overflow-x-auto scrollbar-none shadow-[2px_2px_0px_#090a0f]">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: Activity, variant: 'btn-genz-lavender' },
          { id: 'hangouts', label: `Hangouts (${hangouts.length})`, icon: Layers, variant: 'btn-genz-lime' },
          { id: 'verifications', label: `Verifications (${verifications.length})`, icon: ShieldCheck, variant: 'btn-genz-blue' },
          { id: 'reports', label: `Safety Queue (${reports.length})`, icon: AlertTriangle, variant: 'btn-genz-pink' },
          { id: 'gemma', label: 'Gemma 4 Controller', icon: Cpu, variant: 'btn-genz-yellow' },
          { id: 'database', label: 'Raw Store Inspector', icon: Database, variant: 'btn-genz-lavender' },
          { id: 'api', label: 'REST API & cURL', icon: Terminal, variant: 'btn-genz-blue' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                isActive
                  ? tab.variant
                  : 'text-gray-400 hover:text-white font-semibold'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions Panel */}
            <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#bef264]" /> Administrative Quick Actions
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Direct controls to test endpoints, audit moderation queues, and reconfigure model parameters:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveAdminTab('gemma')}
                  className="p-3.5 rounded-xl bg-[#0e1017] border border-[#232736] hover:border-[#a855f7] text-left transition-all group"
                >
                  <span className="text-xs font-bold text-white group-hover:text-[#bef264] block">
                    Gemma 4 Test Runner →
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Send test prompt and inspect JSON latency
                  </span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('reports')}
                  className="p-3.5 rounded-xl bg-[#0e1017] border border-[#232736] hover:border-[#a855f7] text-left transition-all group"
                >
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 block">
                    Safety Reports Queue →
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Review {reports.length} user submissions
                  </span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('api')}
                  className="p-3.5 rounded-xl bg-[#0e1017] border border-[#232736] hover:border-[#a855f7] text-left transition-all group"
                >
                  <span className="text-xs font-bold text-white group-hover:text-[#bef264] block">
                    cURL Endpoint Keys →
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Copy backend queries for terminal access
                  </span>
                </button>

                <button
                  onClick={() => setActiveAdminTab('database')}
                  className="p-3.5 rounded-xl bg-[#0e1017] border border-[#232736] hover:border-[#a855f7] text-left transition-all group"
                >
                  <span className="text-xs font-bold text-white group-hover:text-[#bef264] block">
                    Inspect Raw Data Store →
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Full JSON memory state inspection
                  </span>
                </button>
              </div>
            </div>

            {/* Server & Runtime Health */}
            <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-[#a855f7]" /> Server & Node.js Health
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1017] border border-[#232736]">
                  <span className="text-gray-400">Express Framework Version</span>
                  <span className="font-mono text-white font-semibold">v4.21.2</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1017] border border-[#232736]">
                  <span className="text-gray-400">Development Server</span>
                  <span className="font-mono text-[#bef264] font-semibold">tsx + Vite dev server (port 3000)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1017] border border-[#232736]">
                  <span className="text-gray-400">In-Memory Data Store</span>
                  <span className="font-mono text-white font-semibold">Active ({hangouts.length} records)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1017] border border-[#232736]">
                  <span className="text-gray-400">Inference Architecture</span>
                  <span className="font-mono text-purple-300 font-semibold">Server-Side Adapter (Isolated)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Hangout Fleet Management */}
      {activeAdminTab === 'hangouts' && (
        <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">All Hangouts Fleet</h3>
              <p className="text-xs text-gray-400">Audit attendee limits, host bios, and remove flagged hangouts.</p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={hangoutSearch}
                onChange={(e) => setHangoutSearch(e.target.value)}
                placeholder="Search by title, host, area..."
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0e1017] text-gray-400 uppercase font-mono text-[10px] border-b border-[#232736]">
                <tr>
                  <th className="p-3">Hangout Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Host</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Reports</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232736]/60">
                {filteredHangouts.map((h) => (
                  <tr key={h.id} className="hover:bg-[#181a26] transition-colors">
                    <td className="p-3 font-semibold text-white max-w-xs truncate">
                      {h.title}
                    </td>
                    <td className="p-3 text-[#bef264]">{h.activityCategory}</td>
                    <td className="p-3">{h.host.name}</td>
                    <td className="p-3 font-mono">
                      {h.currentMembersCount} / {h.groupSizeLimit}
                    </td>
                    <td className="p-3">
                      {(h.reportsCount || 0) > 0 ? (
                        <span className="text-red-400 font-bold">{h.reportsCount} report(s)</span>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => onOpenHangoutDetails(h)}
                        className="btn-genz-dark !rounded-xl !px-3 !py-1 text-xs"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDeleteHangout(h.id, h.title)}
                        className="btn-genz-danger !rounded-xl !px-3 !py-1 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Profile Verifications Moderation Queue */}
      {activeAdminTab === 'verifications' && (
        <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-[#c084fc] border border-purple-500/30 uppercase">
                  Identity Moderation Queue
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {verifications.filter((v) => v.identityStatus === 'pending_review').length} pending review
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Profile Trust & Verification Requests</h3>
              <p className="text-xs text-gray-400">
                Audit phone 2FA and approve or reject government ID & biometric liveness submissions.
              </p>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={verificationSearch}
                onChange={(e) => setVerificationSearch(e.target.value)}
                placeholder="Search user name or handle..."
                className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#0e1017] text-gray-400 uppercase font-mono text-[10px] border-b border-[#232736]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Active Badge</th>
                  <th className="p-3">Phone 2FA</th>
                  <th className="p-3">Gov ID Document</th>
                  <th className="p-3">Review Status</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3 text-right">Moderator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232736]/60">
                {verifications
                  .filter(
                    (v) =>
                      v.userName.toLowerCase().includes(verificationSearch.toLowerCase()) ||
                      v.userHandle.toLowerCase().includes(verificationSearch.toLowerCase())
                  )
                  .map((v) => (
                    <tr key={v.userId} className="hover:bg-[#181a26] transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={v.avatar}
                            alt={v.userName}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-white block truncate">{v.userName}</span>
                            <span className="text-[11px] text-gray-400 font-mono truncate block">{v.userHandle}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        {v.tier !== 'none' ? (
                          <VerifiedBadge tier={v.tier} size="xs" showLabel={true} />
                        ) : (
                          <span className="text-gray-500 font-mono text-[11px]">Unverified</span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        {v.phoneVerified ? (
                          <div className="flex items-center gap-1.5 text-[#bef264]">
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>{v.phoneNumberMasked || 'Verified'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Not verified</span>
                        )}
                      </td>

                      <td className="p-3">
                        {v.documentType ? (
                          <span className="font-mono text-xs text-purple-300 capitalize">
                            {v.documentType.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>

                      <td className="p-3">
                        {v.identityStatus === 'pending_review' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Review Required
                          </span>
                        ) : v.status === 'verified' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified ✓
                          </span>
                        ) : v.status === 'failed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            Failed
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px]">Not Started</span>
                        )}
                      </td>

                      <td className="p-3 font-mono text-[11px]">
                        {v.attemptsCount} / 3
                      </td>

                      <td className="p-3 text-right space-x-2">
                        {v.identityStatus === 'pending_review' ? (
                          <>
                            <button
                              onClick={() => handleApproveVerification(v.userId, v.userName)}
                              className="btn-genz-lime !rounded-xl !px-3 !py-1 text-xs"
                            >
                              Approve ID
                            </button>
                            <button
                              onClick={() => handleRejectVerification(v.userId, v.userName)}
                              className="btn-genz-danger !rounded-xl !px-3 !py-1 text-xs"
                            >
                              Reject
                            </button>
                          </>
                        ) : v.tier !== 'none' ? (
                          <button
                            onClick={() => handleResetVerification(v.userId, v.userName)}
                            className="btn-genz-dark !rounded-xl !px-3 !py-1 text-xs"
                          >
                            Reset Badge
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApproveVerification(v.userId, v.userName)}
                            className="btn-genz-lavender !rounded-xl !px-3 !py-1 text-xs"
                          >
                            Grant ID Badge
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Safety & Reports Queue */}
      {activeAdminTab === 'reports' && (
        <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Community Safety & Moderation Queue
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Review reports submitted by users through the report modal on hangout sheets.
            </p>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl bg-[#0e1017] border border-[#232736] space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232736]/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded uppercase font-mono font-bold bg-red-950/40 text-red-300 border border-red-500/30 text-[10px]">
                        {report.reason}
                      </span>
                      <span className="font-semibold text-white text-sm">{report.hangoutTitle}</span>
                    </div>
                    <span className="text-gray-500 font-mono text-[11px]">{report.timestamp}</span>
                  </div>

                  <p className="text-gray-300 leading-relaxed bg-[#141620] p-3 rounded-xl border border-[#232736]/50">
                    "{report.details}"
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-gray-400 text-[11px]">
                      Reporter: {report.userEmail || 'Anonymous attendee'} · Host: {report.hostName}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolveReport(report.id, 'dismissed')}
                        className="btn-genz-dark !rounded-xl !px-3.5 !py-1.5 text-xs"
                      >
                        Dismiss (Valid Event)
                      </button>
                      <button
                        onClick={() => handleResolveReport(report.id, 'deleted_hangout')}
                        className="btn-genz-danger !rounded-xl !px-3.5 !py-1.5 text-xs"
                      >
                        Take Down Hangout
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No pending safety reports</h4>
              <p className="text-xs text-gray-400">Community is respectful and zero reports are currently queued.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Gemma 4 AI Controller */}
      {activeAdminTab === 'gemma' && (
        <div className="space-y-6">
          {/* Config Editor */}
          <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#232736] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#bef264]" /> Gemma 4 Inference Configuration
                </h3>
                <p className="text-xs text-gray-400">
                  Update model endpoint URL and bearer token dynamically without redeploying.
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                  metrics?.gemmaStatus?.configured
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {metrics?.gemmaStatus?.configured ? 'Live' : 'Simulated'}
              </span>
            </div>

            <form onSubmit={handleSaveGemmaConfig} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-300 block">
                  Gemma 4 Endpoint URL (OpenAI-compatible /chat/completions or Ollama)
                </label>
                <input
                  type="text"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  placeholder="e.g., http://localhost:11434/v1/chat/completions or https://api.my-gemma-server.com/v1/chat/completions"
                  className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-[#a855f7]"
                />
                <span className="text-[11px] text-gray-500 block">
                  Leave empty to operate in visibly labeled simulated development mode.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-300 block">API Key / Bearer Token</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="hf_... or secret token"
                    className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#a855f7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-300 block">Model Name Identifier</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="gemma-4"
                    className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#a855f7]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-300 block">Timeout (ms)</label>
                  <input
                    type="number"
                    value={timeoutMs}
                    onChange={(e) => setTimeoutMs(Number(e.target.value))}
                    className="w-full bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingConfig}
                  className="btn-genz-lime rounded-xl px-5 py-2.5 text-xs disabled:opacity-50"
                >
                  {isUpdatingConfig ? 'Updating...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>

          {/* Diagnostic Test Runner */}
          <div className="bg-[#141620] border-2 border-[#232736] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#B99AFF]" /> Diagnostic Inference Test Runner
                </h3>
                <p className="text-xs text-gray-400">
                  Execute an immediate prompt through <code className="text-purple-300">server/gemma-adapter.ts</code> and inspect latency.
                </p>
              </div>

              <button
                onClick={handleRunDiagnosticTest}
                disabled={isTestingGemma}
                className="btn-genz-lavender rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current text-[#12131A]" />
                <span>{isTestingGemma ? 'Executing...' : 'Run Test Ping'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                value={testVibe}
                onChange={(e) => setTestVibe(e.target.value)}
                placeholder="Test vibe (e.g. Vinyl & Matcha)"
                className="bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white"
              />
              <input
                type="text"
                value={testLocation}
                onChange={(e) => setTestLocation(e.target.value)}
                placeholder="Test location"
                className="bg-[#0c0d12] border border-[#232736] rounded-xl px-3 py-2 text-white"
              />
            </div>

            {testLatency !== null && (
              <div className="p-3 rounded-xl bg-[#0e1017] border border-[#232736] flex items-center justify-between text-xs">
                <span className="text-gray-400">Execution Roundtrip Latency:</span>
                <span className="font-mono text-[#bef264] font-bold">{testLatency} ms</span>
              </div>
            )}

            {testResult && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400">Response Payload Output:</span>
                <pre className="text-xs font-mono text-gray-300 bg-black/60 p-3 rounded-xl overflow-x-auto max-h-64 border border-[#232736]">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Raw Store Inspector */}
      {activeAdminTab === 'database' && (
        <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-[#bef264]" /> In-Memory Database Inspector
              </h3>
              <p className="text-xs text-gray-400">Raw JSON state for hangouts, reports, and current session user.</p>
            </div>
            <button
              onClick={() => copyToClipboard(JSON.stringify(rawDb, null, 2), 'raw-db')}
              className="px-3.5 py-1.5 rounded-xl bg-[#232736] hover:bg-[#2d3246] text-xs font-semibold text-white flex items-center gap-1.5"
            >
              {copiedKey === 'raw-db' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy JSON</span>
            </button>
          </div>

          <pre className="text-xs font-mono text-gray-300 bg-black/60 p-4 rounded-2xl overflow-x-auto max-h-[500px] border border-[#232736]">
            {rawDb ? JSON.stringify(rawDb, null, 2) : 'Loading database dump...'}
          </pre>
        </div>
      )}

      {/* Tab 6: REST API & cURL Generator */}
      {activeAdminTab === 'api' && (
        <div className="bg-[#141620] border border-[#232736] rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#a855f7]" /> Backend REST API Documentation & cURL
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Copy cURL commands directly to query or modify the YapOut backend from your terminal or API clients.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* GET /api/hangouts */}
            <div className="p-4 bg-[#0e1017] border border-[#232736] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">GET</span>
                  <span className="text-white font-bold">/api/hangouts</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      'curl -s http://localhost:3000/api/hangouts | jq .',
                      'curl-get-hangouts'
                    )
                  }
                  className="text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'curl-get-hangouts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy cURL
                </button>
              </div>
              <p className="text-gray-400">Fetch all hangouts with optional query params (?search=..., ?category=..., ?budget=...).</p>
              <pre className="p-2.5 bg-black/40 rounded-lg font-mono text-gray-300 overflow-x-auto">
curl -s http://localhost:3000/api/hangouts | jq .
              </pre>
            </div>

            {/* POST /api/hangouts */}
            <div className="p-4 bg-[#0e1017] border border-[#232736] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">POST</span>
                  <span className="text-white font-bold">/api/hangouts</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
`curl -X POST http://localhost:3000/api/hangouts \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Late Night Matcha & Vinyl","description":"Chill listening session with fresh pour-over matcha and indie beats.","activityCategory":"Coffee & Yap","activityType":"Casual","dateTime":"Saturday at 8:00 PM","locationName":"Kettl Tea Bar","neighborhood":"Greenpoint","budget":"$","groupSizeLimit":6,"tags":["Matcha","Vinyl","LoFi"]}'`,
                      'curl-post-hangout'
                    )
                  }
                  className="text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'curl-post-hangout' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy cURL
                </button>
              </div>
              <p className="text-gray-400">Create a new hangout plan.</p>
            </div>

            {/* POST /api/hangouts/:id/join */}
            <div className="p-4 bg-[#0e1017] border border-[#232736] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">POST</span>
                  <span className="text-white font-bold">/api/hangouts/:id/join</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard('curl -X POST http://localhost:3000/api/hangouts/hangout-2/join', 'curl-join')
                  }
                  className="text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'curl-join' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy cURL
                </button>
              </div>
              <p className="text-gray-400">Join a hangout (validates spot limit and checks for duplicates).</p>
            </div>

            {/* POST /api/gemma/plan */}
            <div className="p-4 bg-[#0e1017] border border-[#232736] rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">POST</span>
                  <span className="text-white font-bold">/api/gemma/plan</span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
`curl -X POST http://localhost:3000/api/gemma/plan \\
  -H "Content-Type: application/json" \\
  -d '{"groupSize":4,"vibes":["Tabletop Board Games","Indie Coffee & Matcha"],"budget":"$","timeOfDay":"Afternoon","durationHours":3,"environment":"Indoor","location":"Lower East Side"}' | jq .`,
                      'curl-gemma-plan'
                    )
                  }
                  className="text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === 'curl-gemma-plan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy cURL
                </button>
              </div>
              <p className="text-gray-400">Generate 3 structured activity suggestions and schedule using the Gemma 4 adapter.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
