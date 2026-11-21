import React, { useState } from 'react';
import { PackageCheck } from 'lucide-react';
import { FEED_VARIETIES, FEED_TYPES } from '../../constants/feedData';

export default function SubTabPacking({ packing, setPacking }) {
  const [selectedFeedType, setSelectedFeedType] = useState(FEED_TYPES.VANAMAI);

  const handleVarietyChange = (feedCode, value) => {
    const val = parseFloat(value) || 0;
    setPacking(prev => ({
      ...prev,
      [feedCode]: val
    }));
  };

  const vanamaiList = FEED_VARIETIES[FEED_TYPES.VANAMAI];
  const monodonList = FEED_VARIETIES[FEED_TYPES.MONODON];

  // Calculate Subtotals
  const vanamaiTotalMT = vanamaiList.reduce((acc, v) => acc + (parseFloat(packing[`VAN-${v}`] || 0)), 0);
  const monodonTotalMT = monodonList.reduce((acc, v) => acc + (parseFloat(packing[`MON-${v}`] || 0)), 0);
  const grandTotalMT = vanamaiTotalMT + monodonTotalMT;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-sky-500" />
              Packing Output Entry (Metric Tonnes - MT)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter packed feed quantity in Metric Tonnes (MT) for all Vanamai and Monodon varieties.
            </p>
          </div>

          {/* Grand Total Indicator */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#0d5575]/10 to-[#00b4d8]/20 border border-sky-500/30 text-right">
            <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block">Total Shift Packing</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{grandTotalMT.toFixed(2)} MT</span>
          </div>
        </div>

        {/* Feed Type Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setSelectedFeedType(FEED_TYPES.VANAMAI)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              selectedFeedType === FEED_TYPES.VANAMAI
                ? 'bg-gradient-to-r from-[#0d5575] to-[#00b4d8] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>🦐 Vanamai Feed (8 Varieties)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono">
              {vanamaiTotalMT.toFixed(1)} MT
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedFeedType(FEED_TYPES.MONODON)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              selectedFeedType === FEED_TYPES.MONODON
                ? 'bg-gradient-to-r from-[#0d5575] to-[#00b4d8] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>🦞 Monodon Feed (8 Varieties)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white font-mono">
              {monodonTotalMT.toFixed(1)} MT
            </span>
          </button>
        </div>

        {/* Variety Grid for Selected Feed Type */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {(selectedFeedType === FEED_TYPES.VANAMAI ? vanamaiList : monodonList).map(variety => {
            const prefix = selectedFeedType === FEED_TYPES.VANAMAI ? 'VAN' : 'MON';
            const code = `${prefix}-${variety}`;
            const val = packing[code] || '';

            return (
              <div 
                key={code}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#07131b]/60 hover:border-sky-300 dark:hover:border-sky-700 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-sm text-slate-800 dark:text-slate-100">
                    {variety}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    {selectedFeedType === FEED_TYPES.VANAMAI ? 'Vanamai' : 'Monodon'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={val}
                    onChange={(e) => handleVarietyChange(code, e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 pr-10 text-xs sm:text-sm font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs font-semibold text-slate-400 pointer-events-none">
                    MT
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Vanamai Subtotal: <strong className="text-sky-600 dark:text-sky-400">{vanamaiTotalMT.toFixed(2)} MT</strong></span>
            <span>Monodon Subtotal: <strong className="text-teal-600 dark:text-teal-400">{monodonTotalMT.toFixed(2)} MT</strong></span>
          </div>
          <div className="text-sm font-black text-slate-900 dark:text-white">
            Grand Total Packed: <span className="text-[#0077b6] dark:text-[#38bdf8] underline">{grandTotalMT.toFixed(2)} MT</span>
          </div>
        </div>

      </div>
    </div>
  );
}
