/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  PostType,
  CandidateGender,
  CandidateSocialCategory,
  Panchayat,
  Ward,
  Nomination,
  FREE_SYMBOLS,
  RESERVATION_LABELS,
  AuthenticatedOperator,
} from '../../types/election';
import { validateReservation } from '../../utils/reservationValidator';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Check,
  User,
  Landmark,
  FileText,
  AlertCircle,
  KeyRound,
} from 'lucide-react';

interface NominationFormModalProps {
  panchayat: Panchayat;
  wards: Ward[];
  authenticatedOperator?: AuthenticatedOperator | null;
  defaultPostType?: PostType;
  defaultWardNumber?: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nomination: Nomination) => void;
}

export const NominationFormModal: React.FC<NominationFormModalProps> = ({
  panchayat,
  wards,
  authenticatedOperator,
  defaultPostType,
  defaultWardNumber,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'detailed' | 'checklist'>('basic');

  // Post & Reservation selection
  const [postType, setPostType] = useState<PostType>(
    defaultPostType || (authenticatedOperator?.assignedWardNumber ? 'WARD_MEMBER' : 'PRESIDENT')
  );
  const [selectedWardNumber, setSelectedWardNumber] = useState<number>(
    defaultWardNumber || authenticatedOperator?.assignedWardNumber || 1
  );

  React.useEffect(() => {
    if (isOpen) {
      if (defaultPostType) setPostType(defaultPostType);
      if (defaultWardNumber) setSelectedWardNumber(defaultWardNumber);
    }
  }, [isOpen, defaultPostType, defaultWardNumber]);

  // Candidate Basic Data
  const [candidateName, setCandidateName] = useState('');
  const [fatherOrSpouseName, setFatherOrSpouseName] = useState('');
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<CandidateGender>('Female');
  const [category, setCategory] = useState<CandidateSocialCategory>('BC');
  const [subCaste, setSubCaste] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [epicNumber, setEpicNumber] = useState('');
  const [partyAffiliation, setPartyAffiliation] = useState('Independent');
  const [symbolRequested, setSymbolRequested] = useState(FREE_SYMBOLS[0].name);

  // Proposer Data
  const [proposerName, setProposerName] = useState('');
  const [proposerEpic, setProposerEpic] = useState('');
  const [proposerWardNo, setProposerWardNo] = useState<number>(1);
  const [securityReceiptNo, setSecurityReceiptNo] = useState(`TREAS-${Date.now().toString().slice(-4)}`);

  // Detailed Data
  const [education, setEducation] = useState('Intermediate');
  const [occupation, setOccupation] = useState('Agriculture & Self-employed');
  const [hasCriminalCases, setHasCriminalCases] = useState(false);
  const [criminalDetails, setCriminalDetails] = useState('');
  const [movableVal, setMovableVal] = useState<number>(250000);
  const [immovableVal, setImmovableVal] = useState<number>(1200000);
  const [liabilitiesVal, setLiabilitiesVal] = useState<number>(50000);
  const [cashOnHand, setCashOnHand] = useState<number>(25000);
  const [bankDeposits, setBankDeposits] = useState<number>(100000);
  const [goldGrams, setGoldGrams] = useState<number>(40);
  const [agriLandAcres, setAgriLandAcres] = useState<number>(2.0);
  const [sqftBuilt, setSqftBuilt] = useState<number>(850);
  const [panchayatDuesCleared, setPanchayatDuesCleared] = useState(true);
  const [noDueCertNo, setNoDueCertNo] = useState(`GP-NDC-${Date.now().toString().slice(-3)}`);
  const [livingChildren, setLivingChildren] = useState<number>(2);

  // Checklists
  const [checklist, setChecklist] = useState({
    casteCertProvided: true,
    ageProofProvided: true,
    voterListCertifiedCopy: true,
    securityDepositChallan: true,
    affidavitForm26: true,
    noDueCertificate: true,
    twoChildNormAffidavit: true,
  });

  if (!isOpen) return null;

  // Determine targeted reservation
  const targetWard = wards.find((w) => w.wardNumber === selectedWardNumber);
  const targetReservation =
    postType === 'PRESIDENT' ? panchayat.sarpanchReservation : targetWard?.reservation || 'GEN';

  const reservationCheck = validateReservation(targetReservation, gender, category);

  // Deposit amount
  const depositAmount =
    postType === 'PRESIDENT'
      ? ['SC', 'ST'].includes(category)
        ? 500
        : 1000
      : ['SC', 'ST'].includes(category)
      ? 250
      : 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateName.trim()) {
      alert('Candidate Name is required.');
      return;
    }
    if (age < 21) {
      alert('Candidate must be at least 21 years old as per statutory requirements.');
      return;
    }

    const newNomination: Nomination = {
      id: `nom-${Date.now()}`,
      nominationNo: `NOM-2026-${postType === 'PRESIDENT' ? 'SARP' : `W${selectedWardNumber}`}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      panchayatId: panchayat.id,
      postType,
      wardId: postType === 'WARD_MEMBER' ? targetWard?.id : undefined,
      wardNumber: postType === 'WARD_MEMBER' ? selectedWardNumber : undefined,
      candidateName,
      fatherOrSpouseName,
      age,
      gender,
      category,
      subCaste: subCaste || category,
      address,
      mobile,
      aadhaarMasked: aadhaar ? `XXXX-XXXX-${aadhaar.slice(-4)}` : 'XXXX-XXXX-0000',
      epicNumber: epicNumber || `AP21/${Math.floor(100 + Math.random() * 900)}/${Math.floor(100000 + Math.random() * 900000)}`,
      partyAffiliation,
      symbolRequested,
      proposerName: proposerName || 'Local Registered Elector',
      proposerEpic: proposerEpic || 'AP21/142/099881',
      proposerWardNo,
      securityDeposit: {
        receiptNo: securityReceiptNo,
        amount: depositAmount,
        date: new Date().toISOString().split('T')[0],
      },
      submissionTimestamp: new Date().toISOString(),
      education,
      occupation,
      criminalAntecedents: {
        hasCases: hasCriminalCases,
        caseDetails: criminalDetails,
        convictionCount: 0,
      },
      assets: {
        movableVal,
        immovableVal,
        liabilitiesVal,
        cashOnHand,
        bankDeposits,
        goldOrJewelryGrams: goldGrams,
        agriculturalLandAcres: agriLandAcres,
        commercialOrResidentialSqft: sqftBuilt,
      },
      panchayatDuesCleared,
      noDueCertNumber: noDueCertNo,
      numberOfLivingChildren: livingChildren,
      proposerVerified: true,
      checklist,
      scrutinyStatus: 'PENDING',
      withdrawn: false,
    };

    onSubmit(newNomination);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              File Nomination Paper (Form 2 / Form 3)
            </h2>
            <p className="text-[11px] text-slate-500">
              Gram Panchayat: <strong>{panchayat.name}</strong>
            </p>
            {authenticatedOperator && (
              <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>
                  Operator: <strong>{authenticatedOperator.name}</strong> ({authenticatedOperator.employeeId})
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Post Selection & Live Reservation Banner */}
          <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-200 space-y-2.5 shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Election Post Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={Boolean(authenticatedOperator?.assignedWardNumber)}
                    onClick={() => setPostType('PRESIDENT')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                      authenticatedOperator?.assignedWardNumber
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                        : postType === 'PRESIDENT'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs cursor-pointer'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    Panchayat President (Sarpanch)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('WARD_MEMBER')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors cursor-pointer ${
                      postType === 'WARD_MEMBER'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Ward Member
                  </button>
                </div>
                {authenticatedOperator?.assignedWardNumber && (
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                    ✓ Locked to Ward {authenticatedOperator.assignedWardNumber} (Signed in: {authenticatedOperator.name})
                  </span>
                )}
              </div>

              {postType === 'WARD_MEMBER' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Ward Number *
                  </label>
                  <select
                    value={selectedWardNumber}
                    disabled={Boolean(authenticatedOperator?.assignedWardNumber)}
                    onChange={(e) => setSelectedWardNumber(Number(e.target.value))}
                    className={`w-full bg-white border border-slate-200 text-xs rounded-md p-2 focus:ring-2 focus:ring-emerald-500 font-medium ${
                      authenticatedOperator?.assignedWardNumber ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : ''
                    }`}
                  >
                    {wards.map((w) => (
                      <option key={w.id} value={w.wardNumber}>
                        Ward {w.wardNumber} — Reserved for: {RESERVATION_LABELS[w.reservation]}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Statutory Seat Reservation
                  </label>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs font-medium">
                    Sarpanch Seat Reserved: <strong>{RESERVATION_LABELS[panchayat.sarpanchReservation]}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Live Reservation Check Bar */}
            <div
              className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                reservationCheck.isEligible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {reservationCheck.isEligible ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  <strong>Seat: {RESERVATION_LABELS[targetReservation]}</strong> — {reservationCheck.message}
                </span>
              </div>
              <span className="font-semibold tabular-nums">Deposit: ₹{depositAmount}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'basic'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              1. Basic Particulars
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('detailed')}
              className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'detailed'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              2. Form 26 Affidavit & Assets
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className={`py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'checklist'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              3. Enclosures Checklist
            </button>
          </div>

          {/* Tab Panels */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Boya Parvathamma"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Father / Husband / Spouse Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Boya Thimmappa (Husband)"
                      value={fatherOrSpouseName}
                      onChange={(e) => setFatherOrSpouseName(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Gender, Caste, Age row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Gender *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as CandidateGender)}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-semibold"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Social Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CandidateSocialCategory)}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-semibold"
                    >
                      <option value="GEN">General / Open (GEN)</option>
                      <option value="BC">Backward Class (BC)</option>
                      <option value="SC">Scheduled Caste (SC)</option>
                      <option value="ST">Scheduled Tribe (ST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Sub-Caste</label>
                    <input
                      type="text"
                      placeholder="e.g. Kuruba / Boya"
                      value={subCaste}
                      onChange={(e) => setSubCaste(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Age (Min 21) *</label>
                    <input
                      type="number"
                      min={21}
                      max={100}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Contact & Identifiers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">EPIC (Voter ID) *</label>
                    <input
                      type="text"
                      placeholder="e.g. AP21/142/021944"
                      value={epicNumber}
                      onChange={(e) => setEpicNumber(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Aadhaar (Last 4)</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4921"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Residential Address *</label>
                  <input
                    type="text"
                    placeholder="House No, Street, Village, Mandal"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs"
                  />
                </div>

                {/* Symbol Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Party Affiliation
                    </label>
                    <input
                      type="text"
                      value={partyAffiliation}
                      onChange={(e) => setPartyAffiliation(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Preferred Free Symbol
                    </label>
                    <select
                      value={symbolRequested}
                      onChange={(e) => setSymbolRequested(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs"
                    >
                      {FREE_SYMBOLS.map((s) => (
                        <option key={s.code} value={s.name}>
                          {s.icon} {s.name} ({s.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Proposer Info */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                  <div className="font-semibold text-slate-800">Proposer (Elector of Panchayat)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Proposer Name</label>
                      <input
                        type="text"
                        placeholder="Name of elector"
                        value={proposerName}
                        onChange={(e) => setProposerName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Proposer EPIC No.</label>
                      <input
                        type="text"
                        placeholder="AP21/142/XXXXXX"
                        value={proposerEpic}
                        onChange={(e) => setProposerEpic(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Proposer Ward No.</label>
                      <input
                        type="number"
                        min={1}
                        max={wards.length || 10}
                        value={proposerWardNo}
                        onChange={(e) => setProposerWardNo(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'detailed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Educational Qualification
                    </label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs"
                    >
                      <option value="Primary School (5th Pass)">Primary School (5th Pass)</option>
                      <option value="Middle School (8th Pass)">Middle School (8th Pass)</option>
                      <option value="10th Standard (SSC Pass)">10th Standard (SSC Pass)</option>
                      <option value="Intermediate (12th Pass)">Intermediate (12th Pass)</option>
                      <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate</option>
                      <option value="Post Graduate / Professional">Post Graduate / Professional</option>
                      <option value="Literate">Literate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Occupation / Source of Livelihood
                    </label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full border border-slate-200 rounded-md p-2 text-xs"
                    />
                  </div>
                </div>

                {/* Assets & Liabilities */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <div className="font-semibold text-slate-800">
                    Assets & Liabilities Declaration (Form 26)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Movable Assets (₹)</label>
                      <input
                        type="number"
                        value={movableVal}
                        onChange={(e) => setMovableVal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Immovable Assets (₹)</label>
                      <input
                        type="number"
                        value={immovableVal}
                        onChange={(e) => setImmovableVal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Liabilities / Loans (₹)</label>
                      <input
                        type="number"
                        value={liabilitiesVal}
                        onChange={(e) => setLiabilitiesVal(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Gold / Jewelry (Grams)</label>
                      <input
                        type="number"
                        value={goldGrams}
                        onChange={(e) => setGoldGrams(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Cash on Hand (₹)</label>
                      <input
                        type="number"
                        value={cashOnHand}
                        onChange={(e) => setCashOnHand(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Bank Deposits (₹)</label>
                      <input
                        type="number"
                        value={bankDeposits}
                        onChange={(e) => setBankDeposits(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Agri Land (Acres)</label>
                      <input
                        type="number"
                        step={0.1}
                        value={agriLandAcres}
                        onChange={(e) => setAgriLandAcres(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Statutory Disqualifications Declarations */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-slate-900">Criminal Cases Pending?</div>
                      <div className="text-slate-500 text-[11px]">
                        Any court cognisance or pending trial under Section 19(1)
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCriminalCases}
                        onChange={(e) => setHasCriminalCases(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-medium text-slate-700">Yes, Cases Pending</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900">Panchayat Dues Status</span>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={panchayatDuesCleared}
                            onChange={(e) => setPanchayatDuesCleared(e.target.checked)}
                            className="rounded text-emerald-600"
                          />
                          <span className="text-[11px] font-medium text-slate-700">Cleared</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="No Due Cert No."
                        value={noDueCertNo}
                        onChange={(e) => setNoDueCertNo(e.target.value)}
                        className="w-full border border-slate-200 rounded-md p-1.5 text-xs font-mono"
                      />
                    </div>

                    <div className="p-3 border border-slate-200 rounded-lg">
                      <span className="font-semibold text-slate-900 block mb-1">
                        Number of Living Children
                      </span>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={livingChildren}
                          onChange={(e) => setLivingChildren(Number(e.target.value))}
                          className="w-24 border border-slate-200 rounded-md p-1.5 text-xs font-semibold"
                        />
                        <span className="text-[11px] text-slate-500">
                          {livingChildren <= 2 ? '✓ Compliant with 2-child rule' : '⚠️ Potential disqualification check'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Mandatory Document Verification:</strong> All checked documents will be verified by
                    the Returning Officer (RO) during Scrutiny on the statutory date.
                  </div>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-lg p-4">
                  {[
                    {
                      id: 'affidavitForm26',
                      label: 'Form 26 Affidavit sworn before Notary / Magistrate',
                      desc: 'Contains assets, liabilities, education & criminal disclosures',
                    },
                    {
                      id: 'casteCertProvided',
                      label: 'Valid Caste Certificate issued by Competent Authority (Tahsildar)',
                      desc: 'Required for all reserved seats (SC, ST, BC)',
                    },
                    {
                      id: 'ageProofProvided',
                      label: 'Age Proof (Birth Certificate / School Leaving / SSC)',
                      desc: 'Verifies candidate age is >= 21 years on nomination date',
                    },
                    {
                      id: 'voterListCertifiedCopy',
                      label: 'Certified Extract of Electoral Roll (Form 1)',
                      desc: 'Elector listing in Gram Panchayat voter list',
                    },
                    {
                      id: 'securityDepositChallan',
                      label: 'Treasury Challan / Security Deposit Cash Receipt',
                      desc: 'Statutory non-refundable / refundable deposit paid',
                    },
                    {
                      id: 'noDueCertificate',
                      label: 'Gram Panchayat Tax & Water Charges No-Due Certificate',
                      desc: 'Issued by Panchayat Secretary certifying nil arrears',
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-2.5 rounded-md hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(checklist as any)[item.id]}
                        onChange={(e) =>
                          setChecklist({ ...checklist, [item.id]: e.target.checked })
                        }
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'checklist' ? 'detailed' : 'basic')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Previous
                </button>
              )}

              {activeTab !== 'checklist' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'basic' ? 'detailed' : 'checklist')}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Submit Nomination Paper
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
