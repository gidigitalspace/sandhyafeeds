import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy, Check, MessageSquare } from 'lucide-react';
import { COMPANY_NAME, DIVISION_NAME } from '../constants/feedData';

// Safe number parsers to strictly prevent any TypeError on string/undefined inputs
const safeNum = (val, fallback = 0) => {
  if (val === undefined || val === null || val === '') return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
};

const safeFixed = (val, decimals = 3, fallback = '0.000') => {
  if (val === undefined || val === null || val === '') return fallback;
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n.toFixed(decimals);
};

const safeLocale = (val, fallback = '0') => {
  if (val === undefined || val === null || val === '') return fallback;
  const n = Math.round(parseFloat(val) || 0);
  return isNaN(n) ? fallback : n.toLocaleString();
};

const drawRoundRect = (ctx, x, y, w, h, r = 12) => {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
};

export default function PowerPosterModal({ isOpen, onClose, powerData, mode = 'day' }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');

  useEffect(() => {
    if (!isOpen || !powerData) return;

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Canvas dimensions (portrait 800 x 1150 px)
      const width = 800;
      const height = 1150;
      canvas.width = width;
      canvas.height = height;

      // 1. Background Gradient (Deep Marine Navy)
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#041d2a');
      bgGrad.addColorStop(0.35, '#093c52');
      bgGrad.addColorStop(1, '#02121b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Decorative Top Accent Bar
      ctx.fillStyle = '#00b4d8';
      ctx.fillRect(0, 0, width, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(250, 12, 300, 4);

      // 2. Header: Company & Mill Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(COMPANY_NAME, width / 2, 60);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
      const subTitle = mode === 'shift' 
        ? `${DIVISION_NAME} • SHIFT ELECTRICAL POWER & PF REPORT`
        : `${DIVISION_NAME} • ELECTRICAL ENERGY & DAY POWER REPORT`;
      ctx.fillText(subTitle, width / 2, 88);

      if (mode === 'shift') {
        // ==========================================
        // SHIFT POSTER RENDERING
        // ==========================================
        // Info Banner
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, 110, width - 80, 85, 16);
        ctx.fill();
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px sans-serif';
        ctx.fillText('REPORT DATE', 65, 138);
        ctx.fillText('DUTY SHIFT', 230, 138);
        ctx.fillText('SHIFT ELECTRICIAN', 400, 138);
        ctx.fillText('TRANSMISSION', 600, 138);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 16px monospace';
        ctx.fillText(powerData.date || 'Today', 65, 168);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 16px sans-serif';
        ctx.fillText(powerData.shift || 'Shift A', 230, 168);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 15px sans-serif';
        ctx.fillText(powerData.electricalIncharge || 'Shift Electrician', 400, 168);

        ctx.fillStyle = '#10b981';
        ctx.font = '800 13px sans-serif';
        ctx.fillText('✓ Live Synced', 600, 168);

        // Section 1: Active Energy (MWH & kWh)
        let y = 225;
        ctx.fillStyle = 'rgba(0, 180, 216, 0.12)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, width - 80, 140, 18);
        ctx.fill();
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 15px sans-serif';
        ctx.fillText('⚡ 1. ACTIVE ENERGY CONSUMPTION (MWH & kWh)', 65, y + 30);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px sans-serif';
        ctx.fillText('STARTING READING', 65, y + 62);
        ctx.fillText('ENDING READING', 250, y + 62);
        ctx.fillText('SHIFT DIFFERENCE', 440, y + 62);
        ctx.fillText('POWER CONSUMED', 600, y + 62);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 17px monospace';
        ctx.fillText(`${safeFixed(powerData.startMwh, 3)} MWH`, 65, y + 92);
        ctx.fillText(`${safeFixed(powerData.endMwh, 3)} MWH`, 250, y + 92);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '900 19px monospace';
        ctx.fillText(`${safeFixed(powerData.diffMwh, 3)} MWH`, 440, y + 92);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 24px monospace';
        ctx.fillText(`${safeLocale(powerData.consumedKwh)} kWh`, 600, y + 95);

        // Section 2: Apparent Energy (MVAH & kVAh)
        y = 390;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, width - 80, 140, 18);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = '800 15px sans-serif';
        ctx.fillText('⚡ 2. APPARENT ENERGY AUDIT (MVAH & kVAh)', 65, y + 30);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px sans-serif';
        ctx.fillText('STARTING MVAH', 65, y + 62);
        ctx.fillText('ENDING MVAH', 250, y + 62);
        ctx.fillText('SHIFT DIFF MVAH', 440, y + 62);
        ctx.fillText('APPARENT kVAh', 600, y + 62);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 17px monospace';
        ctx.fillText(`${safeFixed(powerData.startMvah, 3)} MVAH`, 65, y + 92);
        ctx.fillText(`${safeFixed(powerData.endMvah, 3)} MVAH`, 250, y + 92);

        ctx.fillStyle = '#10b981';
        ctx.font = '900 19px monospace';
        ctx.fillText(`${safeFixed(powerData.diffMvah, 3)} MVAH`, 440, y + 92);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px monospace';
        const calcKvah = powerData.consumedKvah || Math.round(safeNum(powerData.diffMvah) * 1000);
        ctx.fillText(`${safeLocale(calcKvah)} kVAh`, 600, y + 93);

        // Section 3: Power Factor (Large Gauge / Spotlight Box)
        y = 555;
        const pfVal = safeNum(powerData.powerFactor, 0.985);
        const isOptimal = pfVal >= 0.980;

        ctx.fillStyle = isOptimal ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, width - 80, 160, 20);
        ctx.fill();
        ctx.strokeStyle = isOptimal ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 13px sans-serif';
        ctx.fillText('POWER FACTOR FORMULA: PF = ACTIVE ENERGY (MWH) ÷ APPARENT ENERGY (MVAH)', 65, y + 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 16px sans-serif';
        ctx.fillText('SHIFT POWER FACTOR (PF)', 65, y + 68);

        ctx.fillStyle = isOptimal ? '#10b981' : '#f59e0b';
        ctx.font = '900 56px monospace';
        ctx.fillText(safeFixed(pfVal, 3), 65, y + 130);

        // Status pill on the right
        ctx.fillStyle = isOptimal ? '#10b981' : '#f59e0b';
        ctx.beginPath();
        drawRoundRect(ctx, 450, y + 70, 280, 48, 12);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 14px sans-serif';
        ctx.fillText(isOptimal ? '★ OPTIMAL PF (NO PENALTY)' : '⚠️ GRID REBATE THRESHOLD', 590, y + 100);

        // Section 4: Grid Continuity & Handover Transmission Notice
        y = 740;
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, width - 80, 170, 18);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 15px sans-serif';
        ctx.fillText('📡 SHIFT TRANSMISSION & MULTI-DEPARTMENT VISIBILITY', 65, y + 32);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('• Shift In-Charge Terminal: Live Shift kWh and Power Factor synced for Line Operations', 65, y + 65);
        ctx.fillText('• General In-Charge Terminal: Day Energy accumulated for Specific Energy Consumption (SEC)', 65, y + 95);
        ctx.fillText('• Plant Manager Executive Suite: HT Energy verified for daily electrical audit & sign-off', 65, y + 125);
        ctx.fillText(`• Shift Outage Minutes: ${safeNum(powerData.outageMinutes)} Mins • Supply: Continuous High Tension (HT) 33kV`, 65, y + 152);

        // Section 5: Signature & Sign-Off
        y = 935;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, width - 80, 150, 18);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 12px sans-serif';
        ctx.fillText('DIGITAL SIGN-OFF', 65, y + 30);
        ctx.fillText('TIMESTAMP OF HANDOVER', 480, y + 30);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 18px sans-serif';
        ctx.fillText(powerData.electricalIncharge || 'Shift Electrician', 65, y + 65);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '700 13px monospace';
        ctx.fillText(powerData.reportTime || new Date().toLocaleTimeString(), 480, y + 65);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 12px sans-serif';
        ctx.fillText('Official HT Record • Sandhya Marines Ltd (SML Feeds) Aqua Feed Mill', 65, y + 120);

      } else {
        // ==========================================
        // DAY POSTER RENDERING (24h Day Poster)
        // ==========================================
        // Date & Officer Info Banner
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, 110, width - 80, 80, 16);
        ctx.fill();
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 12px sans-serif';
        ctx.fillText('REPORT DATE', 65, 138);
        ctx.fillText('ELECTRICAL IN-CHARGE', 250, 138);
        ctx.fillText('AUDIT STATUS', 580, 138);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 16px monospace';
        ctx.fillText(powerData.date || 'Today', 65, 166);

        ctx.font = '800 15px sans-serif';
        ctx.fillText(powerData.electricalIncharge || 'Electrical Engineer', 250, 166);

        ctx.fillStyle = '#10b981';
        ctx.font = '800 14px sans-serif';
        ctx.fillText(powerData.status || 'Verified & Sent', 580, 166);

        // 3. Shift-Wise Power Table (Shift A, Shift B, Shift C)
        let y = 215;
        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 16px sans-serif';
        ctx.fillText('⚡ SHIFT-WISE MWH, MVAH & POWER FACTOR (PF)', 40, y);
        y += 15;

        // Table Header
        ctx.fillStyle = 'rgba(0, 180, 216, 0.25)';
        ctx.fillRect(40, y, width - 80, 34);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '700 12px sans-serif';
        ctx.fillText('SHIFT', 55, y + 22);
        ctx.fillText('START MWH', 140, y + 22);
        ctx.fillText('END MWH', 240, y + 22);
        ctx.fillText('DIFF MWH', 340, y + 22);
        ctx.fillText('UNITS (kWh)', 445, y + 22);
        ctx.fillText('MVAH', 565, y + 22);
        ctx.fillText('POWER FACTOR', 665, y + 22);
        y += 34;

        const shiftsList = [
          { name: 'Shift A', data: powerData.shifts?.['Shift A'] },
          { name: 'Shift B', data: powerData.shifts?.['Shift B'] },
          { name: 'Shift C', data: powerData.shifts?.['Shift C'] }
        ];

        shiftsList.forEach((s, idx) => {
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(40, y, width - 80, 36);

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 13px sans-serif';
          ctx.fillText(s.name, 55, y + 23);

          ctx.fillStyle = '#cbd5e1';
          ctx.font = '600 12px monospace';
          ctx.fillText(s.data?.startMwh !== undefined && s.data?.startMwh !== null ? safeFixed(s.data.startMwh, 3) : '—', 140, y + 23);
          ctx.fillText(s.data?.endMwh !== undefined && s.data?.endMwh !== null ? safeFixed(s.data.endMwh, 3) : '—', 240, y + 23);

          ctx.fillStyle = '#38bdf8';
          ctx.font = '700 12px monospace';
          ctx.fillText(s.data?.diffMwh !== undefined && s.data?.diffMwh !== null ? safeFixed(s.data.diffMwh, 3) : '—', 340, y + 23);

          ctx.fillStyle = '#f59e0b';
          ctx.font = '800 13px monospace';
          ctx.fillText(s.data?.consumedKwh !== undefined && s.data?.consumedKwh !== null ? safeLocale(s.data.consumedKwh) : '—', 445, y + 23);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 12px monospace';
          ctx.fillText(s.data?.diffMvah !== undefined && s.data?.diffMvah !== null ? safeFixed(s.data.diffMvah, 3) : '—', 565, y + 23);

          ctx.fillStyle = '#10b981';
          ctx.font = '800 13px monospace';
          ctx.fillText(s.data?.powerFactor !== undefined && s.data?.powerFactor !== null ? safeFixed(s.data.powerFactor, 3) : '—', 665, y + 23);

          y += 36;
        });

        // 4. Day Total & Month-To-Date (MTD) Metrics Cards
        y += 20;
        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 16px sans-serif';
        ctx.fillText('📊 DAY CONSUMPTION & MONTH-TO-DATE (MTD) CUMULATIVE', 40, y);
        y += 15;

        const cardW = (width - 80 - 30) / 4;
        const cardH = 95;

        // Card 1: Day Total Power (kWh)
        ctx.fillStyle = 'rgba(0, 180, 216, 0.15)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, cardW, cardH, 14);
        ctx.fill();
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 11px sans-serif';
        ctx.fillText('DAY TOTAL POWER', 55, y + 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 20px monospace';
        ctx.fillText(`${safeLocale(powerData.dayTotalKwh)} kWh`, 55, y + 54);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '700 11px monospace';
        ctx.fillText(`${safeFixed(powerData.dayTotalMwh, 3)} MWH`, 55, y + 76);

        // Card 2: Day Power Factor (PF = MWH / MVAH)
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        drawRoundRect(ctx, 40 + cardW + 10, y, cardW, cardH, 14);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 11px sans-serif';
        ctx.fillText('DAY POWER FACTOR', 55 + cardW + 10, y + 24);
        ctx.fillStyle = '#10b981';
        ctx.font = '900 24px monospace';
        ctx.fillText(safeFixed(powerData.dayPowerFactor, 3, '0.985'), 55 + cardW + 10, y + 56);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 10px sans-serif';
        ctx.fillText('Formula: MWH ÷ MVAH', 55 + cardW + 10, y + 76);

        // Card 3: MTD Cumulative Units
        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.beginPath();
        drawRoundRect(ctx, 40 + (cardW + 10) * 2, y, cardW, cardH, 14);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 11px sans-serif';
        ctx.fillText('MTD CUMULATIVE UNITS', 55 + (cardW + 10) * 2, y + 24);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 20px monospace';
        ctx.fillText(`${safeLocale(powerData.mtdKwh || powerData.dayTotalKwh)} kWh`, 55 + (cardW + 10) * 2, y + 54);
        ctx.fillStyle = '#f59e0b';
        ctx.font = '700 11px monospace';
        ctx.fillText(`${safeFixed(powerData.mtdMwh || powerData.dayTotalMwh, 3)} MWH`, 55 + (cardW + 10) * 2, y + 76);

        // Card 4: MTD Cumulative PF
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        drawRoundRect(ctx, 40 + (cardW + 10) * 3, y, cardW, cardH, 14);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 11px sans-serif';
        ctx.fillText('MTD CUMULATIVE PF', 55 + (cardW + 10) * 3, y + 24);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '900 24px monospace';
        ctx.fillText(safeFixed(powerData.mtdPowerFactor || powerData.dayPowerFactor, 3, '0.985'), 55 + (cardW + 10) * 3, y + 56);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 10px sans-serif';
        ctx.fillText('Cum MWH ÷ Cum MVAH', 55 + (cardW + 10) * 3, y + 76);

        // 5. Diesel Generators (DG 750 kVA & DG 180 kVA)
        y += cardH + 25;
        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 16px sans-serif';
        ctx.fillText('🚜 DIESEL GENERATORS (DG 750 kVA & DG 180 kVA)', 40, y);
        y += 15;

        const halfW = (width - 80 - 15) / 2;
        const dgCardH = 150;

        // DG 750 kVA Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, halfW, dgCardH, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = '800 14px sans-serif';
        ctx.fillText('DG-1: 750 kVA HEAVY FEED LINE', 55, y + 26);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 12px sans-serif';
        ctx.fillText(`Run Time: ${safeNum(powerData.dg750?.durationHours)} hrs (${powerData.dg750?.startTime || '--'} to ${powerData.dg750?.endTime || '--'})`, 55, y + 50);
        ctx.fillText(`Opening Diesel: ${safeLocale(powerData.dg750?.openingLiters)} L  |  Filling: +${safeLocale(powerData.dg750?.fillingLiters)} L`, 55, y + 74);
        ctx.fillText(`Total Available: ${safeLocale(safeNum(powerData.dg750?.openingLiters) + safeNum(powerData.dg750?.fillingLiters))} Liters`, 55, y + 98);
        ctx.fillStyle = '#ef4444';
        ctx.font = '700 13px sans-serif';
        ctx.fillText(`Consumed: ${safeLocale(powerData.dg750?.consumptionLiters)} L`, 55, y + 125);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`Closing: ${safeLocale(powerData.dg750?.closingLiters)} L`, 220, y + 125);

        // DG 180 kVA Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        drawRoundRect(ctx, 40 + halfW + 15, y, halfW, dgCardH, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '800 14px sans-serif';
        ctx.fillText('DG-2: 180 kVA AUXILIARY & BOILER', 55 + halfW + 15, y + 26);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 12px sans-serif';
        ctx.fillText(`Run Time: ${safeNum(powerData.dg180?.durationHours)} hrs (${powerData.dg180?.startTime || '--'} to ${powerData.dg180?.endTime || '--'})`, 55 + halfW + 15, y + 50);
        ctx.fillText(`Opening Diesel: ${safeLocale(powerData.dg180?.openingLiters)} L  |  Filling: +${safeLocale(powerData.dg180?.fillingLiters)} L`, 55 + halfW + 15, y + 74);
        ctx.fillText(`Total Available: ${safeLocale(safeNum(powerData.dg180?.openingLiters) + safeNum(powerData.dg180?.fillingLiters))} Liters`, 55 + halfW + 15, y + 98);
        ctx.fillStyle = '#ef4444';
        ctx.font = '700 13px sans-serif';
        ctx.fillText(`Consumed: ${safeLocale(powerData.dg180?.consumptionLiters)} L`, 55 + halfW + 15, y + 125);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`Closing: ${safeLocale(powerData.dg180?.closingLiters)} L`, 220 + halfW + 15, y + 125);

        // 6. Solar Power & Power Cut Row
        y += dgCardH + 25;
        const secH = 110;

        // Solar Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, halfW, secH, 14);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = '800 14px sans-serif';
        ctx.fillText('☀️ ROOFTOP SOLAR POWER', 55, y + 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px monospace';
        ctx.fillText(`${safeLocale(powerData.solarDayGen)} kWh Gen`, 55, y + 56);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 12px sans-serif';
        ctx.fillText(`Export: ${safeLocale(powerData.solarDayExport)} kWh  |  Mill Offset: ${safeFixed(powerData.solarGenPct, 1, '12.8')}%`, 55, y + 84);

        // Power Cut Box
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        drawRoundRect(ctx, 40 + halfW + 15, y, halfW, secH, 14);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = '800 14px sans-serif';
        ctx.fillText('⚡ GRID POWER INTERRUPTIONS', 55 + halfW + 15, y + 26);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px monospace';
        ctx.fillText(`${safeNum(powerData.totalPowerCutMinutes)} Mins Outage`, 55 + halfW + 15, y + 56);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '600 12px sans-serif';
        const cutReason = powerData.powerCuts && powerData.powerCuts.length > 0 
          ? `${powerData.powerCuts[0].startTime}-${powerData.powerCuts[0].endTime} (${powerData.powerCuts[0].reason})`
          : 'Zero Trips / Continuous 33kV Supply';
        ctx.fillText(cutReason, 55 + halfW + 15, y + 84);

        // 7. Footer & Verification Sign-Off
        y += secH + 20;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.beginPath();
        drawRoundRect(ctx, 40, y, width - 80, 75, 12);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 11px sans-serif';
        ctx.fillText('VERIFIED BY ELECTRICAL IN-CHARGE', 55, y + 24);
        ctx.fillText('PLANT MANAGER AUDIT STATUS', 480, y + 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 14px sans-serif';
        ctx.fillText(powerData.electricalIncharge || 'K. Ramesh (Electrical Engineer)', 55, y + 48);

        ctx.fillStyle = '#10b981';
        ctx.font = '800 14px sans-serif';
        ctx.fillText(powerData.approvedBy ? `Approved by ${powerData.approvedBy}` : 'Submitted for Approval', 480, y + 48);
      }

      // Convert to Image URL
      setPosterUrl(canvas.toDataURL('image/png'));
    } catch (err) {
      console.error('Error rendering Power Poster canvas:', err);
    }
  }, [isOpen, powerData, mode]);

  const handleDownload = () => {
    if (!posterUrl) return;
    const link = document.createElement('a');
    const filename = mode === 'shift'
      ? `SML_Feeds_Shift_Power_Report_${powerData?.date || 'Today'}_${(powerData?.shift || 'Shift').replace(/\s+/g, '_')}.png`
      : `SML_Feeds_Day_Power_Report_${powerData?.date || 'Today'}.png`;
    link.download = filename;
    link.href = posterUrl;
    link.click();
  };

  const handleCopyWhatsApp = () => {
    let text = '';
    if (mode === 'shift') {
      text = `⚡ *SANDHYA MARINES LTD — SHIFT POWER REPORT*
🏭 *Division:* ${DIVISION_NAME}
📅 *Date:* ${powerData?.date || 'Today'}
⏰ *Duty Shift:* ${powerData?.shift || 'Shift A'}
👷 *Shift Electrician:* ${powerData?.electricalIncharge || 'Shift Electrician'}

⚡ *1. ACTIVE ENERGY (MWH):*
• *Starting MWH:* ${safeFixed(powerData?.startMwh, 3)}
• *Ending MWH:* ${safeFixed(powerData?.endMwh, 3)}
• *Shift Consumption:* ${safeFixed(powerData?.diffMwh, 3)} MWH (${safeLocale(powerData?.consumedKwh)} kWh)

⚡ *2. APPARENT ENERGY (MVAH):*
• *Starting MVAH:* ${safeFixed(powerData?.startMvah, 3)}
• *Ending MVAH:* ${safeFixed(powerData?.endMvah, 3)}
• *Shift MVAH:* ${safeFixed(powerData?.diffMvah, 3)} MVAH

🎯 *3. POWER FACTOR (PF):*
• *Calculated PF:* *${safeFixed(powerData?.powerFactor, 3, '0.985')}* (MWH ÷ MVAH)
• *Grid Compliance:* ${safeNum(powerData?.powerFactor, 0.985) >= 0.98 ? '★ Optimal PF (> 0.98)' : 'Compliant'}

⏱️ *GRID STATUS:*
• *Outage Duration:* ${safeNum(powerData?.outageMinutes)} Minutes
• *Supply Status:* Continuous HT Supply`;
    } else {
      text = `⚡ *SANDHYA MARINES LTD — DAY POWER REPORT*
🏭 *Division:* ${DIVISION_NAME}
📅 *Date:* ${powerData?.date || 'Today'}
👷 *In-Charge:* ${powerData?.electricalIncharge || 'Electrical Dept'}

⚡ *HT POWER CONSUMPTION (24 HRS):*
• *Shift A:* ${powerData?.shifts?.['Shift A']?.consumedKwh ? `${safeLocale(powerData.shifts['Shift A'].consumedKwh)} kWh (PF ${safeFixed(powerData.shifts['Shift A'].powerFactor, 3)})` : '—'}
• *Shift B:* ${powerData?.shifts?.['Shift B']?.consumedKwh ? `${safeLocale(powerData.shifts['Shift B'].consumedKwh)} kWh (PF ${safeFixed(powerData.shifts['Shift B'].powerFactor, 3)})` : '—'}
• *Shift C:* ${powerData?.shifts?.['Shift C']?.consumedKwh ? `${safeLocale(powerData.shifts['Shift C'].consumedKwh)} kWh (PF ${safeFixed(powerData.shifts['Shift C'].powerFactor, 3)})` : '—'}
• *Day Total Power:* ${safeLocale(powerData?.dayTotalKwh)} kWh (${safeFixed(powerData?.dayTotalMwh, 3)} MWH)
• *Day Power Factor:* *${safeFixed(powerData?.dayPowerFactor, 3, '0.985')}* (MWH ÷ MVAH)
• *MTD Cumulative Units:* ${safeLocale(powerData?.mtdKwh || powerData?.dayTotalKwh)} kWh
• *MTD Cumulative PF:* *${safeFixed(powerData?.mtdPowerFactor || powerData?.dayPowerFactor, 3, '0.985')}*

🚜 *DIESEL GENERATORS (DG FUEL):*
• *DG 750 kVA:* ${safeNum(powerData?.dg750?.durationHours)} hrs | Consumed: ${safeLocale(powerData?.dg750?.consumptionLiters)} L | Closing: ${safeLocale(powerData?.dg750?.closingLiters)} L
• *DG 180 kVA:* ${safeNum(powerData?.dg180?.durationHours)} hrs | Consumed: ${safeLocale(powerData?.dg180?.consumptionLiters)} L | Closing: ${safeLocale(powerData?.dg180?.closingLiters)} L
• *Day Total Diesel:* ${safeLocale(powerData?.totalDieselConsumedLiters)} Liters

☀️ *SOLAR GENERATION:*
• *Solar Day Gen:* ${safeLocale(powerData?.solarDayGen)} kWh | Export: ${safeLocale(powerData?.solarDayExport)} kWh

⏱️ *GRID POWER CUT:*
• *Outage Duration:* ${safeNum(powerData?.totalPowerCutMinutes)} Minutes (${safeFixed(safeNum(powerData?.totalPowerCutMinutes)/60, 1)} hrs)`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-[#193a4f] rounded-3xl p-6 shadow-2xl my-6 text-slate-800 dark:text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-100 dark:border-cyan-950">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {mode === 'shift' ? 'Shift Electrical Power Report Poster' : 'Day Power Report Poster'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-resolution executive power poster for Sandhya Marines Ltd plant archive and WhatsApp dispatch.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#142e3f] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Canvas Preview */}
        <div className="flex-1 overflow-y-auto py-4 flex justify-center">
          <canvas
            ref={canvasRef}
            className="rounded-2xl shadow-xl max-w-full h-auto border border-cyan-200/50 dark:border-cyan-900/50"
            style={{ maxHeight: '60vh' }}
          />
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-cyan-100 dark:border-cyan-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Rendered at <strong>800 × 1150 px</strong> (Lossless Graphic PNG)
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              <span>{copied ? 'Copied & Opened WhatsApp!' : 'Share to WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:brightness-105 text-white rounded-xl text-xs font-black shadow-md shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Poster (PNG)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
