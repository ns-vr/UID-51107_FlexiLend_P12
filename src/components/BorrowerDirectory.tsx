import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, AlertTriangle, ShieldCheck, MapPin, Briefcase, Download } from 'lucide-react';
import { Borrower } from '../types';
import { formatINR } from '../utils/financial';

interface BorrowerDirectoryProps {
  borrowers: Borrower[];
  selectedBorrower: Borrower;
  onSelectBorrower: (b: Borrower) => void;
}

export const BorrowerDirectory: React.FC<BorrowerDirectoryProps> = ({
  borrowers,
  selectedBorrower,
  onSelectBorrower,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredBorrowers = borrowers.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.location.toLowerCase().includes(search.toLowerCase()) ||
      b.borrowerId.toLowerCase().includes(search.toLowerCase()) ||
      b.occupation.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.riskStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      'Borrower ID',
      'Name',
      'Location',
      'District',
      'Occupation',
      'Loan Amount (INR)',
      'Current EMI (INR)',
      'Household Monthly Income (INR)',
      'FOIR (%)',
      'Risk Status',
      'Rainfall Deviation (%)',
      'SHG Group ID',
    ];

    const rows = filteredBorrowers.map((b) => [
      `"${b.borrowerId}"`,
      `"${b.name}"`,
      `"${b.location}"`,
      `"${b.district || b.location}"`,
      `"${b.occupation}"`,
      b.loanAmount,
      b.currentEMI,
      b.householdIncome,
      b.foir,
      `"${b.riskStatus}"`,
      b.rainfallDeviationPct,
      `"${b.shgId || 'N/A'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flexilend_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="rounded-xl border border-slate-800/80 bg-[#12121E]/90 p-4 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, district, crop, or loan ID..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-sans"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <div className="flex items-center space-x-1">
            {['ALL', 'TEMPORARY_STRESS', 'STRUCTURAL_RISK', 'WATCH', 'STABLE'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-cyan-500/20 text-[#00F0FF] border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            title="Download current portfolio view as CSV"
            className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1 text-[11px] font-mono text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/30 transition-all flex-shrink-0"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-xl border border-slate-800/80 bg-[#12121E]/90 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-[10px] font-mono uppercase text-slate-500">
                <th className="py-3 px-4">Borrower & ID</th>
                <th className="py-3 px-4">Location & Sector</th>
                <th className="py-3 px-4">Active Loan</th>
                <th className="py-3 px-4">Current EMI</th>
                <th className="py-3 px-4">Household Income</th>
                <th className="py-3 px-4">FOIR</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBorrowers.map((b) => {
                const isSelected = b.id === selectedBorrower.id;

                return (
                  <tr
                    key={b.id}
                    onClick={() => onSelectBorrower(b)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-950/20 border-l-2 border-l-[#00F0FF]'
                        : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white font-['Chakra_Petch',sans-serif]">
                        {b.name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{b.borrowerId}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-slate-300 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {b.location}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-slate-600" />
                        {b.occupation}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-200">
                      {formatINR(b.loanAmount)}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#00F0FF]">
                      {formatINR(b.currentEMI)}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {formatINR(b.householdIncome)}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={
                          b.currentFOIR > 50
                            ? 'text-pink-400'
                            : b.currentFOIR > 43
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {b.currentFOIR}%
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          b.riskStatus === 'TEMPORARY_STRESS'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : b.riskStatus === 'STRUCTURAL_RISK'
                            ? 'bg-pink-500/20 text-[#FF007A] border border-pink-500/30'
                            : b.riskStatus === 'WATCH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {b.riskStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBorrower(b);
                        }}
                        className="inline-flex items-center space-x-1 rounded bg-slate-800 px-2 py-1 text-[10px] font-mono text-slate-300 hover:text-cyan-400 hover:bg-slate-700"
                      >
                        <span>Select</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
