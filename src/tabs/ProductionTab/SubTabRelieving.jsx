import React, { useEffect, useState } from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { getLatestHandoverNote } from '../../services/storage';

export default function SubTabRelieving({ unit, shift, handoverNotes, setHandoverNotes }) {
  const [previousNote, setPreviousNote] = useState(null);

  useEffect(() => {
    const prev = getLatestHandoverNote(unit, shift);
    setPreviousNote(prev);
  }, [unit, shift]);

  return (
    <div className="space-y-6">
      {/* Handover from Previous Shift */}
      <div className="bg-sky-50/80 dark:bg-[#0c1f2b] border border-sky-200 dark:border-[#193a4f] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <h4 className="font-bold text-sm sm:text-base text-sky-950 dark:text-sky-200">
            Previous Shift Handover Notes
          </h4>
        </div>

        {previousNote ? (
          <div className="bg-white dark:bg-[#07131b] rounded-xl p-4 border border-sky-100 dark:border-sky-900 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500 dark:text-slate-400 mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                👤 Given by: {previousNote.inChargeName || 'Previous Engineer'}
              </span>
              <span>
                Shift: {previousNote.shift} • Unit: {previousNote.unit}
              </span>
              <span className="text-[11px]">
                {new Date(previousNote.savedAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              "{previousNote.handoverNotes || 'All lines operated normally. No major issues observed during shift handover.'}"
            </p>
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-[#07131b]/60 rounded-xl p-4 border border-sky-100 dark:border-sky-900 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-500 shrink-0" />
            No previous handover note recorded yet for this unit. You can start fresh for this shift.
          </div>
        )}
      </div>

      {/* Enter Current Shift Handover Notes */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
          Handover Notes for Relieving Shift In-Charge
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Mention machine parameters, boiler steam pressure, hopper levels, or special maintenance instructions.
        </p>
        <textarea
          rows={4}
          value={handoverNotes}
          onChange={(e) => setHandoverNotes(e.target.value)}
          placeholder="e.g. Line A conditioner steam pressure is stable at 2.8 bar. Pelleting die clearances inspected. Continue packing Vanamai 3S in the next shift..."
          className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed font-sans"
        />
        <div className="mt-2 text-right text-[11px] text-slate-400">
          This note will be automatically displayed to the relieving in-charge upon login.
        </div>
      </div>
    </div>
  );
}
