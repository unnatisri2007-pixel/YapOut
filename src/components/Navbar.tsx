import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { UserProfile } from '../types';

export type NavTab = 'feed' | 'discover' | 'planner' | 'create' | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, currentUser }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0c0d12]/95 backdrop-blur-md border-b border-[#232736]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onSelectTab('feed')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0 transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#B99AFF] via-[#FF83C8] to-[#C9FF59] p-0.5 flex items-center justify-center shadow-[2px_2px_0px_#12131A] border border-[#12131A] group-hover:rotate-6 transition-all">
            <div className="w-full h-full bg-[#12131A] rounded-[13px] flex items-center justify-center">
              <span className="text-base font-black tracking-tighter text-[#C9FF59]">Y</span>
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-white whitespace-nowrap">
            Yap<span className="text-[#FF83C8]">Out</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links (Chunky playful interactive pills) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#13151f] border border-[#232736] rounded-full text-xs font-bold">
          <button
            onClick={() => onSelectTab('feed')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'feed'
                ? 'bg-[#C9FF59] text-[#12131A] font-extrabold shadow-[2px_2px_0px_#12131A] border border-[#12131A]'
                : 'text-gray-300 hover:text-white hover:bg-[#1d202e]'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => onSelectTab('discover')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'discover'
                ? 'bg-[#8DE5FF] text-[#12131A] font-extrabold shadow-[2px_2px_0px_#12131A] border border-[#12131A]'
                : 'text-gray-300 hover:text-white hover:bg-[#1d202e]'
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => onSelectTab('planner')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'planner'
                ? 'bg-[#FF83C8] text-[#12131A] font-extrabold shadow-[2px_2px_0px_#12131A] border border-[#12131A]'
                : 'text-gray-300 hover:text-[#FF83C8] hover:bg-[#1d202e]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>AI Planner</span>
          </button>
          <button
            onClick={() => onSelectTab('create')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'create'
                ? 'bg-[#FFD166] text-[#12131A] font-extrabold shadow-[2px_2px_0px_#12131A] border border-[#12131A]'
                : 'text-gray-300 hover:text-white hover:bg-[#1d202e]'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => onSelectTab('profile')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'profile'
                ? 'bg-[#B99AFF] text-[#12131A] font-extrabold shadow-[2px_2px_0px_#12131A] border border-[#12131A]'
                : 'text-gray-300 hover:text-white hover:bg-[#1d202e]'
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Zone 3: Primary Action & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('create')}
            className="btn-genz-lime !rounded-full px-4 py-2 text-xs font-black shadow-[2.5px_2.5px_0px_#12131A] hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Hangout</span>
          </button>

          {/* Quick Profile Avatar click */}
          <button
            onClick={() => onSelectTab('profile')}
            aria-label="View Profile"
            className="relative p-0.5 rounded-full border-2 border-[#12131A] shadow-[2px_2px_0px_#B99AFF] hover:shadow-[3px_3px_0px_#B99AFF] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_#B99AFF] transition-all focus:outline-none"
          >
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
