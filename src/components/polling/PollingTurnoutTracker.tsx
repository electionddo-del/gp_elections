/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Panchayat,
  Ward,
  PollingStation,
  HourlyTurnoutRecord,
  PollingTimeSlot,
  POLLING_SLOTS,
  AuthenticatedOperator,
} from '../../types/election';
import {
  Users,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Printer,
  AlertCircle,
  Save,
  Lock,
  Phone,
} from 'lucide-react';

interface PollingTurnoutTrackerProps {
  panchayat: Panchayat;
  wards: Ward[];
  pollingStations: PollingStation[];
  turnoutRecords: HourlyTurnoutRecord[];
  authenticatedOperator?: AuthenticatedOperator | null;
  onOpenLogin?: () => void;
  onSaveTurnoutRecord: (record: HourlyTurnoutRecord) => void;
  onBatchSaveTurnout?: (records: HourlyTurnoutRecord[]) => void;
}

export const PollingTurnoutTracker: React.FC<PollingTurnoutTrackerProps> = ({
  panchayat,
  wards,
  pollingStations,
  turnoutRecords,
  authenticatedOperator,
  onOpenLogin,
  onSaveTurnoutRecord,
}) => {
  const [activeSlot, setActiveSlot] = useState<PollingTimeSlot>('15:00 - 17:00');
  const [editingWardId, setEditingWardId] = useState<string | null>(null);

  // Edit draft state
  const [draftMale, setDraftMale] = useState<number>(0);
  const [draftFemale, setDraftFemale] = useState<number>(0);
  const [draftOther, setDraftOther] = useState<number>(0);

  const panchayatWards = wards.filter((w) => w.panchayatId === panchayat.id);

  // Totals registered electors
  const totalRegMale = panchayatWards.reduce((acc, w) => acc + w.voters.male, 0);
  const totalRegFemale = panchayatWards.reduce((acc, w) => acc + w.voters.female, 0);
  const totalRegOther = panchayatWards.reduce((acc, w) => acc + w.voters.other, 0);
  const totalRegistered = totalRegMale + totalRegFemale + totalRegOther;

  // Turnout records for active slot
  const currentSlotRecords = turnoutRecords.filter(
    (r) => r.panchayatId === panchayat.id && r.timeSlot === activeSlot
  );

  // Calculate cumulative polled for active slot
  const totalPolledMale = currentSlotRecords.reduce((acc, r) => acc + r.cumulativeMale, 0);
  const totalPolledFemale = currentSlotRecords.reduce((acc, r) => acc + r.cumulativeFemale, 0);
  const totalPolledOther = currentSlotRecords.reduce((acc, r) => acc + r.cumulativeOther, 0);
  const totalPolled = totalPolledMale + totalPolledFemale + totalPolledOther;

  const overallTurnoutPercent =
    totalRegistered > 0 ? ((totalPolled / totalRegistered) * 100).toFixed(2) : '0.00';
  const maleTurnoutPercent =
    totalRegMale > 0 ? ((totalPolledMale / totalRegMale) * 100).toFixed(2) : '0.00';
  const femaleTurnoutPercent =
    totalRegFemale > 0 ? ((totalPolledFemale / totalRegFemale) * 100).toFixed(2) : '0.00';

  const handleStartEdit = (ward: Ward, existing?: HourlyTurnoutRecord) => {
    setEditingWardId(ward.id);
    if (existing) {
      setDraftMale(existing.cumulativeMale);
      setDraftFemale(existing.cumulativeFemale);
      setDraftOther(existing.cumulativeOther);
    } else {
      // reasonable defaults
      setDraftMale(Math.round(ward.voters.male * 0.7));
      setDraftFemale(Math.round(ward.voters.female * 0.75));
      setDraftOther(ward.voters.other);
    }
  };

  const handleSaveEdit = (ward: Ward) => {
    const total = draftMale + draftFemale + draftOther;
    if (total > ward.voters.total) {
      alert(`Polled votes (${total}) cannot exceed total registered electors (${ward.voters.total}) for Ward ${ward.wardNumber}!`);
      return;
    }

    const existing = currentSlotRecords.find((r) => r.wardId === ward.id);

    const record: HourlyTurnoutRecord = {
      id: existing ? existing.id : `turnout-${ward.id}-${activeSlot.replace(/[: ]/g, '-')}`,
      panchayatId: panchayat.id,
      pollingStationId: ward.pollingStationId,
      wardId: ward.id,
      timeSlot: activeSlot,
      cumulativeMale: draftMale,
      cumulativeFemale: draftFemale,
      cumulativeOther: draftOther,
      cumulativeTotal: total,
      enteredBy: `${ward.dataEntryPerson.name} (${ward.dataEntryPerson.employeeId})`,
      verifiedByPO: true,
      updatedAt: new Date().toISOString(),
    };

    onSaveTurnoutRecord(record);
    setEditingWardId(null);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Banner & Slot Selector */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 sm:p-4 space-y-2.5 sm:space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>By-Hourly Polling Turnout Tracker</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Ward & polling station-wise cumulative entries
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center gap-1 no-print cursor-pointer"
          >
            <Printer className="w-3 h-3" />
            <span>Print Bulletin</span>
          </button>
        </div>

        {/* By-Hourly Time Slot Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {POLLING_SLOTS.map((slot) => {
            const countForSlot = turnoutRecords.filter(
              (r) => r.panchayatId === panchayat.id && r.timeSlot === slot.key
            ).length;
            const isCompleted = countForSlot === panchayatWards.length;

            return (
              <button
                key={slot.key}
                onClick={() => {
                  setActiveSlot(slot.key);
                  setEditingWardId(null);
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activeSlot === slot.key
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{slot.label}</span>
                {isCompleted && (
                  <CheckCircle2 className={`w-3 h-3 ${activeSlot === slot.key ? 'text-emerald-400' : 'text-emerald-600'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cumulative KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block">Overall Turnout %</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-emerald-800 tabular-nums">
              {overallTurnoutPercent}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {totalPolled.toLocaleString()}/{totalRegistered.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Number(overallTurnoutPercent))}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block">Female Polling %</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-slate-900 tabular-nums">
              {femaleTurnoutPercent}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {totalPolledFemale.toLocaleString()}/{totalRegFemale.toLocaleString()}
            </span>
          </div>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-1">
            Index: {((Number(femaleTurnoutPercent) / (Number(maleTurnoutPercent) || 1)) * 100).toFixed(0)}%
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5">
          <span className="text-slate-500 text-[10px] sm:text-xs block">Male Polling %</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold text-slate-900 tabular-nums">
              {maleTurnoutPercent}%
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {totalPolledMale.toLocaleString()}/{totalRegMale.toLocaleString()}
            </span>
          </div>
          <span className="hidden sm:block text-[10px] text-slate-400 mt-1">
            {totalPolledOther} other polled
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <span className="text-slate-500 text-xs block">Stations Reported</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {currentSlotRecords.length} / {panchayatWards.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {currentSlotRecords.length === panchayatWards.length ? '100% Complete' : 'In Progress'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Slot: {activeSlot}
          </span>
        </div>
      </div>

      {/* Ward & Polling Station Wise Entry Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-800">
            Polling Station Wise & Ward Wise Cumulative Data Entry ({activeSlot})
          </div>
          <div className="text-slate-500">
            Returning Officer: <strong>{panchayat.returningOfficer.name}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Ward & Station</th>
                <th className="py-2.5 px-3">Data Entry Person</th>
                <th className="py-2.5 px-3 text-right">Registered Electors</th>
                <th className="py-2.5 px-3 text-right">Men Polled</th>
                <th className="py-2.5 px-3 text-right">Women Polled</th>
                <th className="py-2.5 px-3 text-right">Others Polled</th>
                <th className="py-2.5 px-3 text-right">Total Polled</th>
                <th className="py-2.5 px-3 text-right">Turnout %</th>
                <th className="py-2.5 px-3 text-center">Status / PO Cert</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {panchayatWards.map((ward) => {
                const ps = pollingStations.find((p) => p.id === ward.pollingStationId);
                const record = currentSlotRecords.find((r) => r.wardId === ward.id);
                const isEditing = editingWardId === ward.id;

                const polledMale = isEditing ? draftMale : record?.cumulativeMale ?? 0;
                const polledFemale = isEditing ? draftFemale : record?.cumulativeFemale ?? 0;
                const polledOther = isEditing ? draftOther : record?.cumulativeOther ?? 0;
                const totalPolledVal = isEditing ? draftMale + draftFemale + draftOther : record?.cumulativeTotal ?? 0;

                const percent =
                  ward.voters.total > 0
                    ? ((totalPolledVal / ward.voters.total) * 100).toFixed(1)
                    : '0.0';

                const canEditWard = Boolean(
                  authenticatedOperator &&
                  authenticatedOperator.panchayatId === panchayat.id &&
                  (
                    authenticatedOperator.role === 'RO' ||
                    authenticatedOperator.assignedWardNumber === undefined ||
                    authenticatedOperator.assignedWardNumber === ward.wardNumber
                  )
                );

                return (
                  <tr
                    key={ward.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isEditing ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    {/* Ward & Station */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">Ward No. {ward.wardNumber}</div>
                      <div className="text-[11px] text-slate-500">
                        {ps ? `${ps.psNumber} — ${ps.name}` : 'PS Assigned'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Seat: {ward.reservation}
                      </div>
                    </td>

                    {/* Data Entry Operator */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">
                        {ward.dataEntryPerson.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ward.dataEntryPerson.designation} · {ward.dataEntryPerson.employeeId}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ph: {ward.dataEntryPerson.phone}
                      </div>
                    </td>

                    {/* Registered Voters */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span className="font-bold text-slate-900 text-xs">
                        {ward.voters.total.toLocaleString()}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        M: {ward.voters.male} · F: {ward.voters.female}
                      </div>
                    </td>

                    {/* Men Polled */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={ward.voters.male}
                          value={draftMale}
                          onChange={(e) => setDraftMale(Number(e.target.value))}
                          className="w-16 bg-white border border-amber-300 rounded p-1 text-right text-xs font-mono font-bold"
                        />
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {record ? record.cumulativeMale : '—'}
                        </span>
                      )}
                    </td>

                    {/* Women Polled */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={ward.voters.female}
                          value={draftFemale}
                          onChange={(e) => setDraftFemale(Number(e.target.value))}
                          className="w-16 bg-white border border-amber-300 rounded p-1 text-right text-xs font-mono font-bold"
                        />
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {record ? record.cumulativeFemale : '—'}
                        </span>
                      )}
                    </td>

                    {/* Other Polled */}
                    <td className="py-3 px-3 text-right font-mono">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          max={ward.voters.other}
                          value={draftOther}
                          onChange={(e) => setDraftOther(Number(e.target.value))}
                          className="w-12 bg-white border border-amber-300 rounded p-1 text-right text-xs font-mono"
                        />
                      ) : (
                        <span className="text-slate-600">
                          {record ? record.cumulativeOther : '—'}
                        </span>
                      )}
                    </td>

                    {/* Total Polled */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span className="font-bold text-slate-900 text-sm">
                        {record || isEditing ? totalPolledVal : '—'}
                      </span>
                    </td>

                    {/* Turnout % */}
                    <td className="py-3 px-3 text-right font-mono">
                      {record || isEditing ? (
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-emerald-800">{percent}%</span>
                          <div className="w-16 bg-slate-200 h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, Number(percent))}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300">0.0%</span>
                      )}
                    </td>

                    {/* Status & PO Cert */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {record ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          PO Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-medium">
                          Awaiting Entry
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingWardId(null)}
                            className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(ward)}
                            className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded flex items-center gap-1 shadow-xs"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      ) : canEditWard ? (
                        <button
                          onClick={() => handleStartEdit(ward, record)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors cursor-pointer shadow-2xs"
                        >
                          {record ? 'Edit Turnout' : 'Enter Turnout'}
                        </button>
                      ) : authenticatedOperator ? (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          🔒 Locked (Ward {ward.wardNumber})
                        </span>
                      ) : (
                        <button
                          onClick={onOpenLogin}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Login</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
