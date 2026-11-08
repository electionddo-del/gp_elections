/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Nomination,
  Panchayat,
  Ward,
  PostType,
  ScrutinyStatus,
  RESERVATION_LABELS,
  AuthenticatedOperator,
} from '../../types/election';
import { validateReservation } from '../../utils/reservationValidator';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileCheck2,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  UserX,
  LogIn,
} from 'lucide-react';

interface NominationListProps {
  nominations: Nomination[];
  panchayat: Panchayat;
  wards: Ward[];
  authenticatedOperator?: AuthenticatedOperator | null;
  onViewDetails: (nomination: Nomination) => void;
  onOpenNewNomination: () => void;
  onOpenLogin?: () => void;
  onQuickScrutinize?: (nominationId: string, status: ScrutinyStatus, remarks: string) => void;
}

export const NominationList: React.FC<NominationListProps> = ({
  nominations,
  panchayat,
  wards,
  authenticatedOperator,
  onViewDetails,
  onOpenNewNomination,
  onOpenLogin,
  onQuickScrutinize,
}) => {
  const [postFilter, setPostFilter] = useState<'ALL' | PostType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ScrutinyStatus | 'WITHDRAWN'>('ALL');
  const [selectedWardFilter, setSelectedWardFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter nominations for current panchayat
  const panchayatNominations = nominations.filter((n) => n.panchayatId === panchayat.id);

  const filteredNominations = panchayatNominations.filter((nom) => {
    if (postFilter !== 'ALL' && nom.postType !== postFilter) return false;
    if (statusFilter === 'WITHDRAWN') {
      if (!nom.withdrawn) return false;
    } else if (statusFilter !== 'ALL') {
      if (nom.scrutinyStatus !== statusFilter || nom.withdrawn) return false;
    }
    if (selectedWardFilter !== 'ALL' && nom.wardNumber !== selectedWardFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        nom.candidateName.toLowerCase().includes(q) ||
        nom.nominationNo.toLowerCase().includes(q) ||
        nom.epicNumber.toLowerCase().includes(q) ||
        nom.fatherOrSpouseName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate stats
  const totalCount = panchayatNominations.length;
  const presidentCount = panchayatNominations.filter((n) => n.postType === 'PRESIDENT').length;
  const wardCount = panchayatNominations.filter((n) => n.postType === 'WARD_MEMBER').length;
  const acceptedCount = panchayatNominations.filter((n) => n.scrutinyStatus === 'ACCEPTED' && !n.withdrawn).length;
  const rejectedCount = panchayatNominations.filter((n) => n.scrutinyStatus === 'REJECTED').length;
  const withdrawnCount = panchayatNominations.filter((n) => n.withdrawn).length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Metric Strip (Clean, unboxed, 3 cols on mobile, 6 on desktop) */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2.5">
        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Total Nom.</span>
          <span className="text-base sm:text-xl font-bold text-slate-900 tabular-nums block">{totalCount}</span>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Filed across posts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Sarpanch</span>
          <span className="text-base sm:text-xl font-bold text-emerald-800 tabular-nums block">{presidentCount}</span>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">
            {RESERVATION_LABELS[panchayat.sarpanchReservation]}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Ward Mem.</span>
          <span className="text-base sm:text-xl font-bold text-slate-900 tabular-nums block">{wardCount}</span>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">{wards.length} wards</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Accepted</span>
          <span className="text-base sm:text-xl font-bold text-emerald-700 tabular-nums block">{acceptedCount}</span>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Valid contestants</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Rejected</span>
          <span className="text-base sm:text-xl font-bold text-rose-700 tabular-nums block">{rejectedCount}</span>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Form 5 rejected</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block truncate">Withdrawn</span>
          <span className="text-base sm:text-xl font-bold text-purple-700 tabular-nums block">{withdrawnCount}</span>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-0.5">Form 6 notices</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Post Type Segmented Control */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
          <button
            onClick={() => setPostFilter('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              postFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setPostFilter('PRESIDENT')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              postFilter === 'PRESIDENT'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sarpanch ({presidentCount})
          </button>
          <button
            onClick={() => setPostFilter('WARD_MEMBER')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
              postFilter === 'WARD_MEMBER'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ward ({wardCount})
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-slate-200 text-slate-800 rounded-md px-2 py-1 text-xs font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACCEPTED">Accepted / Valid</option>
            <option value="REJECTED">Rejected</option>
            <option value="PENDING">Pending Scrutiny</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>

        {/* Ward Filter (if ward members selected or all) */}
        {postFilter !== 'PRESIDENT' && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Ward:</span>
            <select
              value={selectedWardFilter}
              onChange={(e) =>
                setSelectedWardFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="bg-white border border-slate-200 text-slate-800 rounded-md px-2 py-1 text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.wardNumber}>
                  Ward {w.wardNumber} ({w.reservation})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, EPIC, or nomination no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Primary Action — Only available when logged in as Data Entry Operator! Officer cant file nominations */}
        {authenticatedOperator && authenticatedOperator.role !== 'RO' && (
          <button
            onClick={onOpenNewNomination}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
          >
            + File Nomination
          </button>
        )}
      </div>

      {/* Nominations Data Grid */}

      {/* Mobile-Optimized List (< md) */}
      <div className="block md:hidden space-y-2">
        {filteredNominations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-xs">
            No nominations found matching current filter.
          </div>
        ) : (
          filteredNominations.map((nom) => {
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
                className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {nom.candidateName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {nom.nominationNo}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {nom.postType === 'PRESIDENT' ? (
                        <strong className="text-emerald-900 font-semibold">Sarpanch (President)</strong>
                      ) : (
                        <span>Ward Member — <strong>Ward {nom.wardNumber}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {nom.withdrawn ? (
                      <span className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        <UserX className="w-3 h-3" />
                        Withdrawn
                      </span>
                    ) : nom.scrutinyStatus === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Accepted
                      </span>
                    ) : nom.scrutinyStatus === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">{nom.allottedSymbol?.icon || '🗳️'} {nom.allottedSymbol?.name || nom.symbolRequested}</span>
                    <span>·</span>
                    <span className={resCheck.isEligible ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                      {resCheck.isEligible ? `Eligible (${nom.category})` : `Ineligible`}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewDetails(nom)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Eye className="w-3 h-3 text-emerald-700" />
                    <span>Details &gt;</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Nomination No</th>
                <th className="py-2.5 px-3">Candidate & Details</th>
                <th className="py-2.5 px-3">Post & Ward</th>
                <th className="py-2.5 px-3">Seat Reservation Check</th>
                <th className="py-2.5 px-3">Symbol / Party</th>
                <th className="py-2.5 px-3">Scrutiny Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNominations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No nominations match your active filters.
                  </td>
                </tr>
              ) : (
                filteredNominations.map((nom) => {
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
                    <tr key={nom.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nom No */}
                      <td className="py-2 px-2.5 font-mono font-medium text-slate-800 whitespace-nowrap">
                        <div>{nom.nominationNo}</div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(nom.submissionTimestamp).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Candidate Particulars */}
                      <td className="py-2 px-2.5">
                        <div className="font-semibold text-slate-900 text-xs">{nom.candidateName}</div>
                        <div className="text-[11px] text-slate-500">
                          {nom.fatherOrSpouseName} · {nom.age} yrs · {nom.gender}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          EPIC: {nom.epicNumber}
                        </div>
                      </td>

                      {/* Post & Ward */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {nom.postType === 'PRESIDENT' ? (
                            <span className="font-bold text-emerald-900">Gram Panchayat President</span>
                          ) : (
                            <span>Ward Member — Ward {nom.wardNumber}</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Seat: <strong>{RESERVATION_LABELS[targetReservation]}</strong>
                        </div>
                      </td>

                      {/* Reservation Compliance Badge */}
                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-1.5">
                          {resCheck.isEligible ? (
                            <div className="flex items-center gap-1 text-emerald-700 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>Eligible ({nom.category})</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-rose-700 font-medium">
                              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                              <span title={resCheck.message}>Ineligible ({nom.gender}/{nom.category})</span>
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Deposit: ₹{nom.securityDeposit.amount} ({nom.securityDeposit.receiptNo})
                        </div>
                      </td>

                      {/* Symbol & Party */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          {nom.allottedSymbol ? (
                            <>
                              <span>{nom.allottedSymbol.icon}</span>
                              <span>{nom.allottedSymbol.name}</span>
                            </>
                          ) : (
                            <span>Requested: {nom.symbolRequested}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{nom.allottedParty || nom.partyAffiliation}</div>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        {nom.withdrawn ? (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <UserX className="w-3 h-3" />
                            Withdrawn
                          </span>
                        ) : nom.scrutinyStatus === 'ACCEPTED' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Valid / Accepted
                          </span>
                        ) : nom.scrutinyStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <Clock className="w-3 h-3" />
                            Pending Scrutiny
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewDetails(nom)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
                            title="On click view or take detailed information (Form 26, assets, affidavit)"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </button>

                          {/* Scrutiny action strictly restricted to Returning Officer */}
                          {authenticatedOperator?.role === 'RO' && nom.scrutinyStatus === 'PENDING' && onQuickScrutinize && (
                            <button
                              onClick={() =>
                                onQuickScrutinize(
                                  nom.id,
                                  resCheck.isEligible ? 'ACCEPTED' : 'REJECTED',
                                  resCheck.isEligible
                                    ? 'Valid upon preliminary RO review'
                                    : resCheck.message
                                )
                              }
                              className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                                resCheck.isEligible
                                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                  : 'bg-rose-700 text-white hover:bg-rose-800'
                              }`}
                              title="RO Statutory Scrutiny Review"
                            >
                              {resCheck.isEligible ? 'Accept' : 'Reject'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
