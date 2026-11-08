/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Nomination,
  Panchayat,
  Ward,
  ScrutinyStatus,
  FREE_SYMBOLS,
  RESERVATION_LABELS,
  AuthenticatedOperator,
} from '../../types/election';
import { validateReservation } from '../../utils/reservationValidator';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Sparkles,
  FileText,
  Printer,
  Award,
  Lock,
  ShieldAlert,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
} from 'lucide-react';

interface ScrutinyAndWithdrawalProps {
  nominations: Nomination[];
  panchayat: Panchayat;
  wards: Ward[];
  authenticatedOperator?: AuthenticatedOperator | null;
  onUpdateNomination: (updated: Nomination) => void;
  onViewDetails: (nomination: Nomination) => void;
}

export const ScrutinyAndWithdrawal: React.FC<ScrutinyAndWithdrawalProps> = ({
  nominations,
  panchayat,
  wards,
  authenticatedOperator,
  onUpdateNomination,
  onViewDetails,
}) => {
  const isOfficer = authenticatedOperator?.role === 'RO';
  const [subTab, setSubTab] = useState<'scrutiny' | 'withdrawal' | 'contesting'>('scrutiny');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const panchayatNominations = nominations.filter((n) => n.panchayatId === panchayat.id);

  // Scrutiny actions
  const handleAccept = (nom: Nomination) => {
    const updated: Nomination = {
      ...nom,
      scrutinyStatus: 'ACCEPTED',
      scrutinyRemarks: 'All statutory declarations, caste certificate & Form 26 verified valid.',
      scrutinizedBy: `${panchayat.returningOfficer.name} (${panchayat.returningOfficer.designation})`,
      scrutinyTimestamp: new Date().toISOString(),
      // Automatically assign requested or free symbol if none assigned
      allottedSymbol: nom.allottedSymbol || {
        name: nom.symbolRequested,
        code: FREE_SYMBOLS.find((s) => s.name === nom.symbolRequested)?.code || 'SYM-01',
        icon: FREE_SYMBOLS.find((s) => s.name === nom.symbolRequested)?.icon || '🗳️',
      },
    };
    onUpdateNomination(updated);
  };

  const handleReject = (nom: Nomination) => {
    if (!rejectionReason.trim()) {
      alert('Please enter statutory reason for rejection under Panchayat Election Rules.');
      return;
    }
    const updated: Nomination = {
      ...nom,
      scrutinyStatus: 'REJECTED',
      scrutinyRemarks: rejectionReason,
      scrutinizedBy: `${panchayat.returningOfficer.name} (${panchayat.returningOfficer.designation})`,
      scrutinyTimestamp: new Date().toISOString(),
    };
    onUpdateNomination(updated);
    setRejectingId(null);
    setRejectionReason('');
  };

  // Withdrawal action (restricted to Officer recording the Form 6 notice)
  const handleWithdraw = (nom: Nomination) => {
    if (!isOfficer) {
      alert('Only the Returning Officer has the statutory authority to accept and record Form 6 Notice of Withdrawal.');
      return;
    }
    const noticeNo = prompt('Enter Form 6 Withdrawal Notice Number:', `WITHDRAW-2026-${Math.floor(100 + Math.random() * 900)}`);
    if (!noticeNo) return;

    const updated: Nomination = {
      ...nom,
      withdrawn: true,
      withdrawnTimestamp: new Date().toISOString(),
      withdrawnNoticeNo: noticeNo,
    };
    onUpdateNomination(updated);
  };

  // Officer statutory authority: Allot Symbol
  const handleAllotSymbol = (nom: Nomination, symbolName: string) => {
    if (!isOfficer) {
      alert('Only the Returning Officer has the right to allot election symbols.');
      return;
    }
    const sym = FREE_SYMBOLS.find((s) => s.name === symbolName);
    if (!sym) return;

    const updated: Nomination = {
      ...nom,
      allottedSymbol: {
        name: sym.name,
        code: sym.code,
        icon: sym.icon,
      },
    };
    onUpdateNomination(updated);
  };

  // Officer statutory authority: Allot Party
  const handleAllotParty = (nom: Nomination, partyName: string) => {
    if (!isOfficer) {
      alert('Only the Returning Officer has the right to allot recognized political party affiliation.');
      return;
    }
    const updated: Nomination = {
      ...nom,
      allottedParty: partyName,
    };
    onUpdateNomination(updated);
  };

  // Officer statutory authority: Reorder name / serial order in ballot paper
  const handleMoveBallotOrder = (list: Nomination[], index: number, direction: 'UP' | 'DOWN') => {
    if (!isOfficer) {
      alert('Only the Returning Officer has the statutory power to determine candidate name order in ballot paper.');
      return;
    }
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const itemA = list[index];
    const itemB = list[targetIndex];

    onUpdateNomination({ ...itemA, ballotOrder: targetIndex + 1 });
    onUpdateNomination({ ...itemB, ballotOrder: index + 1 });
  };

  // Valid non-withdrawn contestants
  const validContestants = panchayatNominations.filter(
    (n) => n.scrutinyStatus === 'ACCEPTED' && !n.withdrawn
  );

  // Sort Sarpanch contestants by ballotOrder if set, else alphabetical by candidateName
  const sarpanchContestants = [...validContestants.filter((n) => n.postType === 'PRESIDENT')].sort((a, b) => {
    if (a.ballotOrder && b.ballotOrder) return a.ballotOrder - b.ballotOrder;
    if (a.ballotOrder) return -1;
    if (b.ballotOrder) return 1;
    return a.candidateName.localeCompare(b.candidateName);
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Sub Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg p-1.5 sm:p-2 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSubTab('scrutiny')}
            className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              subTab === 'scrutiny'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Scrutiny (Form 5)</span>
          </button>

          <button
            onClick={() => setSubTab('withdrawal')}
            className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              subTab === 'withdrawal'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Withdrawal (Form 6)</span>
          </button>

          <button
            onClick={() => setSubTab('contesting')}
            className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              subTab === 'contesting'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Contestants (Form 7A)</span>
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center gap-1 no-print cursor-pointer"
        >
          <Printer className="w-3 h-3" />
          <span className="hidden sm:inline">Print Gazette</span>
        </button>
      </div>

      {/* Sub Tab 1: Scrutiny Desk */}
      {subTab === 'scrutiny' && (
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                RO Statutory Scrutiny Desk
              </h3>
              <p className="text-[11px] text-slate-500">
                Reservation eligibility, age (&ge; 21), Form 26 affidavits
              </p>
            </div>
            <div className="text-right text-[11px]">
              <span className="text-slate-400 block">RO:</span>
              <span className="font-semibold text-slate-800">{panchayat.returningOfficer.name}</span>
            </div>
          </div>

          <div className="space-y-3">
            {panchayatNominations.map((nom) => {
              const targetWard = wards.find((w) => w.wardNumber === nom.wardNumber);
              const targetReservation =
                nom.postType === 'PRESIDENT'
                  ? panchayat.sarpanchReservation
                  : targetWard?.reservation || 'GEN';

              const resCheck = validateReservation(
                targetReservation,
                nom.gender,
                nom.category
              );

              return (
                <div
                  key={nom.id}
                  className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {nom.candidateName}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {nom.nominationNo}
                        </span>
                        <span className="text-xs text-slate-500">
                          Contesting: <strong>{nom.postType === 'PRESIDENT' ? 'Sarpanch' : `Ward ${nom.wardNumber}`}</strong>
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                        <span>Father/Spouse: <strong>{nom.fatherOrSpouseName}</strong></span>
                        <span>·</span>
                        <span>Age: <strong>{nom.age}</strong></span>
                        <span>·</span>
                        <span>Gender: <strong>{nom.gender}</strong></span>
                        <span>·</span>
                        <span>Caste: <strong>{nom.category} ({nom.subCaste})</strong></span>
                        <span>·</span>
                        <span>EPIC: <strong className="font-mono">{nom.epicNumber}</strong></span>
                      </div>

                      {/* Reservation compliance check notice */}
                      <div
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md mt-2 ${
                          resCheck.isEligible
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {resCheck.isEligible ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>
                          Seat Reserved: {RESERVATION_LABELS[targetReservation]} — {resCheck.message}
                        </span>
                      </div>
                    </div>

                    {/* Scrutiny Status & Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewDetails(nom)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        >
                          View Form 26 Affidavit
                        </button>

                        {nom.scrutinyStatus === 'ACCEPTED' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Accepted (Valid)
                          </span>
                        ) : nom.scrutinyStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        ) : isOfficer ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setRejectingId(nom.id);
                                setRejectionReason(
                                  resCheck.isEligible
                                    ? 'Defective nomination / missing affidavit'
                                    : resCheck.message
                                );
                              }}
                              className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAccept(nom)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer shadow-xs"
                            >
                              Accept & Validate
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3 text-amber-600" />
                            Officer Scrutiny Required
                          </span>
                        )}
                      </div>

                      {nom.scrutinyRemarks && (
                        <div className="text-[11px] text-slate-500 italic max-w-md text-right">
                          Order: {nom.scrutinyRemarks}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reject reason input drawer */}
                  {rejectingId === nom.id && (
                    <div className="mt-3 pt-3 border-t border-slate-200 bg-rose-50/50 p-3 rounded-md space-y-2">
                      <label className="block text-xs font-semibold text-rose-900">
                        Enter Statutory Reason for Rejection under PR Election Rules:
                      </label>
                      <input
                        type="text"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Ineligible category for reserved seat / Age below 21 / Unpaid GP dues"
                        className="w-full bg-white border border-rose-300 rounded-md p-2 text-xs text-rose-900 focus:ring-2 focus:ring-rose-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(nom)}
                          className="px-3 py-1 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded"
                        >
                          Confirm Rejection Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub Tab 2: Withdrawal of Candidature (Form 6) */}
      {subTab === 'withdrawal' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Withdrawal of Candidature Desk (Form 6)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Validly nominated candidates may submit notice of withdrawal signed before Returning Officer prior to deadline.
            </p>
          </div>

          <div className="space-y-3">
            {panchayatNominations
              .filter((n) => n.scrutinyStatus === 'ACCEPTED')
              .map((nom) => (
                <div
                  key={nom.id}
                  className={`border rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-xs ${
                    nom.withdrawn
                      ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{nom.candidateName}</span>
                      <span className="font-mono text-slate-500">({nom.nominationNo})</span>
                      <span className="font-medium text-slate-700">
                        {nom.postType === 'PRESIDENT' ? 'President' : `Ward ${nom.wardNumber}`}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1">
                      Father/Spouse: {nom.fatherOrSpouseName} · Symbol: {nom.allottedSymbol?.name || nom.symbolRequested}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(nom)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Details &gt;</span>
                    </button>

                    {nom.withdrawn ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded bg-purple-200 text-purple-900 font-bold text-[11px]">
                          Withdrawn (Notice: {nom.withdrawnNoticeNo})
                        </span>
                      </div>
                    ) : isOfficer ? (
                      <button
                        onClick={() => handleWithdraw(nom)}
                        className="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Record Notice of Withdrawal (Form 6)
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Officer Withdrawal Authority Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Sub Tab 3: Final Contesting List (Form 7A) */}
      {subTab === 'contesting' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Form 7A: Final List of Contesting Candidates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official gazette of candidates who remain in contest after scrutiny and withdrawal period.
              </p>
            </div>
            <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {validContestants.length} Total Contesting Candidates
            </div>
          </div>

          {/* Uncontested / Unopposed detection */}
          {sarpanchContestants.length === 1 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-3 text-xs text-amber-900">
              <Award className="w-6 h-6 text-amber-700 shrink-0" />
              <div>
                <div className="font-bold text-sm">
                  Uncontested / Unopposed Election for Panchayat President!
                </div>
                <div>
                  Only 1 valid candidate (<strong>{sarpanchContestants[0].candidateName}</strong>) remains in contest.
                  Under PR Act rules, candidate is eligible for certificate of election without poll!
                </div>
              </div>
            </div>
          )}

          {/* President Contestants */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Panchayat President (Sarpanch) Ballot Order & Allotment ({sarpanchContestants.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                Seat Reserved for: <strong>{RESERVATION_LABELS[panchayat.sarpanchReservation]}</strong>
              </span>
            </div>

            <div className="space-y-2">
              {sarpanchContestants.map((c, idx) => (
                <div
                  key={c.id}
                  className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Ballot Order Serial Number badge */}
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      #{idx + 1}
                    </div>

                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                      {c.allottedSymbol?.icon || '🗳️'}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {c.candidateName}
                      </div>
                      <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-2">
                        <span>Symbol: <strong className="text-slate-800">{c.allottedSymbol?.name || c.symbolRequested}</strong></span>
                        <span>·</span>
                        <span>Party: <strong className="text-slate-800">{c.allottedParty || c.partyAffiliation || 'Independent'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Officer Controls: Symbol, Party, Ballot Ordering & Details */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:self-center">
                    {isOfficer ? (
                      <>
                        {/* Ballot Reorder Arrows */}
                        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveBallotOrder(sarpanchContestants, idx, 'UP')}
                            className="p-1 hover:bg-white rounded text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Up in Ballot Paper"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sarpanchContestants.length - 1}
                            onClick={() => handleMoveBallotOrder(sarpanchContestants, idx, 'DOWN')}
                            className="p-1 hover:bg-white rounded text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Down in Ballot Paper"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Symbol Allotment */}
                        <select
                          value={c.allottedSymbol?.name || c.symbolRequested}
                          onChange={(e) => handleAllotSymbol(c, e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer font-medium max-w-[130px]"
                          title="Assign Election Symbol (Officer Right)"
                        >
                          {FREE_SYMBOLS.map((s) => (
                            <option key={s.code} value={s.name}>
                              {s.icon} {s.name}
                            </option>
                          ))}
                        </select>

                        {/* Party Affiliation Allotment */}
                        <select
                          value={c.allottedParty || c.partyAffiliation || 'Independent'}
                          onChange={(e) => handleAllotParty(c, e.target.value)}
                          className="bg-white border border-slate-300 rounded px-2 py-1 text-xs cursor-pointer font-medium max-w-[120px]"
                          title="Assign Party Affiliation (Officer Right)"
                        >
                          <option value="Independent">Independent</option>
                          <option value="Ruling Alliance Party">Alliance A</option>
                          <option value="Opposition Party">Alliance B</option>
                          <option value="State Recognized Party">State Party</option>
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
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>Details &gt;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ward Member Contestants by Ward */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Ward Member Contestants by Ward ({wards.length} Wards)
              </h4>
              <span className="text-[11px] text-slate-500">
                Statutory ballot order, party & symbol assigned by RO
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {wards.map((ward) => {
                const wardContestants = [...validContestants.filter(
                  (n) => n.postType === 'WARD_MEMBER' && n.wardNumber === ward.wardNumber
                )].sort((a, b) => {
                  if (a.ballotOrder && b.ballotOrder) return a.ballotOrder - b.ballotOrder;
                  if (a.ballotOrder) return -1;
                  if (b.ballotOrder) return 1;
                  return a.candidateName.localeCompare(b.candidateName);
                });

                return (
                  <div
                    key={ward.id}
                    className="border border-slate-200 rounded-lg p-3 bg-white space-y-2 text-xs shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                          {ward.wardNumber}
                        </span>
                        <div className="font-bold text-slate-900 text-xs">
                          Ward No. {ward.wardNumber}
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {RESERVATION_LABELS[ward.reservation]}
                      </span>
                    </div>

                    {/* Ward unopposed notice */}
                    {wardContestants.length === 1 && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Unopposed contest (1 valid candidate)</span>
                      </div>
                    )}

                    {wardContestants.length === 0 ? (
                      <p className="text-slate-400 italic text-[11px] py-2">
                        No valid contestants in this ward.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {wardContestants.map((c, i) => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                #{i + 1}
                              </span>
                              <span className="text-lg shrink-0">
                                {c.allottedSymbol?.icon || '🗳️'}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-xs truncate">
                                  {c.candidateName}
                                </div>
                                <div className="text-slate-500 text-[10px] flex items-center gap-1.5 truncate">
                                  <span>{c.allottedSymbol?.name || c.symbolRequested}</span>
                                  <span>·</span>
                                  <span>{c.allottedParty || c.partyAffiliation || 'Independent'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                              {isOfficer && (
                                <>
                                  <div className="flex items-center gap-0.5 bg-white p-0.5 rounded border border-slate-200">
                                    <button
                                      type="button"
                                      disabled={i === 0}
                                      onClick={() => handleMoveBallotOrder(wardContestants, i, 'UP')}
                                      className="p-0.5 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-20 cursor-pointer"
                                      title="Move Up in Ballot"
                                    >
                                      <ArrowUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={i === wardContestants.length - 1}
                                      onClick={() => handleMoveBallotOrder(wardContestants, i, 'DOWN')}
                                      className="p-0.5 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-20 cursor-pointer"
                                      title="Move Down in Ballot"
                                    >
                                      <ArrowDown className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <select
                                    value={c.allottedSymbol?.name || c.symbolRequested}
                                    onChange={(e) => handleAllotSymbol(c, e.target.value)}
                                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] cursor-pointer max-w-[100px]"
                                    title="Allot Symbol"
                                  >
                                    {FREE_SYMBOLS.map((s) => (
                                      <option key={s.code} value={s.name}>
                                        {s.icon} {s.name}
                                      </option>
                                    ))}
                                  </select>

                                  <select
                                    value={c.allottedParty || c.partyAffiliation || 'Independent'}
                                    onChange={(e) => handleAllotParty(c, e.target.value)}
                                    className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] cursor-pointer max-w-[90px]"
                                    title="Allot Party"
                                  >
                                    <option value="Independent">Indep.</option>
                                    <option value="Ruling Alliance Party">Alliance A</option>
                                    <option value="Opposition Party">Alliance B</option>
                                    <option value="State Recognized Party">State</option>
                                  </select>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => onViewDetails(c)}
                                className="px-2 py-0.5 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
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
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
