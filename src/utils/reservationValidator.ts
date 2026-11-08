/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ReservationCategory,
  CandidateGender,
  CandidateSocialCategory,
  RESERVATION_LABELS,
} from '../types/election';

export interface ValidationResult {
  isEligible: boolean;
  isGenderCompliant: boolean;
  isCategoryCompliant: boolean;
  message: string;
  reasons: string[];
}

export function validateReservation(
  seatReservation: ReservationCategory,
  candidateGender: CandidateGender,
  candidateCategory: CandidateSocialCategory
): ValidationResult {
  const reasons: string[] = [];
  let isGenderCompliant = true;
  let isCategoryCompliant = true;

  // 1. Women reservation check
  const requiresFemale = [
    'GEN_W',
    'BC_W',
    'SC_W',
    'ST_W',
  ].includes(seatReservation);

  if (requiresFemale && candidateGender !== 'Female') {
    isGenderCompliant = false;
    reasons.push(
      `Seat is reserved for Women (${RESERVATION_LABELS[seatReservation]}). Male / Other candidates are not eligible.`
    );
  }

  // 2. Social category reservation check
  switch (seatReservation) {
    case 'GEN':
    case 'GEN_W':
      // Open to all social categories
      isCategoryCompliant = true;
      break;

    case 'BC':
    case 'BC_W':
      if (candidateCategory !== 'BC') {
        isCategoryCompliant = false;
        reasons.push(
          `Seat is reserved for Backward Class (BC). Candidate category is '${candidateCategory}'.`
        );
      }
      break;

    case 'SC':
    case 'SC_W':
      if (candidateCategory !== 'SC') {
        isCategoryCompliant = false;
        reasons.push(
          `Seat is reserved for Scheduled Caste (SC). Candidate category is '${candidateCategory}'.`
        );
      }
      break;

    case 'ST':
    case 'ST_W':
      if (candidateCategory !== 'ST') {
        isCategoryCompliant = false;
        reasons.push(
          `Seat is reserved for Scheduled Tribe (ST). Candidate category is '${candidateCategory}'.`
        );
      }
      break;
  }

  const isEligible = isGenderCompliant && isCategoryCompliant;

  let message = `Eligible for ${RESERVATION_LABELS[seatReservation]} seat`;
  if (!isEligible) {
    message = `Ineligible: ${reasons.join(' ')}`;
  }

  return {
    isEligible,
    isGenderCompliant,
    isCategoryCompliant,
    message,
    reasons,
  };
}

export function validateNominationFiling(nomination: {
  age: number;
  panchayatDuesCleared: boolean;
  proposerWardMatches: boolean;
  seatReservation: ReservationCategory;
  candidateGender: CandidateGender;
  candidateCategory: CandidateSocialCategory;
}): { isValid: boolean; warnings: string[]; errors: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Age rule
  if (nomination.age < 21) {
    errors.push(`Candidate age is ${nomination.age}. Minimum statutory age is 21 years.`);
  }

  // Reservation rule
  const resCheck = validateReservation(
    nomination.seatReservation,
    nomination.candidateGender,
    nomination.candidateCategory
  );
  if (!resCheck.isEligible) {
    errors.push(...resCheck.reasons);
  }

  // Dues check
  if (!nomination.panchayatDuesCleared) {
    warnings.push('Gram Panchayat dues are marked as pending. Requires No-Due certificate before scrutiny.');
  }

  // Proposer check
  if (!nomination.proposerWardMatches) {
    errors.push('Proposer must be a registered elector in the same Gram Panchayat / Ward.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
