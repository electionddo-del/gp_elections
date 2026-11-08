/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AuthenticatedOperator,
  Panchayat,
  Ward,
  Nomination,
  ScrutinyStatus,
  RESERVATION_LABELS,
} from '../../types/election';
import { NominationList } from '../nominations/NominationList';
import {
  FileSpreadsheet,
  LogOut,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Building,
  Award,
} from 'lucide-react';

interface OperatorWorkspaceProps {
  operator: AuthenticatedOperator;
  panchayat: Panchayat;
  wards: Ward[];
  nominations: Nomination[];
  onOpenNewNomination: () => void;
  onLogout: () => void;
  onViewDetails: (nomination: Nomination) => void;
  onQuickScrutinize: (nominationId: string, status: ScrutinyStatus, remarks: string) => void;
}

export const OperatorWorkspace: React.FC<OperatorWorkspaceProps> = ({
  operator,
  panchayat,
  wards,
  nominations,
  onOpenNewNomination,
  onLogout,
  onViewDetails,
  onQuickScrutinize,
}) => {
  const operatorWards = wards.filter((w) => w.panchayatId === panchayat.id);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Authorized Operator Identity & Linked Jurisdiction Banner */}
      <div className="bg-emerald-900 text-white rounded-xl p-3.5 sm:p-5 shadow-sm border border-emerald-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1 ${
                operator.role === 'RO'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-emerald-800 text-emerald-200'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {operator.role === 'RO' ? 'Returning Officer (RO)' : 'Data Entry Operator (DEO)'}
              </span>
              <span className="text-emerald-300 text-[11px] font-mono">
                {operator.employeeId}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-base sm:text-xl font-bold tracking-tight">
                {operator.name}
              </h1>
              <span className="text-emerald-200 text-xs">
                ({operator.designation})
              </span>
            </div>

            {/* Linked Hierarchy Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-emerald-100 font-medium">
              <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
              <span>{operator.districtName}</span>
              <span>·</span>
              <span>{operator.divisionName}</span>
              <span>·</span>
              <span>{operator.mandalName}</span>
              <span>·</span>
              <span className="font-bold text-white bg-emerald-800 px-1.5 py-0.5 rounded">
                {operator.panchayatName}
              </span>
              {operator.assignedWardNumber && (
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                  Ward {operator.assignedWardNumber}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons inside session */}
          <div className="flex items-center gap-2 shrink-0">
            {operator.role !== 'RO' && (
              <button
                onClick={onOpenNewNomination}
                className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-900" />
                <span>+ File Nomination</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 text-xs font-medium text-emerald-200 hover:text-white bg-emerald-800 hover:bg-emerald-700 border border-emerald-700 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operator's Panchayat Nominations Desk */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {panchayat.name} — Nominations
          </h2>

          <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Sarpanch: <strong className="text-slate-800">{RESERVATION_LABELS[panchayat.sarpanchReservation]}</strong>
          </div>
        </div>

        <NominationList
          nominations={nominations}
          panchayat={panchayat}
          wards={operatorWards}
          authenticatedOperator={operator}
          onViewDetails={onViewDetails}
          onOpenNewNomination={onOpenNewNomination}
          onQuickScrutinize={operator.role === 'RO' ? onQuickScrutinize : undefined}
        />
      </div>
    </div>
  );
};
