/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  District,
  Division,
  Mandal,
  Panchayat,
  Ward,
  PollingStation,
  Nomination,
  HourlyTurnoutRecord,
  CountingRoundRecord,
} from '../types/election';

import {
  INITIAL_DISTRICT,
  INITIAL_DIVISIONS,
  INITIAL_MANDALS,
  INITIAL_PANCHAYATS,
  INITIAL_WARDS,
  INITIAL_POLLING_STATIONS,
  INITIAL_NOMINATIONS,
  INITIAL_TURNOUT_RECORDS,
  INITIAL_COUNTING_RECORDS,
} from '../data/initialElectionData';

const STORAGE_KEYS = {
  DISTRICT: 'pems_district',
  DIVISIONS: 'pems_divisions',
  MANDALS: 'pems_mandals',
  PANCHAYATS: 'pems_panchayats',
  WARDS: 'pems_wards',
  POLLING_STATIONS: 'pems_polling_stations',
  NOMINATIONS: 'pems_nominations',
  TURNOUT: 'pems_turnout',
  COUNTING: 'pems_counting',
  PARTIES: 'pems_parties',
  SYMBOLS: 'pems_symbols',
};

export interface ElectionAppState {
  district: District;
  divisions: Division[];
  mandals: Mandal[];
  panchayats: Panchayat[];
  wards: Ward[];
  pollingStations: PollingStation[];
  nominations: Nomination[];
  turnoutRecords: HourlyTurnoutRecord[];
  countingRecords: CountingRoundRecord[];
  parties: PoliticalParty[];
  symbols: FreeSymbol[];
}

import { PoliticalParty, FreeSymbol, FREE_SYMBOLS, INITIAL_PARTIES } from '../types/election';

export function loadElectionState(): ElectionAppState {
  try {
    const rawDistrict = localStorage.getItem(STORAGE_KEYS.DISTRICT);
    const rawDivisions = localStorage.getItem(STORAGE_KEYS.DIVISIONS);
    const rawMandals = localStorage.getItem(STORAGE_KEYS.MANDALS);
    const rawPanchayats = localStorage.getItem(STORAGE_KEYS.PANCHAYATS);
    const rawWards = localStorage.getItem(STORAGE_KEYS.WARDS);
    const rawPS = localStorage.getItem(STORAGE_KEYS.POLLING_STATIONS);
    const rawNominations = localStorage.getItem(STORAGE_KEYS.NOMINATIONS);
    const rawTurnout = localStorage.getItem(STORAGE_KEYS.TURNOUT);
    const rawCounting = localStorage.getItem(STORAGE_KEYS.COUNTING);
    const rawParties = localStorage.getItem(STORAGE_KEYS.PARTIES);
    const rawSymbols = localStorage.getItem(STORAGE_KEYS.SYMBOLS);

    return {
      district: rawDistrict ? JSON.parse(rawDistrict) : INITIAL_DISTRICT,
      divisions: rawDivisions ? JSON.parse(rawDivisions) : INITIAL_DIVISIONS,
      mandals: rawMandals ? JSON.parse(rawMandals) : INITIAL_MANDALS,
      panchayats: rawPanchayats ? JSON.parse(rawPanchayats) : INITIAL_PANCHAYATS,
      wards: rawWards ? JSON.parse(rawWards) : INITIAL_WARDS,
      pollingStations: rawPS ? JSON.parse(rawPS) : INITIAL_POLLING_STATIONS,
      nominations: rawNominations ? JSON.parse(rawNominations) : INITIAL_NOMINATIONS,
      turnoutRecords: rawTurnout ? JSON.parse(rawTurnout) : INITIAL_TURNOUT_RECORDS,
      countingRecords: rawCounting ? JSON.parse(rawCounting) : INITIAL_COUNTING_RECORDS,
      parties: rawParties ? JSON.parse(rawParties) : INITIAL_PARTIES,
      symbols: rawSymbols ? JSON.parse(rawSymbols) : FREE_SYMBOLS,
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return {
      district: INITIAL_DISTRICT,
      divisions: INITIAL_DIVISIONS,
      mandals: INITIAL_MANDALS,
      panchayats: INITIAL_PANCHAYATS,
      wards: INITIAL_WARDS,
      pollingStations: INITIAL_POLLING_STATIONS,
      nominations: INITIAL_NOMINATIONS,
      turnoutRecords: INITIAL_TURNOUT_RECORDS,
      countingRecords: INITIAL_COUNTING_RECORDS,
      parties: INITIAL_PARTIES,
      symbols: FREE_SYMBOLS,
    };
  }
}

export function saveElectionState(state: Partial<ElectionAppState>): void {
  try {
    if (state.district) localStorage.setItem(STORAGE_KEYS.DISTRICT, JSON.stringify(state.district));
    if (state.divisions) localStorage.setItem(STORAGE_KEYS.DIVISIONS, JSON.stringify(state.divisions));
    if (state.mandals) localStorage.setItem(STORAGE_KEYS.MANDALS, JSON.stringify(state.mandals));
    if (state.panchayats) localStorage.setItem(STORAGE_KEYS.PANCHAYATS, JSON.stringify(state.panchayats));
    if (state.wards) localStorage.setItem(STORAGE_KEYS.WARDS, JSON.stringify(state.wards));
    if (state.pollingStations) localStorage.setItem(STORAGE_KEYS.POLLING_STATIONS, JSON.stringify(state.pollingStations));
    if (state.nominations) localStorage.setItem(STORAGE_KEYS.NOMINATIONS, JSON.stringify(state.nominations));
    if (state.turnoutRecords) localStorage.setItem(STORAGE_KEYS.TURNOUT, JSON.stringify(state.turnoutRecords));
    if (state.countingRecords) localStorage.setItem(STORAGE_KEYS.COUNTING, JSON.stringify(state.countingRecords));
    if (state.parties) localStorage.setItem(STORAGE_KEYS.PARTIES, JSON.stringify(state.parties));
    if (state.symbols) localStorage.setItem(STORAGE_KEYS.SYMBOLS, JSON.stringify(state.symbols));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function resetToDefaultState(): ElectionAppState {
  localStorage.clear();
  return {
    district: INITIAL_DISTRICT,
    divisions: INITIAL_DIVISIONS,
    mandals: INITIAL_MANDALS,
    panchayats: INITIAL_PANCHAYATS,
    wards: INITIAL_WARDS,
    pollingStations: INITIAL_POLLING_STATIONS,
    nominations: INITIAL_NOMINATIONS,
    turnoutRecords: INITIAL_TURNOUT_RECORDS,
    countingRecords: INITIAL_COUNTING_RECORDS,
    parties: INITIAL_PARTIES,
    symbols: FREE_SYMBOLS,
  };
}
