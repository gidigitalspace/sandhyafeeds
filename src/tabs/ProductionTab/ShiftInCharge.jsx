import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Building2, 
  Sparkles, 
  Send, 
  Share2, 
  FileText, 
  Users, 
  Gauge, 
  PackageCheck, 
  Wrench, 
  CalendarCheck,
  CheckCircle2,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  UNITS, 
  SHIFTS, 
  getTodayDateString, 
  getCurrentShift, 
  getTimeGreeting 
} from '../../constants/feedData';
import { 
  saveShiftReport, 
  getShiftReport,
  getElectricalData 
} from '../../services/storage';

import SubTabRelieving from './SubTabRelieving';
import SubTabManpower from './SubTabManpower';
import SubTabRunning from './SubTabRunning';
import SubTabPacking from './SubTabPacking';
import SubTabMaintenance from './SubTabMaintenance';
import SubTabLeave from './SubTabLeave';
import SignaturePad from '../../components/SignaturePad';
import PosterModal from '../../components/PosterModal';
import PowerPosterModal from '../../components/PowerPosterModal';

export default function ShiftInCharge({ activeUser, onUpdateActiveUser }) {
  const [date, setDate] = useState(getTodayDateString());
  const [unit, setUnit] = useState(activeUser.unit || 'Unit-1');
  const [shift, setShift] = useState(activeUser.shift || getCurrentShift());
  const [inChargeName, setInChargeName] = useState(activeUser.name || '');
  
  // 6 Sub-Tabs State
  const [activeSubTab, setActiveSubTab] = useState('packing');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [manpower, setManpower] = useState({
    helpersRequired: 8,
    helpersPresent: 7,
    nmrRequired: 4,
    nmrPresent: 4,
  });
  const [running, setRunning] = useState({
    aLineStart: '06:00',
    aLineEnd: '14:00',
    aLineHours: '8.0',
    bLineStart: '06:30',
    bLineEnd: '14:00',
    bLineHours: '7.5',
    crumbleStart: '07:00',
    crumbleEnd: '13:30',
    crumbleHours: '6.5',
  });
  const [packing, setPacking] = useState({
    'VAN-2P': 8.5,
    'VAN-3S': 12.0,
    'VAN-3P': 10.5,
    'MON-3S': 6.0,
    'MON-3P': 8.0,
  });
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [signature, setSignature] = useState(null);

  // Status & Modals
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [showShiftPowerPoster, setShowShiftPowerPoster] = useState(false);
  const [savedReportData, setSavedReportData] = useState(null);

  // Electrical Integration State
  const [elecData, setElecData] = useState(null);
  const [loadingElec, setLoadingElec] = useState(false);

  const greeting = getTimeGreeting();

  // Load Electrical Shift Data
  const loadElectrical = async () => {
    setLoadingElec(true);
    const data = await getElectricalData(date);
    setElecData(data);
    setLoadingElec(false);
  };

  useEffect(() => {
    loadElectrical();
  }, [date]);

  // Load existing report
  useEffect(() => {
    async function loadExisting() {
      const existing = await getShiftReport(date, unit, shift);
      if (existing) {
        if (existing.handoverNotes) setHandoverNotes(existing.handoverNotes);
        if (existing.manpower) setManpower(existing.manpower);
        if (existing.running) setRunning(existing.running);
        if (existing.packing) setPacking(existing.packing);
        if (existing.maintenance) setMaintenanceList(existing.maintenance);
        if (existing.signature) setSignature(existing.signature);
        if (existing.inChargeName) setInChargeName(existing.inChargeName);
      }
    }
    loadExisting();
  }, [date, unit, shift]);

  // Persist In-charge Name
  const handleNameChange = (val) => {
    setInChargeName(val);
    onUpdateActiveUser({ ...activeUser, name: val, unit, shift });
  };

  const handleUnitChange = (u) => {
    setUnit(u);
    onUpdateActiveUser({ ...activeUser, unit: u });
  };

  const handleShiftChange = (s) => {
    setShift(s);
    onUpdateActiveUser({ ...activeUser, shift: s });
  };

  // Submit Shift Report
  const handleSubmitReport = async () => {
    if (!inChargeName.trim()) {
      alert('Please enter Shift In-Charge Name before submitting.');
      return;
    }

    setIsSubmitting(true);

    const reportObj = {
      date,
      unit,
      shift,
      inChargeName,
      handoverNotes,
      manpower,
      running,
      packing,
      maintenance: maintenanceList,
      maintenanceSummary: maintenanceList.length > 0 
        ? maintenanceList.map(m => `${m.equipment}: ${m.issue} (${m.durationMins}m)`).join(', ')
        : 'All equipment operated normally with zero major breakdowns.',
      signature,
      submittedToBoard: true,
      status: 'Submitted'
    };

    await saveShiftReport(reportObj);
    setSavedReportData(reportObj);
    setIsSubmitting(false);
    setIsSaved(true);
    setShowPosterModal(true);
  };

  const subTabs = [
    { id: 'relieving', label: '1. Relieving & Notes', icon: FileText },
    { id: 'manpower', label: '2. Manpower Details', icon: Users },
    { id: 'running', label: '3. Production Running', icon: Gauge },
    { id: 'packing', label: '4. Packing Output (MT)', icon: PackageCheck },
    { id: 'maintenance', label: '5. Maintenance Logs', icon: Wrench },
    { id: 'leave', label: '6. Leave Application', icon: CalendarCheck },
  ];

  return (
    <div className="space-y-6">
      
      {/* Light Blue Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white rounded-3xl p-6 shadow-lg border border-cyan-300/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2 border border-white/25 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-100" /> Shift In-Charge Operations
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {greeting.salutation}, {inChargeName || 'Shift In-Charge'}!
            </h2>
            <p className="text-xs sm:text-sm text-cyan-50 mt-1 max-w-2xl leading-relaxed">
              {greeting.note}
            </p>
          </div>

          {/* In-Charge Name Input */}
          <div className="bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 min-w-[220px]">
            <label className="text-[10px] uppercase font-bold text-cyan-100 block mb-1">
              Active In-Charge Name
            </label>
            <input
              type="text"
              value={inChargeName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your name"
              className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/25 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>

        {/* Date, Unit & Shift Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/20 text-xs">
          <div className="flex items-center gap-2 bg-white/15 px-3.5 py-2.5 rounded-xl border border-white/20">
            <Calendar className="w-4 h-4 text-cyan-100 shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-2 bg-white/15 px-3.5 py-2.5 rounded-xl border border-white/20">
            <Building2 className="w-4 h-4 text-cyan-100 shrink-0" />
            <select
              value={unit}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none w-full cursor-pointer"
            >
              {UNITS.map(u => (
                <option key={u} value={u} className="bg-slate-900 text-white">{u}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/15 px-3.5 py-2.5 rounded-xl border border-white/20">
            <Clock className="w-4 h-4 text-cyan-100 shrink-0" />
            <select
              value={shift}
              onChange={(e) => handleShiftChange(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none w-full cursor-pointer"
            >
              {SHIFTS.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ⚡ Live Shift Power & Energy Status (From Electrical Department) */}
      <div className="bg-gradient-to-r from-sky-950 via-[#0a2333] to-[#041d2a] border border-cyan-400/40 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cyan-800/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>⚡ Shift Power & Electrical Status</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {shift}
                </span>
              </h3>
              <p className="text-[11px] text-cyan-200/80">
                Live energy data transmitted directly from the Electrical Department
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {elecData?.shifts?.[shift]?.status === 'Approved' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Electrical Verified: Approved by Engineer
              </span>
            ) : elecData?.shifts?.[shift] ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Shift Log Awaiting Engineer Approval
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-300 border border-slate-400/30">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                Awaiting Electrical Entry for {shift}
              </span>
            )}

            {elecData?.shifts?.[shift]?.status === 'Approved' && (
              <button
                type="button"
                onClick={() => setShowShiftPowerPoster(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition cursor-pointer"
                title="View Shift Power Report Poster"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Shift Poster</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadElectrical}
              title="Refresh Shift Power Data"
              className="p-1.5 rounded-lg bg-cyan-900/50 hover:bg-cyan-800/60 text-cyan-200 border border-cyan-700/50 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingElec ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {elecData?.shifts?.[shift]?.status === 'Approved' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">Shift Consumption</span>
              <div className="text-xl font-black text-white">
                {elecData.shifts[shift].consumedKwh?.toLocaleString() || (elecData.shifts[shift].diffMwh * 1000).toLocaleString()}{' '}
                <span className="text-xs font-semibold text-cyan-300">kWh</span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono">
                {elecData.shifts[shift].diffMwh} MWH
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">Active / Apparent</span>
              <div className="text-xs font-mono font-bold text-slate-200">
                MWH: <span className="text-white font-black">{elecData.shifts[shift].startMwh} ➔ {elecData.shifts[shift].endMwh}</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-200 mt-1">
                MVAH: <span className="text-white font-black">{elecData.shifts[shift].startMvah} ➔ {elecData.shifts[shift].endMvah}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">Shift Power Factor (PF)</span>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {elecData.shifts[shift].powerFactor || (elecData.shifts[shift].diffMvah > 0 ? (elecData.shifts[shift].diffMwh / elecData.shifts[shift].diffMvah).toFixed(3) : '1.000')}
              </div>
              <span className="text-[10px] text-emerald-300/90 font-medium">
                {parseFloat(elecData.shifts[shift].powerFactor || 1) >= 0.98 ? '★ Optimal PF (> 0.98)' : 'Grid Compliance'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">Power Cuts / Outage</span>
              <div className="text-lg font-black text-white">
                {elecData.totalPowerCutMinutes || 0} <span className="text-xs font-normal text-slate-300">Mins</span>
              </div>
              <span className="text-[10px] text-slate-300">
                Log: {elecData.shifts[shift].submittedBy || 'Shift Electrician'}
              </span>
            </div>
          </div>
        ) : elecData?.shifts?.[shift] ? (
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">Shift Readings Submitted • Awaiting Engineer Approval</span>
              <span>
                Shift {shift} power data was entered by {elecData.shifts[shift].submittedBy || 'Duty Electrician'}. Official consumption numbers and shift poster will unlock once verified and approved by the Electrical Engineer.
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-cyan-200/70 text-xs">
            Awaiting Shift {shift} readings from Electrical Department.
          </div>
        )}
      </div>

      {/* 6 Sub-Tabs Bar */}
      <div className="flex items-center overflow-x-auto no-scrollbar gap-2 p-1.5 bg-cyan-50/50 dark:bg-[#0c1f2b] rounded-2xl border border-cyan-200/80 dark:border-cyan-900/60">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sub-Tab View */}
      <div className="transition-all">
        {activeSubTab === 'relieving' && (
          <SubTabRelieving
            unit={unit}
            shift={shift}
            handoverNotes={handoverNotes}
            setHandoverNotes={setHandoverNotes}
          />
        )}
        {activeSubTab === 'manpower' && (
          <SubTabManpower
            manpower={manpower}
            setManpower={setManpower}
          />
        )}
        {activeSubTab === 'running' && (
          <SubTabRunning
            running={running}
            setRunning={setRunning}
          />
        )}
        {activeSubTab === 'packing' && (
          <SubTabPacking
            packing={packing}
            setPacking={setPacking}
          />
        )}
        {activeSubTab === 'maintenance' && (
          <SubTabMaintenance
            maintenanceList={maintenanceList}
            setMaintenanceList={setMaintenanceList}
          />
        )}
        {activeSubTab === 'leave' && (
          <SubTabLeave
            activeUser={{ ...activeUser, name: inChargeName, unit, shift }}
          />
        )}
      </div>

      {/* E-Signature & Shift Submission Box */}
      {activeSubTab !== 'leave' && (
        <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                Shift Completion & Digital Report Submission
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                E-Sign below to verify production running hours, manpower headcount, and packing MT.
              </p>
            </div>
            {isSaved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Shift Report Saved & Active on Board
              </span>
            )}
          </div>

          {/* E-Signature Pad */}
          <SignaturePad
            onSave={(dataUrl) => setSignature(dataUrl)}
            initialSignature={signature}
          />

          {/* Action Submission Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3">
            {savedReportData && (
              <button
                type="button"
                onClick={() => setShowPosterModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs bg-cyan-50 dark:bg-[#0e2230] hover:bg-cyan-100 dark:hover:bg-[#142e3f] text-[#0077b6] dark:text-[#38bdf8] transition border border-cyan-200 dark:border-cyan-800"
              >
                <Share2 className="w-4 h-4 text-cyan-500" />
                View Graphic Poster / WhatsApp Share
              </button>
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitReport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:from-[#0096c7] hover:to-[#0369a1] shadow-lg shadow-cyan-500/25 active:scale-95 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting to Board...' : 'E-Sign & Submit Shift Report'}
            </button>
          </div>
        </div>
      )}

      {/* Production Poster Modal */}
      {savedReportData && (
        <PosterModal
          isOpen={showPosterModal}
          onClose={() => setShowPosterModal(false)}
          report={savedReportData}
        />
      )}

      {/* Electrical Shift Power Poster Modal (Real-time View Mode) */}
      {showShiftPowerPoster && elecData?.shifts?.[shift] && (
        <PowerPosterModal
          isOpen={showShiftPowerPoster}
          onClose={() => setShowShiftPowerPoster(false)}
          mode="shift"
          powerData={{
            date,
            shift,
            startMwh: elecData.shifts[shift].startMwh,
            endMwh: elecData.shifts[shift].endMwh,
            diffMwh: elecData.shifts[shift].diffMwh,
            consumedKwh: elecData.shifts[shift].consumedKwh,
            startMvah: elecData.shifts[shift].startMvah,
            endMvah: elecData.shifts[shift].endMvah,
            diffMvah: elecData.shifts[shift].diffMvah,
            consumedKvah: elecData.shifts[shift].consumedKvah,
            powerFactor: elecData.shifts[shift].powerFactor,
            electricalIncharge: elecData.shifts[shift].submittedBy || 'Shift Electrician',
            outageMinutes: elecData.totalPowerCutMinutes || 0,
            reportTime: elecData.shifts[shift].submittedAt
          }}
        />
      )}

    </div>
  );
}
