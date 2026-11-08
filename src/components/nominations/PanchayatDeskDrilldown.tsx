/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  District,
  Division,
  Mandal,
  Panchayat,
  Ward,
  Nomination,
  PollingStation,
  PostType,
  ScrutinyStatus,
  RESERVATION_LABELS,
  AuthenticatedOperator,
  FREE_SYMBOLS,
  PoliticalParty,
  FreeSymbol,
} from '../../types/election';
import { validateReservation } from '../../utils/reservationValidator';
import {
  Building2,
  Building,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Users,
  Award,
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  PlusCircle,
  Eye,
  ShieldCheck,
  Lock,
  ArrowUp,
  ArrowDown,
  User,
  Phone,
  Vote,
  Layers,
  Sparkles,
  UserX,
  BadgeCheck,
} from 'lucide-react';

export type DrilldownLevel =
  | 'DIVISIONS'
  | 'MANDALS'
  | 'PANCHAYATS'
  | 'POST_CHOICE'
  | 'SARPANCH_PAGE'
  | 'WARD_MEMBERS_LIST'
  | 'WARD_PAGE';

interface PanchayatDeskDrilldownProps {
  district: District;
  divisions: Division[];
  mandals: Mandal[];
  panchayats: Panchayat[];
  wards: Ward[];
  nominations: Nomination[];
  pollingStations: PollingStation[];
  parties?: PoliticalParty[];
  symbols?: FreeSymbol[];
  selectedDivisionId: string;
  selectedMandalId: string;
  selectedPanchayatId: string;
  authenticatedOperator?: AuthenticatedOperator | null;
  onSelectDivision: (id: string) => void;
  onSelectMandal: (id: string) => void;
  onSelectPanchayat: (id: string) => void;
  onViewDetails: (nomination: Nomination) => void;
  onOpenNewNomination: (defaultPostType?: PostType, defaultWardNumber?: number) => void;
  onQuickScrutinize?: (nominationId: string, status: ScrutinyStatus, remarks: string) => void;
  onUpdateNomination?: (updated: Nomination) => void;
  onOpenLoginModal?: () => void;
}

export const PanchayatDeskDrilldown: React.FC<PanchayatDeskDrilldownProps> = ({
  district,
  divisions,
  mandals,
  panchayats,
  wards,
  nominations,
  pollingStations,
  parties,
  symbols,
  selectedDivisionId,
  selectedMandalId,
  selectedPanchayatId,
  authenticatedOperator,
  onSelectDivision,
  onSelectMandal,
  onSelectPanchayat,
  onViewDetails,
  onOpenNewNomination,
  onQuickScrutinize,
  onUpdateNomination,
  onOpenLoginModal,
}) => {
  const availableSymbols = symbols && symbols.length > 0 ? symbols : FREE_SYMBOLS;
  const availableParties = parties && parties.length > 0 ? parties : [
    { id: 'party-ind', name: 'Independent', abbreviation: 'IND' },
  ];

  // Navigation State: Starts at DIVISIONS for hierarchical drilldown
  const [level, setLevel] = useState<DrilldownLevel>('DIVISIONS');
  const [selectedWardNumber, setSelectedWardNumber] = useState<number>(1);
  const [activeSubTab, setActiveSubTab] = useState<'nominations' | 'scrutiny' | 'ballot'>('nominations');

  // Role checks
  const isOfficer = authenticatedOperator?.role === 'RO';
  const isOperator = authenticatedOperator?.role === 'DEO';

  // Current entity lookups
  const activeDivision = divisions.find((d) => d.id === selectedDivisionId) || divisions[0];
  const activeMandal = mandals.find((m) => m.id === selectedMandalId) || mandals[0];
  const activePanchayat = panchayats.find((p) => p.id === selectedPanchayatId) || panchayats[0];
  const activeWards = wards.filter((w) => w.panchayatId === activePanchayat.id);
  const currentWard = activeWards.find((w) => w.wardNumber === selectedWardNumber) || activeWards[0];

  // Specific Ward Operator Check (strict operator-ward binding)
  const isCurrentWardOperator = Boolean(
    isOperator &&
    authenticatedOperator?.panchayatId === activePanchayat.id &&
    (authenticatedOperator?.assignedWardNumber === undefined ||
     authenticatedOperator?.assignedWardNumber === selectedWardNumber)
  );

  // Can file Sarpanch (Panchayat-level operator or all-ward operator)
  const canFileSarpanch = Boolean(
    isOperator &&
    authenticatedOperator?.panchayatId === activePanchayat.id &&
    (authenticatedOperator?.assignedWardNumber === undefined ||
     authenticatedOperator?.assignedWardNumber === 0)
  );

  // Aggregations for active Panchayat
  const totalMale = activeWards.reduce((acc, w) => acc + w.voters.male, 0);
  const totalFemale = activeWards.reduce((acc, w) => acc + w.voters.female, 0);
  const totalOther = activeWards.reduce((acc, w) => acc + w.voters.other, 0);
  const totalVoters = totalMale + totalFemale + totalOther;

  const panNominations = nominations.filter((n) => n.panchayatId === activePanchayat.id);
  const presidentNominations = panNominations.filter((n) => n.postType === 'PRESIDENT');
  const allWardNominations = panNominations.filter((n) => n.postType === 'WARD_MEMBER');
  const currentWardNominations = allWardNominations.filter(
    (n) => n.wardNumber === selectedWardNumber
  );

  // Drilldown Click Handlers
  const handleDivisionClick = (divId: string) => {
    onSelectDivision(divId);
    const relatedMandals = mandals.filter((m) => m.divisionId === divId);
    if (relatedMandals.length > 0) {
      onSelectMandal(relatedMandals[0].id);
      const relatedPanchayats = panchayats.filter((p) => p.mandalId === relatedMandals[0].id);
      if (relatedPanchayats.length > 0) {
        onSelectPanchayat(relatedPanchayats[0].id);
      }
    }
    setLevel('MANDALS');
  };

  const handleMandalClick = (mandalId: string) => {
    onSelectMandal(mandalId);
    const relatedPanchayats = panchayats.filter((p) => p.mandalId === mandalId);
    if (relatedPanchayats.length > 0) {
      onSelectPanchayat(relatedPanchayats[0].id);
    }
    setLevel('PANCHAYATS');
  };

  const handlePanchayatClick = (panchayatId: string) => {
    onSelectPanchayat(panchayatId);
    setLevel('POST_CHOICE');
  };

  const handleSelectSarpanch = () => {
    setActiveSubTab('nominations');
    setLevel('SARPANCH_PAGE');
  };

  const handleSelectWardMembers = () => {
    setLevel('WARD_MEMBERS_LIST');
  };

  const handleOpenWardPage = (wardNum: number) => {
    setSelectedWardNumber(wardNum);
    setActiveSubTab('nominations');
    setLevel('WARD_PAGE');
  };

  // RO Scrutiny & Ballot handlers
  const handleAllotSymbol = (nom: Nomination, symbolName: string) => {
    if (!isOfficer || !onUpdateNomination) return;
    const sym = availableSymbols.find((s) => s.name === symbolName);
    if (!sym) return;
    onUpdateNomination({
      ...nom,
      allottedSymbol: { name: sym.name, code: sym.code, icon: sym.icon },
    });
  };

  const handleAllotParty = (nom: Nomination, partyName: string) => {
    if (!isOfficer || !onUpdateNomination) return;
    onUpdateNomination({ ...nom, allottedParty: partyName });
  };

  const handleMoveBallotOrder = (list: Nomination[], index: number, direction: 'UP' | 'DOWN') => {
    if (!isOfficer || !onUpdateNomination) return;
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    onUpdateNomination({ ...list[index], ballotOrder: targetIdx + 1 });
    onUpdateNomination({ ...list[targetIdx], ballotOrder: index + 1 });
  };

  const handleRecordWithdrawal = (nom: Nomination) => {
    if (!isOfficer || !onUpdateNomination) return;
    const noticeNo = prompt(
      'Enter Form 6 Withdrawal Notice Number:',
      `WITHDRAW-2026-${Math.floor(100 + Math.random() * 900)}`
    );
    if (!noticeNo) return;
    onUpdateNomination({
      ...nom,
      withdrawn: true,
      withdrawnTimestamp: new Date().toISOString(),
      withdrawnNoticeNo: noticeNo,
    });
  };

  // Contestant list sorted for Form 7A
  const sarpanchValidContestants = presidentNominations.filter(
    (n) => n.scrutinyStatus === 'ACCEPTED' && !n.withdrawn
  );
  const sortedSarpanchContestants = [...sarpanchValidContestants].sort((a, b) => {
    if (a.ballotOrder && b.ballotOrder) return a.ballotOrder - b.ballotOrder;
    if (a.ballotOrder) return -1;
    if (b.ballotOrder) return 1;
    return a.candidateName.localeCompare(b.candidateName);
  });

  const wardValidContestants = currentWardNominations.filter(
    (n) => n.scrutinyStatus === 'ACCEPTED' && !n.withdrawn
  );
  const sortedWardContestants = [...wardValidContestants].sort((a, b) => {
    if (a.ballotOrder && b.ballotOrder) return a.ballotOrder - b.ballotOrder;
    if (a.ballotOrder) return -1;
    if (b.ballotOrder) return 1;
    return a.candidateName.localeCompare(b.candidateName);
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ========================================================================= */}
      {/* 1. HIERARCHICAL BREADCRUMB & JUMP BAR                                    */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Breadcrumbs Path */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">
            {/* Step 1: District / Divisions */}
            <button
              type="button"
              onClick={() => setLevel('DIVISIONS')}
              className={`flex items-center gap-1 font-semibold px-2 py-1 rounded transition-colors cursor-pointer ${
                level === 'DIVISIONS'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Click to view all Divisions"
            >
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{district.name} (Divisions)</span>
            </button>

            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

            {/* Step 2: Division */}
            <button
              type="button"
              onClick={() => setLevel('MANDALS')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                level === 'MANDALS'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Click to view Mandals in this Division"
            >
              {activeDivision.name}
            </button>

            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

            {/* Step 3: Mandal */}
            <button
              type="button"
              onClick={() => setLevel('PANCHAYATS')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                level === 'PANCHAYATS'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Click to view Panchayats in this Mandal"
            >
              {activeMandal.name}
            </button>

            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />

            {/* Step 4: Panchayat Post Choice */}
            <button
              type="button"
              onClick={() => setLevel('POST_CHOICE')}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                level === 'POST_CHOICE'
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Click to view Sarpanch & Ward Members choice"
            >
              {activePanchayat.name}
            </button>

            {/* Step 5: Active Sub-Page (Sarpanch or Ward Member) */}
            {level === 'SARPANCH_PAGE' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="px-2 py-1 rounded bg-amber-400 text-slate-950 font-bold shadow-2xs">
                  🏛️ Sarpanch (President)
                </span>
              </>
            )}

            {level === 'WARD_MEMBERS_LIST' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="px-2 py-1 rounded bg-purple-100 text-purple-900 font-bold shadow-2xs">
                  👥 Ward Members ({activeWards.length})
                </span>
              </>
            )}

            {level === 'WARD_PAGE' && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => setLevel('WARD_MEMBERS_LIST')}
                  className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Ward Members
                </button>
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-bold shadow-2xs">
                  Ward No. {selectedWardNumber}
                </span>
              </>
            )}
          </div>

          {/* Action Button: Go to Divisions anytime */}
          <div className="flex items-center gap-1.5 shrink-0">
            {level !== 'DIVISIONS' && (
              <button
                type="button"
                onClick={() => setLevel('DIVISIONS')}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
              >
                Go to Divisions
              </button>
            )}
            {level !== 'POST_CHOICE' && level !== 'DIVISIONS' && level !== 'MANDALS' && level !== 'PANCHAYATS' && (
              <button
                type="button"
                onClick={() => setLevel('POST_CHOICE')}
                className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Posts
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 1: DIVISIONS SELECTION                                              */}
      {/* ========================================================================= */}
      {level === 'DIVISIONS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                Revenue Divisions in {district.name} District
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any division below to drill down into its mandals and panchayats.
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
              {divisions.length} Divisions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {divisions.map((div) => {
              const divMandals = mandals.filter((m) => m.divisionId === div.id);
              const divMandalIds = divMandals.map((m) => m.id);
              const divPanchayats = panchayats.filter((p) => divMandalIds.includes(p.mandalId));
              const divPanIds = divPanchayats.map((p) => p.id);
              const divNominations = nominations.filter((n) => divPanIds.includes(n.panchayatId));

              return (
                <div
                  key={div.id}
                  onClick={() => handleDivisionClick(div.id)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between group shadow-2xs hover:shadow-sm ${
                    div.id === activeDivision.id
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                      : 'border-slate-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                        {div.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {divNominations.length} Nominations
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                        {div.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        RDO: {div.subCollectorRO}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-400 block text-[10px]">Mandals</span>
                        <span className="font-bold text-slate-800">{divMandals.length}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-400 block text-[10px]">Panchayats</span>
                        <span className="font-bold text-slate-800">{divPanchayats.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                    <span>Click to Open Mandals</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: MANDALS SELECTION                                                */}
      {/* ========================================================================= */}
      {level === 'MANDALS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLevel('DIVISIONS')}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Back to Divisions"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Mandals under {activeDivision.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any mandal to view its gram panchayats.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLevel('DIVISIONS')}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded cursor-pointer font-medium"
            >
              ← Back to Divisions
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {mandals
              .filter((m) => m.divisionId === activeDivision.id)
              .map((man) => {
                const manPanchayats = panchayats.filter((p) => p.mandalId === man.id);
                const manPanIds = manPanchayats.map((p) => p.id);
                const manNominations = nominations.filter((n) =>
                  manPanIds.includes(n.panchayatId)
                );
                const manWards = wards.filter((w) => manPanIds.includes(w.panchayatId));

                return (
                  <div
                    key={man.id}
                    onClick={() => handleMandalClick(man.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between group shadow-2xs hover:shadow-sm ${
                      man.id === activeMandal.id
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                          {man.name}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {manNominations.length} Noms
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">MPDO: {man.tahsildarRO}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Panchayats</span>
                          <span className="font-bold text-slate-800">{manPanchayats.length}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Wards</span>
                          <span className="font-bold text-slate-800">{manWards.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                      <span>View Panchayats</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: PANCHAYATS SELECTION                                             */}
      {/* ========================================================================= */}
      {level === 'PANCHAYATS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLevel('MANDALS')}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  title="Back to Mandals"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Gram Panchayats under {activeMandal.name} Mandal
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any panchayat to view Sarpanch and Ward Members.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLevel('MANDALS')}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 px-2.5 py-1 rounded cursor-pointer font-medium"
            >
              ← Back to Mandals
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {panchayats
              .filter((p) => p.mandalId === activeMandal.id)
              .map((pan) => {
                const panWards = wards.filter((w) => w.panchayatId === pan.id);
                const panNoms = nominations.filter((n) => n.panchayatId === pan.id);
                const panElectors = panWards.reduce(
                  (acc, w) => acc + w.voters.male + w.voters.female + w.voters.other,
                  0
                );

                return (
                  <div
                    key={pan.id}
                    onClick={() => handlePanchayatClick(pan.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left flex flex-col justify-between group shadow-2xs hover:shadow-sm ${
                      pan.id === activePanchayat.id
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800">
                            {pan.name}
                          </h3>
                          <span className="text-[11px] text-slate-500 block">
                            Secretary: {pan.panchayatSecretary.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded shrink-0">
                          Pres: {RESERVATION_LABELS[pan.sarpanchReservation]}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Wards</span>
                          <span className="font-bold text-slate-800">{panWards.length}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Electors</span>
                          <span className="font-bold text-slate-800">{panElectors.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded">
                          <span className="text-slate-400 block text-[10px]">Noms</span>
                          <span className="font-bold text-slate-800">{panNoms.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                      <span>Select Panchayat</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 4: POST CHOICE — "FIRST I NEED SARPANCH AND WARD MEMBERS"          */}
      {/* ========================================================================= */}
      {level === 'POST_CHOICE' && (
        <div className="space-y-4">
          {/* Selected Panchayat Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Gram Panchayat Overview
                  </span>
                  <span className="text-xs text-slate-500">
                    {activeDivision.name} · {activeMandal.name} Mandal
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {activePanchayat.name}
                </h1>
                <p className="text-xs text-slate-500">
                  Returning Officer: <strong>{activePanchayat.returningOfficer.name}</strong> ({activePanchayat.returningOfficer.designation}, Ph: {activePanchayat.returningOfficer.phone})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLevel('PANCHAYATS')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  All Panchayats
                </button>
              </div>
            </div>

            {/* Total Panchayat Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Total Electors</span>
                <span className="font-bold text-slate-900 text-sm">{totalVoters.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">M: {totalMale} · F: {totalFemale}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">President Reservation</span>
                <span className="font-bold text-purple-900 text-xs sm:text-sm">
                  {RESERVATION_LABELS[activePanchayat.sarpanchReservation]}
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Wards Count</span>
                <span className="font-bold text-slate-900 text-sm">{activeWards.length} Wards</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Total Nominations</span>
                <span className="font-bold text-emerald-800 text-sm">{panNominations.length} Filed</span>
              </div>
            </div>
          </div>

          {/* TWO PRIMARY PEER CHOICES: 1. Sarpanch, 2. Ward Members */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Election Posts in {activePanchayat.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                First select either <strong>Sarpanch (President)</strong> or <strong>Ward Members</strong> to go to their dedicated pages:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CHOICE 1: SARPANCH (PRESIDENT) CARD */}
              <div
                onClick={handleSelectSarpanch}
                className="p-5 rounded-2xl border-2 border-emerald-400 hover:border-emerald-600 bg-linear-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white cursor-pointer transition-all shadow-md hover:shadow-xl group flex flex-col justify-between min-h-[220px]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      🏛️
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                      President Post
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                      Sarpanch (Gram Panchayat President)
                    </h3>
                    <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                      Primary executive office of the Panchayat. Direct single election across all {activeWards.length} wards.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-800/80 text-xs">
                    <span className="bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-medium">
                      Seat Reserved: <strong>{RESERVATION_LABELS[activePanchayat.sarpanchReservation]}</strong>
                    </span>
                    <span className="bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded font-medium">
                      Voters: <strong>{totalVoters.toLocaleString()}</strong>
                    </span>
                    <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                      {presidentNominations.length} Nominations Filed
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-800/60 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  <span>Go to Sarpanch Page</span>
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* CHOICE 2: WARD MEMBERS CARD */}
              <div
                onClick={handleSelectWardMembers}
                className="p-5 rounded-2xl border-2 border-purple-400 hover:border-purple-600 bg-linear-to-br from-purple-950 via-slate-900 to-slate-950 text-white cursor-pointer transition-all shadow-md hover:shadow-xl group flex flex-col justify-between min-h-[220px]"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-purple-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      👥
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-purple-400 text-slate-950 shadow-xs">
                      {activeWards.length} Ward Seats
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                      Ward Members (Wards 1 – {activeWards.length})
                    </h3>
                    <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                      Electoral ward representation. Individual election per ward with ward-level reservations, electors, and data entry operators.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-800/80 text-xs">
                    <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded font-medium">
                      {activeWards.length} Total Wards
                    </span>
                    <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded font-medium">
                      Total Voters: <strong>{totalVoters.toLocaleString()}</strong>
                    </span>
                    <span className="bg-purple-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                      {allWardNominations.length} Ward Nominations Filed
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-purple-800/60 flex items-center justify-between text-xs font-bold text-purple-300 group-hover:text-purple-200">
                  <span>Go to Ward Members Page</span>
                  <div className="w-7 h-7 rounded-full bg-purple-400 text-slate-950 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 5A: SARPANCH (PRESIDENT) DEDICATED PAGE                             */}
      {/* ========================================================================= */}
      {level === 'SARPANCH_PAGE' && (
        <div className="space-y-4">
          {/* Quick Switcher Ribbon: Sarpanch vs Ward Members */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <span>🏛️ Sarpanch (President)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-400 text-slate-950">
                  {presidentNominations.length} Filed
                </span>
              </button>

              <button
                type="button"
                onClick={handleSelectWardMembers}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
              >
                <span>👥 Switch to Ward Members ({activeWards.length})</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setLevel('POST_CHOICE')}
              className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-3 h-3" />
              Back
            </button>
          </div>

          {/* Sarpanch Details Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-800 text-white">
                    Gram Panchayat President Desk
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-purple-100 text-purple-900">
                    Reserved for: {RESERVATION_LABELS[activePanchayat.sarpanchReservation]}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                  Sarpanch — {activePanchayat.name}
                </h1>

                <p className="text-xs text-slate-500 mt-0.5">
                  Direct election by all electors across all {activeWards.length} wards of {activePanchayat.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {canFileSarpanch ? (
                  <button
                    type="button"
                    onClick={() => onOpenNewNomination('PRESIDENT')}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + File Sarpanch Nomination
                  </button>
                ) : isOperator ? (
                  <div className="text-right text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold block">🔒 Sarpanch Filing: Panchayat Operator only</span>
                    <span className="text-[10px] text-amber-700">Signed in as Ward {authenticatedOperator?.assignedWardNumber} Operator</span>
                  </div>
                ) : isOfficer ? (
                  <div className="text-right text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold block">Returning Officer Mode</span>
                    <span className="text-[10px] text-slate-500">View, Scrutiny & Symbol Allotment only</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenLoginModal}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign in with Mobile to File</span>
                  </button>
                )}
              </div>
            </div>

            {/* Things Belonging to Sarpanch Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Total Electors Voting for Sarpanch
                </span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">
                  {totalVoters.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Male: {totalMale} · Female: {totalFemale} · Other: {totalOther}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Reservation Eligibility
                </span>
                <span className="text-xs sm:text-sm font-bold text-purple-900 block mt-0.5">
                  {RESERVATION_LABELS[activePanchayat.sarpanchReservation]}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
                  {activePanchayat.sarpanchReservation.includes('W')
                    ? 'Women candidates strictly required'
                    : 'Open to eligible category citizens'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Returning Officer (RO)
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">
                  {activePanchayat.returningOfficer.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {activePanchayat.returningOfficer.designation} ({activePanchayat.returningOfficer.phone})
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Nominations Filed
                </span>
                <span className="text-lg font-bold text-emerald-800 block mt-0.5">
                  {presidentNominations.length} Candidates
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {sarpanchValidContestants.length} Accepted · {presidentNominations.filter((n) => n.scrutinyStatus === 'REJECTED').length} Rejected
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: 1. Nominations Filed, 2. Scrutiny & Withdrawal, 3. Form 7A Ballot */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('nominations')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'nominations'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Nominations Filed ({presidentNominations.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('scrutiny')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'scrutiny'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Scrutiny & Withdrawal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('ballot')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'ballot'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>Form 7A Ballot Paper ({sarpanchValidContestants.length})</span>
                </button>
              </div>

              {!authenticatedOperator && onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Sign In (RO / DEO)
                </button>
              )}
            </div>

            {/* SUB-TAB 1: NOMINATIONS FILED */}
            {activeSubTab === 'nominations' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-3">
                {presidentNominations.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No nominations filed yet for Sarpanch.
                    </p>
                    {canFileSarpanch ? (
                      <button
                        type="button"
                        onClick={() => onOpenNewNomination('PRESIDENT')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                      >
                        + File First Sarpanch Nomination
                      </button>
                    ) : !authenticatedOperator && onOpenLoginModal ? (
                      <button
                        type="button"
                        onClick={onOpenLoginModal}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer"
                      >
                        Sign in with Mobile to File Nomination
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {presidentNominations.map((nom) => {
                      const resCheck = validateReservation(
                        activePanchayat.sarpanchReservation,
                        nom.gender,
                        nom.category
                      );

                      return (
                        <div
                          key={nom.id}
                          className="border border-slate-200 rounded-xl p-3 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                              {nom.allottedSymbol?.icon || '🗳️'}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm truncate">
                                  {nom.candidateName}
                                </span>
                                <span className="font-mono text-slate-500 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {nom.nominationNo}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5 flex flex-wrap items-center gap-2">
                                <span>Father/Spouse: <strong>{nom.fatherOrSpouseName}</strong></span>
                                <span>·</span>
                                <span>Age: <strong>{nom.age}</strong></span>
                                <span>·</span>
                                <span>Party: <strong>{nom.allottedParty || nom.partyAffiliation || 'Independent'}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                resCheck.isEligible
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {resCheck.isEligible ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-700" />
                              )}
                              <span>{nom.category}-{nom.gender.slice(0, 1)}</span>
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                nom.scrutinyStatus === 'ACCEPTED'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : nom.scrutinyStatus === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {nom.scrutinyStatus}
                            </span>

                            {nom.withdrawn && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                                Withdrawn
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => onViewDetails(nom)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>Details &gt;</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: SCRUTINY & WITHDRAWAL */}
            {activeSubTab === 'scrutiny' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Form 5 Scrutiny & Form 6 Withdrawal Desk (Sarpanch)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Returning Officer verifies caste certificate, Form 26 wealth & no due clearances.
                    </p>
                  </div>
                  {!isOfficer && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <Lock className="w-3 h-3 text-slate-400" />
                      RO Scrutiny Authority Required
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {presidentNominations.map((nom) => (
                    <div
                      key={nom.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{nom.candidateName}</span>
                          <span className="text-slate-500 font-mono text-[10px]">({nom.nominationNo})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              nom.scrutinyStatus === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-900'
                                : nom.scrutinyStatus === 'REJECTED'
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {nom.scrutinyStatus}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Category: <strong>{nom.category}</strong> · Gender: <strong>{nom.gender}</strong> · Wealth: ₹{((nom.assets?.movableVal || 0) + (nom.assets?.immovableVal || 0)).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        {isOfficer && onQuickScrutinize && nom.scrutinyStatus === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onQuickScrutinize(nom.id, 'ACCEPTED', 'Verified and accepted')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt('Statutory reason for rejection:');
                                if (reason) onQuickScrutinize(nom.id, 'REJECTED', reason);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isOfficer && nom.scrutinyStatus === 'ACCEPTED' && !nom.withdrawn && (
                          <button
                            type="button"
                            onClick={() => handleRecordWithdrawal(nom)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" />
                            Record Withdrawal (Form 6)
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewDetails(nom)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Details &gt;</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: FORM 7A BALLOT PAPER */}
            {activeSubTab === 'ballot' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Form 7A: Final List of Contesting Candidates & Ballot Ordering (Sarpanch)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Returning Officer assigns serial order in ballot paper, official election symbol & political party.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded">
                    {sarpanchValidContestants.length} Valid Contestants
                  </span>
                </div>

                {sarpanchValidContestants.length === 1 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2.5 text-xs text-amber-900">
                    <Award className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <strong className="block">Unopposed / Uncontested Election for Sarpanch!</strong>
                      <span>
                        Candidate <strong>{sarpanchValidContestants[0].candidateName}</strong> is declared elected unopposed.
                      </span>
                    </div>
                  </div>
                )}

                {sarpanchValidContestants.length === 0 ? (
                  <p className="text-slate-400 italic text-xs py-4 text-center">
                    No accepted contestants ready for ballot paper yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedSarpanchContestants.map((c, idx) => (
                      <div
                        key={c.id}
                        className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-xl shrink-0">{c.allottedSymbol?.icon || '🗳️'}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-sm block truncate">
                              {c.candidateName}
                            </span>
                            <span className="text-slate-500 text-[11px] block">
                              Symbol: <strong className="text-slate-800">{c.allottedSymbol?.name || c.symbolRequested}</strong> · Party: <strong className="text-slate-800">{c.allottedParty || c.partyAffiliation || 'Independent'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                          {isOfficer ? (
                            <>
                              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveBallotOrder(sortedSarpanchContestants, idx, 'UP')}
                                  className="p-1 hover:bg-white rounded text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Up in Ballot"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === sortedSarpanchContestants.length - 1}
                                  onClick={() => handleMoveBallotOrder(sortedSarpanchContestants, idx, 'DOWN')}
                                  className="p-1 hover:bg-white rounded text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Down in Ballot"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <select
                                value={c.allottedSymbol?.name || c.symbolRequested}
                                onChange={(e) => handleAllotSymbol(c, e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer max-w-[120px]"
                                title="Assign Symbol"
                              >
                                {availableSymbols.map((s) => (
                                  <option key={s.code} value={s.name}>
                                    {s.icon} {s.name}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={c.allottedParty || c.partyAffiliation || 'Independent'}
                                onChange={(e) => handleAllotParty(c, e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer max-w-[120px]"
                                title="Assign Party"
                              >
                                {availableParties.map((p) => (
                                  <option key={p.id} value={p.name}>
                                    {p.abbreviation} - {p.name}
                                  </option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              Allotted: {c.allottedSymbol?.name} ({c.allottedParty || c.partyAffiliation})
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => onViewDetails(c)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Details &gt;</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 5B: WARD MEMBERS DIRECTORY / LIST PAGE                              */}
      {/* ========================================================================= */}
      {level === 'WARD_MEMBERS_LIST' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-100 text-purple-900">
                    Ward Members Directory
                  </span>
                  <span className="text-xs text-slate-500">
                    {activePanchayat.name} · {activeWards.length} Wards
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Ward Members of {activePanchayat.name}
                </h1>
                <p className="text-xs text-slate-500">
                  Select any ward member below to inspect ward voters, data entry operator, and ward nominations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectSarpanch}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>🏛️ Go to Sarpanch Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setLevel('POST_CHOICE')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Grid of All Wards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {activeWards.map((w) => {
              const wNoms = allWardNominations.filter((n) => n.wardNumber === w.wardNumber);
              const wVoters = w.voters.male + w.voters.female + w.voters.other;

              return (
                <div
                  key={w.id}
                  onClick={() => handleOpenWardPage(w.wardNumber)}
                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50/20 transition-all cursor-pointer text-left flex flex-col justify-between group shadow-2xs hover:shadow-md bg-white"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs group-hover:bg-purple-700 transition-colors">
                        W{w.wardNumber}
                      </span>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                        {RESERVATION_LABELS[w.reservation]}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-900 transition-colors">
                        Ward Member — Ward {w.wardNumber}
                      </h3>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {wVoters.toLocaleString()} Electors (M: {w.voters.male}, F: {w.voters.female})
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <span className="text-slate-400 block text-[10px]">Data Operator</span>
                      <span className="font-medium truncate block">{w.dataEntryPerson.name}</span>
                      <span className="text-slate-400 text-[10px] block">{w.dataEntryPerson.phone}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700 group-hover:text-purple-800">
                    <span>{wNoms.length} Nominations Filed</span>
                    <div className="flex items-center gap-0.5">
                      <span>Open Page</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 5C: SPECIFIC WARD MEMBER DEDICATED PAGE                             */}
      {/* ========================================================================= */}
      {level === 'WARD_PAGE' && (
        <div className="space-y-4">
          {/* Quick Ward Navigation Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={handleSelectSarpanch}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 hover:bg-slate-100 flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
              >
                <span>🏛️ Sarpanch</span>
              </button>

              <span className="text-slate-300">|</span>

              {activeWards.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => handleOpenWardPage(w.wardNumber)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedWardNumber === w.wardNumber
                      ? 'bg-purple-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Ward {w.wardNumber}</span>
                  <span className="text-[10px] opacity-80">({w.reservation})</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSelectWardMembers}
              className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-3 h-3" />
              All Wards
            </button>
          </div>

          {/* Ward Details Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-900 text-white">
                    Ward Member Post
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold bg-purple-100 text-purple-900">
                    Reserved for: {RESERVATION_LABELS[currentWard?.reservation || 'GEN']}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                  Ward Member — Ward No. {selectedWardNumber} ({activePanchayat.name})
                </h1>

                <p className="text-xs text-slate-500 mt-0.5">
                  Election for Ward Member. Limited to electors residing inside Ward No. {selectedWardNumber} boundary.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isCurrentWardOperator ? (
                  <button
                    type="button"
                    onClick={() => onOpenNewNomination('WARD_MEMBER', selectedWardNumber)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + File Ward {selectedWardNumber} Nomination
                  </button>
                ) : isOperator ? (
                  <div className="text-right text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold block">🔒 Locked: Assigned to Ward {selectedWardNumber} Operator</span>
                    <span className="text-[10px] text-amber-700">
                      {currentWard?.dataEntryPerson.name} ({currentWard?.dataEntryPerson.phone})
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      (You are signed in as Ward {authenticatedOperator?.assignedWardNumber} Operator)
                    </span>
                  </div>
                ) : isOfficer ? (
                  <div className="text-right text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <span className="font-semibold block">Returning Officer Mode</span>
                    <span className="text-[10px] text-slate-500">Scrutiny & Allotment only · Filing is by Ward Operator</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenLoginModal}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign in with Mobile to File</span>
                  </button>
                )}
              </div>
            </div>

            {/* Things Belonging to this Ward Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Voters Belonging to Ward {selectedWardNumber}
                </span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">
                  {((currentWard?.voters.male || 0) + (currentWard?.voters.female || 0) + (currentWard?.voters.other || 0)).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Male: {currentWard?.voters.male} · Female: {currentWard?.voters.female} · Other: {currentWard?.voters.other}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Ward Reservation
                </span>
                <span className="text-xs sm:text-sm font-bold text-purple-900 block mt-0.5">
                  {RESERVATION_LABELS[currentWard?.reservation || 'GEN']}
                </span>
                <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
                  {currentWard?.reservation.includes('W')
                    ? 'Women candidates strictly required'
                    : 'Open to eligible category citizens'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Assigned Data Entry Operator
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">
                  {currentWard?.dataEntryPerson.name}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {currentWard?.dataEntryPerson.designation} ({currentWard?.dataEntryPerson.phone})
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                  Nominations Filed in Ward
                </span>
                <span className="text-lg font-bold text-emerald-800 block mt-0.5">
                  {currentWardNominations.length} Candidates
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {wardValidContestants.length} Accepted · {currentWardNominations.filter((n) => n.scrutinyStatus === 'REJECTED').length} Rejected
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: 1. Nominations in Ward, 2. Scrutiny in Ward, 3. Ballot Paper in Ward */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('nominations')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'nominations'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Nominations in Ward {selectedWardNumber} ({currentWardNominations.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('scrutiny')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'scrutiny'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Ward Scrutiny & Withdrawal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('ballot')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeSubTab === 'ballot'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Vote className="w-3.5 h-3.5" />
                  <span>Form 7A Ward Ballot ({wardValidContestants.length})</span>
                </button>
              </div>

              {!authenticatedOperator && onOpenLoginModal && (
                <button
                  type="button"
                  onClick={onOpenLoginModal}
                  className="text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  Sign In (RO / DEO)
                </button>
              )}
            </div>

            {/* SUB-TAB 1: NOMINATIONS IN WARD */}
            {activeSubTab === 'nominations' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-3">
                {currentWardNominations.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-xs text-slate-500">
                      No nominations filed yet for Ward No. {selectedWardNumber}.
                    </p>
                    {isCurrentWardOperator ? (
                      <button
                        type="button"
                        onClick={() => onOpenNewNomination('WARD_MEMBER', selectedWardNumber)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
                      >
                        + File First Ward {selectedWardNumber} Nomination
                      </button>
                    ) : isOperator ? (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg max-w-sm mx-auto text-amber-900 text-xs">
                        🔒 Data entry locked. Only Ward {selectedWardNumber} Operator ({currentWard?.dataEntryPerson.name}) can file nominations for this ward.
                      </div>
                    ) : !authenticatedOperator && onOpenLoginModal ? (
                      <button
                        type="button"
                        onClick={onOpenLoginModal}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer"
                      >
                        Sign in with Operator Mobile to File
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {currentWardNominations.map((nom) => {
                      const resCheck = validateReservation(
                        currentWard?.reservation || 'GEN',
                        nom.gender,
                        nom.category
                      );

                      return (
                        <div
                          key={nom.id}
                          className="border border-slate-200 rounded-xl p-3 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                              {nom.allottedSymbol?.icon || '🗳️'}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm truncate">
                                  {nom.candidateName}
                                </span>
                                <span className="font-mono text-slate-500 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {nom.nominationNo}
                                </span>
                              </div>
                              <div className="text-slate-500 text-[11px] mt-0.5 flex flex-wrap items-center gap-2">
                                <span>Father/Spouse: <strong>{nom.fatherOrSpouseName}</strong></span>
                                <span>·</span>
                                <span>Age: <strong>{nom.age}</strong></span>
                                <span>·</span>
                                <span>Party: <strong>{nom.allottedParty || nom.partyAffiliation || 'Independent'}</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                                resCheck.isEligible
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {resCheck.isEligible ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-700" />
                              )}
                              <span>{nom.category}-{nom.gender.slice(0, 1)}</span>
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                nom.scrutinyStatus === 'ACCEPTED'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : nom.scrutinyStatus === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {nom.scrutinyStatus}
                            </span>

                            {nom.withdrawn && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                                Withdrawn
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => onViewDetails(nom)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>Details &gt;</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: WARD SCRUTINY & WITHDRAWAL */}
            {activeSubTab === 'scrutiny' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Form 5 Scrutiny & Form 6 Withdrawal Desk — Ward {selectedWardNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Returning Officer reviews statutory affidavits and notices of withdrawal for this ward.
                    </p>
                  </div>
                  {!isOfficer && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <Lock className="w-3 h-3 text-slate-400" />
                      RO Scrutiny Authority Required
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {currentWardNominations.map((nom) => (
                    <div
                      key={nom.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{nom.candidateName}</span>
                          <span className="text-slate-500 font-mono text-[10px]">({nom.nominationNo})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              nom.scrutinyStatus === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-900'
                                : nom.scrutinyStatus === 'REJECTED'
                                ? 'bg-rose-100 text-rose-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {nom.scrutinyStatus}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Category: <strong>{nom.category}</strong> · Gender: <strong>{nom.gender}</strong> · Wealth: ₹{((nom.assets?.movableVal || 0) + (nom.assets?.immovableVal || 0)).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                        {isOfficer && onQuickScrutinize && nom.scrutinyStatus === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onQuickScrutinize(nom.id, 'ACCEPTED', 'Verified and accepted')}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt('Statutory reason for rejection:');
                                if (reason) onQuickScrutinize(nom.id, 'REJECTED', reason);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isOfficer && nom.scrutinyStatus === 'ACCEPTED' && !nom.withdrawn && (
                          <button
                            type="button"
                            onClick={() => handleRecordWithdrawal(nom)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <UserX className="w-3 h-3" />
                            Record Withdrawal (Form 6)
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewDetails(nom)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Details &gt;</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: WARD BALLOT PAPER */}
            {activeSubTab === 'ballot' && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 space-y-4">
                <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Form 7A: Final Contestants & Ballot Ordering — Ward {selectedWardNumber}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Returning Officer assigns serial order in ballot paper, official symbol & party for this ward.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded">
                    {wardValidContestants.length} Valid Contestants
                  </span>
                </div>

                {wardValidContestants.length === 1 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-2.5 text-xs text-amber-900">
                    <Award className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <strong className="block">Unopposed / Uncontested Election in Ward {selectedWardNumber}!</strong>
                      <span>
                        Candidate <strong>{wardValidContestants[0].candidateName}</strong> is declared elected unopposed.
                      </span>
                    </div>
                  </div>
                )}

                {wardValidContestants.length === 0 ? (
                  <p className="text-slate-400 italic text-xs py-4 text-center">
                    No accepted contestants ready for ballot paper yet in this ward.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedWardContestants.map((c, idx) => (
                      <div
                        key={c.id}
                        className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="text-xl shrink-0">{c.allottedSymbol?.icon || '🗳️'}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-sm block truncate">
                              {c.candidateName}
                            </span>
                            <span className="text-slate-500 text-[11px] block">
                              Symbol: <strong className="text-slate-800">{c.allottedSymbol?.name || c.symbolRequested}</strong> · Party: <strong className="text-slate-800">{c.allottedParty || c.partyAffiliation || 'Independent'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                          {isOfficer ? (
                            <>
                              <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveBallotOrder(sortedWardContestants, idx, 'UP')}
                                  className="p-1 hover:bg-white rounded text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Up in Ballot"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === sortedWardContestants.length - 1}
                                  onClick={() => handleMoveBallotOrder(sortedWardContestants, idx, 'DOWN')}
                                  className="p-1 hover:bg-white rounded text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Move Down in Ballot"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <select
                                value={c.allottedSymbol?.name || c.symbolRequested}
                                onChange={(e) => handleAllotSymbol(c, e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer max-w-[120px]"
                                title="Assign Symbol"
                              >
                                {availableSymbols.map((s) => (
                                  <option key={s.code} value={s.name}>
                                    {s.icon} {s.name}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={c.allottedParty || c.partyAffiliation || 'Independent'}
                                onChange={(e) => handleAllotParty(c, e.target.value)}
                                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer max-w-[120px]"
                                title="Assign Party"
                              >
                                {availableParties.map((p) => (
                                  <option key={p.id} value={p.name}>
                                    {p.abbreviation} - {p.name}
                                  </option>
                                ))}
                              </select>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-500 italic">
                              Allotted: {c.allottedSymbol?.name} ({c.allottedParty || c.partyAffiliation})
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => onViewDetails(c)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Details &gt;</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
