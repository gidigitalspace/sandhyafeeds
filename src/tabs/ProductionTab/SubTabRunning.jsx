import React from 'react';
import { Clock, Gauge } from 'lucide-react';

export default function SubTabRunning({ running, setRunning }) {
  const calcHours = (start, end) => {
    if (!start || !end) return '';
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diffMinutes = (eH * 60 + eM) - (sH * 60 + sM);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    return (diffMinutes / 60).toFixed(1);
  };

  const handleTimeChange = (linePrefix, type, val) => {
    setRunning(prev => {
      const updated = { ...prev, [`${linePrefix}${type}`]: val };
      const start = updated[`${linePrefix}Start`];
      const end = updated[`${linePrefix}End`];
      if (start && end) {
        updated[`${linePrefix}Hours`] = calcHours(start, end);
      }
      return updated;
    });
  };

  const setNow = (linePrefix, type) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    handleTimeChange(linePrefix, type, timeStr);
  };

  const lines = [
    { prefix: 'aLine', label: 'A Line (Pellet Extruder Line 1)', desc: 'Conditioner, Die & Counterflow Cooler' },
    { prefix: 'bLine', label: 'B Line (Pellet Extruder Line 2)', desc: 'Double Conditioner & Pelleting Press' },
    { prefix: 'crumble', label: 'Crumble Line (Starter & Grower)', desc: 'Crumbler Rolls & Double Deck Sifter' }
  ];

  const totalRuntime = (
    parseFloat(running.aLineHours || 0) +
    parseFloat(running.bLineHours || 0) +
    parseFloat(running.crumbleHours || 0)
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-sky-500" />
              Production Line Running Timings & Hours
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log machine start and stop times for A Line, B Line, and Crumble Line.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Run Hours</span>
            <span className="text-lg font-black text-sky-600 dark:text-sky-400">{totalRuntime} Hrs</span>
          </div>
        </div>

        <div className="space-y-4">
          {lines.map(line => {
            const startVal = running[`${line.prefix}Start`] || '';
            const endVal = running[`${line.prefix}End`] || '';
            const hoursVal = running[`${line.prefix}Hours`] || '0';
            const remarksVal = running[`${line.prefix}Remarks`] || '';

            return (
              <div 
                key={line.prefix}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#07131b]/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {line.label}
                    </h5>
                    <p className="text-[11px] text-slate-400">{line.desc}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-mono font-bold text-xs">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span>Run Hours: {hoursVal || '0.0'} hrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Start Time */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                      <span>Start Time</span>
                      <button
                        type="button"
                        onClick={() => setNow(line.prefix, 'Start')}
                        className="text-[10px] text-sky-600 hover:underline"
                      >
                        Set Now
                      </button>
                    </label>
                    <input
                      type="time"
                      value={startVal}
                      onChange={(e) => handleTimeChange(line.prefix, 'Start', e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                      <span>End Time</span>
                      <button
                        type="button"
                        onClick={() => setNow(line.prefix, 'End')}
                        className="text-[10px] text-sky-600 hover:underline"
                      >
                        Set Now
                      </button>
                    </label>
                    <input
                      type="time"
                      value={endVal}
                      onChange={(e) => handleTimeChange(line.prefix, 'End', e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                      Remarks / Feed Code
                    </label>
                    <input
                      type="text"
                      value={remarksVal}
                      onChange={(e) => setRunning(prev => ({ ...prev, [`${line.prefix}Remarks`]: e.target.value }))}
                      placeholder="e.g. 3P Feed, Die 1.8mm"
                      className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
