/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Division,
  Mandal,
  Panchayat,
  Ward,
  District,
  RESERVATION_LABELS,
} from '../types/election';
import { MapPin, Users, ShieldCheck, ChevronRight } from 'lucide-react';

interface HierarchySelectorProps {
  district: District;
  divisions: Division[];
  mandals: Mandal[];
  panchayats: Panchayat[];
  wards: Ward[];
  selectedDivisionId: string;
  selectedMandalId: string;
  selectedPanchayatId: string;
  onSelectDivision: (id: string) => void;
  onSelectMandal: (id: string) => void;
  onSelectPanchayat: (id: string) => void;
}

export const HierarchySelector: React.FC<HierarchySelectorProps> = ({
  district,
  divisions,
  mandals,
  panchayats,
  wards,
  selectedDivisionId,
  selectedMandalId,
  selectedPanchayatId,
  onSelectDivision,
  onSelectMandal,
  onSelectPanchayat,
}) => {
  const currentDivision = divisions.find((d) => d.id === selectedDivisionId) || divisions[0];
  const filteredMandals = mandals.filter((m) => m.divisionId === selectedDivisionId);
  const currentMandal =
    filteredMandals.find((m) => m.id === selectedMandalId) || filteredMandals[0] || mandals[0];
  const filteredPanchayats = panchayats.filter((p) => p.mandalId === currentMandal?.id);
  const currentPanchayat =
    filteredPanchayats.find((p) => p.id === selectedPanchayatId) ||
    filteredPanchayats[0] ||
    panchayats[0];

  // Calculate totals for active Panchayat
  const panchayatWards = wards.filter((w) => w.panchayatId === currentPanchayat?.id);
  const totalMale = panchayatWards.reduce((acc, w) => acc + w.voters.male, 0);
  const totalFemale = panchayatWards.reduce((acc, w) => acc + w.voters.female, 0);
  const totalOther = panchayatWards.reduce((acc, w) => acc + w.voters.other, 0);
  const totalVoters = totalMale + totalFemale + totalOther;

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-3">
        {/* Hierarchy Dropdowns Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-xs">
          {/* District Display */}
          <div className="flex items-center gap-1 font-semibold text-slate-900 bg-slate-100 px-2 py-1 rounded">
            <MapPin className="w-3 h-3 text-emerald-700" />
            <span>{district.name}</span>
          </div>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />

          {/* Division Selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] sm:text-xs">Div:</span>
            <select
              value={selectedDivisionId}
              onChange={(e) => onSelectDivision(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />

          {/* Mandal Selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] sm:text-xs">Mandal:</span>
            <select
              value={selectedMandalId}
              onChange={(e) => onSelectMandal(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
            >
              {filteredMandals.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />

          {/* Gram Panchayat Selector */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px] sm:text-xs">Panchayat:</span>
            <select
              value={selectedPanchayatId}
              onChange={(e) => onSelectPanchayat(e.target.value)}
              className="bg-emerald-50 border border-emerald-300 text-emerald-900 font-semibold text-xs rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {filteredPanchayats.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Panchayat Context & Demographics Card */}
        {currentPanchayat && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Panchayat Meta & Reservation */}
            <div className="flex flex-wrap items-center gap-2 text-slate-600">
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{currentPanchayat.name}</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 text-[11px] sm:text-xs">{panchayatWards.length} Wards</span>
              </div>

              {/* Sarpanch Reservation Banner */}
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded text-[11px] font-medium">
                <ShieldCheck className="w-3 h-3 text-amber-700" />
                <span>
                  Sarpanch: <strong>{RESERVATION_LABELS[currentPanchayat.sarpanchReservation]}</strong>
                </span>
              </div>

              {/* RO & Secretary details */}
              <div className="hidden md:flex items-center gap-2 text-slate-500 text-[11px]">
                <span>RO: {currentPanchayat.returningOfficer.name}</span>
                <span className="text-slate-300">|</span>
                <span>Secy: {currentPanchayat.panchayatSecretary.name}</span>
              </div>
            </div>

            {/* Voter Demographics Counter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded text-slate-700 text-[11px] sm:text-xs font-medium tabular-nums">
              <span className="text-slate-500">Electors:</span>
              <span className="font-bold text-slate-900">{totalVoters.toLocaleString()}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">M: {totalMale.toLocaleString()}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600">F: {totalFemale.toLocaleString()}</span>
              {totalOther > 0 && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">O: {totalOther}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
