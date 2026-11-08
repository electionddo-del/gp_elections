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
  AuthenticatedOperator,
} from '../../types/election';
import {
  X,
  Phone,
  ShieldCheck,
  User,
  MapPin,
  CheckCircle2,
  LogIn,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

interface DataEntryLoginModalProps {
  district: District;
  divisions: Division[];
  mandals: Mandal[];
  panchayats: Panchayat[];
  wards: Ward[];
  isOpen: boolean;
  onClose: () => void;
  onLogin: (operator: AuthenticatedOperator) => void;
}

export const DataEntryLoginModal: React.FC<DataEntryLoginModalProps> = ({
  district,
  divisions,
  mandals,
  panchayats,
  wards,
  isOpen,
  onClose,
  onLogin,
}) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedPresetMobile, setSelectedPresetMobile] = useState<string | null>(null);

  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [newRole, setNewRole] = useState<'DEO' | 'RO'>('DEO');
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('Junior Assistant / BLO');
  const [newEmpId, setNewEmpId] = useState(`DEO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedDivId, setSelectedDivId] = useState(divisions[0]?.id || '');
  const [selectedManId, setSelectedManId] = useState(mandals[0]?.id || '');
  const [selectedPanId, setSelectedPanId] = useState(panchayats[0]?.id || '');
  const [selectedWardNo, setSelectedWardNo] = useState<number | 'ALL'>('ALL');

  if (!isOpen) return null;

  // Preset quick operator logins
  const PRESET_OPERATORS = [
    {
      mobile: '9848011221',
      name: 'K. Venkatesh',
      designation: 'Junior Assistant / BLO',
      empId: 'DEO-4821',
      wardNo: 1,
      panchayatName: 'Gorantla GP',
      mandalName: 'Yemmiganur',
      divisionName: 'Adoni Division',
      districtName: district.name,
    },
    {
      mobile: '9848011222',
      name: 'S. Lakshmi Devi',
      designation: 'Anganwadi Supervisor / BLO',
      empId: 'DEO-3312',
      wardNo: 2,
      panchayatName: 'Gorantla GP',
      mandalName: 'Yemmiganur',
      divisionName: 'Adoni Division',
      districtName: district.name,
    },
    {
      mobile: '9848011225',
      name: 'G. Raghavendra',
      designation: 'Panchayat Secretary Gr-IV',
      empId: 'DEO-6602',
      wardNo: undefined,
      panchayatName: 'Gorantla GP',
      mandalName: 'Yemmiganur',
      divisionName: 'Adoni Division',
      districtName: district.name,
    },
    {
      mobile: '9848011001',
      name: 'N. Ravindra Reddy',
      designation: 'MPDO & Returning Officer',
      empId: 'RO-1001',
      wardNo: undefined,
      panchayatName: 'Gorantla GP',
      mandalName: 'Yemmiganur',
      divisionName: 'Adoni Division',
      districtName: district.name,
    },
  ];

  // Check if entered mobile matches any ward's dataEntryPerson or Panchayat RO/Secretary
  const findOperatorByMobile = (mobile: string): AuthenticatedOperator | null => {
    const clean = mobile.trim();
    if (!clean) return null;

    // Check in wards
    for (const w of wards) {
      if (w.dataEntryPerson.phone === clean) {
        const pan = panchayats.find((p) => p.id === w.panchayatId);
        const man = mandals.find((m) => m.id === pan?.mandalId);
        const div = divisions.find((d) => d.id === man?.divisionId);
        return {
          mobile: clean,
          name: w.dataEntryPerson.name,
          designation: w.dataEntryPerson.designation,
          employeeId: w.dataEntryPerson.employeeId,
          districtId: district.id,
          districtName: district.name,
          divisionId: div?.id || divisions[0].id,
          divisionName: div?.name || divisions[0].name,
          mandalId: man?.id || mandals[0].id,
          mandalName: man?.name || mandals[0].name,
          panchayatId: pan?.id || panchayats[0].id,
          panchayatName: pan?.name || panchayats[0].name,
          assignedWardNumber: w.wardNumber,
          role: 'DEO',
          loginTime: new Date().toISOString(),
        };
      }
    }

    // Check in Panchayat RO / Secretary
    for (const p of panchayats) {
      if (p.returningOfficer.phone === clean) {
        const man = mandals.find((m) => m.id === p.mandalId);
        const div = divisions.find((d) => d.id === man?.divisionId);
        return {
          mobile: clean,
          name: p.returningOfficer.name,
          designation: p.returningOfficer.designation,
          employeeId: 'RO-OFFICIAL',
          districtId: district.id,
          districtName: district.name,
          divisionId: div?.id || divisions[0].id,
          divisionName: div?.name || divisions[0].name,
          mandalId: man?.id || mandals[0].id,
          mandalName: man?.name || mandals[0].name,
          panchayatId: p.id,
          panchayatName: p.name,
          assignedWardNumber: undefined,
          role: 'RO',
          loginTime: new Date().toISOString(),
        };
      }
      if (p.panchayatSecretary.phone === clean) {
        const man = mandals.find((m) => m.id === p.mandalId);
        const div = divisions.find((d) => d.id === man?.divisionId);
        return {
          mobile: clean,
          name: p.panchayatSecretary.name,
          designation: 'Panchayat Secretary',
          employeeId: 'SECY-OFFICIAL',
          districtId: district.id,
          districtName: district.name,
          divisionId: div?.id || divisions[0].id,
          divisionName: div?.name || divisions[0].name,
          mandalId: man?.id || mandals[0].id,
          mandalName: man?.name || mandals[0].name,
          panchayatId: p.id,
          panchayatName: p.name,
          assignedWardNumber: undefined,
          role: 'DEO',
          loginTime: new Date().toISOString(),
        };
      }
    }

    return null;
  };

  const matchedOperator = findOperatorByMobile(mobileNumber);

  const handleSelectPreset = (preset: typeof PRESET_OPERATORS[0]) => {
    setMobileNumber(preset.mobile);
    setSelectedPresetMobile(preset.mobile);
    setIsNewRegistration(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (matchedOperator) {
      onLogin(matchedOperator);
      onClose();
      return;
    }

    if (isNewRegistration) {
      if (!newName.trim()) {
        alert('Please enter operator full name');
        return;
      }
      const pan = panchayats.find((p) => p.id === selectedPanId) || panchayats[0];
      const man = mandals.find((m) => m.id === pan.mandalId) || mandals[0];
      const div = divisions.find((d) => d.id === man.divisionId) || divisions[0];

      const newOp: AuthenticatedOperator = {
        mobile: mobileNumber.trim(),
        name: newName.trim(),
        designation: newDesignation.trim(),
        employeeId: newEmpId.trim(),
        districtId: district.id,
        districtName: district.name,
        divisionId: div.id,
        divisionName: div.name,
        mandalId: man.id,
        mandalName: man.name,
        panchayatId: pan.id,
        panchayatName: pan.name,
        assignedWardNumber: selectedWardNo === 'ALL' ? undefined : Number(selectedWardNo),
        role: newRole,
        loginTime: new Date().toISOString(),
      };
      onLogin(newOp);
      onClose();
    } else {
      setIsNewRegistration(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="px-3.5 sm:px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Official Election Portal Sign-In
              </h2>
              <p className="text-[11px] text-slate-500">
                Single sign-in by mobile number · Auto-detects Data Entry Operator or Returning Officer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-xs">
          {/* Quick Preset Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
              Quick Login as Registered Operator:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {PRESET_OPERATORS.map((op) => (
                <button
                  key={op.mobile}
                  type="button"
                  onClick={() => handleSelectPreset(op)}
                  className={`p-2.5 text-left rounded-lg border transition-colors cursor-pointer ${
                    mobileNumber === op.mobile
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{op.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{op.empId}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {op.designation} {op.wardNo ? `(Ward ${op.wardNo})` : ''}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono font-medium mt-1">
                    📱 {op.mobile}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Number Entry */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Registered Mobile Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="Enter 10-digit mobile (e.g. 9848011221)"
                value={mobileNumber}
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                  setSelectedPresetMobile(null);
                  setIsNewRegistration(false);
                }}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm font-mono font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Matched Operator / Officer Card */}
          {matchedOperator && (
            <div className={`p-4 rounded-lg space-y-2 border ${
              matchedOperator.role === 'RO'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${matchedOperator.role === 'RO' ? 'text-amber-700' : 'text-emerald-700'}`} />
                  <span>
                    {matchedOperator.role === 'RO'
                      ? 'Verified Returning Officer (Statutory Scrutiny Authority)'
                      : 'Verified Data Entry Operator (Nomination Filing Authority)'}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  matchedOperator.role === 'RO'
                    ? 'bg-amber-200 text-amber-900 border border-amber-400'
                    : 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                }`}>
                  {matchedOperator.role === 'RO' ? 'Officer Role' : 'Operator Role'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Official Name:</span>
                  <span className="font-semibold text-slate-900">{matchedOperator.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Designation:</span>
                  <span className="font-semibold text-slate-900">{matchedOperator.designation}</span>
                </div>
              </div>

              {/* Linked Hierarchy Display */}
              <div className="pt-2 border-t border-slate-200/60 mt-2 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>
                    Jurisdiction: <strong>{matchedOperator.districtName}</strong> $\to${' '}
                    <strong>{matchedOperator.divisionName}</strong> $\to${' '}
                    <strong>{matchedOperator.mandalName}</strong> $\to${' '}
                    <strong>{matchedOperator.panchayatName}</strong>
                    {matchedOperator.assignedWardNumber ? ` (Ward ${matchedOperator.assignedWardNumber})` : ''}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 italic">
                  {matchedOperator.role === 'RO'
                    ? '✓ Full authority to scrutinize, accept/reject candidate Form 26 affidavits, and certify results.'
                    : '✓ Authorized to file and submit candidate nominations for assigned jurisdiction.'}
                </div>
              </div>
            </div>
          )}

          {/* Unmatched / New User Registration Mode */}
          {mobileNumber.length >= 10 && !matchedOperator && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3 text-amber-950">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-amber-900">
                  Mobile not registered. Identify role and assign jurisdiction:
                </div>
              </div>

              {/* Role Selection (Operator vs Officer) */}
              <div className="flex items-center gap-4 p-2 bg-white rounded border border-amber-200">
                <span className="font-semibold text-slate-800 text-[11px]">Select Role:</span>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-xs text-slate-900">
                  <input
                    type="radio"
                    name="role"
                    value="DEO"
                    checked={newRole === 'DEO'}
                    onChange={() => {
                      setNewRole('DEO');
                      setNewDesignation('Junior Assistant / BLO');
                    }}
                    className="accent-emerald-700 cursor-pointer"
                  />
                  <span>Data Entry Operator (Filing only)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-xs text-slate-900">
                  <input
                    type="radio"
                    name="role"
                    value="RO"
                    checked={newRole === 'RO'}
                    onChange={() => {
                      setNewRole('RO');
                      setNewDesignation('Returning Officer / Tahsildar');
                    }}
                    className="accent-amber-600 cursor-pointer"
                  />
                  <span>Returning Officer (Scrutiny authority)</span>
                </label>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Operator Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>
                </div>

                {/* Hierarchy mapping */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Link to Division *
                    </label>
                    <select
                      value={selectedDivId}
                      onChange={(e) => setSelectedDivId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium cursor-pointer"
                    >
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Link to Mandal *
                    </label>
                    <select
                      value={selectedManId}
                      onChange={(e) => setSelectedManId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium cursor-pointer"
                    >
                      {mandals
                        .filter((m) => m.divisionId === selectedDivId)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Link to Panchayat *
                    </label>
                    <select
                      value={selectedPanId}
                      onChange={(e) => setSelectedPanId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {panchayats
                        .filter((p) => p.mandalId === selectedManId)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Assigned Ward
                    </label>
                    <select
                      value={selectedWardNo}
                      onChange={(e) =>
                        setSelectedWardNo(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                      }
                      className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs cursor-pointer"
                    >
                      <option value="ALL">All Wards / Panchayat Level</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <option key={num} value={num}>
                          Ward {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={mobileNumber.length < 10}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                mobileNumber.length >= 10
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {matchedOperator
                  ? 'Login to File Nominations'
                  : isNewRegistration
                  ? 'Register & Proceed to File'
                  : 'Verify Mobile'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
