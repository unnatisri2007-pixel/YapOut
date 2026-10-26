import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Sparkles, Plus, Calendar, Compass, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { Hangout, HangoutCategory, VerificationTier } from '../types';
import { HangoutCard } from '../components/HangoutCard';
import { NavTab } from '../components/Navbar';

interface FeedViewProps {
  hangouts: Hangout[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenDetails: (hangout: Hangout) => void;
  onJoinToggle: (e: React.MouseEvent, hangoutId: string, isCurrentlyJoined: boolean) => void;
  onSaveToggle: (e: React.MouseEvent, hangoutId: string) => void;
  onBadgeClick?: (tier: VerificationTier, userName?: string) => void;
}

const CATEGORIES: ('All' | HangoutCategory)[] = [
  'All',
  'Coffee & Yap',
  'Bouldering & Climbing',
  'Board Games',
  'Foodie & Night Market',
  'Indie Cinema & Arts',
  'Outdoor & Hiking',
  'Creative & Jamming',
];

export const FeedView: React.FC<FeedViewProps> = ({
  hangouts,
  isLoading,
  onRefresh,
  onSelectTab,
  onOpenDetails,
  onJoinToggle,
  onSaveToggle,
  onBadgeClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | HangoutCategory>('All');

  const filteredHangouts = hangouts.filter((h) => {
    const matchesCategory = selectedCategory === 'All' || h.activityCategory === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Community Banner */}
      <section className="relative rounded-3xl overflow-hidden border border-[#232736] bg-[#141620] shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_hangout_community_1792683954659.jpg"
            alt="YapOut Hangout Community"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/80 to-transparent" />
        </div>

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bef264]/10 border border-[#bef264]/30 text-[#bef264] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real Connections, Zero Small Talk Drag</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
            Find your crowd. Plan your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] to-[#bef264]">social yap</span>.
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
            Discover upcoming local hangouts, join activity groups with available spots, or let Gemma 4 build the perfect custom group itinerary.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('discover')}
              className="btn-genz-lime rounded-full px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#12131A] stroke-[2.5]" />
              <span>Find Your People</span>
            </button>
            <button
              onClick={() => onSelectTab('planner')}
              className="btn-genz-pink rounded-full px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#12131A] stroke-[2.5]" />
              <span>Match My Vibe</span>
            </button>
            <button
              onClick={() => onSelectTab('create')}
              className="btn-genz-yellow rounded-full px-5 py-2.5 text-xs sm:text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#12131A] stroke-[3]" />
              <span>Create a Hangout</span>
            </button>
          </div>
        </div>
      </section>

      {/* Search & Category Filter Controls */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hangouts by vibe, neighborhood, or activity..."
              className="w-full bg-[#141620] border-2 border-[#232736] focus:border-[#B99AFF] rounded-2xl pl-10 pr-12 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-[#FF83C8] transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onSelectTab('discover')}
              className="btn-genz-blue rounded-xl px-3.5 py-2 text-xs flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Explore Nearby</span>
            </button>
            <button
              onClick={onRefresh}
              aria-label="Refresh feed"
              className="btn-genz-dark w-9 h-9 rounded-xl flex items-center justify-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#C9FF59]' : 'text-gray-300'}`} />
            </button>
          </div>
        </div>

        {/* Category Horizontal Filter Buttons (Interactive controls) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat;
            const activeColorVariations = ['active-lime', 'active-pink', 'active-lavender'];
            const activeVariant = activeColorVariations[idx % activeColorVariations.length];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`pill-genz-filter ${isSelected ? activeVariant : ''}`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Feed Content Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold text-white">Upcoming Hangouts</h2>
            <span className="text-xs text-gray-400 font-mono">({filteredHangouts.length} available)</span>
          </div>
          <span className="text-xs text-gray-500 hidden sm:inline">Tap any card to view crew & RSVP</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-[#141620] border border-[#232736] rounded-2xl h-80 animate-pulse p-4 space-y-4"
              >
                <div className="w-full h-40 bg-[#1e2130] rounded-xl" />
                <div className="h-4 bg-[#1e2130] rounded w-3/4" />
                <div className="h-3 bg-[#1e2130] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredHangouts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHangouts.map((hangout) => (
              <HangoutCard
                key={hangout.id}
                hangout={hangout}
                onOpenDetails={onOpenDetails}
                onJoinToggle={onJoinToggle}
                onSaveToggle={onSaveToggle}
                onBadgeClick={onBadgeClick}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-[#141620] border border-[#232736] rounded-3xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-[#a855f7] mx-auto flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No hangouts match your search</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Try selecting "All" categories or adjusting your keywords. You can also host a new hangout!
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="btn-genz-yellow rounded-xl px-4 py-2 text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
