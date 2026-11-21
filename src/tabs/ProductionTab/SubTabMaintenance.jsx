import React, { useState } from 'react';
import { Wrench, Plus, Trash2 } from 'lucide-react';

export default function SubTabMaintenance({ maintenanceList, setMaintenanceList }) {
  const [equipment, setEquipment] = useState('A Line Pelleting');
  const [issue, setIssue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('Resolved');
  const [attendedBy, setAttendedBy] = useState('');

  const setNow = (field) => {
    const now = new Date();
    const str = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (field === 'start') setStartTime(str);
    if (field === 'end') setEndTime(str);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!issue.trim()) return;

    let durationMins = 0;
    if (startTime && endTime) {
      const [sH, sM] = startTime.split(':').map(Number);
      const [eH, eM] = endTime.split(':').map(Number);
      durationMins = (eH * 60 + eM) - (sH * 60 + sM);
      if (durationMins < 0) durationMins += 24 * 60;
    }

    const newItem = {
      id: Date.now().toString(),
      equipment,
      issue,
      startTime,
      endTime,
      durationMins,
      status,
      attendedBy: attendedBy || 'Maintenance Tech'
    };

    setMaintenanceList(prev => [...prev, newItem]);
    setIssue('');
    setStartTime('');
    setEndTime('');
    setAttendedBy('');
  };

  const handleDelete = (id) => {
    setMaintenanceList(prev => prev.filter(item => item.id !== id));
  };

  const totalBreakdownMinutes = maintenanceList.reduce((acc, curr) => acc + (curr.durationMins || 0), 0);

  return (
    <div className="space-y-6">
      {/* Add Maintenance Form */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Wrench className="w-5 h-5 text-sky-500" />
          Maintenance & Breakdown Logs
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Log equipment breakdown events, root cause, start/end time, and duration during shift.
        </p>

        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Equipment / Machine Unit
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500 font-medium"
              >
                <option value="A Line Pelleting">A Line Pelleting & Die</option>
                <option value="B Line Pelleting">B Line Pelleting & Conditioner</option>
                <option value="Crumble Line Rolls">Crumble Line Rolls & Sifter</option>
                <option value="Boiler & Steam Header">Boiler & Steam Header</option>
                <option value="Counterflow Cooler">Counterflow Cooler & Blower</option>
                <option value="Batch Mixer & Conveyor">Batch Mixer & Conveyor</option>
                <option value="Packing Machine">Packing Machine & Stitcher</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Breakdown Description / Reason *
              </label>
              <input
                type="text"
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="e.g. Die choke cleared, V-belt tensioned, sifter screen mesh replaced"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Start Time */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>Start Time</span>
                <button
                  type="button"
                  onClick={() => setNow('start')}
                  className="text-[10px] text-sky-600 hover:underline"
                >
                  Set Now
                </button>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>End Time</span>
                <button
                  type="button"
                  onClick={() => setNow('end')}
                  className="text-[10px] text-sky-600 hover:underline"
                >
                  Set Now
                </button>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Work Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              >
                <option value="Resolved">Resolved</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Pending Spares">Pending Spares</option>
              </select>
            </div>

            {/* Attended By */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Attended By / Technician
              </label>
              <input
                type="text"
                value={attendedBy}
                onChange={(e) => setAttendedBy(e.target.value)}
                placeholder="Tech Name"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#0d5575] to-[#00b4d8] hover:from-[#09435c] hover:to-[#0096c7] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Maintenance Log
            </button>
          </div>
        </form>
      </div>

      {/* Logged Maintenance Works Table */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            Shift Breakdown Summary ({maintenanceList.length} Records)
          </h5>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
            Total Breakdown: {totalBreakdownMinutes} Minutes ({(totalBreakdownMinutes / 60).toFixed(1)} hrs)
          </span>
        </div>

        {maintenanceList.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {maintenanceList.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{item.equipment}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Resolved' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{item.issue}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span>Timing: {item.startTime || '--:--'} to {item.endTime || '--:--'}</span>
                    <span>Duration: <strong>{item.durationMins} mins</strong></span>
                    <span>Tech: {item.attendedBy}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#07131b]/40 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
            No machine breakdowns reported during this shift. All lines running smoothly.
          </div>
        )}
      </div>
    </div>
  );
}
