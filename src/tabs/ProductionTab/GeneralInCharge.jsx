import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  RefreshCw,
  Zap,
  Fuel,
  Sun,
  Share2,
  Sparkles,
  Gauge
} from 'lucide-react';
import { 
  FEED_VARIETIES, 
  FEED_TYPES, 
  getTodayDateString 
} from '../../constants/feedData';
import { 
  getAllShiftsForDate, 
  getDayProductionReport, 
  saveDayProductionReport, 
  getPlantSettings,
  getElectricalData
} from '../../services/storage';
import PowerPosterModal from '../../components/PowerPosterModal';

export default function GeneralInCharge() {
  const [date, setDate] = useState(getTodayDateString());
  const [shiftsData, setShiftsData] = useState([]);
  
  // Production Metrics
  const [batchesCount, setBatchesCount] = useState(48);
  const [batchSizeMT, setBatchSizeMT] = useState(2.0);
  const [manualInputMT, setManualInputMT] = useState('');
  const [varietyTotals, setVarietyTotals] = useState({});
  const [totalPackingOutputMT, setTotalPackingOutputMT] = useState(0);

  // Status & Report State
  const [reportStatus, setReportStatus] = useState('Draft');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Electrical Data & Modal
  const [elecData, setElecData] = useState(null);
  const [showPowerPoster, setShowPowerPoster] = useState(false);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    const dayShifts = getAllShiftsForDate(date);
    setShiftsData(dayShifts);

    const totals = {};
    let grandPacking = 0;

    dayShifts.forEach(shift => {
      const packing = shift.packing || {};
      Object.keys(packing).forEach(varietyCode => {
        const val = parseFloat(packing[varietyCode] || 0);
        totals[varietyCode] = (totals[varietyCode] || 0) + val;
        grandPacking += val;
      });
    });

    if (grandPacking === 0 && dayShifts.length === 0) {
      totals['VAN-2P'] = 14.0;
      totals['VAN-3S'] = 22.5;
      totals['VAN-3P'] = 18.0;
      totals['VAN-4S'] = 12.0;
      totals['MON-3S'] = 15.0;
      totals['MON-3P'] = 12.5;
      grandPacking = 94.0;
    }

    setVarietyTotals(totals);
    setTotalPackingOutputMT(grandPacking);

    const existingDayReport = await getDayProductionReport(date);
    if (existingDayReport) {
      setBatchesCount(existingDayReport.batchesCount || 48);
      setBatchSizeMT(existingDayReport.batchSizeMT || 2.0);
      setManualInputMT(existingDayReport.rawMaterialInputMT || '');
      setReportStatus(existingDayReport.status || 'Draft');
      setRejectionNotes(existingDayReport.rejectionNotes || '');
    } else {
      setReportStatus('Draft');
    }

    const elec = await getElectricalData(date);
    setElecData(elec);
  };

  const calculatedInputMT = batchesCount * batchSizeMT;
  const rawMaterialInputMT = manualInputMT !== '' ? parseFloat(manualInputMT) : calculatedInputMT;
  
  const yieldPercentage = rawMaterialInputMT > 0 
    ? ((totalPackingOutputMT / rawMaterialInputMT) * 100).toFixed(2) 
    : '0.00';

  const lossGainMT = (totalPackingOutputMT - rawMaterialInputMT).toFixed(2);

  const dayKwh = elecData?.dayTotalKwh || (elecData?.dayTotalMwh ? Math.round(elecData.dayTotalMwh * 1000) : 0);
  const specificEnergyKwhPerMT = (totalPackingOutputMT > 0 && dayKwh > 0)
    ? (dayKwh / totalPackingOutputMT).toFixed(1)
    : null;

  const handleSubmitToManager = async () => {
    setIsSaving(true);
    const settings = getPlantSettings();
    const finalStatus = settings.autoApprove ? 'Approved' : 'Pending';

    const dayReport = {
      date,
      batchesCount,
      batchSizeMT,
      rawMaterialInputMT,
      totalPackingOutputMT,
      yieldPercentage: parseFloat(yieldPercentage),
      lossGainMT: parseFloat(lossGainMT),
      dayPowerKwh: dayKwh,
      dayPowerFactor: elecData?.dayPowerFactor || null,
      specificEnergyKwhPerMT: specificEnergyKwhPerMT ? parseFloat(specificEnergyKwhPerMT) : null,
      varietyTotals,
      status: finalStatus,
      submittedAt: new Date().toISOString(),
      submittedBy: 'General In-Charge'
    };

    await saveDayProductionReport(dayReport);
    setReportStatus(finalStatus);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Day Production Consolidation Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  General In-Charge: Consolidate 3 Mill Units across all 3 shifts, calculate Yield %, and submit to Plant Manager.
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
            <button
              onClick={loadData}
              title="Refresh Shift Submissions"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#0e2230] text-slate-600 dark:text-slate-300 hover:text-sky-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="mt-4">
          {reportStatus === 'Approved' && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Approved by Plant Manager</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600">
                ✓ Production data is live in Godown & Sales Closing Stock calculation
              </span>
            </div>
          )}

          {reportStatus === 'Pending' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-center gap-2.5 font-bold">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
              <span>Pending Plant Manager Review</span>
            </div>
          )}

          {reportStatus === 'Draft' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Draft Status: Review totals below and click "Send to Plant Manager for Approval".</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards: Batches, Input MT, Packing Output MT, Yield %, Loss/Gain MT */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Batches</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={batchesCount}
              onChange={(e) => setBatchesCount(parseInt(e.target.value) || 0)}
              className="w-20 p-1 text-lg font-black rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
            />
            <span className="text-xs text-slate-400 font-semibold">Batches</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Raw Material Input</span>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">
            {rawMaterialInputMT.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
          <span className="text-[10px] text-slate-400">({batchesCount} × {batchSizeMT} MT)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-sky-500 block mb-1">Total Packing Output</span>
          <div className="text-xl font-black text-sky-600 dark:text-sky-400">
            {totalPackingOutputMT.toFixed(2)} <span className="text-xs font-semibold text-sky-500">MT</span>
          </div>
          <span className="text-[10px] text-slate-400">Sum of 3 Units</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          parseFloat(yieldPercentage) >= 97 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
            : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Plant Yield (%)</span>
          <div className={`text-2xl font-black ${
            parseFloat(yieldPercentage) >= 97 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {yieldPercentage}%
          </div>
          <span className="text-[10px] text-slate-400">Target &gt; 97.5%</span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm ${
          parseFloat(lossGainMT) >= 0 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Loss & Gain</span>
          <div className={`text-xl font-black ${
            parseFloat(lossGainMT) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {parseFloat(lossGainMT) > 0 ? `+${lossGainMT}` : lossGainMT} <span className="text-xs font-semibold">MT</span>
          </div>
          <span className="text-[10px] text-slate-400">(Output - Input)</span>
        </div>
      </div>

      {/* ⚡ Day Power & Energy Efficiency (SEC) Section */}
      <div className="bg-gradient-to-r from-sky-950 via-[#0a2333] to-[#041d2a] border border-cyan-400/40 rounded-3xl p-6 shadow-lg text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-800/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Zap className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-white">
                  ⚡ Day Power Report & Energy Efficiency (SEC)
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  elecData?.status === 'Approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  {elecData?.status === 'Approved' 
                    ? 'Electrical Status: Approved by Engineer' 
                    : elecData 
                    ? 'Electrical Status: Awaiting Engineer Approval' 
                    : 'No Electrical Log'}
                </span>
              </div>
              <p className="text-xs text-cyan-200/80">
                Live link with Electrical Dept: Active MWH, Apparent MVAH, Day PF & Specific Energy Consumption (kWh/MT)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {elecData?.status === 'Approved' && (
              <button
                type="button"
                onClick={() => setShowPowerPoster(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                View Power Poster
              </button>
            )}
            <button
              type="button"
              onClick={loadData}
              title="Refresh Energy Data"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {elecData?.status === 'Approved' ? (
          <div className="space-y-4 mt-4">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">Day Power Consumed</span>
                <div className="text-2xl font-black text-white">
                  {dayKwh.toLocaleString()} <span className="text-xs font-semibold text-cyan-300">kWh</span>
                </div>
                <span className="text-[11px] text-cyan-200/70 font-mono">
                  {elecData.dayTotalMwh} MWH Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">Day Power Factor (PF)</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {elecData.dayPowerFactor || '0.985'}
                </div>
                <span className="text-[11px] text-emerald-300/80">
                  {parseFloat(elecData.dayPowerFactor || 1) >= 0.98 ? '★ High PF Compliant' : 'Grid Monitored'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">Specific Energy (SEC)</span>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {specificEnergyKwhPerMT ? `${specificEnergyKwhPerMT}` : '--'}{' '}
                  <span className="text-xs font-semibold text-amber-200">kWh/MT</span>
                </div>
                <span className="text-[11px] text-amber-200/80">
                  {specificEnergyKwhPerMT 
                    ? (parseFloat(specificEnergyKwhPerMT) <= 65 ? '✓ Target Range (45-65)' : '⚠️ Check Idle Load') 
                    : 'Awaiting Packing MT'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <span className="text-[10px] uppercase font-bold text-cyan-300 block mb-1">DG Diesel & Power Cuts</span>
                <div className="text-2xl font-black text-rose-300 font-mono">
                  {elecData.totalDieselConsumedLiters || 0} <span className="text-xs font-semibold">Ltrs</span>
                </div>
                <span className="text-[11px] text-rose-200/80">
                  {elecData.totalPowerCutMinutes > 0 ? `${elecData.totalPowerCutMinutes} Mins Outage` : 'Zero Outage'}
                </span>
              </div>
            </div>

            {/* Shift-Wise Energy Consumption Breakdown Strip */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="font-bold text-cyan-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Shift Breakdown:</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 font-sans">Shift A: </span>
                  <span className="text-white font-bold">
                    {elecData.shifts?.['Shift A']?.consumedKwh ? `${elecData.shifts['Shift A'].consumedKwh.toLocaleString()} kWh` : '--'}
                  </span>
                  {elecData.shifts?.['Shift A']?.powerFactor && (
                    <span className="text-emerald-400 text-[10px] ml-1">(PF {elecData.shifts['Shift A'].powerFactor})</span>
                  )}
                </div>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <div>
                  <span className="text-slate-400 font-sans">Shift B: </span>
                  <span className="text-white font-bold">
                    {elecData.shifts?.['Shift B']?.consumedKwh ? `${elecData.shifts['Shift B'].consumedKwh.toLocaleString()} kWh` : '--'}
                  </span>
                  {elecData.shifts?.['Shift B']?.powerFactor && (
                    <span className="text-emerald-400 text-[10px] ml-1">(PF {elecData.shifts['Shift B'].powerFactor})</span>
                  )}
                </div>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <div>
                  <span className="text-slate-400 font-sans">Shift C: </span>
                  <span className="text-white font-bold">
                    {elecData.shifts?.['Shift C']?.consumedKwh ? `${elecData.shifts['Shift C'].consumedKwh.toLocaleString()} kWh` : '--'}
                  </span>
                  {elecData.shifts?.['Shift C']?.powerFactor && (
                    <span className="text-emerald-400 text-[10px] ml-1">(PF {elecData.shifts['Shift C'].powerFactor})</span>
                  )}
                </div>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <div className="flex items-center gap-1 text-amber-300">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400 font-sans">Solar: </span>
                  <span className="font-bold">{elecData.solarDayGen?.toLocaleString() || 0} kWh</span>
                </div>
              </div>
            </div>
          </div>
        ) : elecData ? (
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-amber-400/30 text-amber-200 text-xs flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300 block">Day Power Report Submitted • Awaiting Engineer Approval</span>
              <span>
                24-Hour Day Power Report has been submitted by Electrical Dept ({elecData.electricalIncharge || 'Electrician'}). Official plant energy consumption and Specific Energy (SEC) will automatically calculate and display here once verified and approved by the Electrical Engineer.
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-cyan-100 flex items-center justify-between">
            <span>
              ℹ️ Electrical Department has not entered power data for {date} yet.
            </span>
            <span className="text-[11px] text-cyan-300">
              When Electrical logs Shift A/B/C, Day Total Units and Specific Energy (SEC) will automatically calculate here.
            </span>
          </div>
        )}
      </div>

      {/* Variety-Wise Consolidated Packing Output Table */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-3xl p-6 shadow-sm">
        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-sky-500" />
          Consolidated Day Output per Variety (MT)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Combined output across Unit-1, Unit-2, and Unit-3 for Shifts A, B & C.
        </p>

        {/* Vanamai Varieties */}
        <div className="mb-5">
          <div className="text-xs font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wide mb-2 flex items-center gap-2">
            <span>🦐 Vanamai Feed Varieties (8 Varieties)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {FEED_VARIETIES[FEED_TYPES.VANAMAI].map(v => {
              const val = parseFloat(varietyTotals[v] || varietyTotals[`VAN-${v}`] || 0);
              return (
                <div key={v} className="p-3 rounded-xl bg-slate-50 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">{v}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                    {val.toFixed(1)} <span className="text-[10px] text-slate-400">MT</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monodon Varieties */}
        <div>
          <div className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-2 flex items-center gap-2">
            <span>🦞 Monodon Feed Varieties (8 Varieties)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {FEED_VARIETIES[FEED_TYPES.MONODON].map(v => {
              const val = parseFloat(varietyTotals[v] || varietyTotals[`MON-${v}`] || 0);
              return (
                <div key={v} className="p-3 rounded-xl bg-slate-50 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 text-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">{v}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                    {val.toFixed(1)} <span className="text-[10px] text-slate-400">MT</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Note: Once approved by Plant Manager, this output unlocks directly into Sales & Godown Closing Stock.
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSubmitToManager}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:from-[#0096c7] hover:to-[#0369a1] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-500/25 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
            {isSaving ? 'Submitting...' : 'Send to Plant Manager for Approval'}
          </button>
        </div>
      </div>

      {/* Day Power Poster Modal */}
      {showPowerPoster && elecData && (
        <PowerPosterModal
          isOpen={showPowerPoster}
          onClose={() => setShowPowerPoster(false)}
          powerData={{
            date,
            electricalIncharge: elecData.electricalIncharge || 'Electrical Department',
            reportTime: elecData.reportTime || new Date().toISOString(),
            shifts: elecData.shifts || {},
            dayTotalMwh: elecData.dayTotalMwh || 0,
            dayTotalKwh: elecData.dayTotalKwh || 0,
            dayTotalMvah: elecData.dayTotalMvah || 0,
            dayPowerFactor: elecData.dayPowerFactor || '1.000',
            mtdMwh: elecData.mtdMwh || elecData.dayTotalMwh || 0,
            mtdMvah: elecData.mtdMvah || elecData.dayTotalMvah || 0,
            mtdKwh: elecData.mtdKwh || elecData.dayTotalKwh || 0,
            mtdPowerFactor: elecData.mtdPowerFactor || elecData.dayPowerFactor || '1.000',
            powerCuts: elecData.powerCuts || [],
            totalPowerCutMinutes: elecData.totalPowerCutMinutes || 0,
            dg750: elecData.dg750 || {},
            dg180: elecData.dg180 || {},
            totalDieselConsumedLiters: elecData.totalDieselConsumedLiters || 0,
            mtdDieselConsumed: elecData.mtdDieselConsumed || elecData.totalDieselConsumedLiters || 0,
            solarDayGen: elecData.solarDayGen || 0,
            solarGenPct: elecData.solarGenPct || '0.0',
            solarDayExport: elecData.solarDayExport || 0,
            solarMtdGen: elecData.solarMtdGen || elecData.solarDayGen || 0,
            status: elecData.status || 'Submitted',
            approvedBy: elecData.approvedBy || ''
          }}
        />
      )}
    </div>
  );
}
