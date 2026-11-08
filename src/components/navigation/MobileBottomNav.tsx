/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Building2,
  FileCheck2,
  Users2,
  BarChart3,
  Award,
} from 'lucide-react';
import { ActiveTab } from '../Header';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: 'district_home' as ActiveTab,
      label: 'Home',
      icon: Building2,
    },
    {
      id: 'nominations' as ActiveTab,
      label: 'Panchayat Desk',
      icon: FileCheck2,
    },
    {
      id: 'polling' as ActiveTab,
      label: 'Turnout',
      icon: Users2,
    },
    {
      id: 'counting' as ActiveTab,
      label: 'Counting',
      icon: BarChart3,
    },
    {
      id: 'results' as ActiveTab,
      label: 'Results',
      icon: Award,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pb-safe"
    >
      <div className="grid grid-cols-5 h-15 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors relative cursor-pointer ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute top-1 w-6 h-0.5 rounded-full bg-emerald-600" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-700' : 'text-slate-400'}`} />
              <span className="text-[10px] leading-tight tracking-tight mt-1 truncate max-w-[62px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
