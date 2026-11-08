/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Panchayat,
  Ward,
  Nomination,
  CountingRoundRecord,
  CandidateRoundVote,
  PostType,
  RESERVATION_LABELS,
  AuthenticatedOperator,
} from '../../types/election';
import {
  BarChart3,
  Trophy,
  CheckCircle2,
  Save,
  RotateCcw,
  Plus,
  Printer,
  AlertCircle,
  HelpCircle,
  Lock,
  Phone,
} from 'lucide-react';

interface RoundCountingManagerProps {
  panchayat: Panchayat;
  wards: Ward[];
  nominations: Nomination[];
  countingRecords: CountingRoundRecord[];
  authenticatedOperator?: AuthenticatedOperator | null;
  onOpenLogin?: () => void;
  onSaveCountingRecord: (record: CountingRoundRecord) => void;
  onGoToResults: () => void;
}

export const RoundCountingManager: React.FC<RoundCountingManagerProps> = ({
  panchayat,
  wards,
  nominations,
  countingRecords,
  authenticatedOperator,
  onOpenLogin,
  onSaveCountingRecord,
  onGoToResults,
}) => {
  const [selectedPost, setSelectedPost] = useState<PostType>('PRESIDENT');
  const [selectedWardNumber, setSelectedWardNumber] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);

  // Active contestants for the selected post
  const validContestants = nominations.filter(
    (n) =>
      n.panchayatId === panchayat.id &&
      n.scrutinyStatus === 'ACCEPTED' &&
      !n.withdrawn &&
      n.postType === selectedPost &&
      (selectedPost === 'PRESIDENT' || n.wardNumber === selectedWardNumber)
  );

  // Existing or initialized counting record
  const existingRecord = countingRecords.find(
    (c) =>
      c.panchayatId === panchayat.id &&
      c.postType === selectedPost &&
      (selectedPost === 'PRESIDENT' || c.wardNumber === selectedWardNumber)
  );

  // Counting authority check:
  // Returning Officer can count any post.
  // Ward Operator can only count their assigned ward.
  // Panchayat-level operator can count Sarpanch.
  const canEditCounting = Boolean(
    authenticatedOperator &&
    authenticatedOperator.panchayatId === panchayat.id &&
    (
      authenticatedOperator.role === 'RO' ||
      (selectedPost === 'PRESIDENT' && (authenticatedOperator.assignedWardNumber === undefined || authenticatedOperator.assignedWardNumber === 0)) ||
      (selectedPost === 'WARD_MEMBER' && (authenticatedOperator.assignedWardNumber === undefined || authenticatedOperator.assignedWardNumber === selectedWardNumber))
    )
  );

  // Local draft state for editing rounds
  const [draftVotes, setDraftVotes] = useState<Record<string, { r1: number; r2: number; r3: number; postal: number }>>({});
  const [draftRejected, setDraftRejected] = useState<number>(existingRecord?.rejectedBallots || 0);
  const [draftTendered, setDraftTendered] = useState<number>(existingRecord?.tenderedBallots || 0);

  // Initialize draft when selecting new post or entering edit mode
  const initDraft = () => {
    const map: Record<string, { r1: number; r2: number; r3: number; postal: number }> = {};
    validContestants.forEach((c) => {
      const match = existingRecord?.candidateVotes.find((cv) => cv.candidateId === c.id);
      map[c.id] = {
        r1: match?.round1Votes || 0,
        r2: match?.round2Votes || 0,
        r3: match?.round3Votes || 0,
        postal: match?.postalVotes || 0,
      };
    });
    setDraftVotes(map);
    setDraftRejected(existingRecord?.rejectedBallots || 0);
    setDraftTendered(existingRecord?.tenderedBallots || 0);
    setIsEditing(true);
  };

  // Calculate live tallies
  const candidatesTally = validContestants.map((c) => {
    const current = isEditing
      ? draftVotes[c.id] || { r1: 0, r2: 0, r3: 0, postal: 0 }
      : existingRecord?.candidateVotes.find((cv) => cv.candidateId === c.id) || {
          round1Votes: 0,
          round2Votes: 0,
          round3Votes: 0,
          postalVotes: 0,
          totalVotes: 0,
        };

    const r1 = 'round1Votes' in current ? current.round1Votes : current.r1;
    const r2 = 'round2Votes' in current ? current.round2Votes : current.r2;
    const r3 = 'round3Votes' in current ? current.round3Votes : current.r3;
    const postal = 'postalVotes' in current ? current.postalVotes : current.postal;
    const total = r1 + r2 + r3 + postal;

    return {
      candidateId: c.id,
      candidateName: c.candidateName,
      symbol: `${c.allottedSymbol?.icon || '🗳️'} ${c.allottedSymbol?.name || c.symbolRequested}`,
      postType: selectedPost,
      wardNumber: selectedPost === 'WARD_MEMBER' ? selectedWardNumber : undefined,
      round1Votes: r1,
      round2Votes: r2,
      round3Votes: r3,
      postalVotes: postal,
      totalVotes: total,
    };
  });

  // Sort candidates by total votes desc
  const sortedTally = [...candidatesTally].sort((a, b) => b.totalVotes - a.totalVotes);
  const totalValidVotes = sortedTally.reduce((acc, c) => acc + c.totalVotes, 0);
  const totalBallotsPolled = totalValidVotes + (isEditing ? draftRejected : existingRecord?.rejectedBallots || 0);

  const leader = sortedTally[0];
  const runnerUp = sortedTally[1];
  const margin = leader && runnerUp ? leader.totalVotes - runnerUp.totalVotes : leader?.totalVotes || 0;

  const handleSaveTally = (markCompleted: boolean = false) => {
    const candidateVotes: CandidateRoundVote[] = candidatesTally;

    const record: CountingRoundRecord = {
      id: existingRecord ? existingRecord.id : `count-${selectedPost}-${selectedWardNumber}-${Date.now()}`,
      panchayatId: panchayat.id,
      postType: selectedPost,
      wardNumber: selectedPost === 'WARD_MEMBER' ? selectedWardNumber : undefined,
      currentRound: 3,
      totalRounds: 3,
      candidateVotes,
      rejectedBallots: draftRejected,
      tenderedBallots: draftTendered,
      totalPolledCounted: totalBallotsPolled,
      status: markCompleted ? 'COMPLETED' : 'IN_PROGRESS',
      declaredWinnerId: markCompleted && leader ? leader.candidateId : undefined,
      declaredWinnerName: markCompleted && leader ? leader.candidateName : undefined,
      margin: markCompleted ? margin : undefined,
      completedAt: markCompleted ? new Date().toISOString() : undefined,
    };

    onSaveCountingRecord(record);
    setIsEditing(false);
  };

  const currentWard = wards.find((w) => w.wardNumber === selectedWardNumber);
  const targetReservation =
    selectedPost === 'PRESIDENT' ? panchayat.sarpanchReservation : currentWard?.reservation || 'GEN';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Banner & Post Selector */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 sm:p-4 space-y-2 sm:space-y-3 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-700" />
              <span>Round-Wise Vote Counting Desk</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Round entries, postal ballots, and real-time margin computation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onGoToResults}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Result Gazette</span>
            </button>
          </div>
        </div>

        {/* Post Selection Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => {
              setSelectedPost('PRESIDENT');
              setIsEditing(false);
            }}
            className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
              selectedPost === 'PRESIDENT'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Sarpanch
          </button>

          <span className="text-slate-300">|</span>

          <span className="text-slate-400 text-[11px]">Wards:</span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {wards.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  setSelectedPost('WARD_MEMBER');
                  setSelectedWardNumber(w.wardNumber);
                  setIsEditing(false);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  selectedPost === 'WARD_MEMBER' && selectedWardNumber === w.wardNumber
                    ? 'bg-emerald-800 text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Ward {w.wardNumber}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Counting Header & Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Post Context */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 block">Post Under Counting</span>
          <span className="text-base font-bold text-slate-900 block mt-0.5">
            {selectedPost === 'PRESIDENT'
              ? 'Gram Panchayat President (Sarpanch)'
              : `Ward Member — Ward No. ${selectedWardNumber}`}
          </span>
          <div className="text-xs text-slate-500 mt-1">
            Seat Reserved for: <strong>{RESERVATION_LABELS[targetReservation]}</strong>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Contestants: {validContestants.length} · Status:{' '}
            <strong className={existingRecord?.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'}>
              {existingRecord?.status === 'COMPLETED' ? 'Counting Completed' : 'Counting In Progress'}
            </strong>
          </div>
        </div>

        {/* Current Leader */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 block">Current Leading Candidate</span>
          {leader && leader.totalVotes > 0 ? (
            <div>
              <div className="flex items-center gap-2 mt-0.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-slate-900 text-sm">{leader.candidateName}</span>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Votes: <strong className="text-slate-900 font-mono">{leader.totalVotes.toLocaleString()}</strong> ·
                Symbol: {leader.symbol}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                Lead Margin: +{margin.toLocaleString()} votes over 2nd candidate
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-xs italic block mt-1">
              Votes not entered yet. Click "Enter Round Votes".
            </span>
          )}
        </div>

        {/* Total Votes Counted */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <span className="text-xs text-slate-500 block">Votes Counted</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900 font-mono">
              {totalValidVotes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">valid votes</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Rejected Ballots: <strong className="font-mono">{existingRecord?.rejectedBallots || draftRejected}</strong> · Tendered:{' '}
            <strong className="font-mono">{existingRecord?.tenderedBallots || draftTendered}</strong>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            Total Accounted: {totalBallotsPolled.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Round-Wise Votes Entry Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="font-semibold text-slate-800">
            Candidate-wise Round Votes Table (Round 1, Round 2, Round 3 & Postal)
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              canEditCounting ? (
                <button
                  onClick={initDraft}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{existingRecord ? 'Edit Round Entries' : 'Enter Round Votes'}</span>
                </button>
              ) : authenticatedOperator ? (
                <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                  <span className="font-semibold block">🔒 Locked for Data Entry</span>
                  <span className="text-[10px] text-amber-700">
                    {selectedPost === 'PRESIDENT'
                      ? 'Sarpanch counting restricted to Returning Officer or Panchayat Operator.'
                      : `Ward ${selectedWardNumber} counting restricted to assigned operator.`}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign in with Mobile to Enter Votes</span>
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveTally(false)}
                  className="px-3 py-1 text-xs font-semibold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSaveTally(true)}
                  className="px-3.5 py-1 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Finalize & Declare Winner
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Sl</th>
                <th className="py-2.5 px-3">Candidate & Symbol</th>
                <th className="py-2.5 px-3 text-right">Round 1</th>
                <th className="py-2.5 px-3 text-right">Round 2</th>
                <th className="py-2.5 px-3 text-right">Round 3</th>
                <th className="py-2.5 px-3 text-right">Postal Votes</th>
                <th className="py-2.5 px-3 text-right">Total Votes</th>
                <th className="py-2.5 px-3 text-right">Vote Share %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTally.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No active contestants found for this post.
                  </td>
                </tr>
              ) : (
                sortedTally.map((cand, idx) => {
                  const share =
                    totalValidVotes > 0
                      ? ((cand.totalVotes / totalValidVotes) * 100).toFixed(1)
                      : '0.0';
                  const isLeader = idx === 0 && cand.totalVotes > 0;

                  return (
                    <tr
                      key={cand.candidateId}
                      className={`hover:bg-slate-50 transition-colors ${
                        isLeader ? 'bg-emerald-50/40 font-medium' : ''
                      }`}
                    >
                      {/* Sl */}
                      <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>

                      {/* Candidate */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{cand.candidateName}</div>
                        <div className="text-[11px] text-slate-500">{cand.symbol}</div>
                      </td>

                      {/* Round 1 */}
                      <td className="py-3 px-3 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={draftVotes[cand.candidateId]?.r1 || 0}
                            onChange={(e) =>
                              setDraftVotes({
                                ...draftVotes,
                                [cand.candidateId]: {
                                  ...(draftVotes[cand.candidateId] || { r1: 0, r2: 0, r3: 0, postal: 0 }),
                                  r1: Number(e.target.value),
                                },
                              })
                            }
                            className="w-16 bg-white border border-slate-300 rounded p-1 text-right text-xs font-mono"
                          />
                        ) : (
                          cand.round1Votes.toLocaleString()
                        )}
                      </td>

                      {/* Round 2 */}
                      <td className="py-3 px-3 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={draftVotes[cand.candidateId]?.r2 || 0}
                            onChange={(e) =>
                              setDraftVotes({
                                ...draftVotes,
                                [cand.candidateId]: {
                                  ...(draftVotes[cand.candidateId] || { r1: 0, r2: 0, r3: 0, postal: 0 }),
                                  r2: Number(e.target.value),
                                },
                              })
                            }
                            className="w-16 bg-white border border-slate-300 rounded p-1 text-right text-xs font-mono"
                          />
                        ) : (
                          cand.round2Votes.toLocaleString()
                        )}
                      </td>

                      {/* Round 3 */}
                      <td className="py-3 px-3 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={draftVotes[cand.candidateId]?.r3 || 0}
                            onChange={(e) =>
                              setDraftVotes({
                                ...draftVotes,
                                [cand.candidateId]: {
                                  ...(draftVotes[cand.candidateId] || { r1: 0, r2: 0, r3: 0, postal: 0 }),
                                  r3: Number(e.target.value),
                                },
                              })
                            }
                            className="w-16 bg-white border border-slate-300 rounded p-1 text-right text-xs font-mono"
                          />
                        ) : (
                          cand.round3Votes.toLocaleString()
                        )}
                      </td>

                      {/* Postal */}
                      <td className="py-3 px-3 text-right font-mono">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            value={draftVotes[cand.candidateId]?.postal || 0}
                            onChange={(e) =>
                              setDraftVotes({
                                ...draftVotes,
                                [cand.candidateId]: {
                                  ...(draftVotes[cand.candidateId] || { r1: 0, r2: 0, r3: 0, postal: 0 }),
                                  postal: Number(e.target.value),
                                },
                              })
                            }
                            className="w-14 bg-white border border-slate-300 rounded p-1 text-right text-xs font-mono"
                          />
                        ) : (
                          cand.postalVotes.toLocaleString()
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                        {cand.totalVotes.toLocaleString()}
                      </td>

                      {/* Share */}
                      <td className="py-3 px-3 text-right font-mono">
                        <span className="font-semibold text-slate-700">{share}%</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isLeader && cand.totalVotes > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            <Trophy className="w-3 h-3 text-amber-600" />
                            Leading ({margin} lead)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Trailing</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Table Footer with Rejected and Total Ballots */}
            <tfoot className="bg-slate-50 border-t border-slate-200 text-slate-700 font-semibold">
              <tr>
                <td colSpan={6} className="py-2.5 px-3 text-right">
                  Total Valid Ballots:
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                  {totalValidVotes.toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
              <tr>
                <td colSpan={6} className="py-2 px-3 text-right text-xs text-slate-500">
                  Rejected / Invalid Ballots:
                </td>
                <td className="py-2 px-3 text-right font-mono">
                  {isEditing ? (
                    <input
                      type="number"
                      min={0}
                      value={draftRejected}
                      onChange={(e) => setDraftRejected(Number(e.target.value))}
                      className="w-16 bg-white border border-slate-300 rounded p-1 text-right text-xs font-mono"
                    />
                  ) : (
                    existingRecord?.rejectedBallots || 0
                  )}
                </td>
                <td colSpan={2} />
              </tr>
              <tr className="border-t border-slate-200">
                <td colSpan={6} className="py-2.5 px-3 text-right text-xs font-bold text-slate-900">
                  Gross Total Ballots Accounted For:
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                  {totalBallotsPolled.toLocaleString()}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
