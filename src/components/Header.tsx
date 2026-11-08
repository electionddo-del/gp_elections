/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Vote,
  RotateCcw,
  LogIn,
  LogOut,
  Building2,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { AuthenticatedOperator } from '../types/election';

export type ActiveTab = 'district_home' | 'nominations' | 'polling' | 'counting' | 'results' | 'hierarchy';

interface HeaderProps {
  districtName: string;
  panchayatName: string;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenLogin: () => void;
  onOpenNewNomination: () => void;
  onLogout: () => void;
  onResetData: () => void;
  authenticatedOperator: AuthenticatedOperator | null;
}

export const Header: React.FC<HeaderProps> = ({
  districtName,
  panchayatName,
  activeTab,
  onSelectTab,
  onOpenLogin,
  onOpenNewNomination,
  onLogout,
  onResetData,
  authenticatedOperator,
}) => {
  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-14 sm:h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div
            onClick={() => onSelectTab('district_home')}
            className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs shrink-0">
              <Vote className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="truncate">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 block leading-tight">
                Panchayat Election
              </span>
              <span className="text-[11px] text-slate-500 font-medium block leading-none">
                {districtName} · SEC AP
              </span>
            </div>
          </div>

          {/* Zone 2: Inner page "Back to Home" button */}
          {activeTab !== 'district_home' && (
            <button
              onClick={() => onSelectTab('district_home')}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden xs:inline">Home</span>
            </button>
          )}

          {/* Zone 3: Mobile Operator Sign-In / Active Session Status */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={onResetData}
              title="Reset sample election data"
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {authenticatedOperator ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-2 sm:px-2.5 py-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    authenticatedOperator.role === 'RO' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'
                  }`} />
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[110px] sm:max-w-[140px]">
                      {authenticatedOperator.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium truncate max-w-[110px] sm:max-w-[140px]">
                      {authenticatedOperator.role === 'RO'
                        ? 'Returning Officer'
                        : authenticatedOperator.assignedWardNumber
                        ? `Ward ${authenticatedOperator.assignedWardNumber} Operator`
                        : 'Panchayat Operator'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign out operator session"
                  className="min-h-[40px] px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="min-h-[42px] px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Operator Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
