import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Fuel, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Activity, 
  Send, 
  Share2, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Sun, 
  ShieldCheck, 
  Sparkles,
  MessageSquare,
  Check,
  Calendar,
  Layers,
  Edit3
} from 'lucide-react';
import { getTodayDateString, getCurrentShift, COMPANY_NAME, DIVISION_NAME } from '../../constants/feedData';
import { 
  getElectricalData, 
  saveElectricalData, 
  getPreviousShiftReadings, 
  getMonthlyElectricalHistory 
} from '../../services/storage';
import PowerPosterModal from '../../components/PowerPosterModal';

const cleanOfficerName = (val) => {
  if (!val) return 'Shift Electrician';
  return val.replace(/Electrical Engineer/gi, 'Shift Electrician').replace(/Engineer/gi, 'Electrician');
};

export default function ElectricalTab({ 
  activeUser, 
  onUpdateActiveUser,
  subTab = 'shift',
  setSubTab
}) {
  // Screen sub-tab state (syncs with Header or internal)
  const currentScreen = subTab || 'shift';
  const handleSwitchScreen = (tabName) => {
    if (setSubTab) {
      setSubTab(tabName);
    }
  };

  const [date, setDate] = useState(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState(getTodayDateString().slice(0, 7)); // e.g. "2026-11"
  const [selectedShift, setSelectedShift] = useState(getCurrentShift());

  // ==========================================
  // 1. SHIFT REPORT STATE
  // ==========================================
  const [shiftStartMwh, setShiftStartMwh] = useState(460.550);
  const [shiftEndMwh, setShiftEndMwh] = useState(464.200);
  const [shiftStartMvah, setShiftStartMvah] = useState(468.850);
  const [shiftEndMvah, setShiftEndMvah] = useState(472.580);
  const [shiftOfficer, setShiftOfficer] = useState(() => cleanOfficerName(activeUser?.name));
  const [autoCarrySource, setAutoCarrySource] = useState('');
  const [shiftSubmitted, setShiftSubmitted] = useState(false);
  const [shiftCopied, setShiftCopied] = useState(false);

  // ==========================================
  // 2. DAY REPORT STATE
  // ==========================================
  const [dayPublished, setDayPublished] = useState(false);
  const [dayCopied, setDayCopied] = useState(false);
  const [shiftsData, setShiftsData] = useState({
    'Shift A': null,
    'Shift B': null,
    'Shift C': null
  });

  // Power Cut Interruption Logs
  const [powerCuts, setPowerCuts] = useState([]);
  const [newCutStart, setNewCutStart] = useState('');
  const [newCutEnd, setNewCutEnd] = useState('');
  const [newCutReason, setNewCutReason] = useState('');

  // DG 750 kVA
  const [dg750, setDg750] = useState({
    startTime: '',
    endTime: '',
    durationHours: 0,
    openingLiters: 650,
    fillingLiters: 0,
    consumptionLiters: 0,
    closingLiters: 650,
    efficiencyRate: '0.0'
  });

  // DG 180 kVA
  const [dg180, setDg180] = useState({
    startTime: '',
    endTime: '',
    durationHours: 0,
    openingLiters: 260,
    fillingLiters: 0,
    consumptionLiters: 0,
    closingLiters: 260,
    efficiencyRate: '0.0'
  });

  // Solar Rooftop
  const [solarDayGen, setSolarDayGen] = useState(1540);
  const [solarDayExport, setSolarDayExport] = useState(110);

  // Status & Posters
  const [reportStatus, setReportStatus] = useState('Submitted');
  const [approvedBy, setApprovedBy] = useState('');
  const [notification, setNotification] = useState('');

  // Poster Modal State
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [posterMode, setPosterMode] = useState('shift'); // 'shift' | 'day'

  // Monthly View State
  const [monthlyHistory, setMonthlyHistory] = useState(getMonthlyElectricalHistory(selectedMonth));
  const [reportsSubSheet, setReportsSubSheet] = useState('power'); // 'power' | 'dg' | 'solar' | 'master'

  // ==========================================
  // LOAD DATA FOR SELECTED DATE
  // ==========================================
  useEffect(() => {
    async function load() {
      const data = await getElectricalData(date);
      if (data) {
        if (data.shifts) setShiftsData(data.shifts);
        if (data.powerCuts) setPowerCuts(data.powerCuts);
        if (data.dg750) setDg750(data.dg750);
        if (data.dg180) setDg180(data.dg180);
        if (data.solarDayGen !== undefined) setSolarDayGen(data.solarDayGen);
        if (data.solarDayExport !== undefined) setSolarDayExport(data.solarDayExport);
        if (data.status) {
          setReportStatus(data.status);
          setDayPublished(data.status === 'Submitted' || data.status === 'Approved');
        }
        if (data.approvedBy) setApprovedBy(data.approvedBy);
        if (data.electricalIncharge) setShiftOfficer(cleanOfficerName(data.electricalIncharge));
      } else {
        // Reset defaults
        setShiftsData({ 'Shift A': null, 'Shift B': null, 'Shift C': null });
        setPowerCuts([]);
        setReportStatus('Draft');
        setDayPublished(false);
      }
      setMonthlyHistory(getMonthlyElectricalHistory(date.slice(0, 7)));
      setSelectedMonth(date.slice(0, 7));
    }
    load();
  }, [date]);

  // Reload monthly data when selectedMonth changes
  useEffect(() => {
    setMonthlyHistory(getMonthlyElectricalHistory(selectedMonth));
  }, [selectedMonth]);

  // Auto-carry forward logic when shift or date changes
  useEffect(() => {
    const existing = shiftsData[selectedShift];
    if (existing) {
      setShiftStartMwh(existing.startMwh || 0);
      setShiftEndMwh(existing.endMwh || 0);
      setShiftStartMvah(existing.startMvah || 0);
      setShiftEndMvah(existing.endMvah || 0);
      setAutoCarrySource('');
      setShiftSubmitted(true);
    } else {
      const prev = getPreviousShiftReadings(date, selectedShift);
      if (prev) {
        setShiftStartMwh(prev.startMwh);
        setShiftEndMwh(prev.startMwh);
        setShiftStartMvah(prev.startMvah);
        setShiftEndMvah(prev.startMvah);
        setAutoCarrySource(prev.source);
      }
      setShiftSubmitted(false);
    }
  }, [selectedShift, date, shiftsData]);

  // ==========================================
  // SHIFT LEVEL CALCULATIONS
  // ==========================================
  const shiftDiffMwh = Math.max(0, (parseFloat(shiftEndMwh) || 0) - (parseFloat(shiftStartMwh) || 0));
  const shiftConsumedKwh = Math.round(shiftDiffMwh * 1000);
  const shiftDiffMvah = Math.max(0, (parseFloat(shiftEndMvah) || 0) - (parseFloat(shiftStartMvah) || 0));
  const shiftConsumedKvah = Math.round(shiftDiffMvah * 1000);
  const shiftPowerFactor = shiftDiffMvah > 0 ? (shiftDiffMwh / shiftDiffMvah).toFixed(3) : '1.000';

  // ==========================================
  // DAY LEVEL CALCULATIONS
  // ==========================================
  const shiftA = shiftsData['Shift A'];
  const shiftB = shiftsData['Shift B'];
  const shiftC = shiftsData['Shift C'];

  const dayTotalMwh = (
    (shiftA?.diffMwh || 0) + 
    (shiftB?.diffMwh || 0) + 
    (shiftC?.diffMwh || 0)
  );
  const dayTotalKwh = Math.round(dayTotalMwh * 1000);

  const dayTotalMvah = (
    (shiftA?.diffMvah || 0) + 
    (shiftB?.diffMvah || 0) + 
    (shiftC?.diffMvah || 0)
  );
  const dayPowerFactor = dayTotalMvah > 0 ? (dayTotalMwh / dayTotalMvah).toFixed(3) : '0.985';

  // Month-to-Date (MTD) Calculations
  const mtdMwh = (parseFloat(monthlyHistory?.totals?.cumMwh || 0)).toFixed(3);
  const mtdMvah = (parseFloat(monthlyHistory?.totals?.cumMvah || 0)).toFixed(3);
  const mtdKwh = Math.round(parseFloat(mtdMwh) * 1000);
  const mtdPowerFactor = parseFloat(mtdMvah) > 0 ? (parseFloat(mtdMwh) / parseFloat(mtdMvah)).toFixed(3) : dayPowerFactor;

  // DG Fuel Calculations
  const dg750Available = (parseFloat(dg750?.openingLiters) || 0) + (parseFloat(dg750?.fillingLiters) || 0);
  const dg750Closing = Math.max(0, dg750Available - (parseFloat(dg750?.consumptionLiters) || 0));

  const dg180Available = (parseFloat(dg180?.openingLiters) || 0) + (parseFloat(dg180?.fillingLiters) || 0);
  const dg180Closing = Math.max(0, dg180Available - (parseFloat(dg180?.consumptionLiters) || 0));

  const totalDieselConsumedDay = (parseFloat(dg750?.consumptionLiters) || 0) + (parseFloat(dg180?.consumptionLiters) || 0);
  const totalPowerCutMinutes = powerCuts.reduce((acc, c) => acc + (parseFloat(c.durationMins) || 0), 0);

  const totalMillEnergyKwh = dayTotalKwh + (parseFloat(solarDayGen) || 0);
  const solarGenPercentage = totalMillEnergyKwh > 0 
    ? (((parseFloat(solarDayGen) || 0) / totalMillEnergyKwh) * 100).toFixed(1) 
    : '0.0';

  // ==========================================
  // ACTION: SUBMIT SHIFT REPORT
  // ==========================================
  const handleSaveShiftPower = async () => {
    if (!shiftOfficer.trim()) {
      alert('Please enter Shift Electrician name.');
      return;
    }

    const shiftPayload = {
      startMwh: parseFloat(shiftStartMwh) || 0,
      endMwh: parseFloat(shiftEndMwh) || 0,
      diffMwh: parseFloat(shiftDiffMwh.toFixed(3)),
      consumedKwh: shiftConsumedKwh,
      startMvah: parseFloat(shiftStartMvah) || 0,
      endMvah: parseFloat(shiftEndMvah) || 0,
      diffMvah: parseFloat(shiftDiffMvah.toFixed(3)),
      consumedKvah: shiftConsumedKvah,
      powerFactor: parseFloat(shiftPowerFactor),
      submittedBy: shiftOfficer,
      submittedAt: new Date().toISOString()
    };

    const updatedShifts = {
      ...shiftsData,
      [selectedShift]: shiftPayload
    };
    setShiftsData(updatedShifts);

    const newDayMwh = (
      (updatedShifts['Shift A']?.diffMwh || 0) + 
      (updatedShifts['Shift B']?.diffMwh || 0) + 
      (updatedShifts['Shift C']?.diffMwh || 0)
    );
    const newDayKwh = Math.round(newDayMwh * 1000);

    const newDayMvah = (
      (updatedShifts['Shift A']?.diffMvah || 0) + 
      (updatedShifts['Shift B']?.diffMvah || 0) + 
      (updatedShifts['Shift C']?.diffMvah || 0)
    );
    const newDayPf = newDayMvah > 0 ? (newDayMwh / newDayMvah).toFixed(3) : '0.985';

    const fullPayload = {
      date,
      shifts: updatedShifts,
      dayTotalMwh: parseFloat(newDayMwh.toFixed(3)),
      dayTotalKwh: newDayKwh,
      dayTotalMvah: parseFloat(newDayMvah.toFixed(3)),
      dayPowerFactor: newDayPf,
      powerCuts,
      totalPowerCutMinutes,
      dg750: {
        ...dg750,
        closingLiters: dg750Closing
      },
      dg180: {
        ...dg180,
        closingLiters: dg180Closing
      },
      totalDieselConsumedLiters: totalDieselConsumedDay,
      solarDayGen: parseFloat(solarDayGen) || 0,
      solarDayExport: parseFloat(solarDayExport) || 0,
      electricalIncharge: shiftOfficer,
      reportTime: new Date().toISOString(),
      status: reportStatus || 'Submitted'
    };

    await saveElectricalData(fullPayload);
    setShiftSubmitted(true);
    setNotification(`✓ ${selectedShift} Power Report submitted successfully! WhatsApp & Poster options are now ready.`);
    setTimeout(() => setNotification(''), 5000);
  };

  // ==========================================
  // ACTION: SUBMIT 24H DAY POWER REPORT
  // ==========================================
  const handlePublishDayReport = async () => {
    const fullPayload = {
      date,
      shifts: shiftsData,
      dayTotalMwh: parseFloat(dayTotalMwh.toFixed(3)),
      dayTotalKwh: dayTotalKwh,
      dayTotalMvah: parseFloat(dayTotalMvah.toFixed(3)),
      dayPowerFactor,
      powerCuts,
      totalPowerCutMinutes,
      dg750: {
        ...dg750,
        closingLiters: dg750Closing
      },
      dg180: {
        ...dg180,
        closingLiters: dg180Closing
      },
      totalDieselConsumedLiters: totalDieselConsumedDay,
      solarDayGen: parseFloat(solarDayGen) || 0,
      solarDayExport: parseFloat(solarDayExport) || 0,
      electricalIncharge: shiftOfficer,
      reportTime: new Date().toISOString(),
      status: 'Submitted'
    };

    await saveElectricalData(fullPayload);
    setReportStatus('Submitted');
    setDayPublished(true);
    setNotification('✓ 24-Hour Day Power Report submitted and synced! WhatsApp & Poster options are now ready.');
    setTimeout(() => setNotification(''), 5000);
  };

  // Power Cut Add/Delete
  const handleAddPowerCut = () => {
    if (!newCutStart || !newCutEnd) {
      alert('Please specify both Start and End times.');
      return;
    }
    const [startH, startM] = newCutStart.split(':').map(Number);
    const [endH, endM] = newCutEnd.split(':').map(Number);
    let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMins < 0) diffMins += 24 * 60;

    const item = {
      id: `PC-${Date.now().toString().slice(-4)}`,
      startTime: newCutStart,
      endTime: newCutEnd,
      durationMins: diffMins,
      reason: newCutReason.trim() || 'Grid Tripping'
    };

    setPowerCuts([...powerCuts, item]);
    setNewCutStart('');
    setNewCutEnd('');
    setNewCutReason('');
  };

  const handleDeletePowerCut = (id) => {
    setPowerCuts(powerCuts.filter(c => c.id !== id));
  };

  // WhatsApp Handlers
  const handleShareShiftWhatsApp = () => {
    const text = `⚡ *SANDHYA MARINES LTD — SHIFT ELECTRICAL REPORT*
🏭 *Division:* ${DIVISION_NAME}
📅 *Date:* ${date}
⏰ *Duty Shift:* ${selectedShift}
👷 *Shift Electrician:* ${shiftOfficer}

⚡ *ACTIVE ENERGY (MWH):*
• Starting MWH: ${parseFloat(shiftStartMwh).toFixed(3)}
• Ending MWH: ${parseFloat(shiftEndMwh).toFixed(3)}
• Shift Net MWH: ${shiftDiffMwh.toFixed(3)} MWH
• *Power Consumed:* *${shiftConsumedKwh.toLocaleString()} kWh*

⚡ *APPARENT ENERGY (MVAH):*
• Starting MVAH: ${parseFloat(shiftStartMvah).toFixed(3)}
• Ending MVAH: ${parseFloat(shiftEndMvah).toFixed(3)}
• Shift Net MVAH: ${shiftDiffMvah.toFixed(3)} MVAH
• Apparent kVAh: ${shiftConsumedKvah.toLocaleString()} kVAh

🎯 *POWER FACTOR (PF):*
• *Shift PF:* *${shiftPowerFactor}* (MWH ÷ MVAH)
• *Grid Compliance:* ${parseFloat(shiftPowerFactor) >= 0.980 ? '★ Optimal PF (> 0.98)' : '⚠️ Low PF Alert'}

⏱️ *OUTAGES:*
• Shift Outage Minutes: ${totalPowerCutMinutes} Mins • 33kV Continuous Supply`;

    navigator.clipboard.writeText(text);
    setShiftCopied(true);
    setTimeout(() => setShiftCopied(false), 2500);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareDayWhatsApp = () => {
    const text = `⚡ *SANDHYA MARINES LTD — 24H DAY POWER REPORT*
🏭 *Division:* ${DIVISION_NAME}
📅 *Date:* ${date}
👷 *Shift Electrician:* ${shiftOfficer}

⚡ *HT POWER CONSUMPTION (3 SHIFTS):*
• Shift A: ${shiftA?.consumedKwh ? `${shiftA.consumedKwh.toLocaleString()} kWh (PF ${shiftA.powerFactor})` : 'Pending'}
• Shift B: ${shiftB?.consumedKwh ? `${shiftB.consumedKwh.toLocaleString()} kWh (PF ${shiftB.powerFactor})` : 'Pending'}
• Shift C: ${shiftC?.consumedKwh ? `${shiftC.consumedKwh.toLocaleString()} kWh (PF ${shiftC.powerFactor})` : 'Pending'}
• *Day Total Power:* ${dayTotalKwh.toLocaleString()} kWh (${dayTotalMwh.toFixed(3)} MWH)
• *Day Power Factor:* *${dayPowerFactor}*
• *MTD Units:* ${mtdKwh.toLocaleString()} kWh | *MTD PF:* *${mtdPowerFactor}*

🚜 *DIESEL GENERATORS (DG FUEL):*
• DG 750 kVA: ${dg750.durationHours || 0} hrs | Consumed: ${dg750.consumptionLiters || 0} L | Closing: ${dg750Closing} L
• DG 180 kVA: ${dg180.durationHours || 0} hrs | Consumed: ${dg180.consumptionLiters || 0} L | Closing: ${dg180Closing} L
• Day Total Diesel: ${totalDieselConsumedDay} Liters

☀️ *ROOFTOP SOLAR:*
• Day Generation: ${(parseFloat(solarDayGen) || 0).toLocaleString()} kWh | Export: ${solarDayExport || 0} kWh

⏱️ *GRID OUTAGES:*
• Total Power Cuts: ${totalPowerCutMinutes} Minutes`;

    navigator.clipboard.writeText(text);
    setDayCopied(true);
    setTimeout(() => setDayCopied(false), 2500);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // CSV Export Handlers
  const exportCsv = (filename, headers, rows) => {
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPowerCsv = () => {
    const headers = ['Date', 'Shift A (kWh)', 'Shift B (kWh)', 'Shift C (kWh)', 'Day MWH', 'Day MVAH', 'Day kWh', 'Day PF', 'Cum MWH', 'Cum MVAH', 'Cum kWh', 'Cum PF'];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date, r.shiftAKwh || 0, r.shiftBKwh || 0, r.shiftCKwh || 0, r.dayTotalMwh, r.dayTotalMvah, r.dayTotalKwh, r.dayPowerFactor, r.cumMwh, r.cumMvah, r.cumKwh, r.cumulativePf
    ]);
    exportCsv(`SML_Feeds_Monthly_Power_Report_${selectedMonth}.csv`, headers, rows);
  };

  const handleExportDgCsv = () => {
    const headers = ['Date', 'Power Cuts (Mins)', 'Outage Trips', 'Outage Reason', 'DG 750kVA Run (Hrs)', 'DG 750kVA Consumed (L)', 'DG 180kVA Run (Hrs)', 'DG 180kVA Consumed (L)', 'Opening Diesel (L)', 'Diesel Filling (L)', 'Total Diesel Consumed (L)', 'Closing Diesel Stock (L)', 'Cum Diesel Consumed (L)'];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date, r.outageMinutes || 0, r.tripsCount || 0, `"${(r.outageReasons || '').replace(/"/g, '""')}"`, r.dg750Hours || 0, r.dg750Liters || 0, r.dg180Hours || 0, r.dg180Liters || 0, r.dayDieselOpening || 0, r.dayDieselFilling || 0, r.totalDieselConsumedLiters || 0, r.dayDieselClosing || 0, r.cumDiesel || 0
    ]);
    exportCsv(`SML_Feeds_Monthly_DG_Report_${selectedMonth}.csv`, headers, rows);
  };

  const handleExportSolarCsv = () => {
    const headers = ['Date', 'Solar Gen (kWh)', 'Solar Export (kWh)', 'Total Mill Power (kWh)', 'Solar Share %', 'Cum Solar Gen (kWh)', 'Cum Solar Export (kWh)'];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date, r.solarDayGen || 0, r.solarDayExport || 0, r.totalMillEnergyKwh || 0, r.solarPercentage || 0, r.cumSolarGen || 0, r.cumSolarExport || 0
    ]);
    exportCsv(`SML_Feeds_Monthly_Solar_Report_${selectedMonth}.csv`, headers, rows);
  };

  const handleExportMasterCsv = () => {
    const headers = [
      'Date', 'Shift A (kWh)', 'Shift B (kWh)', 'Shift C (kWh)', 'Day MWH', 'Day MVAH', 'Day kWh', 'Day PF', 'Cum kWh', 'Cum PF',
      'Power Cut (Mins)', 'DG 750 Run (Hrs)', 'DG 180 Run (Hrs)', 'Diesel Filled (L)', 'Diesel Consumed (L)', 'Closing Diesel (L)',
      'Solar Gen (kWh)', 'Solar Export (kWh)', 'Cum Solar (kWh)'
    ];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date, r.shiftAKwh || 0, r.shiftBKwh || 0, r.shiftCKwh || 0, r.dayTotalMwh, r.dayTotalMvah, r.dayTotalKwh, r.dayPowerFactor, r.cumKwh, r.cumulativePf,
      r.outageMinutes || 0, r.dg750Hours || 0, r.dg180Hours || 0, r.dayDieselFilling || 0, r.totalDieselConsumedLiters || 0, r.dayDieselClosing || 0,
      r.solarDayGen || 0, r.solarDayExport || 0, r.cumSolarGen || 0
    ]);
    exportCsv(`SML_Feeds_MASTER_Monthly_Consolidated_Report_${selectedMonth}.csv`, headers, rows);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* ======================================================== */}
      {/* 1. CLEAN, PREMIUM LIGHT COMMAND BAR (NO THICK DARK COLORS) */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-sky-200/80 dark:border-sky-950 rounded-3xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Title & Department Identity */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-900/60 shadow-xs">
              <Zap className="w-6 h-6 text-sky-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Electrical Department
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100/70 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300/40">
                  <Activity className="w-3 h-3 text-sky-500" />
                  33kV Substation
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {COMPANY_NAME} • Shift Readings, HT Power Factor & DG Fuel Monitoring
              </p>
            </div>
          </div>

          {/* Quick Date & Electrician Inputs */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="bg-slate-50 dark:bg-[#07131b] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Log Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 dark:bg-[#07131b] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[170px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Shift Electrician</span>
              <input
                type="text"
                value={shiftOfficer}
                onChange={(e) => setShiftOfficer(e.target.value)}
                placeholder="Shift Electrician Name"
                className="bg-transparent text-slate-800 dark:text-slate-100 font-bold text-xs focus:outline-none w-full"
              />
            </div>
          </div>

        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* In-Page Screen Navigation Switcher (Mobile Friendly & Crisp) */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#07131b] p-1 rounded-2xl border border-slate-200/60 dark:border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSwitchScreen('shift')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentScreen === 'shift'
                  ? 'bg-white dark:bg-[#0c1f2b] text-sky-600 dark:text-sky-400 shadow-xs border border-sky-200/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-sky-500" />
              <span>Shift Report</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchScreen('day')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentScreen === 'day'
                  ? 'bg-white dark:bg-[#0c1f2b] text-sky-600 dark:text-sky-400 shadow-xs border border-sky-200/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Day Report</span>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchScreen('reports')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentScreen === 'reports'
                  ? 'bg-white dark:bg-[#0c1f2b] text-sky-600 dark:text-sky-400 shadow-xs border border-sky-200/60'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-500" />
              <span>Reports</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
            {currentScreen === 'shift' && 'Duty Shift HT Readings & Instant PF Check'}
            {currentScreen === 'day' && '24-Hour 3-Shift Consolidation & DG Fuel'}
            {currentScreen === 'reports' && 'Monthly Historical Sheets & Master CSV'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SCREEN 1: SHIFT REPORT ONLY                              */}
      {/* ======================================================== */}
      {currentScreen === 'shift' && (
        <div className="bg-white dark:bg-[#0c1f2b] border border-sky-200/80 dark:border-sky-950 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/50">
                <Zap className="w-5 h-5 text-sky-500" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Shift Power Report</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    {selectedShift}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Duty Electrician enters Active Energy (MWH) & Apparent Energy (MVAH) at shift handover.
                </p>
              </div>
            </div>

            {shiftSubmitted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Shift Logged & Synced
              </span>
            )}
          </div>

          {/* Shift Selector Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            {['Shift A', 'Shift B', 'Shift C'].map((sh) => {
              const isSelected = selectedShift === sh;
              const hasData = !!shiftsData[sh];
              return (
                <button
                  key={sh}
                  type="button"
                  onClick={() => setSelectedShift(sh)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white border-transparent shadow-sm shadow-sky-500/20'
                      : hasData
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-[#07131b] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-extrabold">{sh}</span>
                  <span className="text-[10px] opacity-80 font-normal">
                    {sh === 'Shift A' ? '06:00 - 14:00' : sh === 'Shift B' ? '14:00 - 22:00' : '22:00 - 06:00'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Auto-Carry Forward Indicator */}
          {autoCarrySource && !shiftSubmitted && (
            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-sky-500" />
                Starting readings auto-carried from {autoCarrySource}.
              </span>
            </div>
          )}

          {/* 1. MWH (Active Energy) Card */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-sky-500" />
                1. Active Energy Meter (MWH)
              </span>
              <span className="text-xs font-black text-sky-600 dark:text-sky-400 font-mono">
                Diff: {shiftDiffMwh.toFixed(3)} MWH
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Starting MWH
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={shiftStartMwh}
                  disabled={shiftSubmitted}
                  onChange={(e) => setShiftStartMwh(e.target.value)}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Ending MWH
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={shiftEndMwh}
                  disabled={shiftSubmitted}
                  onChange={(e) => setShiftEndMwh(e.target.value)}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 disabled:opacity-75"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-900 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block">
                  Power Consumed
                </span>
                <div className="text-lg font-black text-sky-700 dark:text-sky-300 font-mono">
                  {shiftConsumedKwh.toLocaleString()} <span className="text-xs font-sans font-bold">kWh</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. MVAH (Apparent Energy) Card */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                2. Apparent Energy Meter (MVAH)
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                Diff: {shiftDiffMvah.toFixed(3)} MVAH
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Starting MVAH
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={shiftStartMvah}
                  disabled={shiftSubmitted}
                  onChange={(e) => setShiftStartMvah(e.target.value)}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 disabled:opacity-75"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Ending MVAH
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={shiftEndMvah}
                  disabled={shiftSubmitted}
                  onChange={(e) => setShiftEndMvah(e.target.value)}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 disabled:opacity-75"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                  Apparent Energy
                </span>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
                  {shiftConsumedKvah.toLocaleString()} <span className="text-xs font-sans font-bold">kVAh</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Calculated Power Factor Spotlight Box */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
            parseFloat(shiftPowerFactor) >= 0.980
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
          }`}>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                Calculated Shift Power Factor (PF)
              </span>
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {shiftPowerFactor}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Formula: Shift MWH ÷ Shift MVAH ({shiftDiffMwh.toFixed(3)} ÷ {shiftDiffMvah.toFixed(3)})
              </span>
            </div>

            <div className="text-right">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${
                parseFloat(shiftPowerFactor) >= 0.980
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-amber-500 text-white shadow-xs'
              }`}>
                {parseFloat(shiftPowerFactor) >= 0.980 ? '★ Optimal PF (> 0.98)' : '⚠️ Low PF Alert'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                APCPDCL Grid Rebate Compliant
              </span>
            </div>
          </div>

          {/* Mini Shift Status Overview Strip */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-2">
              Today's 3-Shift Log Status
            </span>
            <div className="grid grid-cols-3 gap-2">
              {['Shift A', 'Shift B', 'Shift C'].map((sh) => {
                const s = shiftsData[sh];
                return (
                  <div key={sh} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600 dark:text-slate-300">{sh}</span>
                      <span className={s ? 'text-emerald-500' : 'text-amber-500'}>
                        {s ? '✓' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-xs font-black font-mono text-slate-800 dark:text-slate-200 mt-1">
                      {s?.consumedKwh ? `${s.consumedKwh.toLocaleString()} kWh` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      PF: {s?.powerFactor || '--'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SUBMIT FIRST WORKFLOW FOR SHIFT REPORT                   */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {!shiftSubmitted ? (
              /* BEFORE SUBMIT: ONLY THE SUBMIT BUTTON IS VISIBLE */
              <button
                type="button"
                onClick={handleSaveShiftPower}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-extrabold text-sm rounded-2xl shadow-sm shadow-sky-500/25 active:scale-98 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit {selectedShift} Report</span>
              </button>
            ) : (
              /* AFTER SUBMIT: SUCCESS BADGE + WHATSAPP + POSTER + EDIT BUTTON */
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        {selectedShift} Report Submitted & Logged
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Consumption: {shiftConsumedKwh.toLocaleString()} kWh • PF {shiftPowerFactor}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShiftSubmitted(false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-white dark:hover:bg-[#0c1f2b] border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                    title="Unlock and edit readings"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-col sm:flex-row">
                  <button
                    type="button"
                    onClick={handleShareShiftWhatsApp}
                    className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
                    title="Share Shift Report to WhatsApp"
                  >
                    {shiftCopied ? <Check className="w-4 h-4 text-white" /> : <MessageSquare className="w-4 h-4 text-white" />}
                    <span>{shiftCopied ? 'Copied & Opened!' : 'Share to WhatsApp'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPosterMode('shift');
                      setIsPosterOpen(true);
                    }}
                    className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white shadow-sm shadow-sky-500/20 transition active:scale-95 cursor-pointer"
                    title="Create Graphic Shift Poster Locally & Download"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Create Shift Report Poster</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 2: DAY REPORT ONLY                                */}
      {/* ======================================================== */}
      {currentScreen === 'day' && (
        <div className="bg-white dark:bg-[#0c1f2b] border border-sky-200/80 dark:border-sky-950 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/50">
                <Sun className="w-5 h-5 text-amber-500" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>24-Hour Day Power Report</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Day Review
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Consolidates Shifts A, B & C, 24-hour total consumption, DG sets, power cuts and rooftop solar.
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              reportStatus === 'Approved'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200'
            }`}>
              {reportStatus === 'Approved' ? 'Approved by Plant Manager' : 'Ready for Submission'}
            </span>
          </div>

          {/* 3 Shifts Mini Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Shift A', 'Shift B', 'Shift C'].map((sh) => {
              const s = shiftsData[sh];
              return (
                <div key={sh} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span>{sh}</span>
                    <span className={s ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                      {s ? '✓ Logged' : 'Pending'}
                    </span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-1">
                    {s?.consumedKwh ? `${s.consumedKwh.toLocaleString()} kWh` : '--'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Net MWH: {s?.diffMwh ? `${s.diffMwh.toFixed(3)}` : '--'} • PF: {s?.powerFactor || '--'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day Totals KPI Cards (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900">
              <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block mb-0.5">Day Total Power</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {dayTotalKwh.toLocaleString()} <span className="text-xs">kWh</span>
              </div>
              <span className="text-[11px] text-sky-600 font-mono">{dayTotalMwh.toFixed(3)} MWH</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">Day Power Factor</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {dayPowerFactor}
              </div>
              <span className="text-[11px] text-emerald-600">MWH ÷ MVAH</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900">
              <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 block mb-0.5">MTD Units</span>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {mtdKwh.toLocaleString()} <span className="text-xs">kWh</span>
              </div>
              <span className="text-[11px] text-teal-600 font-mono">{mtdMwh} MWH</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900">
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block mb-0.5">MTD Cum PF</span>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {mtdPowerFactor}
              </div>
              <span className="text-[11px] text-indigo-600">Cumulative PF</span>
            </div>
          </div>

          {/* DG 750 kVA & 180 kVA Fuel Reserves */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-500" />
                Diesel Generator (DG) Reserves
              </span>
              <span className="text-xs font-black text-amber-600 font-mono">
                Total Consumed: {totalDieselConsumedDay} Liters
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* DG 750 */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-extrabold text-amber-600 block mb-2">DG-1: 750 kVA (Heavy Line)</span>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Run Hrs</span>
                    <input
                      type="number"
                      step="0.1"
                      value={dg750.durationHours}
                      onChange={(e) => setDg750({ ...dg750, durationHours: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 font-mono font-bold border rounded-lg bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Filling (L)</span>
                    <input
                      type="number"
                      value={dg750.fillingLiters}
                      onChange={(e) => setDg750({ ...dg750, fillingLiters: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 font-mono font-bold border rounded-lg bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Consumed (L)</span>
                    <input
                      type="number"
                      value={dg750.consumptionLiters}
                      onChange={(e) => setDg750({ ...dg750, consumptionLiters: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 font-mono font-bold border rounded-lg bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Closing Stock</span>
                    <span className="font-mono font-black text-emerald-600 block mt-1.5 text-xs">{dg750Closing} L</span>
                  </div>
                </div>
              </div>

              {/* DG 180 */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-extrabold text-sky-600 block mb-2">DG-2: 180 kVA (Boiler & Aux)</span>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Run Hrs</span>
                    <input
                      type="number"
                      step="0.1"
                      value={dg180.durationHours}
                      onChange={(e) => setDg180({ ...dg180, durationHours: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 font-mono font-bold border rounded-lg bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Filling (L)</span>
                    <input
                      type="number"
                      value={dg180.fillingLiters}
                      onChange={(e) => setDg180({ ...dg180, fillingLiters: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 font-mono font-bold border rounded-lg bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Consumed (L)</span>
                    <input
                      type="number"
                      value={dg180.consumptionLiters}
                      onChange={(e) => setDg180({ ...dg180, consumptionLiters: parseFloat(e.target.value) || 0 })}
                      className="w-full p-1.5 font-mono font-bold border rounded-lg bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">Closing Stock</span>
                    <span className="font-mono font-black text-emerald-600 block mt-1.5 text-xs">{dg180Closing} L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Solar & Power Cut Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Solar Generation */}
            <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-2.5">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-500" />
                Rooftop Solar Generation
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Day Generation (kWh)</label>
                  <input
                    type="number"
                    value={solarDayGen}
                    onChange={(e) => setSolarDayGen(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Export to Grid (kWh)</label>
                  <input
                    type="number"
                    value={solarDayExport}
                    onChange={(e) => setSolarDayExport(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold pt-1">
                Solar Share: {solarGenPercentage}% of total plant energy
              </div>
            </div>

            {/* Power Cut Outage Log */}
            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-500" />
                  Power Cut Outages ({totalPowerCutMinutes} Mins)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  value={newCutStart}
                  onChange={(e) => setNewCutStart(e.target.value)}
                  className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Start"
                />
                <input
                  type="time"
                  value={newCutEnd}
                  onChange={(e) => setNewCutEnd(e.target.value)}
                  className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="End"
                />
                <input
                  type="text"
                  value={newCutReason}
                  onChange={(e) => setNewCutReason(e.target.value)}
                  className="p-1.5 text-xs flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  placeholder="Outage Reason"
                />
                <button
                  type="button"
                  onClick={handleAddPowerCut}
                  className="p-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0"
                >
                  + Add
                </button>
              </div>

              {powerCuts.length > 0 && (
                <div className="space-y-1 mt-2 max-h-24 overflow-y-auto text-xs">
                  {powerCuts.map((cut) => (
                    <div key={cut.id} className="flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-rose-100 text-[11px]">
                      <span>{cut.startTime} - {cut.endTime} ({cut.durationMins}m) — {cut.reason}</span>
                      <button onClick={() => handleDeletePowerCut(cut.id)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* SUBMIT FIRST WORKFLOW FOR DAY REPORT                     */}
          {/* ======================================================== */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {!dayPublished ? (
              /* BEFORE SUBMIT: ONLY THE SUBMIT BUTTON IS VISIBLE */
              <button
                type="button"
                onClick={handlePublishDayReport}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-extrabold text-sm rounded-2xl shadow-sm shadow-sky-500/25 active:scale-98 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit 24H Day Power Report</span>
              </button>
            ) : (
              /* AFTER SUBMIT: SUCCESS BADGE + WHATSAPP + POSTER + EDIT BUTTON */
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                        24-Hour Day Power Report Submitted & Logged
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Total Power: {dayTotalKwh.toLocaleString()} kWh • Day PF {dayPowerFactor} • Diesel: {totalDieselConsumedDay} L
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDayPublished(false)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-white dark:hover:bg-[#0c1f2b] border border-slate-200 dark:border-slate-800 transition cursor-pointer"
                    title="Unlock and edit day report"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-col sm:flex-row">
                  <button
                    type="button"
                    onClick={handleShareDayWhatsApp}
                    className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition active:scale-95 cursor-pointer"
                    title="Share 24H Day Report to WhatsApp"
                  >
                    {dayCopied ? <Check className="w-4 h-4 text-white" /> : <MessageSquare className="w-4 h-4 text-white" />}
                    <span>{dayCopied ? 'Copied & Opened!' : 'Share Day Report to WhatsApp'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPosterMode('day');
                      setIsPosterOpen(true);
                    }}
                    className="flex-1 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white shadow-sm shadow-sky-500/20 transition active:scale-95 cursor-pointer"
                    title="Create Graphic Day Poster Locally & Download"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Create Day Report Poster</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 3: REPORTS ONLY (MONTHLY AUDIT & HISTORICAL SHEETS) */}
      {/* ======================================================== */}
      {currentScreen === 'reports' && (
        <div className="bg-white dark:bg-[#0c1f2b] border border-sky-200/80 dark:border-sky-950 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in max-w-6xl mx-auto">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-sky-500" />
                <span>Monthly Electrical Reports & Historical Sheets</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily logged data automatically accumulates into specialized audit sheets for APCPDCL compliance.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleExportMasterCsv}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export XLS</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Sub-sheet Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setReportsSubSheet('power')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                reportsSubSheet === 'power'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ⚡ HT Power & PF Sheet
            </button>

            <button
              onClick={() => setReportsSubSheet('dg')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                reportsSubSheet === 'dg'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              🚜 DG & Power Cuts Sheet
            </button>

            <button
              onClick={() => setReportsSubSheet('solar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                reportsSubSheet === 'solar'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              ☀️ Rooftop Solar Sheet
            </button>

            <button
              onClick={() => setReportsSubSheet('master')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                reportsSubSheet === 'master'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              📑 Master Consolidated Sheet
            </button>
          </div>

          {/* Sub-sheet Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-sky-50/70 dark:bg-[#07131b] text-sky-900 dark:text-sky-300 font-extrabold border-b border-slate-200 dark:border-slate-800">
                {reportsSubSheet === 'power' && (
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Shift A (kWh)</th>
                    <th className="py-2.5 px-3">Shift B (kWh)</th>
                    <th className="py-2.5 px-3">Shift C (kWh)</th>
                    <th className="py-2.5 px-3">Day MWH</th>
                    <th className="py-2.5 px-3">Day kWh</th>
                    <th className="py-2.5 px-3">Day PF</th>
                    <th className="py-2.5 px-3">Cum kWh</th>
                    <th className="py-2.5 px-3">Cum PF</th>
                  </tr>
                )}
                {reportsSubSheet === 'dg' && (
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Outage (Mins)</th>
                    <th className="py-2.5 px-3">DG 750 Run (Hrs)</th>
                    <th className="py-2.5 px-3">DG 750 Consumed (L)</th>
                    <th className="py-2.5 px-3">DG 180 Run (Hrs)</th>
                    <th className="py-2.5 px-3">DG 180 Consumed (L)</th>
                    <th className="py-2.5 px-3">Diesel Filled (L)</th>
                    <th className="py-2.5 px-3">Closing Stock (L)</th>
                  </tr>
                )}
                {reportsSubSheet === 'solar' && (
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Solar Gen (kWh)</th>
                    <th className="py-2.5 px-3">Solar Export (kWh)</th>
                    <th className="py-2.5 px-3">Total Mill Power (kWh)</th>
                    <th className="py-2.5 px-3">Solar Share %</th>
                    <th className="py-2.5 px-3">Cum Gen (kWh)</th>
                  </tr>
                )}
                {reportsSubSheet === 'master' && (
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Day kWh</th>
                    <th className="py-2.5 px-3">Day PF</th>
                    <th className="py-2.5 px-3">Cum kWh</th>
                    <th className="py-2.5 px-3">Cum PF</th>
                    <th className="py-2.5 px-3">Outage (Mins)</th>
                    <th className="py-2.5 px-3">DG Diesel (L)</th>
                    <th className="py-2.5 px-3">Solar Gen (kWh)</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-slate-800 dark:text-slate-200">
                {(monthlyHistory?.records || []).map((row, idx) => (
                  <tr key={row.date} className={idx % 2 === 0 ? 'bg-white dark:bg-[#0c1f2b]' : 'bg-slate-50/50 dark:bg-[#07131b]/50'}>
                    <td className="py-2 px-3 font-bold">{row.date}</td>
                    
                    {reportsSubSheet === 'power' && (
                      <>
                        <td className="py-2 px-3">{row.shiftAKwh?.toLocaleString() || 0}</td>
                        <td className="py-2 px-3">{row.shiftBKwh?.toLocaleString() || 0}</td>
                        <td className="py-2 px-3">{row.shiftCKwh?.toLocaleString() || 0}</td>
                        <td className="py-2 px-3 font-bold text-sky-600">{row.dayTotalMwh}</td>
                        <td className="py-2 px-3 font-bold">{row.dayTotalKwh?.toLocaleString()}</td>
                        <td className={`py-2 px-3 font-bold ${parseFloat(row.dayPowerFactor) >= 0.98 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {row.dayPowerFactor}
                        </td>
                        <td className="py-2 px-3">{row.cumKwh?.toLocaleString()}</td>
                        <td className="py-2 px-3 font-bold text-emerald-600">{row.cumulativePf}</td>
                      </>
                    )}

                    {reportsSubSheet === 'dg' && (
                      <>
                        <td className="py-2 px-3">{row.outageMinutes || 0}</td>
                        <td className="py-2 px-3">{row.dg750Hours || 0}</td>
                        <td className="py-2 px-3">{row.dg750Liters || 0}</td>
                        <td className="py-2 px-3">{row.dg180Hours || 0}</td>
                        <td className="py-2 px-3">{row.dg180Liters || 0}</td>
                        <td className="py-2 px-3">{row.dayDieselFilling || 0}</td>
                        <td className="py-2 px-3 font-bold text-emerald-600">{row.dayDieselClosing || 0}</td>
                      </>
                    )}

                    {reportsSubSheet === 'solar' && (
                      <>
                        <td className="py-2 px-3 font-bold text-amber-600">{row.solarDayGen?.toLocaleString() || 0}</td>
                        <td className="py-2 px-3">{row.solarDayExport?.toLocaleString() || 0}</td>
                        <td className="py-2 px-3">{row.totalMillEnergyKwh?.toLocaleString() || 0}</td>
                        <td className="py-2 px-3 font-bold text-emerald-600">{row.solarPercentage || 0}%</td>
                        <td className="py-2 px-3">{row.cumSolarGen?.toLocaleString() || 0}</td>
                      </>
                    )}

                    {reportsSubSheet === 'master' && (
                      <>
                        <td className="py-2 px-3 font-bold">{row.dayTotalKwh?.toLocaleString()}</td>
                        <td className={`py-2 px-3 font-bold ${parseFloat(row.dayPowerFactor) >= 0.98 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {row.dayPowerFactor}
                        </td>
                        <td className="py-2 px-3">{row.cumKwh?.toLocaleString()}</td>
                        <td className="py-2 px-3 font-bold text-emerald-600">{row.cumulativePf}</td>
                        <td className="py-2 px-3">{row.outageMinutes || 0}</td>
                        <td className="py-2 px-3">{row.totalDieselConsumedLiters || 0}</td>
                        <td className="py-2 px-3 font-bold text-amber-600">{row.solarDayGen?.toLocaleString() || 0}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              onClick={handleExportPowerCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Download Power Sheet CSV
            </button>
            <button
              onClick={handleExportDgCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Download DG Sheet CSV
            </button>
            <button
              onClick={handleExportSolarCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
            >
              Download Solar Sheet CSV
            </button>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* POWER POSTER MODAL (PURE WHITE BACKGROUND WITH LOGO)    */}
      {/* ======================================================== */}
      {isPosterOpen && (
        <PowerPosterModal
          isOpen={isPosterOpen}
          onClose={() => setIsPosterOpen(false)}
          mode={posterMode}
          powerData={posterMode === 'shift' ? {
            date,
            shift: selectedShift,
            startMwh: shiftStartMwh,
            endMwh: shiftEndMwh,
            diffMwh: shiftDiffMwh,
            consumedKwh: shiftConsumedKwh,
            startMvah: shiftStartMvah,
            endMvah: shiftEndMvah,
            diffMvah: shiftDiffMvah,
            consumedKvah: shiftConsumedKvah,
            powerFactor: shiftPowerFactor,
            electricalIncharge: shiftOfficer,
            outageMinutes: totalPowerCutMinutes,
            reportTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          } : {
            date,
            shifts: shiftsData,
            dayTotalMwh,
            dayTotalKwh,
            dayTotalMvah,
            dayPowerFactor,
            mtdKwh,
            mtdPowerFactor,
            mtdMwh,
            dg750,
            dg180,
            totalDieselConsumedLiters: totalDieselConsumedDay,
            solarDayGen,
            solarDayExport,
            totalPowerCutMinutes,
            electricalIncharge: shiftOfficer,
            status: reportStatus,
            approvedBy
          }}
        />
      )}

    </div>
  );
}
