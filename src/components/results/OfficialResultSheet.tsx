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
  CountingRoundRecord,
  Nomination,
  RESERVATION_LABELS,
} from '../../types/election';
import {
  Award,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Download,
} from 'lucide-react';

interface OfficialResultSheetProps {
  district: District;
  division: Division;
  mandal: Mandal;
  panchayat: Panchayat;
  wards: Ward[];
  nominations: Nomination[];
  countingRecords: CountingRoundRecord[];
}

export const OfficialResultSheet: React.FC<OfficialResultSheetProps> = ({
  district,
  division,
  mandal,
  panchayat,
  wards,
  nominations,
  countingRecords,
}) => {
  const [activeSheet, setActiveSheet] = useState<'gazette' | 'certificate'>('gazette');
  const [selectedCertificatePost, setSelectedCertificatePost] = useState<'PRESIDENT' | number>('PRESIDENT');

  const panchayatWards = wards.filter((w) => w.panchayatId === panchayat.id);

  // President counting
  const presidentCount = countingRecords.find(
    (c) => c.panchayatId === panchayat.id && c.postType === 'PRESIDENT'
  );

  const presidentContestants = nominations.filter(
    (n) => n.panchayatId === panchayat.id && n.postType === 'PRESIDENT' && n.scrutinyStatus === 'ACCEPTED' && !n.withdrawn
  );

  // President sorted candidates
  const presidentTally = (presidentCount?.candidateVotes || []).map((cv) => {
    const nom = presidentContestants.find((n) => n.id === cv.candidateId);
    return {
      ...cv,
      category: nom?.category || 'GEN',
      gender: nom?.gender || 'Female',
      party: nom?.partyAffiliation || 'Independent',
    };
  }).sort((a, b) => b.totalVotes - a.totalVotes);

  const presidentTotalVotes = presidentTally.reduce((acc, c) => acc + c.totalVotes, 0);
  const presidentWinner = presidentTally[0];
  const presidentRunnerUp = presidentTally[1];
  const presidentMargin = presidentWinner && presidentRunnerUp ? presidentWinner.totalVotes - presidentRunnerUp.totalVotes : presidentWinner?.totalVotes || 0;

  // Ward results lookup
  const wardResults = panchayatWards.map((w) => {
    const count = countingRecords.find(
      (c) => c.panchayatId === panchayat.id && c.postType === 'WARD_MEMBER' && c.wardNumber === w.wardNumber
    );
    const votes = (count?.candidateVotes || []).sort((a, b) => b.totalVotes - a.totalVotes);
    const winner = votes[0];
    const runnerUp = votes[1];
    const margin = winner && runnerUp ? winner.totalVotes - runnerUp.totalVotes : winner?.totalVotes || 0;

    return {
      ward: w,
      winner,
      margin,
      totalVotes: votes.reduce((acc, v) => acc + v.totalVotes, 0),
      isCompleted: count?.status === 'COMPLETED',
    };
  });

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['State Election Commission — Gram Panchayat Election Results'],
      ['District', district.name],
      ['Revenue Division', division.name],
      ['Mandal', mandal.name],
      ['Gram Panchayat', panchayat.name],
      ['Date of Election', district.electionDate],
      [''],
      ['Part I: Panchayat President (Sarpanch) Election'],
      ['Seat Reservation', RESERVATION_LABELS[panchayat.sarpanchReservation]],
      ['Sl No', 'Candidate Name', 'Symbol', 'Party', 'Category', 'Round 1', 'Round 2', 'Round 3', 'Postal', 'Total Votes', 'Vote Share %', 'Result'],
      ...presidentTally.map((c, i) => [
        i + 1,
        c.candidateName,
        c.symbol,
        c.party,
        c.category,
        c.round1Votes,
        c.round2Votes,
        c.round3Votes,
        c.postalVotes,
        c.totalVotes,
        presidentTotalVotes > 0 ? ((c.totalVotes / presidentTotalVotes) * 100).toFixed(2) + '%' : '0%',
        i === 0 ? 'ELECTED (WINNER)' : (c.totalVotes / (presidentTotalVotes || 1)) < 0.1666 ? 'DEPOSIT FORFEITED' : 'DEFEATED',
      ]),
      [''],
      ['Part II: Ward-wise Demographics & Results'],
      ['Ward No', 'Reservation', 'Male Voters', 'Female Voters', 'Other Voters', 'Total Voters', 'Data Entry Operator', 'Employee Code', 'Phone', 'Elected Member', 'Symbol', 'Votes', 'Margin'],
      ...wardResults.map((wr) => [
        wr.ward.wardNumber,
        wr.ward.reservation,
        wr.ward.voters.male,
        wr.ward.voters.female,
        wr.ward.voters.other,
        wr.ward.voters.total,
        wr.ward.dataEntryPerson.name,
        wr.ward.dataEntryPerson.employeeId,
        wr.ward.dataEntryPerson.phone,
        wr.winner ? wr.winner.candidateName : 'Result Pending',
        wr.winner ? wr.winner.symbol : '—',
        wr.winner ? wr.winner.totalVotes : 0,
        wr.margin,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${panchayat.name.replace(/\s+/g, '_')}_Official_Result_Sheet.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Action Ribbon */}
      <div className="bg-white border border-slate-200 rounded-lg p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs no-print">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSheet('gazette')}
            className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeSheet === 'gazette'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Form 20 Gazette</span>
          </button>

          <button
            onClick={() => setActiveSheet('certificate')}
            className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer flex items-center gap-1 ${
              activeSheet === 'certificate'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Form 21E Certificate</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCSV}
            className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-2.5 py-1 bg-emerald-700 text-white hover:bg-emerald-800 rounded transition-colors flex items-center gap-1 font-semibold cursor-pointer shadow-2xs"
          >
            <Printer className="w-3 h-3" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Gazette View */}
      {activeSheet === 'gazette' && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Statutory State Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 block">
              STATE ELECTION COMMISSION · PANCHAYAT RAJ ELECTIONS
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              FORM 20: FINAL RESULT SHEET & ELECTION GAZETTE
            </h1>
            <p className="text-xs text-slate-600">
              (To be published under Rule 62 of the Panchayat Raj Conduct of Election Rules)
            </p>

            {/* Complete Hierarchy Strip */}
            <div className="pt-2 mt-2 border-t border-slate-200 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-700">
              <span>District: <strong>{district.name}</strong></span>
              <span>·</span>
              <span>Division: <strong>{division.name}</strong></span>
              <span>·</span>
              <span>Mandal: <strong>{mandal.name}</strong></span>
              <span>·</span>
              <span>Gram Panchayat: <strong>{panchayat.name}</strong></span>
              <span>·</span>
              <span>Date: <strong>{district.electionDate}</strong></span>
            </div>
          </div>

          {/* Part I: Panchayat President (Sarpanch) Result */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Part I: Election to the Office of Panchayat President (Sarpanch)
              </h2>
              <div className="text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
                Seat Reserved for: {RESERVATION_LABELS[panchayat.sarpanchReservation]}
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Sl</th>
                    <th className="py-2.5 px-3">Candidate Name</th>
                    <th className="py-2.5 px-3">Symbol</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Round 1</th>
                    <th className="py-2.5 px-3 text-right">Round 2</th>
                    <th className="py-2.5 px-3 text-right">Round 3</th>
                    <th className="py-2.5 px-3 text-right">Postal</th>
                    <th className="py-2.5 px-3 text-right">Total Valid Votes</th>
                    <th className="py-2.5 px-3 text-right">Vote Share %</th>
                    <th className="py-2.5 px-3 text-center">Statutory Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {presidentTally.map((cand, idx) => {
                    const isWinner = idx === 0 && cand.totalVotes > 0;
                    const share =
                      presidentTotalVotes > 0
                        ? ((cand.totalVotes / presidentTotalVotes) * 100).toFixed(2)
                        : '0.00';
                    const forfeited = Number(share) < 16.66;

                    return (
                      <tr
                        key={cand.candidateId}
                        className={isWinner ? 'bg-emerald-50/70 font-semibold' : ''}
                      >
                        <td className="py-2.5 px-3 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{cand.candidateName}</div>
                          <span className="text-[10px] text-slate-500 font-normal">{cand.party}</span>
                        </td>
                        <td className="py-2.5 px-3 font-medium">{cand.symbol}</td>
                        <td className="py-2.5 px-3">{cand.category} ({cand.gender})</td>
                        <td className="py-2.5 px-3 text-right font-mono">{cand.round1Votes.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{cand.round2Votes.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{cand.round3Votes.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{cand.postalVotes.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                          {cand.totalVotes.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{share}%</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {isWinner ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-700 text-white shadow-xs">
                              ELECTED (WINNER)
                            </span>
                          ) : forfeited ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              DEPOSIT FORFEITED
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">DEFEATED</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={8} className="py-2 px-3 text-right">
                      Total Valid Votes Polled:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm text-slate-900">
                      {presidentTotalVotes.toLocaleString()}
                    </td>
                    <td colSpan={2} />
                  </tr>
                  <tr>
                    <td colSpan={8} className="py-1.5 px-3 text-right text-slate-500 font-normal">
                      Rejected / Invalid Ballots:
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                      {presidentCount?.rejectedBallots || 0}
                    </td>
                    <td colSpan={2} />
                  </tr>
                  <tr className="border-t border-slate-200 text-slate-900">
                    <td colSpan={8} className="py-2 px-3 text-right font-black">
                      Winning Margin of Victory:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm text-emerald-800">
                      +{presidentMargin.toLocaleString()} votes
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Winner Banner */}
            {presidentWinner && (
              <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-lg flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">
                      Duly Declared Elected: {presidentWinner.candidateName}
                    </div>
                    <div>
                      Elected to the office of <strong>President, {panchayat.name}</strong> with{' '}
                      <strong>{presidentWinner.totalVotes.toLocaleString()} votes</strong> (Margin: +{presidentMargin} votes).
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 hidden sm:block">
                  Verified by Returning Officer
                </div>
              </div>
            )}
          </div>

          {/* Part II: Ward-wise Demographics & Results Sheet */}
          <div className="space-y-3 pt-4 border-t-2 border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                Part II: Ward-wise Registered Voters, Assigned Data Entry Persons & Elected Members
              </h2>
              <span className="text-xs text-slate-500">
                Total Wards: <strong>{panchayatWards.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Ward No</th>
                    <th className="py-2.5 px-3">Reservation</th>
                    <th className="py-2.5 px-3 text-right">Male Voters</th>
                    <th className="py-2.5 px-3 text-right">Female Voters</th>
                    <th className="py-2.5 px-3 text-right">Other Voters</th>
                    <th className="py-2.5 px-3 text-right">Total Electors</th>
                    <th className="py-2.5 px-3">Data Entry Operator (Ward Member DEO)</th>
                    <th className="py-2.5 px-3">Elected Ward Member</th>
                    <th className="py-2.5 px-3 text-right">Votes Polled</th>
                    <th className="py-2.5 px-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wardResults.map((wr) => (
                    <tr key={wr.ward.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                        Ward {wr.ward.wardNumber}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {RESERVATION_LABELS[wr.ward.reservation]}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{wr.ward.voters.male}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{wr.ward.voters.female}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{wr.ward.voters.other}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {wr.ward.voters.total.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{wr.ward.dataEntryPerson.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {wr.ward.dataEntryPerson.employeeId} · Ph: {wr.ward.dataEntryPerson.phone}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        {wr.winner ? (
                          <div>
                            <div className="font-bold text-emerald-900">{wr.winner.candidateName}</div>
                            <div className="text-[10px] text-slate-500">{wr.winner.symbol}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Counting in progress</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {wr.winner ? wr.winner.totalVotes.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700">
                        {wr.winner ? `+${wr.margin}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statutory Signatures Block */}
          <div className="pt-8 mt-6 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-center">
            <div className="space-y-1">
              <div className="h-14 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-700 text-sm">{panchayat.panchayatSecretary.name}</span>
              </div>
              <span className="font-bold text-slate-900 block">Panchayat Secretary</span>
              <span className="text-slate-500 block">{panchayat.name}</span>
            </div>

            <div className="space-y-1">
              <div className="h-14 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-700 text-sm">{panchayat.returningOfficer.name}</span>
              </div>
              <span className="font-bold text-slate-900 block">Returning Officer & MPDO</span>
              <span className="text-slate-500 block">{mandal.name}</span>
            </div>

            <div className="space-y-1">
              <div className="h-14 border-b border-dashed border-slate-300 flex items-end justify-center pb-1">
                <span className="font-serif italic text-slate-700 text-sm">{district.collectorName.split(',')[0]}</span>
              </div>
              <span className="font-bold text-slate-900 block">District Election Officer & Collector</span>
              <span className="text-slate-500 block">{district.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Certificate View (Form 21E) */}
      {activeSheet === 'certificate' && (
        <div className="bg-white border-8 border-double border-slate-800 rounded-xl p-8 sm:p-12 space-y-6 max-w-3xl mx-auto shadow-xl print:border-8 print:p-8">
          <div className="text-center space-y-2">
            <div className="inline-block p-2 rounded-full border border-slate-300 mb-1">
              <Award className="w-10 h-10 text-emerald-800" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase font-serif">
              State Election Commission
            </h1>
            <p className="text-xs font-bold text-slate-600 tracking-widest uppercase">
              Panchayat Raj Conduct of Election Rules
            </p>
            <div className="text-lg font-bold text-emerald-900 font-serif underline decoration-2 underline-offset-4">
              FORM 21E: CERTIFICATE OF ELECTION
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-slate-800 font-serif pt-4">
            <p>
              I, <strong>{panchayat.returningOfficer.name}</strong>, Returning Officer for the{' '}
              <strong>{panchayat.name}</strong>, in <strong>{mandal.name}</strong> of{' '}
              <strong>{district.name}</strong>, hereby certify that:
            </p>

            <div className="p-4 bg-slate-50 border border-slate-300 rounded text-center space-y-1 my-3">
              <span className="text-xs uppercase tracking-wider text-slate-500 block">
                Elected Candidate Name:
              </span>
              <span className="text-xl font-bold text-slate-900 block">
                {presidentWinner ? presidentWinner.candidateName : 'Candidate Name'}
              </span>
              <span className="text-xs text-slate-600 block">
                Symbol: {presidentWinner?.symbol} · Category: {presidentWinner?.category}
              </span>
            </div>

            <p>
              has been duly elected by the electors to fill the office of{' '}
              <strong>PRESIDENT (SARPANCH)</strong> of <strong>{panchayat.name}</strong> (Reserved for{' '}
              <strong>{RESERVATION_LABELS[panchayat.sarpanchReservation]}</strong>) in the Ordinary Elections
              held on <strong>{district.electionDate}</strong> and that I have on this day declared the said
              candidate as elected.
            </p>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-400 flex items-center justify-between text-xs font-serif">
            <div>
              <div>Place: {panchayat.name}</div>
              <div>Date: {district.electionDate}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                Ref No: SEC-PR-ELECT/{district.id.toUpperCase()}/{panchayat.id.toUpperCase()}/2026
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="h-10 border-b border-slate-400 w-48 mx-auto flex items-end justify-center">
                <span className="italic">{panchayat.returningOfficer.name}</span>
              </div>
              <span className="font-bold block">Returning Officer</span>
              <span className="text-slate-600 block text-[11px]">{panchayat.name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
