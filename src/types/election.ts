/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ReservationCategory =
  | 'GEN'       // General / Open
  | 'GEN_W'     // General (Women)
  | 'BC'        // Backward Class
  | 'BC_W'      // Backward Class (Women)
  | 'SC'        // Scheduled Caste
  | 'SC_W'      // Scheduled Caste (Women)
  | 'ST'        // Scheduled Tribe
  | 'ST_W';     // Scheduled Tribe (Women)

export const RESERVATION_LABELS: Record<ReservationCategory, string> = {
  GEN: 'General (Open)',
  GEN_W: 'General (Women)',
  BC: 'Backward Class (BC)',
  BC_W: 'Backward Class (Women)',
  SC: 'Scheduled Caste (SC)',
  SC_W: 'Scheduled Caste (Women)',
  ST: 'Scheduled Tribe (ST)',
  ST_W: 'Scheduled Tribe (Women)',
};

export type CandidateGender = 'Male' | 'Female' | 'Other';
export type CandidateSocialCategory = 'GEN' | 'BC' | 'SC' | 'ST';
export type PostType = 'PRESIDENT' | 'WARD_MEMBER';

export interface District {
  id: string;
  name: string;
  state: string;
  collectorName: string;
  electionDate: string;
}

export interface Division {
  id: string;
  districtId: string;
  name: string;
  subCollectorRO: string;
  headquarters: string;
}

export interface Mandal {
  id: string;
  divisionId: string;
  name: string;
  tahsildarRO: string;
}

export interface Panchayat {
  id: string;
  mandalId: string;
  name: string;
  sarpanchReservation: ReservationCategory;
  returningOfficer: {
    name: string;
    designation: string;
    phone: string;
  };
  panchayatSecretary: {
    name: string;
    phone: string;
  };
  totalWards: number;
}

export interface VoterDemographics {
  male: number;
  female: number;
  other: number;
  total: number;
}

export interface DataEntryPerson {
  name: string;
  employeeId: string;
  designation: string;
  phone: string;
  assignedWardNumber: number;
}

export interface PollingStation {
  id: string;
  panchayatId: string;
  psNumber: string; // e.g. "PS-01"
  name: string;     // e.g. "Mandal Parishad Primary School (East Wing)"
  location: string;
  presidingOfficer: string;
  phone: string;
  wardIds: string[];
}

export interface Ward {
  id: string;
  panchayatId: string;
  wardNumber: number;
  reservation: ReservationCategory;
  voters: VoterDemographics;
  pollingStationId: string;
  dataEntryPerson: DataEntryPerson;
}

export type ScrutinyStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface NominationAssets {
  movableVal: number;
  immovableVal: number;
  liabilitiesVal: number;
  cashOnHand: number;
  bankDeposits: number;
  goldOrJewelryGrams: number;
  agriculturalLandAcres: number;
  commercialOrResidentialSqft: number;
}

export interface NominationChecklist {
  casteCertProvided: boolean;
  ageProofProvided: boolean;
  voterListCertifiedCopy: boolean;
  securityDepositChallan: boolean;
  affidavitForm26: boolean;
  noDueCertificate: boolean;
  twoChildNormAffidavit: boolean;
}

export interface Nomination {
  id: string;
  nominationNo: string; // e.g., "NOM-2026-SARP-001" or "NOM-2026-W04-002"
  panchayatId: string;
  postType: PostType;
  wardId?: string;
  wardNumber?: number;
  
  // Basic Details
  candidateName: string;
  fatherOrSpouseName: string;
  age: number; // >= 21
  gender: CandidateGender;
  category: CandidateSocialCategory;
  subCaste: string;
  address: string;
  mobile: string;
  aadhaarMasked: string; // e.g. "XXXX-XXXX-4921"
  epicNumber: string; // Voter ID
  partyAffiliation: string; // "Independent" or party label
  symbolRequested: string;
  proposerName: string;
  proposerEpic: string;
  proposerWardNo: number;
  securityDeposit: {
    receiptNo: string;
    amount: number;
    date: string;
  };
  submissionTimestamp: string;

  // Detailed Information (Form 26 / Assets / Dues / Legal Declarations)
  education: string;
  occupation: string;
  criminalAntecedents: {
    hasCases: boolean;
    caseDetails?: string;
    convictionCount: number;
  };
  assets: NominationAssets;
  panchayatDuesCleared: boolean;
  noDueCertNumber: string;
  numberOfLivingChildren: number;
  proposerVerified: boolean;
  checklist: NominationChecklist;

  // Scrutiny Stage
  scrutinyStatus: ScrutinyStatus;
  scrutinyRemarks?: string;
  scrutinizedBy?: string;
  scrutinyTimestamp?: string;

  // Withdrawal & Contestants Stage
  withdrawn: boolean;
  withdrawnTimestamp?: string;
  withdrawnNoticeNo?: string;
  allottedSymbol?: {
    name: string;
    code: string;
    icon: string;
  };
  ballotOrder?: number;
  allottedParty?: string;
}

export type PollingTimeSlot =
  | '07:00 - 09:00'
  | '09:00 - 11:00'
  | '11:00 - 13:00'
  | '13:00 - 15:00'
  | '15:00 - 17:00';

export const POLLING_SLOTS: { key: PollingTimeSlot; label: string; round: number }[] = [
  { key: '07:00 - 09:00', label: '07:00 AM – 09:00 AM (Slot 1)', round: 1 },
  { key: '09:00 - 11:00', label: '09:00 AM – 11:00 AM (Slot 2)', round: 2 },
  { key: '11:00 - 13:00', label: '11:00 AM – 01:00 PM (Slot 3)', round: 3 },
  { key: '13:00 - 15:00', label: '01:00 PM – 03:00 PM (Slot 4)', round: 4 },
  { key: '15:00 - 17:00', label: '03:00 PM – 05:00 PM (Close of Poll)', round: 5 },
];

export interface HourlyTurnoutRecord {
  id: string;
  panchayatId: string;
  pollingStationId: string;
  wardId: string;
  timeSlot: PollingTimeSlot;
  cumulativeMale: number;
  cumulativeFemale: number;
  cumulativeOther: number;
  cumulativeTotal: number;
  enteredBy: string; // Data entry person name
  verifiedByPO: boolean;
  updatedAt: string;
}

export interface CandidateRoundVote {
  candidateId: string;
  candidateName: string;
  symbol: string;
  postType: PostType;
  wardNumber?: number;
  round1Votes: number;
  round2Votes: number;
  round3Votes: number;
  postalVotes: number;
  totalVotes: number;
}

export interface CountingRoundRecord {
  id: string;
  panchayatId: string;
  postType: PostType;
  wardNumber?: number;
  currentRound: number;
  totalRounds: number;
  candidateVotes: CandidateRoundVote[];
  rejectedBallots: number;
  tenderedBallots: number;
  totalPolledCounted: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  declaredWinnerId?: string;
  declaredWinnerName?: string;
  margin?: number;
  completedAt?: string;
}

export interface FreeSymbol {
  name: string;
  code: string;
  icon: string;
}

export const FREE_SYMBOLS: FreeSymbol[] = [
  { name: 'Rising Sun', code: 'SYM-01', icon: '☀️' },
  { name: 'Farmer with Plough', code: 'SYM-02', icon: '🚜' },
  { name: 'Coconut Tree', code: 'SYM-03', icon: '🌴' },
  { name: 'Cup & Saucer', code: 'SYM-04', icon: '☕' },
  { name: 'Kettle', code: 'SYM-05', icon: '🫖' },
  { name: 'Almirah (Cupboard)', code: 'SYM-06', icon: '🚪' },
  { name: 'Torch / Flashlight', code: 'SYM-07', icon: '🔦' },
  { name: 'Book & Pen', code: 'SYM-08', icon: '📖' },
  { name: 'Sewing Machine', code: 'SYM-09', icon: '🧵' },
  { name: 'Clock', code: 'SYM-10', icon: '⏰' },
  { name: 'Table Lamp', code: 'SYM-11', icon: '💡' },
  { name: 'Water Pitcher (Pot)', code: 'SYM-12', icon: '🏺' },
  { name: 'Hand Cart', code: 'SYM-13', icon: '🛒' },
  { name: 'Ring', code: 'SYM-14', icon: '💍' },
];

export interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  symbolName?: string;
  recognitionType: 'STATE_RECOGNIZED' | 'NATIONAL' | 'REGISTERED' | 'INDEPENDENT';
}

export const INITIAL_PARTIES: PoliticalParty[] = [
  { id: 'party-ind', name: 'Independent', abbreviation: 'IND', recognitionType: 'INDEPENDENT' },
  { id: 'party-tdp', name: 'Telugu Desam Party', abbreviation: 'TDP', symbolName: 'Bicycle', recognitionType: 'STATE_RECOGNIZED' },
  { id: 'party-ysrcp', name: 'YSR Congress Party', abbreviation: 'YSRCP', symbolName: 'Ceiling Fan', recognitionType: 'STATE_RECOGNIZED' },
  { id: 'party-jsp', name: 'Jana Sena Party', abbreviation: 'JSP', symbolName: 'Glass Tumbler', recognitionType: 'STATE_RECOGNIZED' },
  { id: 'party-bjp', name: 'Bharatiya Janata Party', abbreviation: 'BJP', symbolName: 'Lotus', recognitionType: 'NATIONAL' },
  { id: 'party-inc', name: 'Indian National Congress', abbreviation: 'INC', symbolName: 'Hand', recognitionType: 'NATIONAL' },
  { id: 'party-cpi', name: 'Communist Party of India', abbreviation: 'CPI', symbolName: 'Ears of Corn and Sickle', recognitionType: 'NATIONAL' },
];

export interface AuthenticatedOperator {
  mobile: string;
  name: string;
  designation: string;
  employeeId: string;
  districtId: string;
  districtName: string;
  divisionId: string;
  divisionName: string;
  mandalId: string;
  mandalName: string;
  panchayatId: string;
  panchayatName: string;
  assignedWardNumber?: number; // undefined means all wards / panchayat level
  role: 'DEO' | 'RO' | 'BLO';
  loginTime: string;
}

