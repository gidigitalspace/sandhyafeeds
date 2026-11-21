import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Fuel, 
  Clock, 
  Save, 
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
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Gauge,
  MessageSquare,
  Check,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { getTodayDateString, getCurrentShift, COMPANY_NAME, DIVISION_NAME, SHIFTS } from '../../constants/feedData';
import { 
  getElectricalData, 
  saveElectricalData, 
  getPreviousShiftReadings, 
  getMonthlyElectricalHistory 
} from '../../services/storage';
import PowerPosterModal from '../../components/PowerPosterModal';

export default function ElectricalTab({ activeUser, onUpdateActiveUser }) {
  const [date, setDate] = useState(getTodayDateString());
  const [selectedMonth, setSelectedMonth] = useState(getTodayDateString().slice(0, 7)); // e.g. "2026-11"
  const [selectedShift, setSelectedShift] = useState(getCurrentShift());

  // ==========================================
  // 1. SHIFT REPORT STATE (Left Side)
  // ==========================================
  const [shiftStartMwh, setShiftStartMwh] = useState(460.550);
  const [shiftEndMwh, setShiftEndMwh] = useState(464.200);
  const [shiftStartMvah, setShiftStartMvah] = useState(468.850);
  const [shiftEndMvah, setShiftEndMvah] = useState(472.580);
  const [shiftOfficer, setShiftOfficer] = useState(activeUser?.name || 'K. Ramesh (Electrical Engineer)');
  const [autoCarrySource, setAutoCarrySource] = useState('');
  const [shiftSubmitted, setShiftSubmitted] = useState(false);
  const [shiftCopied, setShiftCopied] = useState(false);

  // ==========================================
  // 2. DAY REPORT STATE (Right Side)
  // ==========================================
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
  const [dayCopied, setDayCopied] = useState(false);

  // Poster Modal State
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [posterMode, setPosterMode] = useState('day'); // 'day' | 'shift'

  // Monthly View State
  const [monthlyHistory, setMonthlyHistory] = useState(getMonthlyElectricalHistory(selectedMonth));

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
        if (data.status) setReportStatus(data.status);
        if (data.approvedBy) setApprovedBy(data.approvedBy);
        if (data.electricalIncharge) setShiftOfficer(data.electricalIncharge);
      } else {
        // Reset defaults
        setShiftsData({ 'Shift A': null, 'Shift B': null, 'Shift C': null });
        setPowerCuts([]);
        setReportStatus('Draft');
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
  const dayTotalKvah = Math.round(dayTotalMvah * 1000);
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

  // Solar generation % of total plant power
  const totalMillEnergyKwh = dayTotalKwh + (parseFloat(solarDayGen) || 0);
  const solarGenPercentage = totalMillEnergyKwh > 0 
    ? (((parseFloat(solarDayGen) || 0) / totalMillEnergyKwh) * 100).toFixed(1) 
    : '0.0';

  // ==========================================
  // ACTION: SUBMIT SHIFT REPORT (LEFT SIDE)
  // ==========================================
  const handleSaveShiftPower = async () => {
    if (!shiftOfficer.trim()) {
      alert('Please enter Shift Electrician / Engineer name.');
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
    const newDayMvah = (
      (updatedShifts['Shift A']?.diffMvah || 0) + 
      (updatedShifts['Shift B']?.diffMvah || 0) + 
      (updatedShifts['Shift C']?.diffMvah || 0)
    );

    const fullRecord = {
      date,
      shifts: updatedShifts,
      dayTotalMwh: parseFloat(newDayMwh.toFixed(3)),
      dayTotalKwh: Math.round(newDayMwh * 1000),
      dayTotalMvah: parseFloat(newDayMvah.toFixed(3)),
      dayTotalKvah: Math.round(newDayMvah * 1000),
      dayPowerFactor: newDayMvah > 0 ? (newDayMwh / newDayMvah).toFixed(3) : '0.985',
      powerCuts,
      totalPowerCutMinutes,
      dg750: { ...dg750, closingLiters: dg750Closing },
      dg180: { ...dg180, closingLiters: dg180Closing },
      totalDieselConsumedLiters: totalDieselConsumedDay,
      solarDayGen: parseFloat(solarDayGen) || 0,
      solarDayExport: parseFloat(solarDayExport) || 0,
      electricalIncharge: shiftOfficer,
      status: reportStatus,
      approvedBy
    };

    await saveElectricalData(fullRecord);
    setMonthlyHistory(getMonthlyElectricalHistory(date.slice(0, 7)));
    setShiftSubmitted(true);
    setNotification(`⚡ ${selectedShift} Power Report submitted & synchronized to all departments!`);
    setTimeout(() => setNotification(''), 4000);
  };

  // ==========================================
  // ACTION: SUBMIT DAY REPORT (RIGHT SIDE)
  // ==========================================
  const handlePublishDayReport = async () => {
    const fullRecord = {
      date,
      shifts: shiftsData,
      dayTotalMwh: parseFloat(dayTotalMwh.toFixed(3)),
      dayTotalKwh,
      dayTotalMvah: parseFloat(dayTotalMvah.toFixed(3)),
      dayTotalKvah,
      dayPowerFactor,
      powerCuts,
      totalPowerCutMinutes,
      dg750: { ...dg750, closingLiters: dg750Closing },
      dg180: { ...dg180, closingLiters: dg180Closing },
      totalDieselConsumedLiters: totalDieselConsumedDay,
      solarDayGen: parseFloat(solarDayGen) || 0,
      solarDayExport: parseFloat(solarDayExport) || 0,
      solarGenPct: solarGenPercentage,
      electricalIncharge: shiftOfficer,
      reportTime: new Date().toISOString(),
      status: 'Submitted',
      approvedBy
    };

    await saveElectricalData(fullRecord);
    setMonthlyHistory(getMonthlyElectricalHistory(date.slice(0, 7)));
    setReportStatus('Submitted');
    setNotification('✓ Full 24-Hour Day Power Report successfully published to General In-Charge & Plant Manager!');
    setTimeout(() => setNotification(''), 4500);
  };

  // ==========================================
  // POWER CUT HANDLERS
  // ==========================================
  const handleAddPowerCut = () => {
    if (!newCutStart || !newCutEnd) {
      alert('Please enter both Start Time and End Time for the power cut.');
      return;
    }
    const [sH, sM] = newCutStart.split(':').map(Number);
    const [eH, eM] = newCutEnd.split(':').map(Number);
    let startMin = sH * 60 + sM;
    let endMin = eH * 60 + eM;
    if (endMin < startMin) endMin += 24 * 60; // Overnight cut
    const duration = Math.max(0, endMin - startMin);

    const newCut = {
      id: `PC-${Date.now().toString().slice(-4)}`,
      startTime: newCutStart,
      endTime: newCutEnd,
      durationMins: duration,
      reason: newCutReason.trim() || '33kV Substation Line Trip'
    };

    setPowerCuts([...powerCuts, newCut]);
    setNewCutStart('');
    setNewCutEnd('');
    setNewCutReason('');
  };

  const handleRemovePowerCut = (id) => {
    setPowerCuts(powerCuts.filter(c => c.id !== id));
  };

  // ==========================================
  // WHATSAPP SHARE HELPERS
  // ==========================================
  const handleShareShiftWhatsApp = () => {
    const text = `⚡ *SANDHYA MARINES LTD — SHIFT POWER REPORT*
🏭 *Division:* ${DIVISION_NAME}
📅 *Date:* ${date}
⏰ *Shift:* ${selectedShift}
👷 *Shift Electrician:* ${shiftOfficer}

⚡ *1. ACTIVE ENERGY (MWH):*
• Starting MWH: ${parseFloat(shiftStartMwh).toFixed(3)}
• Ending MWH: ${parseFloat(shiftEndMwh).toFixed(3)}
• Shift Consumed: ${shiftDiffMwh.toFixed(3)} MWH (${shiftConsumedKwh.toLocaleString()} kWh)

⚡ *2. APPARENT ENERGY (MVAH):*
• Starting MVAH: ${parseFloat(shiftStartMvah).toFixed(3)}
• Ending MVAH: ${parseFloat(shiftEndMvah).toFixed(3)}
• Shift MVAH: ${shiftDiffMvah.toFixed(3)} MVAH

🎯 *3. POWER FACTOR (PF):*
• Shift PF: *${shiftPowerFactor}* (MWH ÷ MVAH)
• Status: ${parseFloat(shiftPowerFactor) >= 0.98 ? '★ High PF (> 0.98)' : 'Compliant'}

⏱️ *Grid Status:* Continuous 33kV Supply`;

    navigator.clipboard.writeText(text);
    setShiftCopied(true);
    setTimeout(() => setShiftCopied(false), 2500);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareDayWhatsApp = () => {
    const text = `⚡ *SANDHYA MARINES LTD — 24H DAY POWER REPORT*
🏭 *Division:* ${DIVISION_NAME}
📅 *Date:* ${date}
👷 *Electrical In-Charge:* ${shiftOfficer}

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

  // ==========================================
  // EXCEL / CSV EXPORT HANDLERS (3 SECTIONS)
  // ==========================================
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
    const headers = [
      'Date',
      'Shift A (kWh)',
      'Shift B (kWh)',
      'Shift C (kWh)',
      'Day MWH',
      'Day MVAH',
      'Day kWh',
      'Day PF',
      'Cum MWH',
      'Cum MVAH',
      'Cum kWh',
      'Cum PF'
    ];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date,
      r.shiftAKwh || 0,
      r.shiftBKwh || 0,
      r.shiftCKwh || 0,
      r.dayTotalMwh,
      r.dayTotalMvah,
      r.dayTotalKwh,
      r.dayPowerFactor,
      r.cumMwh,
      r.cumMvah,
      r.cumKwh,
      r.cumulativePf
    ]);
    exportCsv(`SML_Feeds_Monthly_Power_Report_${selectedMonth}.csv`, headers, rows);
  };

  const handleExportDgCsv = () => {
    const headers = [
      'Date',
      'Power Cuts (Mins)',
      'Outage Trips',
      'Outage Reason',
      'DG 750kVA Run (Hrs)',
      'DG 750kVA Consumed (L)',
      'DG 180kVA Run (Hrs)',
      'DG 180kVA Consumed (L)',
      'Opening Diesel (L)',
      'Diesel Filling (L)',
      'Total Diesel Consumed (L)',
      'Closing Diesel Stock (L)',
      'Cum Diesel Consumed (L)'
    ];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date,
      r.outageMinutes || 0,
      r.tripsCount || 0,
      `"${(r.outageReasons || '').replace(/"/g, '""')}"`,
      r.dg750Hours || 0,
      r.dg750Liters || 0,
      r.dg180Hours || 0,
      r.dg180Liters || 0,
      r.dayDieselOpening || 0,
      r.dayDieselFilling || 0,
      r.totalDieselConsumedLiters || 0,
      r.dayDieselClosing || 0,
      r.cumDiesel || 0
    ]);
    exportCsv(`SML_Feeds_Monthly_DG_Report_${selectedMonth}.csv`, headers, rows);
  };

  const handleExportSolarCsv = () => {
    const headers = [
      'Date',
      'Solar Gen (kWh)',
      'Solar Export (kWh)',
      'Net Mill Consumed (kWh)',
      'Offset %',
      'Cum Solar Gen (kWh)',
      'Cum Solar Export (kWh)'
    ];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date,
      r.solarDayGen || 0,
      r.solarDayExport || 0,
      r.netSolar || 0,
      r.solarOffsetPct || '0.0',
      r.cumSolarGen || 0,
      r.cumSolarExport || 0
    ]);
    exportCsv(`SML_Feeds_Monthly_Solar_Report_${selectedMonth}.csv`, headers, rows);
  };

  const handleExportMasterCsv = () => {
    const headers = [
      'Date',
      'Shift A (kWh)',
      'Shift B (kWh)',
      'Shift C (kWh)',
      'Day MWH',
      'Day MVAH',
      'Day kWh',
      'Day PF',
      'Cum kWh',
      'Cum PF',
      'Power Cut (Mins)',
      'DG 750 Run (Hrs)',
      'DG 180 Run (Hrs)',
      'Diesel Filled (L)',
      'Diesel Consumed (L)',
      'Closing Diesel (L)',
      'Solar Gen (kWh)',
      'Solar Export (kWh)',
      'Cum Solar (kWh)'
    ];
    const rows = (monthlyHistory?.records || []).map(r => [
      r.date,
      r.shiftAKwh || 0,
      r.shiftBKwh || 0,
      r.shiftCKwh || 0,
      r.dayTotalMwh,
      r.dayTotalMvah,
      r.dayTotalKwh,
      r.dayPowerFactor,
      r.cumKwh,
      r.cumulativePf,
      r.outageMinutes || 0,
      r.dg750Hours || 0,
      r.dg180Hours || 0,
      r.dayDieselFilling || 0,
      r.totalDieselConsumedLiters || 0,
      r.dayDieselClosing || 0,
      r.solarDayGen || 0,
      r.solarDayExport || 0,
      r.cumSolarGen || 0
    ]);
    exportCsv(`SML_Feeds_MASTER_Monthly_Consolidated_Report_${selectedMonth}.csv`, headers, rows);
  };

  // Helper for Printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* ==========================================
          TOP COMMAND HEADER & DATE CONTROLS
          ========================================== */}
      <div className="bg-gradient-to-r from-slate-900 via-[#062436] to-[#041c2c] border border-cyan-400/40 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-cyan-900/60">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shadow-lg">
              <Zap className="w-6 h-6 text-cyan-400" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Electrical Department Command Center
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  Unified Single-Screen Architecture
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-200/80 mt-0.5">
                {COMPANY_NAME} • {DIVISION_NAME} | 33kV Substation, DG Generator Reserves & Rooftop Solar
              </p>
            </div>
          </div>

          {/* Quick Date, Officer & Month Selectors */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
              <span className="text-[10px] text-cyan-300 uppercase font-bold block">Log Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 min-w-[200px]">
              <span className="text-[10px] text-cyan-300 uppercase font-bold block">Electrician / In-Charge</span>
              <input
                type="text"
                value={shiftOfficer}
                onChange={(e) => setShiftOfficer(e.target.value)}
                placeholder="Electrician Name"
                className="bg-transparent text-white font-bold text-xs focus:outline-none w-full"
              />
            </div>

            <button
              onClick={() => {
                setPosterMode('day');
                setIsPosterOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:brightness-110 shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Day Power Poster
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {notification && (
          <div className="mt-4 p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* ==========================================
          UPPER DASHBOARD: 2-COLUMN VIEW (ONE SCREEN)
          LEFT: SHIFT REPORT | RIGHT: DAY REPORT
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ==========================================
            LEFT SIDE: SHIFT REPORT
            (Shift Electrician submits at end of shift)
            ========================================== */}
        <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-300/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
                  <Zap className="w-5 h-5 text-[#00b4d8]" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>⚡ Shift Power Report</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                      {selectedShift}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Shift Electrician submits Active Energy (MWH), Apparent (MVAH) & Power Factor at shift end.
                  </p>
                </div>
              </div>

              {shiftSubmitted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Shift Logged
                </span>
              )}
            </div>

            {/* Shift Selector Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {['Shift A', 'Shift B', 'Shift C'].map((sh) => {
                const isSelected = selectedShift === sh;
                const hasData = !!shiftsData[sh];
                return (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => setSelectedShift(sh)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white border-transparent shadow-md shadow-cyan-500/20'
                        : hasData
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-[#07131b] text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <span>{sh}</span>
                    <span className="text-[10px] opacity-80 font-normal">
                      {sh === 'Shift A' ? '06:00-14:00' : sh === 'Shift B' ? '14:00-22:00' : '22:00-06:00'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Auto-Carry Forward Indicator */}
            {autoCarrySource && (
              <div className="mt-3 p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 text-cyan-800 dark:text-cyan-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  Starting readings auto-carried from {autoCarrySource}.
                </span>
              </div>
            )}

            {/* 1. MWH (Active Energy) Card */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Active Energy Meter (MWH)
                </span>
                <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 font-mono">
                  Diff: {shiftDiffMwh.toFixed(3)} MWH
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Shift Starting (MWH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={shiftStartMwh}
                    onChange={(e) => setShiftStartMwh(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Shift Ending (MWH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={shiftEndMwh}
                    onChange={(e) => setShiftEndMwh(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-900 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block">
                    Power Consumption
                  </span>
                  <div className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                    {shiftConsumedKwh.toLocaleString()} <span className="text-[10px] font-sans">kWh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MVAH (Apparent Energy) Card */}
            <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  Apparent Energy Meter (MVAH)
                </span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  Diff: {shiftDiffMvah.toFixed(3)} MVAH
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Shift Starting (MVAH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={shiftStartMvah}
                    onChange={(e) => setShiftStartMvah(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Shift Ending (MVAH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={shiftEndMvah}
                    onChange={(e) => setShiftEndMvah(e.target.value)}
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900 flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                    Apparent Energy
                  </span>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {shiftConsumedKvah.toLocaleString()} <span className="text-[10px] font-sans">kVAh</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Calculated Power Factor (PF = MWH / MVAH) Spotlight Card */}
            <div className={`mt-3 p-4 rounded-2xl border flex items-center justify-between ${
              parseFloat(shiftPowerFactor) >= 0.980
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                  Calculated Shift Power Factor (PF)
                </span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {shiftPowerFactor}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Formula: Shift MWH ÷ Shift MVAH ({shiftDiffMwh.toFixed(3)} ÷ {shiftDiffMvah.toFixed(3)})
                </span>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                  parseFloat(shiftPowerFactor) >= 0.980
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}>
                  {parseFloat(shiftPowerFactor) >= 0.980 ? '★ Optimal PF (> 0.98)' : '⚠️ Low PF Alert'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Avoids APCPDCL PF Surcharge
                </span>
              </div>
            </div>
          </div>

          {/* Shift Actions: Submit, WhatsApp Share & Local Poster Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleShareShiftWhatsApp}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                title="Share Shift Report to WhatsApp"
              >
                {shiftCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{shiftCopied ? 'Copied!' : 'WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPosterMode('shift');
                  setIsPosterOpen(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-[#0e2230] hover:bg-cyan-100 text-[#0077b6] dark:text-[#38bdf8] border border-cyan-200 dark:border-cyan-800 transition cursor-pointer"
                title="Create Graphic Shift Poster Locally & Download"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>Shift Poster</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveShiftPower}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:from-[#0096c7] hover:to-[#0369a1] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-500/25 active:scale-95 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit {selectedShift} Report</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            RIGHT SIDE: DAY REPORT
            (Morning A-Shift person sends 24h Day Report)
            ========================================== */}
        <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-300/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Activity className="w-5 h-5 text-amber-500" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📊 24-Hour Day Power Report</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Morning A-Shift
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Consolidates Shifts A, B & C, Day Cumulative, DG fuel, Power Cuts & Solar export.
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                reportStatus === 'Approved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200'
              }`}>
                {reportStatus === 'Approved' ? 'Approved by Manager' : 'Ready to Send'}
              </span>
            </div>

            {/* 3 Shifts Mini Status Strip */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              {['Shift A', 'Shift B', 'Shift C'].map((sh) => {
                const s = shiftsData[sh];
                return (
                  <div key={sh} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>{sh}</span>
                      <span className={s ? 'text-emerald-500' : 'text-amber-500'}>
                        {s ? '✓' : 'Pending'}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                      {s?.consumedKwh ? `${s.consumedKwh.toLocaleString()} kWh` : '--'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      PF: {s?.powerFactor || '--'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day Consumption & PF KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
              <div className="p-3 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/80 dark:border-cyan-900/60">
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 block mb-0.5">Day Power</span>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {dayTotalKwh.toLocaleString()} <span className="text-[10px]">kWh</span>
                </div>
                <span className="text-[10px] text-cyan-600 font-mono">{dayTotalMwh.toFixed(3)} MWH</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">Day PF</span>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {dayPowerFactor}
                </div>
                <span className="text-[10px] text-emerald-600">MWH ÷ MVAH</span>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/60">
                <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-300 block mb-0.5">MTD Units</span>
                <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {mtdKwh.toLocaleString()} <span className="text-[10px]">kWh</span>
                </div>
                <span className="text-[10px] text-sky-600 font-mono">{mtdMwh} MWH</span>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/80 dark:border-teal-900/60">
                <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 block mb-0.5">MTD Cum PF</span>
                <div className="text-lg font-black text-teal-600 dark:text-teal-400 font-mono">
                  {mtdPowerFactor}
                </div>
                <span className="text-[10px] text-teal-600">Cum MWH/MVAH</span>
              </div>
            </div>

            {/* Solar & Power Cut Interruption Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {/* Solar Log */}
              <div className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 space-y-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" />
                  Rooftop Solar Generation
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Day Gen (kWh)</label>
                    <input
                      type="number"
                      value={solarDayGen}
                      onChange={(e) => setSolarDayGen(e.target.value)}
                      className="w-full text-xs font-mono font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Export (kWh)</label>
                    <input
                      type="number"
                      value={solarDayExport}
                      onChange={(e) => setSolarDayExport(e.target.value)}
                      className="w-full text-xs font-mono font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Power Cut Outage Log */}
              <div className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-500" />
                    Power Cuts ({totalPowerCutMinutes} Mins Outage)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={newCutStart}
                    onChange={(e) => setNewCutStart(e.target.value)}
                    className="p-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Start"
                  />
                  <input
                    type="time"
                    value={newCutEnd}
                    onChange={(e) => setNewCutEnd(e.target.value)}
                    className="p-1 text-[11px] rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="End"
                  />
                  <input
                    type="text"
                    value={newCutReason}
                    onChange={(e) => setNewCutReason(e.target.value)}
                    className="p-1 text-[11px] flex-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    placeholder="Reason"
                  />
                  <button
                    type="button"
                    onClick={handleAddPowerCut}
                    className="p-1 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* DG 750 kVA & 180 kVA Fuel Audit */}
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800 space-y-2.5">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-orange-500" />
                DG Generator Reserves (Day Total Diesel: {totalDieselConsumedDay} Liters)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* DG 750 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-black text-amber-600 block mb-1">DG-1: 750 kVA (Heavy Line)</span>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Run Hrs</span>
                      <input
                        type="number"
                        step="0.1"
                        value={dg750.durationHours}
                        onChange={(e) => setDg750({ ...dg750, durationHours: parseFloat(e.target.value) || 0 })}
                        className="w-full p-1 font-mono font-bold border rounded bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Filling</span>
                      <input
                        type="number"
                        value={dg750.fillingLiters}
                        onChange={(e) => setDg750({ ...dg750, fillingLiters: parseFloat(e.target.value) || 0 })}
                        className="w-full p-1 font-mono font-bold border rounded bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Consumed</span>
                      <input
                        type="number"
                        value={dg750.consumptionLiters}
                        onChange={(e) => setDg750({ ...dg750, consumptionLiters: parseFloat(e.target.value) || 0 })}
                        className="w-full p-1 font-mono font-bold border rounded bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Closing</span>
                      <span className="font-mono font-black text-emerald-600 block mt-1">{dg750Closing} L</span>
                    </div>
                  </div>
                </div>

                {/* DG 180 */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-black text-sky-600 block mb-1">DG-2: 180 kVA (Boiler/Aux)</span>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Run Hrs</span>
                      <input
                        type="number"
                        step="0.1"
                        value={dg180.durationHours}
                        onChange={(e) => setDg180({ ...dg180, durationHours: parseFloat(e.target.value) || 0 })}
                        className="w-full p-1 font-mono font-bold border rounded bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Filling</span>
                      <input
                        type="number"
                        value={dg180.fillingLiters}
                        onChange={(e) => setDg180({ ...dg180, fillingLiters: parseFloat(e.target.value) || 0 })}
                        className="w-full p-1 font-mono font-bold border rounded bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Consumed</span>
                      <input
                        type="number"
                        value={dg180.consumptionLiters}
                        onChange={(e) => setDg180({ ...dg180, consumptionLiters: parseFloat(e.target.value) || 0 })}
                        className="w-full p-1 font-mono font-bold border rounded bg-slate-50 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block">Closing</span>
                      <span className="font-mono font-black text-emerald-600 block mt-1">{dg180Closing} L</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day Actions: Send Day Report, WhatsApp Share & Local Poster Button */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleShareDayWhatsApp}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer"
                title="Share 24H Day Report to WhatsApp"
              >
                {dayCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{dayCopied ? 'Copied!' : 'WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPosterMode('day');
                  setIsPosterOpen(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-[#0e2230] hover:bg-cyan-100 text-[#0077b6] dark:text-[#38bdf8] border border-cyan-200 dark:border-cyan-800 transition cursor-pointer"
                title="Create Graphic Day Poster Locally & Download"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-500" />
                <span>Day Poster</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePublishDayReport}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-95 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send 24H Day Power Report</span>
            </button>
          </div>
        </div>

      </div>

      {/* ==========================================
          BOTTOM HALF: MONTHLY REPORTS (3 SECTIONS ONE BY ONE)
          1. Day-Wise Monthly Power Report (Power & PF)
          2. Day-Wise Monthly DG Report (Power Cuts, Filling & Diesel)
          3. Day-Wise Monthly Solar Report (Generation & Export)
          4. Final Master Cumulative Section at the End
          ========================================== */}
      <div className="space-y-6 pt-4 border-t-2 border-slate-200/80 dark:border-slate-800">
        
        {/* Monthly Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-100 dark:bg-[#07131b] border border-slate-200/80 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-500" />
              <span>Monthly Electrical Audit & Historical Sheets</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily captured data automatically saves here into 3 specialized sheets + master cumulative summary.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-cyan-500" />
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Master All XLS</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
            SHEET 1: DAY-WISE MONTHLY POWER REPORT (POWER & PF)
            ---------------------------------------------------- */}
        <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Sheet 1: Day-Wise Monthly Power & PF Report</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shift A, B, C breakdown, Day Total kWh, Day PF, and Progressive Cumulative Units for {selectedMonth}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPowerCsv}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-500" />
                <span>Export Power XLS</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans">
                  <th className="py-2.5 px-3 font-bold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Shift A (kWh)</th>
                  <th className="py-2.5 px-3 font-semibold">Shift B (kWh)</th>
                  <th className="py-2.5 px-3 font-semibold">Shift C (kWh)</th>
                  <th className="py-2.5 px-3 font-bold text-sky-600">Day MWH</th>
                  <th className="py-2.5 px-3 font-bold text-sky-600">Day kWh</th>
                  <th className="py-2.5 px-3 font-bold text-emerald-600">Day PF</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-400">Cum MWH</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-400">Cum kWh</th>
                  <th className="py-2.5 px-3 font-bold text-teal-600">Cum PF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(monthlyHistory?.records || []).map((r) => (
                  <tr key={r.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold font-sans text-slate-900 dark:text-white">{r.date}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{r.shiftAKwh ? r.shiftAKwh.toLocaleString() : '--'}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{r.shiftBKwh ? r.shiftBKwh.toLocaleString() : '--'}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{r.shiftCKwh ? r.shiftCKwh.toLocaleString() : '--'}</td>
                    <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">{r.dayTotalMwh}</td>
                    <td className="py-2.5 px-3 font-black text-slate-900 dark:text-white">{r.dayTotalKwh ? r.dayTotalKwh.toLocaleString() : '--'}</td>
                    <td className="py-2.5 px-3 font-black text-emerald-600 dark:text-emerald-400">{r.dayPowerFactor}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.cumMwh}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700 dark:text-slate-300">{r.cumKwh?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-black text-teal-600 dark:text-teal-400">{r.cumulativePf}</td>
                  </tr>
                ))}
                {/* Summary Row */}
                <tr className="bg-cyan-50/50 dark:bg-[#071d2b] font-bold border-t-2 border-cyan-300 dark:border-cyan-800">
                  <td className="py-3 px-3 font-sans text-cyan-900 dark:text-cyan-200">MONTH TOTAL</td>
                  <td colSpan={3} className="py-3 px-3 text-slate-400 text-center font-sans">
                    {monthlyHistory?.totals?.daysCount || 0} Operating Days Logged
                  </td>
                  <td className="py-3 px-3 text-cyan-700 dark:text-cyan-300 font-black">{monthlyHistory?.totals?.cumMwh || 0} MWH</td>
                  <td className="py-3 px-3 text-cyan-700 dark:text-cyan-300 font-black">{monthlyHistory?.totals?.cumKwh?.toLocaleString() || 0} kWh</td>
                  <td className="py-3 px-3 text-slate-400">-</td>
                  <td className="py-3 px-3 text-cyan-700 dark:text-cyan-300 font-black">{monthlyHistory?.totals?.cumMwh || 0} MWH</td>
                  <td className="py-3 px-3 text-cyan-700 dark:text-cyan-300 font-black">{monthlyHistory?.totals?.cumKwh?.toLocaleString() || 0} kWh</td>
                  <td className="py-3 px-3 text-teal-600 dark:text-teal-400 font-black text-sm">{monthlyHistory?.totals?.overallPf || '0.985'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------------------------------------------
            SHEET 2: DAY-WISE MONTHLY DG REPORT (OUTAGES & DIESEL)
            ---------------------------------------------------- */}
        <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-orange-500" />
                <span>Sheet 2: Day-Wise Monthly DG & Power Cut Outage Report</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grid interruption minutes, DG 750 kVA & 180 kVA run hours, diesel filling, consumption and closing stock.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportDgCsv}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-orange-500" />
                <span>Export DG XLS</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans">
                  <th className="py-2.5 px-3 font-bold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Outage (Mins)</th>
                  <th className="py-2.5 px-3 font-semibold">Trips</th>
                  <th className="py-2.5 px-3 font-semibold">DG 750 Run (Hrs)</th>
                  <th className="py-2.5 px-3 font-semibold">DG 180 Run (Hrs)</th>
                  <th className="py-2.5 px-3 font-semibold">Opening (L)</th>
                  <th className="py-2.5 px-3 font-bold text-emerald-600">Filling (L)</th>
                  <th className="py-2.5 px-3 font-bold text-rose-600">Consumed (L)</th>
                  <th className="py-2.5 px-3 font-bold text-sky-600">Closing (L)</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-400">Cum Consumed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(monthlyHistory?.records || []).map((r) => (
                  <tr key={r.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold font-sans text-slate-900 dark:text-white">{r.date}</td>
                    <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">{r.outageMinutes || 0}m</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{r.tripsCount || 0}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{r.dg750Hours || 0} hrs</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{r.dg180Hours || 0} hrs</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.dayDieselOpening || 0} L</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">+{r.dayDieselFilling || 0} L</td>
                    <td className="py-2.5 px-3 font-black text-rose-600">{r.totalDieselConsumedLiters || 0} L</td>
                    <td className="py-2.5 px-3 font-bold text-sky-600">{r.dayDieselClosing || 0} L</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.cumDiesel || 0} L</td>
                  </tr>
                ))}
                {/* DG Summary Row */}
                <tr className="bg-orange-50/50 dark:bg-[#1a140d] font-bold border-t-2 border-orange-300 dark:border-orange-800">
                  <td className="py-3 px-3 font-sans text-orange-950 dark:text-orange-200">TOTAL DG AUDIT</td>
                  <td className="py-3 px-3 text-rose-600 font-black">{monthlyHistory?.totals?.cumOutageHours || 0} hrs</td>
                  <td className="py-3 px-3 text-slate-600">{monthlyHistory?.totals?.totalTrips || 0} Trips</td>
                  <td colSpan={3} className="py-3 px-3 text-slate-400 text-center font-sans">Diesel Stock Balances</td>
                  <td className="py-3 px-3 text-emerald-600 font-black">+{monthlyHistory?.totals?.cumDieselFilling || 0} L Filled</td>
                  <td className="py-3 px-3 text-rose-600 font-black">{monthlyHistory?.totals?.cumDiesel || 0} L Burned</td>
                  <td className="py-3 px-3 text-slate-400">-</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-black">{monthlyHistory?.totals?.cumDiesel || 0} L</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------------------------------------------
            SHEET 3: DAY-WISE MONTHLY SOLAR REPORT (GENERATION & EXPORT)
            ---------------------------------------------------- */}
        <div className="bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Sheet 3: Day-Wise Monthly Rooftop Solar Report</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily solar generation (kWh), export units to grid, self-consumption and clean energy offset %.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportSolarCsv}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-500" />
                <span>Export Solar XLS</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-sans">
                  <th className="py-2.5 px-3 font-bold">Date</th>
                  <th className="py-2.5 px-3 font-bold text-amber-600">Solar Gen (kWh)</th>
                  <th className="py-2.5 px-3 font-bold text-sky-600">Export Units (kWh)</th>
                  <th className="py-2.5 px-3 font-semibold">Net Mill Consumed (kWh)</th>
                  <th className="py-2.5 px-3 font-semibold">Mill Power Offset %</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-400">Cum Solar Gen (kWh)</th>
                  <th className="py-2.5 px-3 font-semibold text-slate-400">Cum Export (kWh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(monthlyHistory?.records || []).map((r) => (
                  <tr key={r.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold font-sans text-slate-900 dark:text-white">{r.date}</td>
                    <td className="py-2.5 px-3 font-black text-amber-600 dark:text-amber-400">{r.solarDayGen?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-sky-600">{r.solarDayExport || 0}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{r.netSolar?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600">{r.solarOffsetPct}%</td>
                    <td className="py-2.5 px-3 font-bold text-amber-700 dark:text-amber-300">{r.cumSolarGen?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.cumSolarExport?.toLocaleString()}</td>
                  </tr>
                ))}
                {/* Solar Summary Row */}
                <tr className="bg-amber-50/50 dark:bg-[#1f1908] font-bold border-t-2 border-amber-300 dark:border-amber-800">
                  <td className="py-3 px-3 font-sans text-amber-950 dark:text-amber-200">TOTAL SOLAR GEN</td>
                  <td className="py-3 px-3 text-amber-600 font-black">{monthlyHistory?.totals?.cumSolarGen?.toLocaleString() || 0} kWh</td>
                  <td className="py-3 px-3 text-sky-600 font-black">{monthlyHistory?.totals?.cumSolarExport?.toLocaleString() || 0} kWh</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-black">{monthlyHistory?.totals?.netSolarConsumed?.toLocaleString() || 0} kWh</td>
                  <td colSpan={1} className="py-3 px-3 text-emerald-600 font-black">Clean Energy Offset</td>
                  <td className="py-3 px-3 text-amber-600 font-black">{monthlyHistory?.totals?.cumSolarGen?.toLocaleString() || 0} kWh</td>
                  <td className="py-3 px-3 text-sky-600 font-black">{monthlyHistory?.totals?.cumSolarExport?.toLocaleString() || 0} kWh</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ----------------------------------------------------
            FINAL MASTER CUMULATIVE SECTION: MAIN POWER, DG & SOLAR
            ---------------------------------------------------- */}
        <div className="bg-gradient-to-r from-slate-900 via-[#071f2d] to-[#041620] border-2 border-cyan-400/50 rounded-3xl p-6 shadow-2xl text-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-cyan-800/60">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold mb-1 border border-cyan-400/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                End-of-Month Master Consolidation
              </div>
              <h3 className="text-xl font-black text-white">
                Cumulative Main Power, DG Reserves & Solar Energy Summary
              </h3>
              <p className="text-xs text-cyan-200/80">
                Official HT Substation Ledger • Month of {selectedMonth} ({monthlyHistory?.totals?.daysCount || 0} Audit Days)
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportMasterCsv}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:brightness-110 text-white rounded-xl text-xs font-black shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Master XLS (All Sheets)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-cyan-300" />
                <span>Print Master PDF</span>
              </button>
            </div>
          </div>

          {/* 3 Large Master Cumulative Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* 1. Main Power Cumulative */}
            <div className="p-5 rounded-2xl bg-white/5 border border-cyan-400/30 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-cyan-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  Cumulative Main Power
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                  33kV APCPDCL
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 uppercase block font-bold">Month Total Consumption</span>
                <div className="text-3xl font-black font-mono text-white">
                  {monthlyHistory?.totals?.cumKwh?.toLocaleString() || 0} <span className="text-sm text-cyan-300 font-sans">kWh</span>
                </div>
                <span className="text-xs text-cyan-200/80 font-mono">
                  Active Energy: {monthlyHistory?.totals?.cumMwh || 0} MWH
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Overall Month PF:</span>
                <span className="text-lg font-black text-emerald-400">
                  {monthlyHistory?.totals?.overallPf || '0.985'}
                </span>
              </div>
            </div>

            {/* 2. DG & Outage Cumulative */}
            <div className="p-5 rounded-2xl bg-white/5 border border-orange-400/30 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-orange-300 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-orange-400" />
                  Cumulative DG & Outages
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono">
                  750 + 180 kVA
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 uppercase block font-bold">Month Diesel Consumed</span>
                <div className="text-3xl font-black font-mono text-rose-300">
                  {monthlyHistory?.totals?.cumDiesel?.toLocaleString() || 0} <span className="text-sm font-sans">Liters</span>
                </div>
                <span className="text-xs text-orange-200/80 font-mono">
                  Total Filling: +{monthlyHistory?.totals?.cumDieselFilling || 0} Liters
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Total Grid Outage:</span>
                <span className="text-lg font-black text-rose-400">
                  {monthlyHistory?.totals?.cumOutageHours || 0} Hours ({monthlyHistory?.totals?.totalTrips || 0} Trips)
                </span>
              </div>
            </div>

            {/* 3. Solar Rooftop Cumulative */}
            <div className="p-5 rounded-2xl bg-white/5 border border-amber-400/30 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Cumulative Solar Clean Energy
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  Rooftop PV
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 uppercase block font-bold">Month Solar Generation</span>
                <div className="text-3xl font-black font-mono text-amber-300">
                  {monthlyHistory?.totals?.cumSolarGen?.toLocaleString() || 0} <span className="text-sm font-sans">kWh</span>
                </div>
                <span className="text-xs text-amber-200/80 font-mono">
                  Grid Export: {monthlyHistory?.totals?.cumSolarExport || 0} kWh
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Net Self-Consumed:</span>
                <span className="text-lg font-black text-emerald-400">
                  {monthlyHistory?.totals?.netSolarConsumed?.toLocaleString() || 0} kWh
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ==========================================
          POWER POSTER MODAL (SHIFT OR DAY)
          ========================================== */}
      {isPosterOpen && (
        <PowerPosterModal
          isOpen={isPosterOpen}
          onClose={() => setIsPosterOpen(false)}
          mode={posterMode}
          powerData={
            posterMode === 'shift'
              ? {
                  date,
                  shift: selectedShift,
                  electricalIncharge: shiftOfficer,
                  reportTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  startMwh: parseFloat(shiftStartMwh) || 0,
                  endMwh: parseFloat(shiftEndMwh) || 0,
                  diffMwh: shiftDiffMwh,
                  consumedKwh: shiftConsumedKwh,
                  startMvah: parseFloat(shiftStartMvah) || 0,
                  endMvah: parseFloat(shiftEndMvah) || 0,
                  diffMvah: shiftDiffMvah,
                  consumedKvah: shiftConsumedKvah,
                  powerFactor: shiftPowerFactor,
                  outageMinutes: totalPowerCutMinutes,
                  status: 'Verified & Logged'
                }
              : {
                  date,
                  electricalIncharge: shiftOfficer,
                  reportTime: new Date().toISOString(),
                  shifts: shiftsData,
                  dayTotalMwh,
                  dayTotalKwh,
                  dayTotalMvah,
                  dayPowerFactor,
                  mtdMwh,
                  mtdMvah,
                  mtdKwh,
                  mtdPowerFactor,
                  powerCuts,
                  totalPowerCutMinutes,
                  dg750: { ...dg750, closingLiters: dg750Closing },
                  dg180: { ...dg180, closingLiters: dg180Closing },
                  totalDieselConsumedLiters: totalDieselConsumedDay,
                  mtdDieselConsumed: monthlyHistory?.totals?.cumDiesel || 0,
                  solarDayGen: parseFloat(solarDayGen) || 0,
                  solarGenPct: solarGenPercentage,
                  solarDayExport: parseFloat(solarDayExport) || 0,
                  solarMtdGen: monthlyHistory?.totals?.cumSolarGen || 0,
                  status: reportStatus,
                  approvedBy
                }
          }
        />
      )}

    </div>
  );
}
