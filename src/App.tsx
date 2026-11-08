/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  District,
  Division,
  Mandal,
  Panchayat,
  Ward,
  Nomination,
  HourlyTurnoutRecord,
  CountingRoundRecord,
  ScrutinyStatus,
  AuthenticatedOperator,
  PostType,
} from './types/election';
import {
  loadElectionState,
  saveElectionState,
  resetToDefaultState,
  ElectionAppState,
} from './services/storage';

import { Header, ActiveTab } from './components/Header';
import { HierarchySelector } from './components/HierarchySelector';
import { DistrictNominationsHome } from './components/dashboard/DistrictNominationsHome';
import { OperatorWorkspace } from './components/dashboard/OperatorWorkspace';
import { DataEntryLoginModal } from './components/auth/DataEntryLoginModal';
import { NominationList } from './components/nominations/NominationList';
import { NominationFormModal } from './components/nominations/NominationFormModal';
import { NominationDetailModal } from './components/nominations/NominationDetailModal';
import { ScrutinyAndWithdrawal } from './components/nominations/ScrutinyAndWithdrawal';
import { PanchayatDeskDrilldown } from './components/nominations/PanchayatDeskDrilldown';
import { PollingTurnoutTracker } from './components/polling/PollingTurnoutTracker';
import { RoundCountingManager } from './components/counting/RoundCountingManager';
import { OfficialResultSheet } from './components/results/OfficialResultSheet';
import { HierarchyManager } from './components/admin/HierarchyManager';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';

import { FileCheck, Scale, Users2, ShieldCheck, LogIn } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<ElectionAppState>(() => loadElectionState());

  // Default view is 'district_home' showing district-wise nominations filed
  const [activeTab, setActiveTab] = useState<ActiveTab>('district_home');

  // Sub-navigation for nominations tab
  const [nominationSubTab, setNominationSubTab] = useState<'list' | 'scrutiny_withdrawal'>('list');

  // Authenticated Data Entry Operator session
  const [authenticatedOperator, setAuthenticatedOperator] = useState<AuthenticatedOperator | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Hierarchy selections
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>(
    state.divisions[0]?.id || 'div-01'
  );
  const [selectedMandalId, setSelectedMandalId] = useState<string>(
    state.mandals[0]?.id || 'man-01'
  );
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string>(
    state.panchayats[0]?.id || 'pan-01'
  );

  // Modals state
  const [isNewNominationModalOpen, setIsNewNominationModalOpen] = useState(false);
  const [detailedNomination, setDetailedNomination] = useState<Nomination | null>(null);
  const [nominationDefaults, setNominationDefaults] = useState<{
    postType?: PostType;
    wardNumber?: number;
  }>({});

  const handleOpenNewNomination = (postType?: PostType, wardNumber?: number) => {
    setNominationDefaults({ postType, wardNumber });
    setIsNewNominationModalOpen(true);
  };

  // Auto-sync state changes to localStorage
  useEffect(() => {
    saveElectionState(state);
  }, [state]);

  // Derived active items
  const activeDivision =
    state.divisions.find((d) => d.id === selectedDivisionId) || state.divisions[0];
  const activeMandal =
    state.mandals.find((m) => m.id === selectedMandalId) || state.mandals[0];
  const activePanchayat =
    state.panchayats.find((p) => p.id === selectedPanchayatId) || state.panchayats[0];
  const activeWards = state.wards.filter((w) => w.panchayatId === activePanchayat?.id);

  // Handler: Operator Login via Mobile Number
  const handleOperatorLogin = (operator: AuthenticatedOperator) => {
    setAuthenticatedOperator(operator);
    setSelectedDivisionId(operator.divisionId);
    setSelectedMandalId(operator.mandalId);
    setSelectedPanchayatId(operator.panchayatId);
    setActiveTab('nominations');
  };

  // Handler: Operator Logout
  const handleOperatorLogout = () => {
    setAuthenticatedOperator(null);
    setActiveTab('district_home');
  };

  // Handler: Hierarchy changes
  const handleSelectDivision = (divId: string) => {
    setSelectedDivisionId(divId);
    const relatedMandals = state.mandals.filter((m) => m.divisionId === divId);
    if (relatedMandals.length > 0) {
      setSelectedMandalId(relatedMandals[0].id);
      const relatedPanchayats = state.panchayats.filter(
        (p) => p.mandalId === relatedMandals[0].id
      );
      if (relatedPanchayats.length > 0) {
        setSelectedPanchayatId(relatedPanchayats[0].id);
      }
    }
  };

  const handleSelectMandal = (mandalId: string) => {
    setSelectedMandalId(mandalId);
    const relatedPanchayats = state.panchayats.filter((p) => p.mandalId === mandalId);
    if (relatedPanchayats.length > 0) {
      setSelectedPanchayatId(relatedPanchayats[0].id);
    }
  };

  const handleSelectPanchayat = (panchayatId: string) => {
    setSelectedPanchayatId(panchayatId);
  };

  // Handler: Drilldown from District Overview
  const handlePanchayatDrilldown = (panchayatId: string) => {
    const pan = state.panchayats.find((p) => p.id === panchayatId);
    if (pan) {
      const man = state.mandals.find((m) => m.id === pan.mandalId);
      if (man) {
        setSelectedDivisionId(man.divisionId);
        setSelectedMandalId(man.id);
        setSelectedPanchayatId(pan.id);
        setActiveTab('nominations');
      }
    }
  };

  // Handler: Add new nomination
  const handleAddNomination = (newNom: Nomination) => {
    setState((prev) => ({
      ...prev,
      nominations: [newNom, ...prev.nominations],
    }));
  };

  // Handler: Update nomination
  const handleUpdateNomination = (updated: Nomination) => {
    setState((prev) => ({
      ...prev,
      nominations: prev.nominations.map((n) => (n.id === updated.id ? updated : n)),
    }));
  };

  // Handler: Quick Scrutiny
  const handleQuickScrutinize = (
    nominationId: string,
    status: ScrutinyStatus,
    remarks: string
  ) => {
    setState((prev) => ({
      ...prev,
      nominations: prev.nominations.map((n) =>
        n.id === nominationId
          ? {
              ...n,
              scrutinyStatus: status,
              scrutinyRemarks: remarks,
              scrutinizedBy: `${activePanchayat.returningOfficer.name} (RO)`,
              scrutinyTimestamp: new Date().toISOString(),
            }
          : n
      ),
    }));
  };

  // Handler: Save Turnout record
  const handleSaveTurnoutRecord = (record: HourlyTurnoutRecord) => {
    setState((prev) => {
      const exists = prev.turnoutRecords.some((r) => r.id === record.id);
      const updated = exists
        ? prev.turnoutRecords.map((r) => (r.id === record.id ? record : r))
        : [...prev.turnoutRecords, record];
      return {
        ...prev,
        turnoutRecords: updated,
      };
    });
  };

  // Handler: Save Counting record
  const handleSaveCountingRecord = (record: CountingRoundRecord) => {
    setState((prev) => {
      const exists = prev.countingRecords.some((r) => r.id === record.id);
      const updated = exists
        ? prev.countingRecords.map((r) => (r.id === record.id ? record : r))
        : [...prev.countingRecords, record];
      return {
        ...prev,
        countingRecords: updated,
      };
    });
  };

  // Handler: Reset to sample dataset
  const handleResetData = () => {
    if (
      confirm(
        'Reset election portal to default sample dataset? (All current custom edits will be restored to initial state)'
      )
    ) {
      const defaultState = resetToDefaultState();
      setState(defaultState);
      setSelectedDivisionId(defaultState.divisions[0].id);
      setSelectedMandalId(defaultState.mandals[0].id);
      setSelectedPanchayatId(defaultState.panchayats[0].id);
      setAuthenticatedOperator(null);
      setActiveTab('district_home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header with Top Bar Contract — NO "+ File Nomination" on public view! */}
      <Header
        districtName={state.district.name}
        panchayatName={activePanchayat?.name || 'Gram Panchayat'}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenNewNomination={() => setIsNewNominationModalOpen(true)}
        onLogout={handleOperatorLogout}
        onResetData={handleResetData}
        authenticatedOperator={authenticatedOperator}
      />

      {/* Hierarchy Selector shown on polling, counting, results, hierarchy tabs */}
      {activeTab !== 'district_home' && activeTab !== 'nominations' && (
        <HierarchySelector
          district={state.district}
          divisions={state.divisions}
          mandals={state.mandals}
          panchayats={state.panchayats}
          wards={state.wards}
          selectedDivisionId={selectedDivisionId}
          selectedMandalId={selectedMandalId}
          selectedPanchayatId={selectedPanchayatId}
          onSelectDivision={handleSelectDivision}
          onSelectMandal={handleSelectMandal}
          onSelectPanchayat={handleSelectPanchayat}
        />
      )}

      {/* Main Viewport Content - pb-20 for mobile bottom navigation thumb bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 pt-2.5 pb-20 md:pb-6">
        {/* Tab 0: Home Page — Executive Election Command Dashboard (All 5 Pillars) */}
        {activeTab === 'district_home' && (
          <DistrictNominationsHome
            district={state.district}
            divisions={state.divisions}
            mandals={state.mandals}
            panchayats={state.panchayats}
            wards={state.wards}
            nominations={state.nominations}
            hourlyTurnout={state.turnoutRecords}
            countingRecords={state.countingRecords}
            pollingStations={state.pollingStations}
            activePanchayat={activePanchayat}
            activeDivision={activeDivision}
            activeMandal={activeMandal}
            authenticatedOperator={authenticatedOperator}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSelectPanchayat={(panId) => handleSelectPanchayat(panId)}
          />
        )}

        {/* Tab 1: Nominations, Scrutiny & Withdrawal (Hierarchical Panchayat Desk) */}
        {activeTab === 'nominations' && (
          <div className="space-y-4">
            {/* If Operator or RO is logged in, show their active session banner */}
            {authenticatedOperator && (
              <div className="bg-emerald-950 text-white rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 border border-emerald-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                    {authenticatedOperator.role === 'RO' ? 'RO' : 'DEO'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {authenticatedOperator.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          authenticatedOperator.role === 'RO'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-emerald-800 text-emerald-100'
                        }`}
                      >
                        {authenticatedOperator.role === 'RO'
                          ? 'Returning Officer (RO)'
                          : 'Data Entry Operator (DEO)'}
                      </span>
                    </div>
                    <span className="text-xs text-emerald-200">
                      Assigned: {authenticatedOperator.panchayatName}
                      {authenticatedOperator.assignedWardNumber
                        ? ` · Ward ${authenticatedOperator.assignedWardNumber}`
                        : ' · All Wards / President'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {authenticatedOperator.role !== 'RO' && (
                    <button
                      type="button"
                      onClick={() => handleOpenNewNomination()}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>+ File Nomination</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOperatorLogout}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-200 hover:text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            <PanchayatDeskDrilldown
              district={state.district}
              divisions={state.divisions}
              mandals={state.mandals}
              panchayats={state.panchayats}
              wards={state.wards}
              nominations={state.nominations}
              pollingStations={state.pollingStations}
              parties={state.parties}
              symbols={state.symbols}
              selectedDivisionId={selectedDivisionId}
              selectedMandalId={selectedMandalId}
              selectedPanchayatId={selectedPanchayatId}
              authenticatedOperator={authenticatedOperator}
              onSelectDivision={handleSelectDivision}
              onSelectMandal={handleSelectMandal}
              onSelectPanchayat={handleSelectPanchayat}
              onViewDetails={(nom) => setDetailedNomination(nom)}
              onOpenNewNomination={handleOpenNewNomination}
              onQuickScrutinize={handleQuickScrutinize}
              onUpdateNomination={handleUpdateNomination}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Hourly Polling Turnout */}
        {activeTab === 'polling' && (
          <PollingTurnoutTracker
            panchayat={activePanchayat}
            wards={activeWards}
            pollingStations={state.pollingStations.filter(
              (ps) => ps.panchayatId === activePanchayat?.id
            )}
            turnoutRecords={state.turnoutRecords}
            authenticatedOperator={authenticatedOperator}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSaveTurnoutRecord={handleSaveTurnoutRecord}
          />
        )}

        {/* Tab 3: Round Vote Counting */}
        {activeTab === 'counting' && (
          <RoundCountingManager
            panchayat={activePanchayat}
            wards={activeWards}
            nominations={state.nominations}
            countingRecords={state.countingRecords}
            authenticatedOperator={authenticatedOperator}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onSaveCountingRecord={handleSaveCountingRecord}
            onGoToResults={() => setActiveTab('results')}
          />
        )}

        {/* Tab 4: Official Result Sheet (Form 20 Gazette & Form 21E Certificate) */}
        {activeTab === 'results' && (
          <OfficialResultSheet
            district={state.district}
            division={activeDivision}
            mandal={activeMandal}
            panchayat={activePanchayat}
            wards={activeWards}
            nominations={state.nominations}
            countingRecords={state.countingRecords}
          />
        )}

        {/* Tab 5: Administrative Master Data (Hierarchy, Wards, Reservations, Voters M/F/O, Operators, Parties, Symbols) */}
        {activeTab === 'hierarchy' && (
          <HierarchyManager
            district={state.district}
            divisions={state.divisions}
            mandals={state.mandals}
            panchayats={state.panchayats}
            wards={state.wards}
            parties={state.parties}
            symbols={state.symbols}
            selectedDivisionId={selectedDivisionId}
            selectedMandalId={selectedMandalId}
            selectedPanchayatId={selectedPanchayatId}
            onUpdateDistrict={(dist) => setState((p) => ({ ...p, district: dist }))}
            onUpdatePanchayat={(pan) =>
              setState((p) => ({
                ...p,
                panchayats: p.panchayats.map((item) => (item.id === pan.id ? pan : item)),
              }))
            }
            onUpdateWards={(wList) => setState((p) => ({ ...p, wards: wList }))}
            onAddDivision={(div) => setState((p) => ({ ...p, divisions: [...p.divisions, div] }))}
            onUpdateDivision={(div) =>
              setState((p) => ({
                ...p,
                divisions: p.divisions.map((d) => (d.id === div.id ? div : d)),
              }))
            }
            onDeleteDivision={(divId) =>
              setState((p) => ({
                ...p,
                divisions: p.divisions.filter((d) => d.id !== divId),
              }))
            }
            onAddMandal={(man) => setState((p) => ({ ...p, mandals: [...p.mandals, man] }))}
            onAddPanchayat={(pan) =>
              setState((p) => ({ ...p, panchayats: [...p.panchayats, pan] }))
            }
            onUpdateParties={(pList) => setState((p) => ({ ...p, parties: pList }))}
            onUpdateSymbols={(sList) => setState((p) => ({ ...p, symbols: sList }))}
            onSelectDivision={handleSelectDivision}
            onSelectMandal={handleSelectMandal}
            onSelectPanchayat={handleSelectPanchayat}
            onDeleteWard={(wardId) =>
              setState((p) => ({ ...p, wards: p.wards.filter((w) => w.id !== wardId) }))
            }
            onDeletePanchayat={(panId) =>
              setState((p) => ({
                ...p,
                panchayats: p.panchayats.filter((pan) => pan.id !== panId),
              }))
            }
            onDeleteMandal={(manId) =>
              setState((p) => ({
                ...p,
                mandals: p.mandals.filter((m) => m.id !== manId),
              }))
            }
          />
        )}
      </main>

      {/* Modal 1: Data Entry Operator Login by Mobile Number */}
      {isLoginModalOpen && (
        <DataEntryLoginModal
          district={state.district}
          divisions={state.divisions}
          mandals={state.mandals}
          panchayats={state.panchayats}
          wards={state.wards}
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleOperatorLogin}
        />
      )}

      {/* Modal 2: New Nomination Filing Modal (Available only inside Operator session) */}
      {isNewNominationModalOpen && (
        <NominationFormModal
          panchayat={activePanchayat}
          wards={activeWards}
          authenticatedOperator={authenticatedOperator}
          defaultPostType={nominationDefaults.postType}
          defaultWardNumber={nominationDefaults.wardNumber}
          isOpen={isNewNominationModalOpen}
          onClose={() => setIsNewNominationModalOpen(false)}
          onSubmit={handleAddNomination}
        />
      )}

      {/* Modal 3: View / Take Detailed Information (Form 26 Affidavit, Assets, Clearances) */}
      {detailedNomination && (
        <NominationDetailModal
          nomination={detailedNomination}
          panchayat={activePanchayat}
          ward={activeWards.find((w) => w.wardNumber === detailedNomination.wardNumber)}
          authenticatedOperator={authenticatedOperator}
          isOpen={Boolean(detailedNomination)}
          onClose={() => setDetailedNomination(null)}
          onScrutinize={authenticatedOperator?.role === 'RO' ? (status, remarks) => {
            handleQuickScrutinize(detailedNomination.id, status, remarks);
            setDetailedNomination(null);
          } : undefined}
        />
      )}

      {/* Statutory Footer */}
      <footer className="border-t border-slate-200 bg-white py-2.5 sm:py-3.5 mt-auto no-print text-[11px] sm:text-xs text-slate-500 pb-20 md:pb-3.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-slate-800">
              Panchayat Election System
            </span>
            <span className="text-slate-300">·</span>
            <span>SEC AP</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-slate-500">
            <span>District: {state.district.name}</span>
            <span>·</span>
            <span>Poll: {state.district.electionDate}</span>
            <span>·</span>
            {authenticatedOperator ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Operator Session Active: {authenticatedOperator.name}
              </span>
            ) : (
              <span className="font-mono text-slate-400">Panchayat Raj Rules Compliant</span>
            )}
          </div>
        </div>
      </footer>

      {/* Mobile-First Bottom Thumb Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
