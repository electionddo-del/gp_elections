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
  ReservationCategory,
  RESERVATION_LABELS,
  PoliticalParty,
  FreeSymbol,
} from '../../types/election';
import {
  Settings,
  Plus,
  Trash2,
  Save,
  Check,
  Building,
  Building2,
  Users,
  MapPin,
  Shield,
  Phone,
  Vote,
  Sparkles,
  Layers,
  ArrowRight,
  User,
  PlusCircle,
  AlertCircle,
  Flag,
  FileSpreadsheet,
} from 'lucide-react';

interface HierarchyManagerProps {
  district: District;
  divisions: Division[];
  mandals: Mandal[];
  panchayats: Panchayat[];
  wards: Ward[];
  parties: PoliticalParty[];
  symbols: FreeSymbol[];
  selectedDivisionId: string;
  selectedMandalId: string;
  selectedPanchayatId: string;
  onUpdateDistrict: (district: District) => void;
  onUpdatePanchayat: (panchayat: Panchayat) => void;
  onUpdateWards: (wards: Ward[]) => void;
  onAddDivision: (division: Division) => void;
  onUpdateDivision?: (division: Division) => void;
  onDeleteDivision?: (divisionId: string) => void;
  onAddMandal: (mandal: Mandal) => void;
  onAddPanchayat: (panchayat: Panchayat) => void;
  onUpdateParties: (parties: PoliticalParty[]) => void;
  onUpdateSymbols: (symbols: FreeSymbol[]) => void;
  onSelectDivision?: (id: string) => void;
  onSelectMandal?: (id: string) => void;
  onSelectPanchayat?: (id: string) => void;
  onDeleteMandal?: (mandalId: string) => void;
  onDeletePanchayat?: (panchayatId: string) => void;
  onDeleteWard?: (wardId: string) => void;
}

export const HierarchyManager: React.FC<HierarchyManagerProps> = ({
  district,
  divisions,
  mandals,
  panchayats,
  wards,
  parties,
  symbols,
  selectedDivisionId,
  selectedMandalId,
  selectedPanchayatId,
  onUpdateDistrict,
  onUpdatePanchayat,
  onUpdateWards,
  onAddDivision,
  onUpdateDivision,
  onDeleteDivision,
  onAddMandal,
  onAddPanchayat,
  onUpdateParties,
  onUpdateSymbols,
  onSelectDivision,
  onSelectMandal,
  onSelectPanchayat,
  onDeleteMandal,
  onDeletePanchayat,
  onDeleteWard,
}) => {
  // Master Section Sub-Tabs
  const [activeTab, setActiveTab] = useState<
    'district' | 'divisions' | 'mandals' | 'panchayats' | 'wards' | 'parties_symbols'
  >('panchayats');

  // Currently selected entities for drilldown within admin master
  const [activeDivId, setActiveDivId] = useState<string>(selectedDivisionId || divisions[0]?.id || '');
  const [activeManId, setActiveManId] = useState<string>(selectedMandalId || mandals[0]?.id || '');
  const [activePanId, setActivePanId] = useState<string>(selectedPanchayatId || panchayats[0]?.id || '');

  const currentDivision = divisions.find((d) => d.id === activeDivId) || divisions[0];
  const filteredMandals = mandals.filter((m) => m.divisionId === activeDivId);
  const currentMandal = filteredMandals.find((m) => m.id === activeManId) || filteredMandals[0] || mandals[0];
  const filteredPanchayats = panchayats.filter((p) => p.mandalId === currentMandal?.id);
  const currentPanchayat = filteredPanchayats.find((p) => p.id === activePanId) || filteredPanchayats[0] || panchayats[0];
  const currentWards = wards.filter((w) => w.panchayatId === currentPanchayat?.id);

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  // -------------------------------------------------------------
  // 1. DISTRICT STATE
  // -------------------------------------------------------------
  const [distName, setDistName] = useState(district.name);
  const [distState, setDistState] = useState(district.state);
  const [distCollector, setDistCollector] = useState(district.collectorName);
  const [distElectionDate, setDistElectionDate] = useState(district.electionDate);

  const handleSaveDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDistrict({
      ...district,
      name: distName,
      state: distState,
      collectorName: distCollector,
      electionDate: distElectionDate,
    });
    showToast('District election master details updated successfully!');
  };

  // -------------------------------------------------------------
  // 1B. REVENUE DIVISIONS STATE
  // -------------------------------------------------------------
  const [showAddDivision, setShowAddDivision] = useState(false);
  const [newDivName, setNewDivName] = useState('');
  const [newDivSubCollector, setNewDivSubCollector] = useState('');
  const [newDivHq, setNewDivHq] = useState('');
  const [editingDivId, setEditingDivId] = useState<string | null>(null);
  const [editDivName, setEditDivName] = useState('');
  const [editDivSubCollector, setEditDivSubCollector] = useState('');
  const [editDivHq, setEditDivHq] = useState('');

  const handleAddNewDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDivName.trim()) return;
    const formattedName = newDivName.trim().endsWith('Division')
      ? newDivName.trim()
      : `${newDivName.trim()} Division`;
    const newDiv: Division = {
      id: `div-${Date.now()}`,
      districtId: district.id,
      name: formattedName,
      subCollectorRO: newDivSubCollector.trim() || 'Sub-Collector & Sub-Divisional Magistrate',
      headquarters: newDivHq.trim() || newDivName.trim().replace(/\s+Division$/i, ''),
    };
    onAddDivision(newDiv);
    setActiveDivId(newDiv.id);
    setNewDivName('');
    setNewDivSubCollector('');
    setNewDivHq('');
    setShowAddDivision(false);
    showToast(`Revenue Division "${newDiv.name}" added successfully!`);
  };

  const handleStartEditDivision = (div: Division) => {
    setEditingDivId(div.id);
    setEditDivName(div.name);
    setEditDivSubCollector(div.subCollectorRO);
    setEditDivHq(div.headquarters);
  };

  const handleSaveEditDivision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDivId) return;
    const target = divisions.find((d) => d.id === editingDivId);
    if (!target) return;
    if (onUpdateDivision) {
      onUpdateDivision({
        ...target,
        name: editDivName.trim() || target.name,
        subCollectorRO: editDivSubCollector.trim() || target.subCollectorRO,
        headquarters: editDivHq.trim() || target.headquarters,
      });
    }
    setEditingDivId(null);
    showToast('Revenue Division details updated successfully!');
  };

  const handleDeleteDivisionClick = (divId: string) => {
    const target = divisions.find((d) => d.id === divId);
    if (!target) return;
    const linkedMandals = mandals.filter((m) => m.divisionId === divId);
    if (linkedMandals.length > 0) {
      if (
        !confirm(
          `Division "${target.name}" has ${linkedMandals.length} linked mandal(s). Deleting it will remove the division. Continue?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm(`Are you sure you want to delete revenue division "${target.name}"?`)) {
        return;
      }
    }
    if (onDeleteDivision) {
      onDeleteDivision(divId);
      showToast(`Revenue division "${target.name}" removed.`);
    }
  };

  // -------------------------------------------------------------
  // 2. MANDALS STATE
  // -------------------------------------------------------------
  const [showAddMandal, setShowAddMandal] = useState(false);
  const [newMandalName, setNewMandalName] = useState('');
  const [newMandalDivId, setNewMandalDivId] = useState(divisions[0]?.id || '');
  const [newMandalTahsildar, setNewMandalTahsildar] = useState('');

  const handleAddNewMandal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMandalName.trim()) return;
    const newMandal: Mandal = {
      id: `man-${Date.now()}`,
      divisionId: newMandalDivId,
      name: newMandalName.trim(),
      tahsildarRO: newMandalTahsildar.trim() || 'Tahsildar & Assistant RO',
    };
    onAddMandal(newMandal);
    setActiveManId(newMandal.id);
    setNewMandalName('');
    setNewMandalTahsildar('');
    setShowAddMandal(false);
    showToast(`Mandal "${newMandal.name}" added successfully!`);
  };

  // -------------------------------------------------------------
  // 3. PANCHAYATS STATE (With Reservations, Voters M/F/O)
  // -------------------------------------------------------------
  const [showAddPanchayat, setShowAddPanchayat] = useState(false);
  const [newPanName, setNewPanName] = useState('');
  const [newPanMandalId, setNewPanMandalId] = useState(currentMandal?.id || mandals[0]?.id || '');
  const [newPanReservation, setNewPanReservation] = useState<ReservationCategory>('GEN');
  const [newPanRoName, setNewPanRoName] = useState('');
  const [newPanRoPhone, setNewPanRoPhone] = useState('9848011001');
  const [newPanSecName, setNewPanSecName] = useState('');
  const [newPanSecPhone, setNewPanSecPhone] = useState('9848011225');
  const [newPanInitialWardsCount, setNewPanInitialWardsCount] = useState<number>(4);
  const [newPanMaleVoters, setNewPanMaleVoters] = useState<number>(400);
  const [newPanFemaleVoters, setNewPanFemaleVoters] = useState<number>(420);
  const [newPanOtherVoters, setNewPanOtherVoters] = useState<number>(2);

  const handleAddNewPanchayat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPanName.trim()) return;

    const panId = `pan-${Date.now()}`;
    const newPan: Panchayat = {
      id: panId,
      mandalId: newPanMandalId,
      name: newPanName.trim().endsWith('GP') ? newPanName.trim() : `${newPanName.trim()} GP`,
      sarpanchReservation: newPanReservation,
      returningOfficer: {
        name: newPanRoName.trim() || 'Returning Officer & MPDO',
        designation: 'Mandal Parishad Development Officer',
        phone: newPanRoPhone.trim(),
      },
      panchayatSecretary: {
        name: newPanSecName.trim() || 'Panchayat Secretary Gr-IV',
        phone: newPanSecPhone.trim(),
      },
      totalWards: newPanInitialWardsCount,
    };

    onAddPanchayat(newPan);

    // Auto-generate initial wards with voter demographics for this GP
    const generatedWards: Ward[] = [];
    const perWardMale = Math.floor(newPanMaleVoters / newPanInitialWardsCount);
    const perWardFemale = Math.floor(newPanFemaleVoters / newPanInitialWardsCount);
    const defaultReservations: ReservationCategory[] = ['GEN', 'GEN_W', 'BC', 'BC_W', 'SC', 'SC_W', 'ST', 'ST_W'];

    for (let i = 1; i <= newPanInitialWardsCount; i++) {
      generatedWards.push({
        id: `ward-${Date.now()}-${i}`,
        panchayatId: panId,
        wardNumber: i,
        reservation: defaultReservations[(i - 1) % defaultReservations.length],
        voters: {
          male: perWardMale,
          female: perWardFemale,
          other: i === 1 ? newPanOtherVoters : 0,
          total: perWardMale + perWardFemale + (i === 1 ? newPanOtherVoters : 0),
        },
        pollingStationId: 'ps-01',
        dataEntryPerson: {
          name: `Ward ${i} Operator`,
          employeeId: `DEO-${Math.floor(1000 + Math.random() * 9000)}`,
          designation: 'Panchayat Assistant / BLO',
          phone: `98480112${i.toString().padStart(2, '0')}`,
          assignedWardNumber: i,
        },
      });
    }

    onUpdateWards([...wards, ...generatedWards]);
    setActivePanId(panId);
    setNewPanName('');
    setNewPanRoName('');
    setNewPanSecName('');
    setShowAddPanchayat(false);
    showToast(`Gram Panchayat "${newPan.name}" created with ${newPanInitialWardsCount} wards & voters!`);
  };

  // -------------------------------------------------------------
  // 4. WARDS STATE (Reservations, Voters Men/Women/Other & Operators)
  // -------------------------------------------------------------
  const [localWards, setLocalWards] = useState<Ward[]>(wards);
  const [showAddSingleWard, setShowAddSingleWard] = useState(false);
  const [showBatchAddWards, setShowBatchAddWards] = useState(false);

  // Single Ward Draft
  const [singleWardNo, setSingleWardNo] = useState<number>((currentWards.length || 0) + 1);
  const [singleWardRes, setSingleWardRes] = useState<ReservationCategory>('GEN');
  const [singleMale, setSingleMale] = useState<number>(150);
  const [singleFemale, setSingleFemale] = useState<number>(160);
  const [singleOther, setSingleOther] = useState<number>(0);
  const [singleOpName, setSingleOpName] = useState('');
  const [singleOpPhone, setSingleOpPhone] = useState('9848011234');
  const [singleOpEmpId, setSingleOpEmpId] = useState(`DEO-${Math.floor(1000 + Math.random() * 9000)}`);

  // Batch Wards Draft
  const [batchCount, setBatchCount] = useState<number>(4);
  const [batchDefaultMale, setBatchDefaultMale] = useState<number>(150);
  const [batchDefaultFemale, setBatchDefaultFemale] = useState<number>(150);

  const handleWardFieldChange = (wardId: string, field: string, val: any) => {
    setLocalWards((prev) =>
      prev.map((w) => {
        if (w.id !== wardId) return w;
        if (field === 'reservation') return { ...w, reservation: val };
        if (field === 'male') {
          const m = Number(val) || 0;
          return { ...w, voters: { ...w.voters, male: m, total: m + w.voters.female + w.voters.other } };
        }
        if (field === 'female') {
          const f = Number(val) || 0;
          return { ...w, voters: { ...w.voters, female: f, total: w.voters.male + f + w.voters.other } };
        }
        if (field === 'other') {
          const o = Number(val) || 0;
          return { ...w, voters: { ...w.voters, other: o, total: w.voters.male + w.voters.female + o } };
        }
        if (field === 'opName') {
          return { ...w, dataEntryPerson: { ...w.dataEntryPerson, name: val } };
        }
        if (field === 'opPhone') {
          return { ...w, dataEntryPerson: { ...w.dataEntryPerson, phone: val } };
        }
        if (field === 'opEmpId') {
          return { ...w, dataEntryPerson: { ...w.dataEntryPerson, employeeId: val } };
        }
        return w;
      })
    );
  };

  const handleSaveAllWards = () => {
    onUpdateWards(localWards);
    showToast('All ward reservations, voters (Men/Women/Others), and operators saved!');
  };

  const handleAddSingleWardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWard: Ward = {
      id: `ward-${Date.now()}`,
      panchayatId: currentPanchayat.id,
      wardNumber: singleWardNo,
      reservation: singleWardRes,
      voters: {
        male: singleMale,
        female: singleFemale,
        other: singleOther,
        total: singleMale + singleFemale + singleOther,
      },
      pollingStationId: 'ps-01',
      dataEntryPerson: {
        name: singleOpName.trim() || `Ward ${singleWardNo} Operator`,
        employeeId: singleOpEmpId,
        designation: 'Panchayat Assistant / BLO',
        phone: singleOpPhone.trim(),
        assignedWardNumber: singleWardNo,
      },
    };
    const updated = [...localWards, newWard];
    setLocalWards(updated);
    onUpdateWards(updated);
    setShowAddSingleWard(false);
    setSingleWardNo(singleWardNo + 1);
    setSingleOpName('');
    showToast(`Ward No. ${newWard.wardNumber} added with reservation & operator!`);
  };

  const handleBatchAddWardsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startNum = (currentWards.length || 0) + 1;
    const added: Ward[] = [];
    const defaultReservations: ReservationCategory[] = ['GEN', 'GEN_W', 'BC', 'BC_W', 'SC', 'SC_W', 'ST', 'ST_W'];

    for (let i = 0; i < batchCount; i++) {
      const wardNum = startNum + i;
      added.push({
        id: `ward-${Date.now()}-${i}`,
        panchayatId: currentPanchayat.id,
        wardNumber: wardNum,
        reservation: defaultReservations[i % defaultReservations.length],
        voters: {
          male: batchDefaultMale,
          female: batchDefaultFemale,
          other: 0,
          total: batchDefaultMale + batchDefaultFemale,
        },
        pollingStationId: 'ps-01',
        dataEntryPerson: {
          name: `Ward ${wardNum} Operator`,
          employeeId: `DEO-${Math.floor(1000 + Math.random() * 9000)}`,
          designation: 'Panchayat Assistant / BLO',
          phone: `98480112${wardNum.toString().padStart(2, '0')}`,
          assignedWardNumber: wardNum,
        },
      });
    }

    const updated = [...localWards, ...added];
    setLocalWards(updated);
    onUpdateWards(updated);
    setShowBatchAddWards(false);
    showToast(`Batch added ${batchCount} wards to ${currentPanchayat.name}!`);
  };

  const handleDeleteWardClick = (wardId: string) => {
    if (!confirm('Are you sure you want to delete this ward?')) return;
    const updated = localWards.filter((w) => w.id !== wardId);
    setLocalWards(updated);
    onUpdateWards(updated);
    if (onDeleteWard) onDeleteWard(wardId);
    showToast('Ward deleted.');
  };

  // -------------------------------------------------------------
  // 5. PARTIES AND SYMBOLS STATE
  // -------------------------------------------------------------
  const [showAddParty, setShowAddParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyAbbr, setNewPartyAbbr] = useState('');
  const [newPartySymbol, setNewPartySymbol] = useState('');
  const [newPartyRecog, setNewPartyRecog] = useState<PoliticalParty['recognitionType']>('STATE_RECOGNIZED');

  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [newSymbolName, setNewSymbolName] = useState('');
  const [newSymbolCode, setNewSymbolCode] = useState(`SYM-${symbols.length + 1}`);
  const [newSymbolIcon, setNewSymbolIcon] = useState('🗳️');

  const handleAddPartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;
    const newParty: PoliticalParty = {
      id: `party-${Date.now()}`,
      name: newPartyName.trim(),
      abbreviation: newPartyAbbr.trim() || newPartyName.slice(0, 4).toUpperCase(),
      symbolName: newPartySymbol.trim() || undefined,
      recognitionType: newPartyRecog,
    };
    onUpdateParties([...parties, newParty]);
    setNewPartyName('');
    setNewPartyAbbr('');
    setNewPartySymbol('');
    setShowAddParty(false);
    showToast(`Political party "${newParty.name}" added successfully!`);
  };

  const handleDeleteParty = (partyId: string) => {
    onUpdateParties(parties.filter((p) => p.id !== partyId));
    showToast('Party removed from master register.');
  };

  const handleAddSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolName.trim()) return;
    const newSym: FreeSymbol = {
      name: newSymbolName.trim(),
      code: newSymbolCode.trim(),
      icon: newSymbolIcon.trim() || '🗳️',
    };
    onUpdateSymbols([...symbols, newSym]);
    setNewSymbolName('');
    setNewSymbolCode(`SYM-${symbols.length + 2}`);
    setShowAddSymbol(false);
    showToast(`Election symbol "${newSym.name}" added to free symbols list!`);
  };

  const handleDeleteSymbol = (symbolCode: string) => {
    onUpdateSymbols(symbols.filter((s) => s.code !== symbolCode));
    showToast('Election symbol removed.');
  };

  // Keep localWards in sync with parent wards
  React.useEffect(() => {
    setLocalWards(wards);
  }, [wards]);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {savedSuccessMsg && (
        <div className="p-3 bg-emerald-900 text-white rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs border border-emerald-700 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-300" />
            <span className="font-semibold">{savedSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSavedSuccessMsg(null)}
            className="text-emerald-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Admin Master Navigation Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-900 text-white">
                Admin Master Data & Hierarchy Setup
              </span>
              <span className="text-xs text-slate-500">
                Panchayat Raj Act Statutory Master
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
              Election Master Control Console
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Add and configure Districts, Revenue Divisions, Mandals, Gram Panchayats (Reservations & Voters), Wards & Operators, and Political Parties & Symbols.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
              District: {district.name}
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-3 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('panchayats')}
            className={`px-3.5 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'panchayats'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Gram Panchayats (Reservations & Voters)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wards')}
            className={`px-3.5 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'wards'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span>Wards (Reservations, Voters & Operators)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('divisions')}
            className={`px-3.5 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'divisions'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Revenue Divisions Master</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mandals')}
            className={`px-3.5 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'mandals'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Mandals Master</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('district')}
            className={`px-3.5 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'district'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>District Master</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parties_symbols')}
            className={`px-3.5 py-2 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'parties_symbols'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Vote className="w-4 h-4 text-amber-400" />
            <span>Parties & Symbols Master</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DISTRICT MASTER TAB                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'district' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" />
                District Master Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Configure primary revenue district, state, District Collector & DEO, and polling schedule date.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveDistrict} className="max-w-2xl space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">District Name</label>
                <input
                  type="text"
                  value={distName}
                  onChange={(e) => setDistName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  value={distState}
                  onChange={(e) => setDistState(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  District Collector & District Election Officer (DEO)
                </label>
                <input
                  type="text"
                  value={distCollector}
                  onChange={(e) => setDistCollector(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Election Date (Poll & Count)</label>
                <input
                  type="text"
                  value={distElectionDate}
                  onChange={(e) => setDistElectionDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Save className="w-4 h-4" />
              Save District Master
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1B. REVENUE DIVISIONS MASTER TAB                                          */}
      {/* ========================================================================= */}
      {activeTab === 'divisions' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Revenue Divisions Master ({divisions.length} Divisions)
              </h2>
              <p className="text-xs text-slate-500">
                Configure Revenue Divisions, Sub-Collector / Revenue Divisional Officer (RDO) / SDM, Division Headquarters, and linked Mandals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddDivision(!showAddDivision);
                setEditingDivId(null);
              }}
              className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              + Add Revenue Division
            </button>
          </div>

          {/* Add Revenue Division Form */}
          {showAddDivision && (
            <form onSubmit={handleAddNewDivision} className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-indigo-700" />
                  Add New Revenue Division
                </h3>
                <span className="text-[11px] text-indigo-600 font-medium">
                  Parent District: <strong>{district.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Division Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Adoni Division / Kurnool Division"
                    value={newDivName}
                    onChange={(e) => setNewDivName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Suffix "Division" will be added if omitted</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sub-Collector / RDO Name & Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. S. Abhishek, IAS, Sub-Collector & SDM"
                    value={newDivSubCollector}
                    onChange={(e) => setNewDivSubCollector(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Statutory Returning Officer for Divisional Hierarchy</span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Division Headquarters (Town / City)</label>
                  <input
                    type="text"
                    placeholder="e.g. Adoni / Kurnool"
                    value={newDivHq}
                    onChange={(e) => setNewDivHq(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Sub-Collector / RDO Office location</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Revenue Division
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDivision(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit Revenue Division Form */}
          {editingDivId && (
            <form onSubmit={handleSaveEditDivision} className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-amber-700" />
                  Edit Revenue Division: {divisions.find((d) => d.id === editingDivId)?.name}
                </h3>
                <span className="text-[11px] text-amber-700 font-medium">
                  Parent District: <strong>{district.name}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Division Name</label>
                  <input
                    type="text"
                    value={editDivName}
                    onChange={(e) => setEditDivName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sub-Collector / RDO Name & Designation</label>
                  <input
                    type="text"
                    value={editDivSubCollector}
                    onChange={(e) => setEditDivSubCollector(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Headquarters</label>
                  <input
                    type="text"
                    value={editDivHq}
                    onChange={(e) => setEditDivHq(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Update Division Details
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDivId(null)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Revenue Divisions Cards Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {divisions.map((div) => {
                const divMandals = mandals.filter((m) => m.divisionId === div.id);
                const divMandalIds = divMandals.map((m) => m.id);
                const divPans = panchayats.filter((p) => divMandalIds.includes(p.mandalId));
                const divPanIds = divPans.map((p) => p.id);
                const divWards = wards.filter((w) => divPanIds.includes(w.panchayatId));
                const totalElectors = divWards.reduce((acc, w) => acc + (w.voters?.total || 0), 0);
                const maleElectors = divWards.reduce((acc, w) => acc + (w.voters?.male || 0), 0);
                const femaleElectors = divWards.reduce((acc, w) => acc + (w.voters?.female || 0), 0);
                const otherElectors = divWards.reduce((acc, w) => acc + (w.voters?.other || 0), 0);

                return (
                  <div
                    key={div.id}
                    className="p-4 border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between text-xs space-y-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 text-sm sm:text-base">
                              {div.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
                            HQ: {div.headquarters}
                          </span>
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-900 font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                          Rev. Division
                        </span>
                      </div>

                      <div className="mt-2.5 p-2 bg-white rounded-lg border border-slate-200/80 space-y-1">
                        <div className="text-[11px] text-slate-700 flex items-center justify-between">
                          <span className="text-slate-500">Sub-Collector / RDO:</span>
                          <span className="font-semibold text-slate-900 text-right truncate max-w-[180px]">
                            {div.subCollectorRO}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 flex items-center justify-between">
                          <span className="text-slate-500">District:</span>
                          <span className="font-medium text-slate-800">{district.name}</span>
                        </div>
                      </div>

                      {/* Linked Mandals preview */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Mandals in this Division ({divMandals.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {divMandals.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">No mandals linked yet</span>
                          ) : (
                            divMandals.map((m) => (
                              <span
                                key={m.id}
                                className="text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-medium"
                              >
                                {m.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statistics metrics */}
                    <div className="pt-2.5 border-t border-slate-200 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Mandals</span>
                          <span className="font-bold text-slate-900 text-xs">{divMandals.length}</span>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Panchayats</span>
                          <span className="font-bold text-slate-900 text-xs">{divPans.length}</span>
                        </div>
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Wards</span>
                          <span className="font-bold text-slate-900 text-xs">{divWards.length}</span>
                        </div>
                      </div>

                      {/* Total voters breakdown */}
                      <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[11px] flex items-center justify-between">
                        <div>
                          <span className="text-emerald-900 font-bold block">
                            Total Voters: {totalElectors.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            M: {maleElectors.toLocaleString()} | W: {femaleElectors.toLocaleString()}
                            {otherElectors > 0 ? ` | O: ${otherElectors}` : ''}
                          </span>
                        </div>
                        <Vote className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveDivId(div.id);
                            setActiveTab('mandals');
                          }}
                          className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Manage Mandals</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEditDivision(div)}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded cursor-pointer transition-colors"
                            title="Edit Division"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          {divisions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDivisionClick(div.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                              title="Delete Division"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MANDALS MASTER TAB                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'mandals' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Mandals Master Register ({mandals.length} Mandals)
              </h2>
              <p className="text-xs text-slate-500">
                Manage revenue mandals under each division and assign Tahsildar / Assistant Returning Officers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddMandal(!showAddMandal)}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              + Add New Mandal
            </button>
          </div>

          {/* Add Mandal Form Card */}
          {showAddMandal && (
            <form onSubmit={handleAddNewMandal} className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 text-xs animate-in fade-in">
              <h3 className="font-bold text-blue-900 text-sm">Add New Mandal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Parent Division</label>
                  <select
                    value={newMandalDivId}
                    onChange={(e) => setNewMandalDivId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mandal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kosigi / Peddakadubur"
                    value={newMandalName}
                    onChange={(e) => setNewMandalName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tahsildar & RO Name</label>
                  <input
                    type="text"
                    placeholder="e.g. S. Ramakrishna, Tahsildar"
                    value={newMandalTahsildar}
                    onChange={(e) => setNewMandalTahsildar(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  Save Mandal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMandal(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Mandals List Table */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mandals.map((man) => {
                const manDiv = divisions.find((d) => d.id === man.divisionId);
                const manPans = panchayats.filter((p) => p.mandalId === man.id);
                const manPanIds = manPans.map((p) => p.id);
                const manWards = wards.filter((w) => manPanIds.includes(w.panchayatId));

                return (
                  <div
                    key={man.id}
                    className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col justify-between text-xs space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{man.name}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                          {manDiv?.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Tahsildar & RO: <strong>{man.tahsildarRO}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                      <div>Panchayats: <strong>{manPans.length}</strong></div>
                      <div>Wards: <strong>{manWards.length}</strong></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GRAM PANCHAYATS MASTER TAB (RESERVATIONS & VOTERS M/F/O)              */}
      {/* ========================================================================= */}
      {activeTab === 'panchayats' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2.5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-700" />
                Gram Panchayats Master (Reservations & Voters M/F/O)
              </h2>
              <p className="text-xs text-slate-500">
                Add new Gram Panchayats with statutory Sarpanch reservations, initial voters (Men, Women, Others), and assigned election officers.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPanchayat(!showAddPanchayat)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              + Add Gram Panchayat
            </button>
          </div>

          {/* Add Gram Panchayat Modal / Expandable Form */}
          {showAddPanchayat && (
            <form onSubmit={handleAddNewPanchayat} className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-3.5 text-xs animate-in fade-in">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <h3 className="font-bold text-emerald-950 text-sm">
                  Add New Gram Panchayat (With Reservation & Voters)
                </h3>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Auto-generates initial wards with specified electors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Parent Mandal</label>
                  <select
                    value={newPanMandalId}
                    onChange={(e) => setNewPanMandalId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {mandals.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({divisions.find((d) => d.id === m.divisionId)?.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Panchayat Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Pedda Tumbalam GP"
                    value={newPanName}
                    onChange={(e) => setNewPanName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sarpanch Reservation Category
                  </label>
                  <select
                    value={newPanReservation}
                    onChange={(e) => setNewPanReservation(e.target.value as ReservationCategory)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-purple-900"
                  >
                    {Object.entries(RESERVATION_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>
                        {label} ({code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Voter Demographics (Men, Women, Others) */}
              <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 block text-xs">
                  Panchayat Initial Electors (Men, Women, Others)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Men (Male Voters)</label>
                    <input
                      type="number"
                      value={newPanMaleVoters}
                      onChange={(e) => setNewPanMaleVoters(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-semibold"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Women (Female Voters)</label>
                    <input
                      type="number"
                      value={newPanFemaleVoters}
                      onChange={(e) => setNewPanFemaleVoters(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-semibold"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Others</label>
                    <input
                      type="number"
                      value={newPanOtherVoters}
                      onChange={(e) => setNewPanOtherVoters(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-semibold"
                      min={0}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 block mb-1">Initial Wards to Create</label>
                    <input
                      type="number"
                      value={newPanInitialWardsCount}
                      onChange={(e) => setNewPanInitialWardsCount(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded p-1.5 text-xs font-semibold"
                      min={1}
                      max={24}
                    />
                  </div>
                </div>

                <span className="text-[11px] text-slate-500 block">
                  Total Voters: <strong>{(newPanMaleVoters + newPanFemaleVoters + newPanOtherVoters).toLocaleString()}</strong>
                </span>
              </div>

              {/* Statutory Officers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Returning Officer (RO) Name & Phone</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="RO Name"
                      value={newPanRoName}
                      onChange={(e) => setNewPanRoName(e.target.value)}
                      className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="RO Phone"
                      value={newPanRoPhone}
                      onChange={(e) => setNewPanRoPhone(e.target.value)}
                      className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Panchayat Secretary Name & Phone</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Secretary Name"
                      value={newPanSecName}
                      onChange={(e) => setNewPanSecName(e.target.value)}
                      className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Secretary Phone"
                      value={newPanSecPhone}
                      onChange={(e) => setNewPanSecPhone(e.target.value)}
                      className="bg-white border border-slate-300 rounded p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  Create Gram Panchayat
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPanchayat(false)}
                  className="px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Panchayats Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {panchayats.map((pan) => {
                const panMan = mandals.find((m) => m.id === pan.mandalId);
                const panWards = wards.filter((w) => w.panchayatId === pan.id);
                const maleVoters = panWards.reduce((acc, w) => acc + w.voters.male, 0);
                const femaleVoters = panWards.reduce((acc, w) => acc + w.voters.female, 0);
                const otherVoters = panWards.reduce((acc, w) => acc + w.voters.other, 0);
                const totalVoters = maleVoters + femaleVoters + otherVoters;

                return (
                  <div
                    key={pan.id}
                    className="p-4 border-2 border-slate-200 rounded-xl bg-white shadow-2xs space-y-2.5 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{pan.name}</h3>
                          <span className="text-[11px] text-slate-500 block">
                            Mandal: <strong>{panMan?.name}</strong>
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 shrink-0">
                          {RESERVATION_LABELS[pan.sarpanchReservation]}
                        </span>
                      </div>

                      {/* Voters Breakdown Strip */}
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px] font-semibold">
                          Total Electors in Panchayat
                        </span>
                        <span className="font-black text-slate-900 text-sm block">
                          {totalVoters.toLocaleString()} Voters
                        </span>
                        <div className="text-[10px] text-slate-600 flex items-center gap-2 mt-0.5">
                          <span>Men: <strong>{maleVoters}</strong></span>
                          <span>·</span>
                          <span>Women: <strong>{femaleVoters}</strong></span>
                          <span>·</span>
                          <span>Others: <strong>{otherVoters}</strong></span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div>RO: {pan.returningOfficer.name} ({pan.returningOfficer.phone})</div>
                        <div>Secretary: {pan.panchayatSecretary.name} ({pan.panchayatSecretary.phone})</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800">{panWards.length} Wards</span>
                      <button
                        type="button"
                        onClick={() => {
                          setActivePanId(pan.id);
                          setActiveTab('wards');
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Manage Wards & Operators</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WARDS & OPERATORS MASTER TAB (RESERVATIONS, VOTERS M/F/O, OPERATORS)  */}
      {/* ========================================================================= */}
      {activeTab === 'wards' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-100 text-purple-900">
                  Ward Members & Operators Master
                </span>
                <span className="text-xs text-slate-500">
                  {currentPanchayat?.name}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Ward Reservations, Voters (Men, Women, Others) & Operators
              </h2>
            </div>

            {/* Panchayat Switcher Dropdown */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold">Select GP:</span>
              <select
                value={activePanId}
                onChange={(e) => setActivePanId(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 cursor-pointer"
              >
                {panchayats.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({mandals.find((m) => m.id === p.mandalId)?.name})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setShowAddSingleWard(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                + Add Single Ward
              </button>

              <button
                type="button"
                onClick={() => setShowBatchAddWards(true)}
                className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                ⚡ Batch Add Wards
              </button>

              <button
                type="button"
                onClick={handleSaveAllWards}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Form: Add Single Ward */}
          {showAddSingleWard && (
            <form onSubmit={handleAddSingleWardSubmit} className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Add Single Ward to {currentPanchayat.name}
                </h3>
                <button type="button" onClick={() => setShowAddSingleWard(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Ward Number</label>
                  <input
                    type="number"
                    value={singleWardNo}
                    onChange={(e) => setSingleWardNo(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Ward Reservation</label>
                  <select
                    value={singleWardRes}
                    onChange={(e) => setSingleWardRes(e.target.value as ReservationCategory)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold text-purple-900"
                  >
                    {Object.entries(RESERVATION_LABELS).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Men (Male Voters)</label>
                  <input
                    type="number"
                    value={singleMale}
                    onChange={(e) => setSingleMale(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-1.5"
                    min={0}
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1">Women (Female Voters)</label>
                  <input
                    type="number"
                    value={singleFemale}
                    onChange={(e) => setSingleFemale(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-1.5"
                    min={0}
                  />
                </div>
              </div>

              {/* Operator details for this ward */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="font-semibold block mb-1">Data Entry Operator Name</label>
                  <input
                    type="text"
                    placeholder="e.g. K. Venkatesh"
                    value={singleOpName}
                    onChange={(e) => setSingleOpName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Operator Mobile (For Login)</label>
                  <input
                    type="text"
                    value={singleOpPhone}
                    onChange={(e) => setSingleOpPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Operator Employee ID</label>
                  <input
                    type="text"
                    value={singleOpEmpId}
                    onChange={(e) => setSingleOpEmpId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg cursor-pointer">
                  Add Ward
                </button>
                <button type="button" onClick={() => setShowAddSingleWard(false)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Form: Batch Add Wards */}
          {showBatchAddWards && (
            <form onSubmit={handleBatchAddWardsSubmit} className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3 text-xs animate-in fade-in">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <h3 className="font-bold text-purple-950 text-sm">
                  ⚡ Batch Add Wards to {currentPanchayat.name}
                </h3>
                <button type="button" onClick={() => setShowBatchAddWards(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Number of Wards to Add</label>
                  <input
                    type="number"
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-bold"
                    min={1}
                    max={20}
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Default Men Voters / Ward</label>
                  <input
                    type="number"
                    value={batchDefaultMale}
                    onChange={(e) => setBatchDefaultMale(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                    min={0}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Default Women Voters / Ward</label>
                  <input
                    type="number"
                    value={batchDefaultFemale}
                    onChange={(e) => setBatchDefaultFemale(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                    min={0}
                  />
                </div>
              </div>

              <p className="text-[11px] text-purple-900">
                Wards will be added sequentially with statutory distributed reservation categories (GEN, BC, SC, ST, Women) and auto-generated data operator credentials.
              </p>

              <div className="flex items-center gap-2">
                <button type="submit" className="px-4 py-1.5 bg-purple-700 text-white font-bold rounded-lg cursor-pointer">
                  Generate {batchCount} Wards
                </button>
                <button type="button" onClick={() => setShowBatchAddWards(false)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg cursor-pointer">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Editable Wards Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Configured Wards in <strong>{currentPanchayat.name}</strong>: <strong>{currentWards.length}</strong></span>
              <span>All changes can be edited directly below</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Ward</th>
                    <th className="py-2.5 px-3 min-w-[160px]">Reservation</th>
                    <th className="py-2.5 px-3">Men</th>
                    <th className="py-2.5 px-3">Women</th>
                    <th className="py-2.5 px-3">Others</th>
                    <th className="py-2.5 px-3">Total Voters</th>
                    <th className="py-2.5 px-3 min-w-[150px]">Operator Name</th>
                    <th className="py-2.5 px-3 min-w-[120px]">Operator Phone</th>
                    <th className="py-2.5 px-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentWards.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <span className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center text-xs">
                          W{w.wardNumber}
                        </span>
                      </td>

                      {/* Reservation Dropdown */}
                      <td className="py-2 px-3">
                        <select
                          value={w.reservation}
                          onChange={(e) => handleWardFieldChange(w.id, 'reservation', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-purple-900 cursor-pointer"
                        >
                          {Object.entries(RESERVATION_LABELS).map(([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Male Voters */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={w.voters.male}
                          onChange={(e) => handleWardFieldChange(w.id, 'male', e.target.value)}
                          className="w-16 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-center"
                        />
                      </td>

                      {/* Female Voters */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={w.voters.female}
                          onChange={(e) => handleWardFieldChange(w.id, 'female', e.target.value)}
                          className="w-16 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-center"
                        />
                      </td>

                      {/* Other Voters */}
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={w.voters.other}
                          onChange={(e) => handleWardFieldChange(w.id, 'other', e.target.value)}
                          className="w-12 bg-white border border-slate-200 rounded px-1.5 py-1 text-xs font-semibold text-center"
                        />
                      </td>

                      {/* Total Voters */}
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {w.voters.male + w.voters.female + w.voters.other}
                      </td>

                      {/* Operator Name */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={w.dataEntryPerson.name}
                          onChange={(e) => handleWardFieldChange(w.id, 'opName', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                        />
                      </td>

                      {/* Operator Phone */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={w.dataEntryPerson.phone}
                          onChange={(e) => handleWardFieldChange(w.id, 'opPhone', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-medium"
                        />
                      </td>

                      {/* Delete */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteWardClick(w.id)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                          title="Delete Ward"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAllWards}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Save className="w-4 h-4" />
                Save Wards & Operator Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PARTIES AND SYMBOLS MASTER TAB                                         */}
      {/* ========================================================================= */}
      {activeTab === 'parties_symbols' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT: POLITICAL PARTIES MASTER */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Flag className="w-4 h-4 text-emerald-700" />
                    Recognized Political Parties ({parties.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recognized political parties under SEC order for ticket assignment.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddParty(!showAddParty)}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Add Party
                </button>
              </div>

              {/* Add Party Form */}
              {showAddParty && (
                <form onSubmit={handleAddPartySubmit} className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2.5 text-xs animate-in fade-in">
                  <h4 className="font-bold text-emerald-950">Add Political Party</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-semibold block mb-1">Party Full Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aam Aadmi Party"
                        value={newPartyName}
                        onChange={(e) => setNewPartyName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Abbreviation</label>
                      <input
                        type="text"
                        placeholder="e.g. AAP"
                        value={newPartyAbbr}
                        onChange={(e) => setNewPartyAbbr(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 uppercase font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Reserved Symbol</label>
                      <input
                        type="text"
                        placeholder="e.g. Broom"
                        value={newPartySymbol}
                        onChange={(e) => setNewPartySymbol(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Recognition Status</label>
                      <select
                        value={newPartyRecog}
                        onChange={(e) => setNewPartyRecog(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5"
                      >
                        <option value="STATE_RECOGNIZED">State Recognized</option>
                        <option value="NATIONAL">National Party</option>
                        <option value="REGISTERED">Registered Unrecognized</option>
                        <option value="INDEPENDENT">Independent</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button type="submit" className="px-3.5 py-1.5 bg-emerald-700 text-white font-bold rounded-lg cursor-pointer">
                      Save Party
                    </button>
                    <button type="button" onClick={() => setShowAddParty(false)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Parties List */}
              <div className="space-y-2">
                {parties.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                          {p.abbreviation}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Status: <strong>{p.recognitionType.replace('_', ' ')}</strong> {p.symbolName ? `· Symbol: ${p.symbolName}` : ''}
                      </span>
                    </div>

                    {p.id !== 'party-ind' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteParty(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Delete Party"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: ELECTION SYMBOLS MASTER */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Vote className="w-4 h-4 text-amber-600" />
                    Free & Allotted Symbols Master ({symbols.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official symbols gazetted for allotment to candidates.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddSymbol(!showAddSymbol)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  + Add Symbol
                </button>
              </div>

              {/* Add Symbol Form */}
              {showAddSymbol && (
                <form onSubmit={handleAddSymbolSubmit} className="p-3.5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2.5 text-xs animate-in fade-in">
                  <h4 className="font-bold text-amber-950">Add Election Symbol</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="font-semibold block mb-1">Symbol Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Balloon / Cricket Bat"
                        value={newSymbolName}
                        onChange={(e) => setNewSymbolName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Symbol Code</label>
                      <input
                        type="text"
                        value={newSymbolCode}
                        onChange={(e) => setNewSymbolCode(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Emoji / Icon</label>
                      <input
                        type="text"
                        placeholder="e.g. 🎈"
                        value={newSymbolIcon}
                        onChange={(e) => setNewSymbolIcon(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-center text-base"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button type="submit" className="px-3.5 py-1.5 bg-amber-600 text-white font-bold rounded-lg cursor-pointer">
                      Save Symbol
                    </button>
                    <button type="button" onClick={() => setShowAddSymbol(false)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Symbols Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {symbols.map((s) => (
                  <div
                    key={s.code}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{s.icon}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{s.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{s.code}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSymbol(s.code)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer shrink-0"
                      title="Delete Symbol"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
