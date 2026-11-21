import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  FileText, 
  TrendingUp, 
  Users,
  Zap,
  Fuel,
  Sun,
  Download,
  Printer,
  Share2,
  FileSpreadsheet,
  Activity,
  Sparkles,
  Clock,
  Check
} from 'lucide-react';
import { 
  getTodayDateString,
  COMPANY_NAME,
  DIVISION_NAME
} from '../../constants/feedData';
import { 
  getDayProductionReport, 
  saveDayProductionReport, 
  getGodownStock, 
  getSalesData, 
  getLeaveApplications, 
  updateLeaveStatus, 
  getPlantSettings, 
  updatePlantSettings,
  getAllDayReports,
  getElectricalData,
  approveElectricalDayReport,
  getMonthlyElectricalHistory
} from '../../services/storage';
import PowerPosterModal from '../../components/PowerPosterModal';

export default function PlantManagerTab({ activeUser, onUpdateActiveUser }) {
  const [date, setDate] = useState(getTodayDateString());
  const [dayReport, setDayReport] = useState(null);
  const [plantSettings, setPlantSettings] = useState({ autoApprove: false });
  const [leaves, setLeaves] = useState([]);
  const [historyReports, setHistoryReports] = useState([]);

  // Electrical Audit State
  const [elecData, setElecData] = useState(null);
  const [monthlyElec, setMonthlyElec] = useState(null);
  const [isPowerPosterOpen, setIsPowerPosterOpen] = useState(false);

  // Edit Mode for Manager Corrections
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editBatches, setEditBatches] = useState(0);
  const [editInputMT, setEditInputMT] = useState(0);
  const [editOutputMT, setEditOutputMT] = useState(0);

  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadAll();
  }, [date]);

  const loadAll = async () => {
    const s = getPlantSettings();
    setPlantSettings(s);

    const r = await getDayProductionReport(date);
    setDayReport(r);
    if (r) {
      setEditBatches(r.batchesCount || 48);
      setEditInputMT(r.rawMaterialInputMT || 96.0);
      setEditOutputMT(r.totalPackingOutputMT || 94.0);
    }

    const elec = await getElectricalData(date);
    setElecData(elec);

    const mHistory = getMonthlyElectricalHistory(date.slice(0, 7));
    setMonthlyElec(mHistory);

    const lv = getLeaveApplications();
    setLeaves(lv);

    const allR = getAllDayReports();
    setHistoryReports(allR.length > 0 ? allR : [
      {
        date: getTodayDateString(),
        batchesCount: 48,
        rawMaterialInputMT: 96.0,
        totalPackingOutputMT: 94.2,
        yieldPercentage: 98.12,
        lossGainMT: -1.8,
        status: 'Approved'
      },
      {
        date: '2026-11-19',
        batchesCount: 50,
        rawMaterialInputMT: 100.0,
        totalPackingOutputMT: 98.4,
        yieldPercentage: 98.40,
        lossGainMT: -1.6,
        status: 'Approved'
      },
      {
        date: '2026-11-18',
        batchesCount: 46,
        rawMaterialInputMT: 92.0,
        totalPackingOutputMT: 90.5,
        yieldPercentage: 98.37,
        lossGainMT: -1.5,
        status: 'Approved'
      }
    ]);
  };

  const handleToggleAutoApprove = async () => {
    const updated = !plantSettings.autoApprove;
    const res = await updatePlantSettings({ autoApprove: updated });
    setPlantSettings(res);
    setNotification(updated ? 'Auto-Approve Enabled: General In-Charge reports will now approve automatically.' : 'Auto-Approve Disabled: Manager manual approval required.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleApproveReport = async () => {
    if (!dayReport) return;
    const updatedReport = {
      ...dayReport,
      status: 'Approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'Plant Manager'
    };
    await saveDayProductionReport(updatedReport);
    setDayReport(updatedReport);
    setNotification('✓ Day Production Report successfully Approved. Data has flowed to Sales & Godown.');
    setTimeout(() => setNotification(''), 4000);
    loadAll();
  };

  const handleRejectReport = async () => {
    if (!dayReport) return;
    const reason = prompt('Please enter the reason for rejection / revision note:', 'Yield is below 96%, please re-verify batch count and packing MT.');
    if (!reason) return;

    const updatedReport = {
      ...dayReport,
      status: 'Rejected',
      rejectionNotes: reason,
      reviewedAt: new Date().toISOString()
    };
    await saveDayProductionReport(updatedReport);
    setDayReport(updatedReport);
    setNotification('Report sent back to General In-Charge for revisions.');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSaveCorrection = async () => {
    const bCount = parseInt(editBatches) || 1;
    const inp = parseFloat(editInputMT) || 1;
    const out = parseFloat(editOutputMT) || 0;
    const yld = ((out / inp) * 100).toFixed(2);
    const lg = (out - inp).toFixed(2);

    const updated = {
      ...(dayReport || { date, varietyTotals: {} }),
      batchesCount: bCount,
      rawMaterialInputMT: inp,
      totalPackingOutputMT: out,
      yieldPercentage: parseFloat(yld),
      lossGainMT: parseFloat(lg),
      status: 'Approved',
      managerCorrected: true,
      updatedAt: new Date().toISOString()
    };

    await saveDayProductionReport(updated);
    setDayReport(updated);
    setIsEditingReport(false);
    setNotification('Manager audit corrections saved and published to central ledger.');
    setTimeout(() => setNotification(''), 4000);
    loadAll();
  };

  const handleLeaveAction = async (leaveId, status) => {
    const res = await updateLeaveStatus(leaveId, status);
    setLeaves(res);
    setNotification(`Leave application marked as ${status.toLowerCase()}.`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleApproveElectrical = async () => {
    if (!elecData) return;
    const res = await approveElectricalDayReport(date, 'Plant Manager');
    setElecData(res);
    setNotification('✓ Electrical Day Power Report successfully approved and signed by Plant Manager.');
    setTimeout(() => setNotification(''), 4000);
    const mHistory = getMonthlyElectricalHistory(date.slice(0, 7));
    setMonthlyElec(mHistory);
  };

  const handleDownloadMonthlyCsv = () => {
    if (!monthlyElec || !monthlyElec.records || monthlyElec.records.length === 0) {
      alert('No monthly electrical records found to export.');
      return;
    }
    const headers = [
      'Date',
      'Day MWH',
      'Day MVAH',
      'Day kWh',
      'Day PF',
      'Cum MWH',
      'Cum MVAH',
      'Cum kWh',
      'Cum PF',
      'Diesel Consumed (L)',
      'Solar Gen (kWh)',
      'Solar Export (kWh)',
      'Outage (Mins)',
      'Status'
    ];
    const rows = monthlyElec.records.map(r => [
      r.date,
      r.dayTotalMwh,
      r.dayTotalMvah,
      r.dayTotalKwh,
      r.dayPowerFactor,
      r.cumMwh,
      r.cumMvah,
      r.cumKwh,
      r.cumulativePf,
      r.totalDieselConsumedLiters,
      r.solarDayGen,
      r.solarDayExport,
      r.totalPowerCutMinutes,
      r.status || 'Submitted'
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SML_Feeds_Monthly_Power_Report_${monthlyElec.yearMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingLeaves = leaves.filter(l => l.status === 'Pending');

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Executive Plant Manager Operations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Full Mill Oversight: Approve Day Reports, Review Yield, Edit Historical Records & Authorize Leaves.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Auto-Approve Toggle & Alert Callout */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Auto-Approve General In-Charge Reports
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Toggle ON when manager is traveling/offsite to automatically approve reports and avoid dispatch delays.
            </p>
          </div>

          <button
            onClick={handleToggleAutoApprove}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 ${
              plantSettings.autoApprove
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {plantSettings.autoApprove ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>{plantSettings.autoApprove ? 'Auto-Approve: ENABLED' : 'Auto-Approve: DISABLED'}</span>
          </button>
        </div>

        {notification && (
          <div className="mt-4 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
            {notification}
          </div>
        )}
      </div>

      {/* Section 1: Day Production Report Review & Approval */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              Day Production Report Approval & Review
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submitted by General In-Charge for {date}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              dayReport?.status === 'Approved'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : dayReport?.status === 'Pending'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              Status: {dayReport?.status || 'No Report Yet'}
            </span>

            <button
              onClick={() => setIsEditingReport(!isEditingReport)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-500" />
              {isEditingReport ? 'Cancel Edit' : 'Manager Audit Override'}
            </button>
          </div>
        </div>

        {/* Edit Mode Inputs or Display Metrics */}
        {isEditingReport ? (
          <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-4 my-4">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
              ⚠️ Manager Audit Override Mode: Adjust numbers directly and save.
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Batches Count</label>
                <input
                  type="number"
                  value={editBatches}
                  onChange={(e) => setEditBatches(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Raw Material Input (MT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editInputMT}
                  onChange={(e) => setEditInputMT(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Total Packing Output (MT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editOutputMT}
                  onChange={(e) => setEditOutputMT(e.target.value)}
                  className="w-full p-2 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveCorrection}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Save Corrected Figures & Approve
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Batches</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {dayReport?.batchesCount || 48}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Raw Input</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {Number(dayReport?.rawMaterialInputMT || 96.0).toFixed(2)} MT
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-sky-500 block">Packing Output</span>
              <span className="text-lg font-black text-sky-600 dark:text-sky-400">
                {Number(dayReport?.totalPackingOutputMT || 94.0).toFixed(2)} MT
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Yield</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {dayReport?.yieldPercentage || '97.92'}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Loss / Gain</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {dayReport?.lossGainMT !== undefined ? `${dayReport.lossGainMT} MT` : '-2.0 MT'}
              </span>
            </div>
          </div>
        )}

        {/* Manager Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleRejectReport}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 transition"
          >
            <XCircle className="w-4 h-4" /> Reject / Request Revision
          </button>

          <button
            onClick={handleApproveReport}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/25 active:scale-95 transition"
          >
            <CheckCircle2 className="w-4 h-4" /> Approve & Publish Day Production
          </button>
        </div>
      </div>

      {/* Section 2: Electrical Energy & Power Factor Audit */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Zap className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⚡ Electrical Department Day Power Report & Power Factor Audit</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily HT active & apparent energy logs, Power Factor compliance, DG diesel consumption, and Solar generation for {date}.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              elecData?.status === 'Approved'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}>
              {elecData?.status === 'Approved' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approved by {elecData.approvedBy || 'Plant Manager'}
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  {elecData ? 'Submitted • Pending Approval' : 'No Data Logged Yet'}
                </>
              )}
            </span>

            {(elecData || (monthlyElec?.records && monthlyElec.records.length > 0)) && (
              <button
                type="button"
                onClick={() => setIsPowerPosterOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-[#0e2230] text-cyan-700 dark:text-cyan-300 text-xs font-bold hover:bg-cyan-100 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-500" />
                View Power Poster
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadMonthlyCsv}
              title="Download Month CSV"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Month CSV
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              title="Print Monthly PDF"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              PDF / Print
            </button>
          </div>
        </div>

        {elecData ? (
          <>
            {/* 6 Executive Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/60">
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block mb-1">Day Power</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {elecData.dayTotalKwh?.toLocaleString() || 0} <span className="text-[10px] text-slate-400">kWh</span>
                </div>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                  {elecData.dayTotalMwh} MWH
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Day Power Factor</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {elecData.dayPowerFactor || '0.985'}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">
                  Formula: MWH / MVAH
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/60">
                <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block mb-1">Month-to-Date (MTD)</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {monthlyElec?.totals?.cumKwh?.toLocaleString() || 0} <span className="text-[10px] text-slate-400">kWh</span>
                </div>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono">
                  {monthlyElec?.totals?.cumMwh || 0} MWH
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/60">
                <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 block mb-1">MTD Cumulative PF</span>
                <div className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono">
                  {monthlyElec?.totals?.overallPf || '0.985'}
                </div>
                <span className="text-[10px] text-teal-600 font-medium">
                  Cum MWH / Cum MVAH
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60">
                <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 block mb-1">DG Diesel Consumed</span>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {elecData.totalDieselConsumedLiters || 0} <span className="text-[10px] text-slate-400">Liters</span>
                </div>
                <span className="text-[10px] text-rose-600 font-mono">
                  MTD: {monthlyElec?.totals?.cumDiesel || 0} L
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block mb-1">Solar Generation</span>
                <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {elecData.solarDayGen?.toLocaleString() || 0} <span className="text-[10px] text-slate-400">kWh</span>
                </div>
                <span className="text-[10px] text-amber-600 font-mono">
                  Export: {elecData.solarDayExport || 0} kWh
                </span>
              </div>
            </div>

            {/* Shift-Wise Energy Readings Audit Table */}
            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2.5 px-3 font-bold">Shift</th>
                    <th className="py-2.5 px-3 font-semibold">Start MWH</th>
                    <th className="py-2.5 px-3 font-semibold">End MWH</th>
                    <th className="py-2.5 px-3 font-bold text-sky-600">Shift MWH</th>
                    <th className="py-2.5 px-3 font-bold text-sky-600">Shift kWh</th>
                    <th className="py-2.5 px-3 font-semibold">Start MVAH</th>
                    <th className="py-2.5 px-3 font-semibold">End MVAH</th>
                    <th className="py-2.5 px-3 font-semibold">Shift MVAH</th>
                    <th className="py-2.5 px-3 font-bold text-emerald-600">Power Factor</th>
                    <th className="py-2.5 px-3 font-semibold">Electrical Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {['Shift A', 'Shift B', 'Shift C'].map(sh => {
                    const row = elecData.shifts?.[sh];
                    return (
                      <tr key={sh} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold font-sans text-slate-900 dark:text-white">{sh}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row?.startMwh ?? '--'}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row?.endMwh ?? '--'}</td>
                        <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">{row?.diffMwh ?? '--'}</td>
                        <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white">
                          {row?.consumedKwh ? row.consumedKwh.toLocaleString() : '--'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row?.startMvah ?? '--'}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row?.endMvah ?? '--'}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row?.diffMvah ?? '--'}</td>
                        <td className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400">
                          {row?.powerFactor ?? '--'}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px] truncate max-w-[150px]">
                          {row?.submittedBy || 'Pending'}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Consolidated Day Row */}
                  <tr className="bg-cyan-50/40 dark:bg-[#071d2b] font-bold border-t-2 border-cyan-200 dark:border-cyan-800">
                    <td className="py-3 px-3 font-sans text-cyan-900 dark:text-cyan-200">DAY TOTAL</td>
                    <td className="py-3 px-3 text-slate-400">-</td>
                    <td className="py-3 px-3 text-slate-400">-</td>
                    <td className="py-3 px-3 text-cyan-700 dark:text-cyan-300 font-black">{elecData.dayTotalMwh} MWH</td>
                    <td className="py-3 px-3 text-cyan-700 dark:text-cyan-300 font-black">{elecData.dayTotalKwh?.toLocaleString()} kWh</td>
                    <td className="py-3 px-3 text-slate-400">-</td>
                    <td className="py-3 px-3 text-slate-400">-</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-black">{elecData.dayTotalMvah} MVAH</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-black text-sm">{elecData.dayPowerFactor}</td>
                    <td className="py-3 px-3 font-sans text-[11px] text-cyan-800 dark:text-cyan-200">
                      {elecData.electricalIncharge || 'Electrical Dept'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Outage and DG Summary Footnote */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">⚡ Grid Power Interruption</span>
                <p className="text-slate-500 dark:text-slate-400">
                  Total Outage: <span className="font-black text-slate-900 dark:text-white font-mono">{elecData.totalPowerCutMinutes || 0} Minutes</span>
                  {elecData.powerCuts?.length > 0 && ` (${elecData.powerCuts.map(pc => `${pc.startTime}-${pc.endTime}: ${pc.reason}`).join('; ')})`}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">🚜 DG 750 kVA Run</span>
                <p className="text-slate-500 dark:text-slate-400">
                  Run: <span className="font-bold text-slate-900 dark:text-white font-mono">{elecData.dg750?.durationHours || 0} hrs</span> • 
                  Diesel Consumed: <span className="font-black text-rose-600 font-mono">{elecData.dg750?.consumptionLiters || 0} L</span> • 
                  Closing: <span className="font-bold font-mono">{elecData.dg750?.closingLiters || 0} L</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">🚜 DG 180 kVA Run</span>
                <p className="text-slate-500 dark:text-slate-400">
                  Run: <span className="font-bold text-slate-900 dark:text-white font-mono">{elecData.dg180?.durationHours || 0} hrs</span> • 
                  Diesel Consumed: <span className="font-black text-rose-600 font-mono">{elecData.dg180?.consumptionLiters || 0} L</span> • 
                  Closing: <span className="font-bold font-mono">{elecData.dg180?.closingLiters || 0} L</span>
                </p>
              </div>
            </div>

            {/* Approval Action Button */}
            {elecData.status !== 'Approved' && (
              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleApproveElectrical}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/25 active:scale-95 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve & Authorize Day Power Report
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No electrical power report recorded for {date} yet. When the Electrical Department submits Shift A, B & C, it will appear here for manager audit and sign-off.
          </div>
        )}
      </div>

      {/* Section 3: Staff Leave Applications Approval */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              Staff Leave Applications Authorization
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Shift In-Charge & Mill Staff leave requests awaiting Plant Manager review.
            </p>
          </div>
          {pendingLeaves.length > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800">
              {pendingLeaves.length} Action Needed
            </span>
          )}
        </div>

        {leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                  <th className="pb-2.5 font-semibold">Staff Name</th>
                  <th className="pb-2.5 font-semibold">Unit & Role</th>
                  <th className="pb-2.5 font-semibold">Leave Type</th>
                  <th className="pb-2.5 font-semibold">Date Range</th>
                  <th className="pb-2.5 font-semibold">Reason</th>
                  <th className="pb-2.5 font-semibold">Status</th>
                  <th className="pb-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {leaves.map(lv => (
                  <tr key={lv.id} className="py-3">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{lv.name}</td>
                    <td className="py-3 text-slate-500">{lv.unit} • {lv.role}</td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{lv.type}</td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-400">
                      {lv.fromDate} to {lv.toDate}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 max-w-xs">{lv.reason}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        lv.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                          : lv.status === 'Rejected'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                      }`}>
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {lv.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleLeaveAction(lv.id, 'Approved')}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900 font-bold text-[11px] transition"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLeaveAction(lv.id, 'Rejected')}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900 font-bold text-[11px] transition"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 text-center text-xs text-slate-400">
            No pending leave requests.
          </div>
        )}
      </div>

      {/* Section 4: Monthly Historical Production & Yield Analysis */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              Monthly Mill Production, Yield & Loss/Gain Records
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit trail of daily mill output, efficiency percentage, and batch statistics.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 font-sans text-slate-400">
                <th className="pb-2.5 font-bold">Date</th>
                <th className="pb-2.5 font-bold">Batches</th>
                <th className="pb-2.5 font-bold">Raw Input (MT)</th>
                <th className="pb-2.5 font-bold">Packing Output (MT)</th>
                <th className="pb-2.5 font-bold">Yield (%)</th>
                <th className="pb-2.5 font-bold">Loss / Gain (MT)</th>
                <th className="pb-2.5 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {historyReports.map(rep => (
                <tr key={rep.date} className="py-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">{rep.date}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{rep.batchesCount}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{Number(rep.rawMaterialInputMT || 0).toFixed(1)} MT</td>
                  <td className="py-2.5 font-bold text-sky-600 dark:text-sky-400">{Number(rep.totalPackingOutputMT || 0).toFixed(1)} MT</td>
                  <td className="py-2.5 font-black text-emerald-600 dark:text-emerald-400">{rep.yieldPercentage}%</td>
                  <td className={`py-2.5 font-bold ${
                    parseFloat(rep.lossGainMT) >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {rep.lossGainMT > 0 ? `+${rep.lossGainMT}` : rep.lossGainMT} MT
                  </td>
                  <td className="py-2.5 text-right font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                      {rep.status || 'Approved'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Day Power Poster Modal */}
      {isPowerPosterOpen && (() => {
        const activeElecData = elecData || (monthlyElec?.records && monthlyElec.records.length > 0 ? monthlyElec.records[monthlyElec.records.length - 1] : null);
        if (!activeElecData) return null;
        return (
          <PowerPosterModal
            isOpen={isPowerPosterOpen}
            onClose={() => setIsPowerPosterOpen(false)}
            mode="day"
            powerData={{
              date: activeElecData.date || date,
              electricalIncharge: activeElecData.electricalIncharge || 'Electrical Department',
              reportTime: activeElecData.reportTime || new Date().toISOString(),
              shifts: activeElecData.shifts || {},
              dayTotalMwh: activeElecData.dayTotalMwh || 0,
              dayTotalKwh: activeElecData.dayTotalKwh || 0,
              dayTotalMvah: activeElecData.dayTotalMvah || 0,
              dayPowerFactor: activeElecData.dayPowerFactor || '1.000',
              mtdMwh: monthlyElec?.totals?.cumMwh || activeElecData.dayTotalMwh || 0,
              mtdMvah: monthlyElec?.totals?.cumMvah || activeElecData.dayTotalMvah || 0,
              mtdKwh: monthlyElec?.totals?.cumKwh || activeElecData.dayTotalKwh || 0,
              mtdPowerFactor: monthlyElec?.totals?.overallPf || activeElecData.dayPowerFactor || '1.000',
              powerCuts: activeElecData.powerCuts || [],
              totalPowerCutMinutes: activeElecData.totalPowerCutMinutes || 0,
              dg750: activeElecData.dg750 || {},
              dg180: activeElecData.dg180 || {},
              totalDieselConsumedLiters: activeElecData.totalDieselConsumedLiters || 0,
              mtdDieselConsumed: monthlyElec?.totals?.cumDiesel || activeElecData.totalDieselConsumedLiters || 0,
              solarDayGen: activeElecData.solarDayGen || 0,
              solarGenPct: activeElecData.solarGenPct || '0.0',
              solarDayExport: activeElecData.solarDayExport || 0,
              solarMtdGen: monthlyElec?.totals?.cumSolarGen || activeElecData.solarDayGen || 0,
              status: activeElecData.status || 'Submitted',
              approvedBy: activeElecData.approvedBy || ''
            }}
          />
        );
      })()}

    </div>
  );
}
