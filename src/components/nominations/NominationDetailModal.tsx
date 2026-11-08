/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Nomination,
  Panchayat,
  Ward,
  RESERVATION_LABELS,
} from '../../types/election';
import { validateReservation } from '../../utils/reservationValidator';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Landmark,
  Coins,
  Scale,
  UserCheck,
  Building2,
  Calendar,
  Phone,
  Printer,
} from 'lucide-react';

interface NominationDetailModalProps {
  nomination: Nomination;
  panchayat: Panchayat;
  ward?: Ward;
  authenticatedOperator?: { role: 'DEO' | 'RO' | 'BLO' } | null;
  isOpen: boolean;
  onClose: () => void;
  onScrutinize?: (status: 'ACCEPTED' | 'REJECTED', remarks: string) => void;
}

export const NominationDetailModal: React.FC<NominationDetailModalProps> = ({
  nomination,
  panchayat,
  ward,
  authenticatedOperator,
  isOpen,
  onClose,
  onScrutinize,
}) => {
  if (!isOpen) return null;
  const isOfficer = authenticatedOperator?.role === 'RO';

  const targetReservation =
    nomination.postType === 'PRESIDENT'
      ? panchayat.sarpanchReservation
      : ward?.reservation || 'GEN';

  const reservationCheck = validateReservation(
    targetReservation,
    nomination.gender,
    nomination.category
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">
              {nomination.postType === 'PRESIDENT' ? 'PR' : `W${nomination.wardNumber || 'M'}`}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  {nomination.candidateName}
                </h2>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-mono font-medium bg-slate-200 text-slate-700 shrink-0">
                  {nomination.nominationNo}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                Contesting for:{' '}
                <strong className="text-slate-800">
                  {nomination.postType === 'PRESIDENT'
                    ? 'Panchayat President'
                    : `Ward ${nomination.wardNumber}`}
                </strong>{' '}
                · Reserved: <strong>{RESERVATION_LABELS[targetReservation]}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors no-print cursor-pointer"
              title="Print Nomination Paper"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 text-xs text-slate-700">
          {/* Reservation Compatibility Alert Banner */}
          <div
            className={`p-3.5 rounded-lg border flex items-start gap-3 ${
              reservationCheck.isEligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {reservationCheck.isEligible ? (
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold text-sm">
                Reservation Verification: {reservationCheck.isEligible ? 'Eligible' : 'Ineligible / Violation Detected'}
              </div>
              <p className="mt-0.5">{reservationCheck.message}</p>
              <div className="flex items-center gap-3 mt-1.5 font-medium">
                <span>Candidate Caste: <strong>{nomination.category} ({nomination.subCaste || 'General'})</strong></span>
                <span>·</span>
                <span>Candidate Gender: <strong>{nomination.gender}</strong></span>
                <span>·</span>
                <span>Age: <strong>{nomination.age} yrs</strong></span>
              </div>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-600" />
              1. Basic Candidate Particulars
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-400 block">Candidate Full Name</span>
                <span className="font-semibold text-slate-900 text-sm">{nomination.candidateName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Father / Spouse Name</span>
                <span className="font-semibold text-slate-800">{nomination.fatherOrSpouseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Voter ID (EPIC Number)</span>
                <span className="font-mono font-semibold text-slate-900">{nomination.epicNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Aadhaar (Masked)</span>
                <span className="font-mono text-slate-700">{nomination.aadhaarMasked}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Mobile Number</span>
                <span className="text-slate-800 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {nomination.mobile}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Party / Symbol Preference</span>
                <span className="text-slate-800 font-medium">
                  {nomination.partyAffiliation} — {nomination.allottedSymbol?.name || nomination.symbolRequested}
                </span>
              </div>
              <div className="md:col-span-3">
                <span className="text-slate-400 block">Residential Address</span>
                <span className="text-slate-800">{nomination.address}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Proposer & Security Deposit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-600" />
                2. Proposer Verification
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-slate-400 block">Proposer Name</span>
                  <span className="font-semibold text-slate-900">{nomination.proposerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block">Proposer EPIC</span>
                    <span className="font-mono text-slate-800">{nomination.proposerEpic}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Proposer Ward</span>
                    <span className="font-semibold text-slate-900">Ward {nomination.proposerWardNo}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proposer elector status verified in Gram Panchayat roll</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-slate-600" />
                3. Security Deposit Particulars
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Statutory Deposit Amount:</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    ₹{nomination.securityDeposit.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Treasury / Challan Receipt:</span>
                  <span className="font-mono text-slate-800">{nomination.securityDeposit.receiptNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Deposit Date:</span>
                  <span className="text-slate-800">{nomination.securityDeposit.date}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Statutory fee credited to Panchayat Raj Election Account</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Form 26 Affidavit & Asset / Liability Declarations */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-slate-600" />
              4. Form 26 Affidavit: Assets & Liabilities Declaration
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Movable Assets</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  ₹{nomination.assets.movableVal.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Cash: ₹{nomination.assets.cashOnHand.toLocaleString()} · Bank: ₹{nomination.assets.bankDeposits.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Immovable Assets</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  ₹{nomination.assets.immovableVal.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Land: {nomination.assets.agriculturalLandAcres} ac · Built: {nomination.assets.commercialOrResidentialSqft} sqft
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Gold & Jewelry</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  {nomination.assets.goldOrJewelryGrams} Grams
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Declared in Annexure</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Liabilities / Loans</span>
                <span className="font-bold text-slate-900 text-sm font-mono">
                  ₹{nomination.assets.liabilitiesVal.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Bank / Institutional dues</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block">Highest Educational Qualification</span>
                <span className="font-medium text-slate-800">{nomination.education}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Declared Occupation / Profession</span>
                <span className="font-medium text-slate-800">{nomination.occupation}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Criminal Antecedents & Statutory Compliance */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-600" />
              5. Statutory Clearances & Disqualifications Check
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Criminal cases check */}
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Criminal Antecedents</span>
                {nomination.criminalAntecedents.hasCases ? (
                  <div className="text-amber-700 font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Cases Pending ({nomination.criminalAntecedents.convictionCount} convictions)</span>
                  </div>
                ) : (
                  <div className="text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nil Criminal Cases / Clean Record</span>
                  </div>
                )}
              </div>

              {/* Panchayat Dues Clearance */}
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Gram Panchayat Tax / Dues</span>
                {nomination.panchayatDuesCleared ? (
                  <div className="text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No Due Certificate: {nomination.noDueCertNumber}</span>
                  </div>
                ) : (
                  <div className="text-rose-700 font-semibold flex items-center gap-1 mt-1">
                    <XCircle className="w-4 h-4" />
                    <span>Dues Outstanding / Notice Issued</span>
                  </div>
                )}
              </div>

              {/* Two child norm compliance */}
              <div className="p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 block">Two-Child Norm Declaration</span>
                <div className="text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{nomination.numberOfLivingChildren} Living Children (Compliant)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Documents Checklist */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              6. Mandatory Document Enclosures Checklist
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Form 26 Affidavit (Notarized)', check: nomination.checklist.affidavitForm26 },
                { label: 'Caste Certificate (Tahsildar)', check: nomination.checklist.casteCertProvided },
                { label: 'Age Proof (Birth / SSC)', check: nomination.checklist.ageProofProvided },
                { label: 'Certified Voter Roll Extract', check: nomination.checklist.voterListCertifiedCopy },
                { label: 'Security Deposit Challan', check: nomination.checklist.securityDepositChallan },
                { label: 'Panchayat No-Due Certificate', check: nomination.checklist.noDueCertificate },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-md border text-xs font-medium ${
                    item.check
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  {item.check ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Scrutiny Status Summary */}
          <div className="border border-slate-200 rounded-lg p-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-slate-600" />
              7. Returning Officer Scrutiny Order
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-slate-400 block">Current Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold mt-1 ${
                    nomination.scrutinyStatus === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : nomination.scrutinyStatus === 'REJECTED'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {nomination.scrutinyStatus === 'ACCEPTED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {nomination.scrutinyStatus === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                  {nomination.scrutinyStatus}
                </span>
              </div>

              {nomination.allottedSymbol && (
                <div>
                  <span className="text-slate-400 block">Allotted Election Symbol</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm mt-1">
                    <span>{nomination.allottedSymbol.icon}</span>
                    <span>{nomination.allottedSymbol.name}</span>
                    <span className="text-xs text-slate-500 font-mono">({nomination.allottedSymbol.code})</span>
                  </span>
                </div>
              )}

              {nomination.withdrawn && (
                <div className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-md text-purple-900">
                  <span className="font-bold block">Candidate Withdrawn</span>
                  <span className="text-[11px]">Notice: {nomination.withdrawnNoticeNo}</span>
                </div>
              )}
            </div>

            {nomination.scrutinyRemarks && (
              <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200 text-slate-700">
                <span className="font-semibold block text-slate-900 mb-0.5">RO Scrutiny Remarks:</span>
                <p className="italic">{nomination.scrutinyRemarks}</p>
                {nomination.scrutinizedBy && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Scrutinized by: {nomination.scrutinizedBy} on {nomination.scrutinyTimestamp}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] sm:text-xs text-slate-500">
            Filing Date: {new Date(nomination.submissionTimestamp).toLocaleDateString()}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {isOfficer && onScrutinize && nomination.scrutinyStatus === 'PENDING' && (
              <>
                <button
                  onClick={() => onScrutinize('REJECTED', 'Defective nomination / non-compliance')}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => onScrutinize('ACCEPTED', 'Verified and accepted')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                >
                  Accept & Validate
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
