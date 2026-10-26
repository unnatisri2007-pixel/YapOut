/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar, NavTab } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { FeedView } from './views/FeedView';
import { DiscoverView } from './views/DiscoverView';
import { CreateHangoutView } from './views/CreateHangoutView';
import { AiPlannerView } from './views/AiPlannerView';
import { ProfileView } from './views/ProfileView';
import { AdminPortalApp } from './views/AdminPortalApp';
import { HangoutDetailModal } from './components/HangoutDetailModal';
import { ReportModal } from './components/ReportModal';
import { GemmaRuntimeModal } from './components/GemmaRuntimeModal';
import { VerificationModal } from './components/VerificationModal';
import { Hangout, UserProfile, GemmaRuntimeStatus, HangoutCreateInput, VerificationTier } from './types';

function MainApp() {
  const { showToast } = useToast();

  // Route check for dedicated admin portal isolation
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  });

  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [runtimeStatus, setRuntimeStatus] = useState<GemmaRuntimeStatus | null>(null);

  const [isLoadingHangouts, setIsLoadingHangouts] = useState<boolean>(true);
  const [selectedHangout, setSelectedHangout] = useState<Hangout | null>(null);
  const [reportHangoutId, setReportHangoutId] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [createDraft, setCreateDraft] = useState<Partial<HangoutCreateInput>>({});

  // Verification modal state
  const [verificationModalOpen, setVerificationModalOpen] = useState<boolean>(false);
  const [verificationModalTier, setVerificationModalTier] = useState<VerificationTier>('identity_verified');
  const [verificationModalUser, setVerificationModalUser] = useState<string | undefined>(undefined);

  const handleOpenVerificationModal = (tier: VerificationTier, userName?: string) => {
    setVerificationModalTier(tier);
    setVerificationModalUser(userName);
    setVerificationModalOpen(true);
  };

  // Fetch hangouts
  const fetchHangouts = useCallback(async () => {
    try {
      setIsLoadingHangouts(true);
      const res = await fetch('/api/hangouts');
      const data = await res.json();
      if (data.success) {
        setHangouts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch hangouts:', err);
    } finally {
      setIsLoadingHangouts(false);
    }
  }, []);

  // Fetch current user profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, []);

  // Fetch Gemma 4 runtime status
  const fetchGemmaStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/gemma/status');
      const data = await res.json();
      if (data.success) {
        setRuntimeStatus(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch Gemma 4 status:', err);
    }
  }, []);

  useEffect(() => {
    fetchHangouts();
    fetchProfile();
    fetchGemmaStatus();
  }, [fetchHangouts, fetchProfile, fetchGemmaStatus]);

  // Keep selectedHangout in sync when hangouts list updates
  useEffect(() => {
    if (selectedHangout) {
      const updated = hangouts.find((h) => h.id === selectedHangout.id);
      if (updated) {
        setSelectedHangout(updated);
      }
    }
  }, [hangouts]);

  // Handle RSVP / Join or Leave
  const handleJoinToggle = async (e: React.MouseEvent, hangoutId: string, isCurrentlyJoined: boolean) => {
    e.stopPropagation();
    try {
      const endpoint = isCurrentlyJoined
        ? `/api/hangouts/${hangoutId}/leave`
        : `/api/hangouts/${hangoutId}/join`;

      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setHangouts((prev) => prev.map((h) => (h.id === hangoutId ? data.data : h)));
        showToast(
          isCurrentlyJoined ? 'You left the hangout.' : 'You joined the hangout! See you there ⚡',
          'success'
        );
      } else {
        showToast(data.error || 'Failed to update hangout membership', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Network error', 'error');
    }
  };

  // Handle Bookmark / Save
  const handleSaveToggle = async (e: React.MouseEvent, hangoutId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/hangouts/${hangoutId}/save`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setHangouts((prev) => prev.map((h) => (h.id === hangoutId ? data.data : h)));
        showToast(
          data.data.isSaved ? 'Hangout bookmarked!' : 'Removed from bookmarks.',
          'info'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating bookmark', 'error');
    }
  };

  // Handle Hangout Creation
  const handleHangoutCreated = (newHangout: Hangout) => {
    setHangouts((prev) => [newHangout, ...prev]);
    setSelectedHangout(newHangout);
    setActiveTab('feed');
  };

  // Handle Transfer from Gemma 4 plan to Create form
  const handleSelectActivityForDraft = (draft: Partial<HangoutCreateInput>) => {
    setCreateDraft(draft);
    setActiveTab('create');
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Isolated Admin Portal Route: Render ONLY the Admin Portal App
  if (isAdminRoute) {
    return (
      <AdminPortalApp
        hangouts={hangouts}
        onRefreshHangouts={fetchHangouts}
        onOpenHangoutDetails={setSelectedHangout}
        onReturnToApp={() => {
          window.history.pushState(null, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0d12] text-[#f1f2f6] flex flex-col selection:bg-[#a855f7]/30 selection:text-white">
      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
        {activeTab === 'feed' && (
          <FeedView
            hangouts={hangouts}
            isLoading={isLoadingHangouts}
            onRefresh={fetchHangouts}
            onSelectTab={setActiveTab}
            onOpenDetails={setSelectedHangout}
            onJoinToggle={handleJoinToggle}
            onSaveToggle={handleSaveToggle}
            onBadgeClick={handleOpenVerificationModal}
          />
        )}

        {activeTab === 'discover' && (
          <DiscoverView
            hangouts={hangouts}
            onOpenDetails={setSelectedHangout}
            onJoinToggle={handleJoinToggle}
            onSaveToggle={handleSaveToggle}
            onBadgeClick={handleOpenVerificationModal}
          />
        )}

        {activeTab === 'planner' && (
          <AiPlannerView
            runtimeStatus={runtimeStatus}
            onOpenSetupModal={() => setIsSetupModalOpen(true)}
            onSelectActivityForDraft={handleSelectActivityForDraft}
          />
        )}

        {activeTab === 'create' && (
          <CreateHangoutView
            onHangoutCreated={handleHangoutCreated}
            initialDraft={createDraft}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            hangouts={hangouts}
            onUpdateProfile={setCurrentUser}
            onOpenDetails={setSelectedHangout}
            onJoinToggle={handleJoinToggle}
            onSaveToggle={handleSaveToggle}
            onNavigateToCreate={() => setActiveTab('create')}
            onBadgeClick={handleOpenVerificationModal}
          />
        )}
      </main>

      {/* Mobile Touch Ergonomic Bottom Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Group Detail Sheet / Modal */}
      <HangoutDetailModal
        hangout={selectedHangout}
        onClose={() => setSelectedHangout(null)}
        onJoinToggle={handleJoinToggle}
        onOpenReport={(id) => setReportHangoutId(id)}
        onBadgeClick={handleOpenVerificationModal}
      />

      {/* Report Modal */}
      <ReportModal
        hangoutId={reportHangoutId}
        onClose={() => setReportHangoutId(null)}
      />

      {/* Gemma 4 Setup & Status Modal */}
      <GemmaRuntimeModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        status={runtimeStatus}
      />

      {/* Profile Verification Education Modal */}
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        tier={verificationModalTier}
        userName={verificationModalUser}
        onNavigateToVerificationCenter={() => {
          setVerificationModalOpen(false);
          setActiveTab('profile');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
