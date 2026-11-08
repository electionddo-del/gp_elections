/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  District,
  Division,
  Mandal,
  Panchayat,
  Ward,
  Nomination,
  HourlyTurnoutRecord,
  CountingRoundRecord,
  PollingStation,
  RESERVATION_LABELS,
  POLLING_SLOTS,
  AuthenticatedOperator,
} from '../../types/election';
import { ActiveTab } from '../Header';
import {
  Vote,
  MapPin,
  Building2,
  Building,
  Users2,
  Users,
  Clock,
  BarChart3,
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogIn,
  TrendingUp,
  FileCheck2,
  ChevronRight,
  Trophy,
  AlertCircle,
  Phone,
} from 'lucide-react';

interface DistrictNominationsHomeProps {
  district: District;
  divisions: Division[];
  mandals: Mandal[];
  panchayats: Panchayat[];
  wards: Ward[];
  nominations: Nomination[];
  hourlyTurnout: HourlyTurnoutRecord[];
  countingRecords: CountingRoundRecord[];
  pollingStations: PollingStation[];
  activePanchayat: Panchayat;
  activeDivision: Division;
  activeMandal: Mandal;
  authenticatedOperator?: AuthenticatedOperator | null;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenLogin?: () => void;
  onSelectPanchayat?: (panchayatId: string) => void;
}

export const DistrictNominationsHome: React.FC<DistrictNominationsHomeProps> = ({
  district,
  divisions,
  mandals,
  panchayats,
  wards,
  nominations,
  hourlyTurnout,
  countingRecords,
  pollingStations,
  activePanchayat,
  activeDivision,
  activeMandal,
  authenticatedOperator,
  onNavigateTab,
  onOpenLogin,
  onSelectPanchayat,
}) => {
  // 1. Overall District Aggregations
  const totalElectorsMale = wards.reduce((acc, w) => acc + w.voters.male, 0);
  const totalElectorsFemale = wards.reduce((acc, w) => acc + w.voters.female, 0);
  const totalElectorsOther = wards.reduce((acc, w) => acc + w.voters.other, 0);
  const totalDistrictElectors = totalElectorsMale + totalElectorsFemale + totalElectorsOther;

  const totalNominations = nominations.length;
  const presidentNominations = nominations.filter((n) => n.postType === 'PRESIDENT').length;
  const wardNominations = nominations.filter((n) => n.postType === 'WARD_MEMBER').length;
  const acceptedNominations = nominations.filter((n) => n.scrutinyStatus === 'ACCEPTED' && !n.withdrawn).length;
  const rejectedNominations = nominations.filter((n) => n.scrutinyStatus === 'REJECTED').length;
  const withdrawnNominations = nominations.filter((n) => n.withdrawn).length;

  // 2. Active Panchayat Specific Aggregations
  const currentPanchayatWards = wards.filter((w) => w.panchayatId === activePanchayat.id);
  const panElectorsMale = currentPanchayatWards.reduce((acc, w) => acc + w.voters.male, 0);
  const panElectorsFemale = currentPanchayatWards.reduce((acc, w) => acc + w.voters.female, 0);
  const panElectorsOther = currentPanchayatWards.reduce((acc, w) => acc + w.voters.other, 0);
  const currentPanElectors = panElectorsMale + panElectorsFemale + panElectorsOther;

  const panNominations = nominations.filter((n) => n.panchayatId === activePanchayat.id);
  const panPresidentNoms = panNominations.filter((n) => n.postType === 'PRESIDENT');
  const panWardNoms = panNominations.filter((n) => n.postType === 'WARD_MEMBER');
  const panAccepted = panNominations.filter((n) => n.scrutinyStatus === 'ACCEPTED' && !n.withdrawn).length;
  const panRejected = panNominations.filter((n) => n.scrutinyStatus === 'REJECTED').length;
  const panWithdrawn = panNominations.filter((n) => n.withdrawn).length;

  // 3. Turnout Metrics for Active Panchayat
  const latestTurnoutSlot = '15:00 - 17:00';
  const panTurnoutRecords = hourlyTurnout.filter(
    (r) => r.panchayatId === activePanchayat.id && r.timeSlot === latestTurnoutSlot
  );
  const polledMale = panTurnoutRecords.reduce((acc, r) => acc + r.cumulativeMale, 0);
  const polledFemale = panTurnoutRecords.reduce((acc, r) => acc + r.cumulativeFemale, 0);
  const polledOther = panTurnoutRecords.reduce((acc, r) => acc + r.cumulativeOther, 0);
  const totalPolled = polledMale + polledFemale + polledOther;
  const turnoutPercent = currentPanElectors > 0 ? ((totalPolled / currentPanElectors) * 100).toFixed(1) : '0.0';
  const femaleTurnoutPercent = panElectorsFemale > 0 ? ((polledFemale / panElectorsFemale) * 100).toFixed(1) : '0.0';
  const maleTurnoutPercent = panElectorsMale > 0 ? ((polledMale / panElectorsMale) * 100).toFixed(1) : '0.0';

  // 4. Counting Metrics for Active Panchayat (Sarpanch)
  const sarpanchCounting = countingRecords.find(
    (c) => c.panchayatId === activePanchayat.id && c.postType === 'PRESIDENT'
  );
  const isCountingComplete = sarpanchCounting?.status === 'COMPLETED';
  const totalCountedVotes = sarpanchCounting?.candidateVotes.reduce((acc, cv) => acc + cv.totalVotes, 0) || 0;
  
  // Sorted candidates by votes
  const sortedCandidates = [...(sarpanchCounting?.candidateVotes || [])].sort((a, b) => b.totalVotes - a.totalVotes);
  const leaderCandidate = sortedCandidates[0];
  const runnerUpCandidate = sortedCandidates[1];
  const currentLeadMargin = leaderCandidate && runnerUpCandidate ? leaderCandidate.totalVotes - runnerUpCandidate.totalVotes : 0;

  // 5. Results & Declared Winners
  const totalCompletedCounts = countingRecords.filter((c) => c.status === 'COMPLETED').length;
  const winnerDeclared = Boolean(sarpanchCounting?.declaredWinnerName || isCountingComplete);

  return (
    <div className="space-y-3.5 sm:space-y-5">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE COMMAND BANNER                                               */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-5 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>State Election Commission · Ordinary Panchayat Elections 2026</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {district.name} District Election Command Dashboard
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500">
              District Collector & DEO: <strong>{district.collectorName}</strong> · Polling & Counting Date: <strong>{district.electionDate}</strong>
            </p>
          </div>
        </div>

        {/* Executive KPI Metrics Strip (Strictly unboxed, clean numbers) */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2.5 pt-2.5 border-t border-slate-100 text-xs">
          <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] sm:text-xs block truncate">District Electors</span>
            <span className="text-base sm:text-xl font-bold text-slate-900 tabular-nums block">
              {totalDistrictElectors.toLocaleString()}
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Across {wards.length} Wards</span>
          </div>

          <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Admin Units</span>
            <span className="text-base sm:text-xl font-bold text-slate-900 tabular-nums block">
              {divisions.length} Div · {panchayats.length} GP
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">{mandals.length} Mandals</span>
          </div>

          <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Nominations Filed</span>
            <span className="text-base sm:text-xl font-bold text-slate-900 tabular-nums block">
              {totalNominations}
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">{presidentNominations} Sarpanch · {wardNominations} Ward</span>
          </div>

          <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Valid Contestants</span>
            <span className="text-base sm:text-xl font-bold text-emerald-700 tabular-nums block">
              {acceptedNominations}
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Scrutiny cleared</span>
          </div>

          <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Turnout ({activePanchayat.name})</span>
            <span className="text-base sm:text-xl font-bold text-emerald-800 tabular-nums block">
              {turnoutPercent}%
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">{totalPolled.toLocaleString()} polled</span>
          </div>

          <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Results Declared</span>
            <span className="text-base sm:text-xl font-bold text-slate-900 tabular-nums block">
              {totalCompletedCounts} Posts
            </span>
            <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Gazettes generated</span>
          </div>
        </div>
      </div>

      {/* Operator Session / Quick Mobile Login Card */}
      {authenticatedOperator ? (
        <div className="bg-emerald-900 border border-emerald-700 text-white rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
              📱
            </div>
            <div>
              <div className="font-bold flex items-center gap-2 text-sm">
                <span>{authenticatedOperator.name}</span>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-medium border border-emerald-700">
                  {authenticatedOperator.role === 'RO'
                    ? 'Returning Officer'
                    : authenticatedOperator.assignedWardNumber
                    ? `Ward ${authenticatedOperator.assignedWardNumber} Operator`
                    : 'Panchayat Operator'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-200 mt-0.5 block">
                Phone: {authenticatedOperator.mobile} · Jurisdiction: {authenticatedOperator.panchayatName}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('nominations')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer ml-auto shadow-2xs"
          >
            <span>Proceed to My Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center font-bold text-base shrink-0">
              📱
            </div>
            <div>
              <div className="font-bold text-white text-xs sm:text-sm">
                Field Data Entry Operator or Polling Officer?
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Sign in with registered mobile number to enter nominations, hourly turnout, and counting votes.
              </span>
            </div>
          </div>

          {onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer ml-auto shadow-xs active:scale-[0.98]"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-300" />
              <span>Operator Sign In</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRIMARY MODULE NAVIGATION HUB (BUTTONS TO GOTO RESPECTIVE PAGES)       */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              Election Portals & Operational Desks
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">·</span>
            <span className="text-slate-500 text-xs hidden sm:inline">
              Click any button below to enter its respective page
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Active: <strong className="text-slate-800">{activePanchayat.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {/* Button 1: Panchayat Desk */}
          <button
            onClick={() => onNavigateTab('nominations')}
            className="p-3 bg-emerald-50/70 hover:bg-emerald-100/80 border-2 border-emerald-300 hover:border-emerald-600 rounded-xl transition-all cursor-pointer flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs min-h-[96px]"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-2xs group-hover:bg-emerald-800 transition-colors">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded">
                {panNominations.length} Filed
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block group-hover:text-emerald-900">
                Panchayat Desk
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Nominations & Scrutiny
              </span>
            </div>
          </button>

          {/* Button 2: Hourly Turnout */}
          <button
            onClick={() => onNavigateTab('polling')}
            className="p-3 bg-blue-50/70 hover:bg-blue-100/80 border-2 border-blue-300 hover:border-blue-600 rounded-xl transition-all cursor-pointer flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs min-h-[96px]"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-2xs group-hover:bg-blue-800 transition-colors">
                <Users2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100/90 px-1.5 py-0.5 rounded">
                {turnoutPercent}% Polled
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block group-hover:text-blue-900">
                Hourly Turnout
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Polling Day Tracker
              </span>
            </div>
          </button>

          {/* Button 3: Round Counting */}
          <button
            onClick={() => onNavigateTab('counting')}
            className="p-3 bg-purple-50/70 hover:bg-purple-100/80 border-2 border-purple-300 hover:border-purple-600 rounded-xl transition-all cursor-pointer flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs min-h-[96px]"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-2xs group-hover:bg-purple-800 transition-colors">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-100/90 px-1.5 py-0.5 rounded">
                {isCountingComplete ? 'Completed' : 'Rounds 1–3'}
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block group-hover:text-purple-900">
                Round Counting
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Vote Tally & Margins
              </span>
            </div>
          </button>

          {/* Button 4: Result Sheet */}
          <button
            onClick={() => onNavigateTab('results')}
            className="p-3 bg-amber-50/70 hover:bg-amber-100/80 border-2 border-amber-300 hover:border-amber-600 rounded-xl transition-all cursor-pointer flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs min-h-[96px]"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-2xs group-hover:bg-amber-700 transition-colors">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded">
                Form 20 / 21E
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block group-hover:text-amber-900">
                Result Gazette
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Official Certification
              </span>
            </div>
          </button>

          {/* Button 5: Admin Master Hierarchy */}
          <button
            onClick={() => onNavigateTab('hierarchy')}
            className="p-3 bg-slate-100/80 hover:bg-slate-200/90 border-2 border-slate-300 hover:border-slate-500 rounded-xl transition-all cursor-pointer flex flex-col justify-between text-left group shadow-2xs hover:shadow-xs min-h-[96px]"
          >
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shadow-2xs group-hover:bg-slate-900 transition-colors">
                <Building className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                {wards.length} Wards
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-900 text-xs sm:text-sm block group-hover:text-slate-950">
                Admin Master
              </span>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                Divisions & Wards Setup
              </span>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
