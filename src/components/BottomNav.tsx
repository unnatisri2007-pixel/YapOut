import React from 'react';
import { Home, Compass, Sparkles, PlusCircle, User } from 'lucide-react';
import { NavTab } from './Navbar';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'feed' as NavTab, label: 'Feed', icon: Home, color: '#C9FF59' },
    { id: 'discover' as NavTab, label: 'Discover', icon: Compass, color: '#8DE5FF' },
    { id: 'planner' as NavTab, label: 'AI Vibe', icon: Sparkles, color: '#FF83C8' },
    { id: 'create' as NavTab, label: 'Create', icon: PlusCircle, color: '#FFD166' },
    { id: 'profile' as NavTab, label: 'Profile', icon: User, color: '#B99AFF' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e1017]/95 backdrop-blur-md border-t-2 border-[#12131A] shadow-[0px_-2px_10px_rgba(0,0,0,0.5)] pb-safe">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center h-full w-full min-h-[48px] focus:outline-none transition-all active:scale-90"
            >
              <div
                className={`relative px-3 py-1 rounded-full transition-all ${
                  isActive
                    ? 'border-2 border-[#12131A] shadow-[2px_2px_0px_#12131A] -translate-y-1'
                    : 'text-gray-400'
                }`}
                style={{
                  backgroundColor: isActive ? tab.color : 'transparent',
                }}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#12131A] stroke-[2.5]' : 'text-gray-400'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-extrabold tracking-tight mt-0.5 transition-colors whitespace-nowrap ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
