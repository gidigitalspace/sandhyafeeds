import React, { useState } from 'react';
import { UserCheck, FileSpreadsheet } from 'lucide-react';
import ShiftInCharge from './ShiftInCharge';
import GeneralInCharge from './GeneralInCharge';

export default function ProductionTab({ activeUser, onUpdateActiveUser }) {
  const [productionRole, setProductionRole] = useState(
    activeUser?.subRole === 'general' || activeUser?.role === 'general_incharge' ? 'general' : 'shift'
  );

  return (
    <div className="space-y-6">
      {/* Role Switcher Pill Bar within Production Department */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Production Department Operations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            3 Mill Units (Unit-1, 2, 3), 3 Pelleting Lines (A, B, Crumble), and 3 Daily Shifts (Shift A, B, C).
          </p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-[#0c1f2b] rounded-2xl border border-slate-300 dark:border-[#193a4f]">
          <button
            onClick={() => setProductionRole('shift')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              productionRole === 'shift'
                ? 'bg-gradient-to-r from-[#0d5575] to-[#00b4d8] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-sky-300" />
            <span>Shift In-Charge Operations</span>
          </button>

          <button
            onClick={() => setProductionRole('general')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              productionRole === 'general'
                ? 'bg-gradient-to-r from-[#0d5575] to-[#00b4d8] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-300" />
            <span>General In-Charge Day Consolidation</span>
          </button>
        </div>
      </div>

      {/* Render Selected View */}
      {productionRole === 'shift' ? (
        <ShiftInCharge
          activeUser={activeUser}
          onUpdateActiveUser={onUpdateActiveUser}
        />
      ) : (
        <GeneralInCharge />
      )}
    </div>
  );
}
