import React from 'react';
import { Users, UserMinus, UserCheck, AlertCircle } from 'lucide-react';

export default function SubTabManpower({ manpower, setManpower }) {
  const updateField = (field, val) => {
    const num = Math.max(0, parseInt(val) || 0);
    setManpower(prev => {
      const updated = { ...prev, [field]: num };
      updated.helpersShortage = Math.max(0, (updated.helpersRequired || 0) - (updated.helpersPresent || 0));
      updated.nmrShortage = Math.max(0, (updated.nmrRequired || 0) - (updated.nmrPresent || 0));
      return updated;
    });
  };

  const hReq = manpower.helpersRequired || 0;
  const hPres = manpower.helpersPresent || 0;
  const hShort = Math.max(0, hReq - hPres);

  const nReq = manpower.nmrRequired || 0;
  const nPres = manpower.nmrPresent || 0;
  const nShort = Math.max(0, nReq - nPres);

  const totReq = hReq + nReq;
  const totPres = hPres + nPres;
  const totShort = hShort + nShort;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              Shift Manpower Attendance & Shortage Details
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track required vs present headcount for Helpers and NMR mill staff.
            </p>
          </div>
        </div>

        {/* Inputs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Required Staff</th>
                <th className="py-2.5 px-3 font-semibold">Present on Duty</th>
                <th className="py-2.5 px-3 font-semibold">Shortage Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {/* Helpers Row */}
              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                  Helpers (General Plant)
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    min="0"
                    value={hReq || ''}
                    onChange={(e) => updateField('helpersRequired', e.target.value)}
                    placeholder="0"
                    className="w-24 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    min="0"
                    value={hPres || ''}
                    onChange={(e) => updateField('helpersPresent', e.target.value)}
                    placeholder="0"
                    className="w-24 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-sky-500 text-emerald-600 dark:text-emerald-400"
                  />
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-xs ${
                    hShort > 0 
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {hShort} Short
                  </span>
                </td>
              </tr>

              {/* NMR Row */}
              <tr>
                <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                  NMR Staff (Contract / Daily)
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    min="0"
                    value={nReq || ''}
                    onChange={(e) => updateField('nmrRequired', e.target.value)}
                    placeholder="0"
                    className="w-24 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-sky-500"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    min="0"
                    value={nPres || ''}
                    onChange={(e) => updateField('nmrPresent', e.target.value)}
                    placeholder="0"
                    className="w-24 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:ring-2 focus:ring-sky-500 text-emerald-600 dark:text-emerald-400"
                  />
                </td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-xs ${
                    nShort > 0 
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {nShort} Short
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total Required</span>
            <span className="text-xl font-black text-slate-800 dark:text-slate-100">{totReq}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" /> Total Present on Duty
            </span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{totPres}</span>
          </div>

          <div className={`p-3.5 rounded-xl border ${
            totShort > 0 
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900' 
              : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200/60 dark:border-slate-800'
          }`}>
            <span className={`text-[11px] font-semibold block flex items-center gap-1 ${
              totShort > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
              <UserMinus className="w-3.5 h-3.5" /> Total Shortage
            </span>
            <span className={`text-xl font-black ${
              totShort > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {totShort}
            </span>
          </div>
        </div>

        {totShort > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            Manpower shortage noted ({totShort} workers). Please prioritize packaging line operators.
          </div>
        )}
      </div>
    </div>
  );
}
