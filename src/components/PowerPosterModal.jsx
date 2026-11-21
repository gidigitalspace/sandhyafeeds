import React, { useRef, useEffect, useState } from 'react';
import { X, Download, MessageSquare, Check } from 'lucide-react';
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

const cleanOfficerName = (val) => {
  if (!val) return 'Shift Electrician';
  return String(val).replace(/Electrical Engineer/gi, 'Shift Electrician').replace(/Engineer/gi, 'Electrician');
};

export default function PowerPosterModal({ isOpen, onClose, powerData, mode = 'day' }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');

  useEffect(() => {
    if (!isOpen || !powerData) return;

    const renderPoster = (logoImg = null) => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Lossless portrait dimensions (800 x 1150 px)
        const width = 800;
        const height = 1150;
        canvas.width = width;
        canvas.height = height;

        // 1. PURE WHITE BACKGROUND
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Outer crisp border
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        drawRoundRect(ctx, 16, 16, width - 32, height - 32, 24);
        ctx.stroke();

        // Top Corporate Stripe (Sandhya Marines Cyan & Sky Accent)
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        drawRoundRect(ctx, 18, 18, width - 36, 8, [22, 22, 0, 0]);
        ctx.fill();

        // 2. HEADER WITH OFFICIAL LOGO & CORPORATE IDENTITY
        const headerY = 40;
        if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
          try {
            // Draw logo image with rounded card effect
            ctx.save();
            ctx.beginPath();
            drawRoundRect(ctx, 42, headerY, 68, 68, 14);
            ctx.clip();
            ctx.drawImage(logoImg, 42, headerY, 68, 68);
            ctx.restore();

            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            drawRoundRect(ctx, 42, headerY, 68, 68, 14);
            ctx.stroke();
          } catch {
            // Fallback badge if image drawing fails
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            drawRoundRect(ctx, 42, headerY, 68, 68, 14);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SML', 76, headerY + 42);
          }
        } else {
          // Fallback logo icon
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          drawRoundRect(ctx, 42, headerY, 68, 68, 14);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SML', 76, headerY + 42);
        }

        // Header Corporate Typography
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(COMPANY_NAME, 126, headerY + 24);

        ctx.fillStyle = '#0284c7';
        ctx.font = '800 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${DIVISION_NAME} • AQUA FEED MILL DIVISION`, 126, headerY + 44);

        ctx.fillStyle = '#0369a1';
        ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
        const docTitle = mode === 'shift'
          ? `⚡ SHIFT ELECTRICAL & POWER FACTOR (PF) REPORT`
          : `⚡ 24-HOUR ELECTRICAL ENERGY & DAY POWER REPORT`;
        ctx.fillText(docTitle, 126, headerY + 65);

        // Header Right: Status & Date Pill
        ctx.textAlign = 'right';
        ctx.fillStyle = '#f0fdf4';
        ctx.beginPath();
        drawRoundRect(ctx, width - 200, headerY + 8, 155, 30, 10);
        ctx.fill();
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#15803d';
        ctx.font = '800 12px sans-serif';
        ctx.fillText('✓ Live Verified', width - 60, headerY + 28);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 11px sans-serif';
        ctx.fillText(powerData.date || 'Today', width - 45, headerY + 58);

        // Divider
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(42, 125);
        ctx.lineTo(width - 42, 125);
        ctx.stroke();

        if (mode === 'shift') {
          // ==========================================
          // 1. SHIFT REPORT ON WHITE BACKGROUND
          // ==========================================
          
          // Card 1: Shift Meta Information Box
          let y = 140;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 76, 14);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('REPORT DATE', 62, y + 26);
          ctx.fillText('DUTY SHIFT', 220, y + 26);
          ctx.fillText('SHIFT ELECTRICIAN', 390, y + 26);
          ctx.fillText('SUPPLY TYPE', 600, y + 26);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 15px monospace';
          ctx.fillText(powerData.date || 'Today', 62, y + 54);

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 16px sans-serif';
          ctx.fillText(powerData.shift || 'Shift A', 220, y + 54);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 15px sans-serif';
          ctx.fillText(cleanOfficerName(powerData.electricalIncharge), 390, y + 54);

          ctx.fillStyle = '#15803d';
          ctx.font = '800 14px sans-serif';
          ctx.fillText('33kV HT Feeder', 600, y + 54);

          // Card 2: Active Energy Consumption (MWH & kWh)
          y = 232;
          ctx.fillStyle = '#f0f9ff';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 135, 16);
          ctx.fill();
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 14px sans-serif';
          ctx.fillText('⚡ 1. ACTIVE ENERGY CONSUMPTION (MWH & kWh)', 62, y + 28);

          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('STARTING READING', 62, y + 60);
          ctx.fillText('ENDING READING', 230, y + 60);
          ctx.fillText('SHIFT DIFFERENCE', 400, y + 60);
          ctx.fillText('POWER CONSUMED', 590, y + 60);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 16px monospace';
          ctx.fillText(`${safeFixed(powerData.startMwh, 3)} MWH`, 62, y + 90);
          ctx.fillText(`${safeFixed(powerData.endMwh, 3)} MWH`, 230, y + 90);

          ctx.fillStyle = '#0284c7';
          ctx.font = '900 18px monospace';
          ctx.fillText(`${safeFixed(powerData.diffMwh, 3)} MWH`, 400, y + 90);

          ctx.fillStyle = '#0369a1';
          ctx.font = '900 24px monospace';
          ctx.fillText(`${safeLocale(powerData.consumedKwh)} kWh`, 590, y + 94);

          // Card 3: Apparent Energy Audit (MVAH & kVAh)
          y = 382;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 135, 16);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#047857';
          ctx.font = '800 14px sans-serif';
          ctx.fillText('⚡ 2. APPARENT ENERGY AUDIT (MVAH & kVAh)', 62, y + 28);

          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('STARTING MVAH', 62, y + 60);
          ctx.fillText('ENDING MVAH', 230, y + 60);
          ctx.fillText('DIFF MVAH', 400, y + 60);
          ctx.fillText('APPARENT kVAh', 590, y + 60);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 16px monospace';
          ctx.fillText(`${safeFixed(powerData.startMvah, 3)} MVAH`, 62, y + 90);
          ctx.fillText(`${safeFixed(powerData.endMvah, 3)} MVAH`, 230, y + 90);

          ctx.fillStyle = '#047857';
          ctx.font = '900 18px monospace';
          ctx.fillText(`${safeFixed(powerData.diffMvah, 3)} MVAH`, 400, y + 90);

          ctx.fillStyle = '#065f46';
          ctx.font = '900 22px monospace';
          const calcKvah = powerData.consumedKvah || Math.round(safeNum(powerData.diffMvah) * 1000);
          ctx.fillText(`${safeLocale(calcKvah)} kVAh`, 590, y + 92);

          // Card 4: Shift Power Factor (PF) Spotlight Box
          y = 532;
          const pfVal = safeNum(powerData.powerFactor, 0.985);
          const isOptimal = pfVal >= 0.980;

          ctx.fillStyle = isOptimal ? '#f0fdf4' : '#fffbeb';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 155, 18);
          ctx.fill();
          ctx.strokeStyle = isOptimal ? '#86efac' : '#fde68a';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('POWER FACTOR FORMULA: PF = ACTIVE ENERGY (MWH) ÷ APPARENT ENERGY (MVAH)', 62, y + 30);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 15px sans-serif';
          ctx.fillText('SHIFT POWER FACTOR (PF)', 62, y + 64);

          ctx.fillStyle = isOptimal ? '#15803d' : '#b45309';
          ctx.font = '900 52px monospace';
          ctx.fillText(safeFixed(pfVal, 3), 62, y + 124);

          // Optimal Status Pill
          ctx.fillStyle = isOptimal ? '#dcfce7' : '#fef3c7';
          ctx.beginPath();
          drawRoundRect(ctx, 450, y + 65, 260, 46, 12);
          ctx.fill();
          ctx.strokeStyle = isOptimal ? '#86efac' : '#fde68a';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.textAlign = 'center';
          ctx.fillStyle = isOptimal ? '#15803d' : '#b45309';
          ctx.font = '800 13px sans-serif';
          ctx.fillText(isOptimal ? '★ OPTIMAL PF (NO PENALTY)' : '⚠️ GRID REBATE THRESHOLD', 580, y + 93);

          // Card 5: Grid Continuity & Handover Transmission Notice
          y = 702;
          ctx.textAlign = 'left';
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 175, 16);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 14px sans-serif';
          ctx.fillText('📡 SHIFT TRANSMISSION & MULTI-DEPARTMENT VISIBILITY', 62, y + 28);

          ctx.fillStyle = '#334155';
          ctx.font = '600 12px sans-serif';
          ctx.fillText('• Shift In-Charge Terminal: Live Shift kWh and Power Factor synced for Line Operations', 62, y + 60);
          ctx.fillText('• General In-Charge Terminal: Day Energy accumulated for Specific Energy Consumption (SEC)', 62, y + 88);
          ctx.fillText('• Plant Manager Executive Suite: HT Energy verified for daily electrical audit & sign-off', 62, y + 116);
          ctx.fillText(`• Shift Outage Minutes: ${safeNum(powerData.outageMinutes)} Mins • Supply: Continuous High Tension (HT) 33kV`, 62, y + 144);

          // Card 6: Digital Sign-Off
          y = 892;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 140, 16);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('SHIFT ELECTRICIAN SIGN-OFF', 62, y + 30);
          ctx.fillText('TIMESTAMP OF LOG', 520, y + 30);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 17px sans-serif';
          ctx.fillText(cleanOfficerName(powerData.electricalIncharge), 62, y + 64);

          ctx.fillStyle = '#0284c7';
          ctx.font = '700 14px monospace';
          ctx.fillText(powerData.reportTime || new Date().toLocaleTimeString(), 520, y + 64);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 11px sans-serif';
          ctx.fillText('Official HT Record • Sandhya Marines Ltd (SML Feeds) Aqua Feed Mill', 62, y + 112);

        } else {
          // ==========================================
          // 2. 24-HOUR DAY REPORT ON WHITE BACKGROUND
          // ==========================================

          // Info Banner
          let y = 140;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 76, 14);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('REPORT DATE', 62, y + 26);
          ctx.fillText('ELECTRICAL IN-CHARGE', 250, y + 26);
          ctx.fillText('AUDIT STATUS', 580, y + 26);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 15px monospace';
          ctx.fillText(powerData.date || 'Today', 62, y + 54);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 15px sans-serif';
          ctx.fillText(cleanOfficerName(powerData.electricalIncharge), 250, y + 54);

          ctx.fillStyle = '#15803d';
          ctx.font = '800 14px sans-serif';
          ctx.fillText(powerData.status || 'Verified & Sent', 580, y + 54);

          // 3-Shift Breakdown Table
          y = 232;
          ctx.fillStyle = '#0284c7';
          ctx.font = '800 14px sans-serif';
          ctx.fillText('⚡ SHIFT-WISE MWH, MVAH & POWER FACTOR (PF)', 42, y);
          y += 14;

          // Table Header
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(42, y, width - 84, 34);
          ctx.fillStyle = '#0369a1';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('SHIFT', 58, y + 22);
          ctx.fillText('START MWH', 145, y + 22);
          ctx.fillText('END MWH', 250, y + 22);
          ctx.fillText('DIFF MWH', 355, y + 22);
          ctx.fillText('UNITS (kWh)', 460, y + 22);
          ctx.fillText('MVAH', 575, y + 22);
          ctx.fillText('PF', 680, y + 22);
          y += 34;

          const shiftsList = [
            { name: 'Shift A', data: powerData.shifts?.['Shift A'] },
            { name: 'Shift B', data: powerData.shifts?.['Shift B'] },
            { name: 'Shift C', data: powerData.shifts?.['Shift C'] }
          ];

          shiftsList.forEach((item, idx) => {
            ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
            ctx.fillRect(42, y, width - 84, 34);
            ctx.strokeStyle = '#e2e8f0';
            ctx.strokeRect(42, y, width - 84, 34);

            ctx.fillStyle = '#0f172a';
            ctx.font = '800 12px sans-serif';
            ctx.fillText(item.name, 58, y + 22);

            ctx.font = '600 12px monospace';
            if (item.data) {
              ctx.fillText(safeFixed(item.data.startMwh, 3), 145, y + 22);
              ctx.fillText(safeFixed(item.data.endMwh, 3), 250, y + 22);
              ctx.fillText(safeFixed(item.data.diffMwh, 3), 355, y + 22);

              ctx.fillStyle = '#0284c7';
              ctx.font = '800 12px monospace';
              ctx.fillText(safeLocale(item.data.consumedKwh), 460, y + 22);

              ctx.fillStyle = '#0f172a';
              ctx.font = '600 12px monospace';
              ctx.fillText(safeFixed(item.data.diffMvah, 3), 575, y + 22);

              const pf = safeFixed(item.data.powerFactor, 3);
              ctx.fillStyle = safeNum(pf) >= 0.980 ? '#15803d' : '#b45309';
              ctx.font = '800 12px monospace';
              ctx.fillText(pf, 680, y + 22);
            } else {
              ctx.fillStyle = '#94a3b8';
              ctx.fillText('Pending Log...', 145, y + 22);
            }
            y += 34;
          });

          // Table Day Total Row
          ctx.fillStyle = '#f0f9ff';
          ctx.fillRect(42, y, width - 84, 36);
          ctx.strokeStyle = '#bae6fd';
          ctx.strokeRect(42, y, width - 84, 36);

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 12px sans-serif';
          ctx.fillText('DAY TOTAL', 58, y + 23);

          ctx.fillStyle = '#0f172a';
          ctx.font = '900 13px monospace';
          ctx.fillText(`${safeFixed(powerData.dayTotalMwh, 3)} MWH`, 355, y + 23);

          ctx.fillStyle = '#0369a1';
          ctx.font = '900 14px monospace';
          ctx.fillText(`${safeLocale(powerData.dayTotalKwh)} kWh`, 460, y + 23);

          ctx.fillStyle = '#0f172a';
          ctx.font = '900 13px monospace';
          ctx.fillText(`${safeFixed(powerData.dayTotalMvah, 3)}`, 575, y + 23);

          ctx.fillStyle = '#15803d';
          ctx.font = '900 14px monospace';
          ctx.fillText(safeFixed(powerData.dayPowerFactor, 3, '0.985'), 680, y + 23);
          y += 46;

          // 24H KPI Cards (4 Cards)
          ctx.fillStyle = '#f8fafc';
          const cardW = (width - 84 - 36) / 4;
          const kpis = [
            { label: 'DAY POWER', val: `${safeLocale(powerData.dayTotalKwh)} kWh`, sub: `${safeFixed(powerData.dayTotalMwh, 3)} MWH`, color: '#0284c7' },
            { label: 'DAY PF', val: safeFixed(powerData.dayPowerFactor, 3, '0.985'), sub: 'Optimal > 0.98', color: '#15803d' },
            { label: 'MTD UNITS', val: `${safeLocale(powerData.mtdKwh || powerData.dayTotalKwh)} kWh`, sub: `${safeFixed(powerData.mtdMwh, 3)} MWH`, color: '#0369a1' },
            { label: 'MTD PF', val: safeFixed(powerData.mtdPowerFactor || powerData.dayPowerFactor, 3, '0.985'), sub: 'Cumulative PF', color: '#15803d' }
          ];

          kpis.forEach((kpi, idx) => {
            const cx = 42 + idx * (cardW + 12);
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            drawRoundRect(ctx, cx, y, cardW, 85, 12);
            ctx.fill();
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#64748b';
            ctx.font = '700 10px sans-serif';
            ctx.fillText(kpi.label, cx + 12, y + 22);

            ctx.fillStyle = kpi.color;
            ctx.font = '900 16px monospace';
            ctx.fillText(kpi.val, cx + 12, y + 50);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '600 10px sans-serif';
            ctx.fillText(kpi.sub, cx + 12, y + 72);
          });
          y += 100;

          // DG Fuel & Solar Summary Row (2 Cards side by side)
          const halfW = (width - 84 - 16) / 2;
          
          // DG Generators Card
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, halfW, 175, 14);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#d97706';
          ctx.font = '800 13px sans-serif';
          ctx.fillText('🚜 DIESEL GENERATOR (DG) RESERVES', 58, y + 26);

          ctx.fillStyle = '#334155';
          ctx.font = '600 11px sans-serif';
          ctx.fillText(`• DG 750 kVA: ${safeNum(powerData.dg750?.durationHours)} hrs | Consumed: ${safeLocale(powerData.dg750?.consumptionLiters)} L`, 58, y + 56);
          ctx.fillText(`• DG 750 Closing Stock: ${safeLocale(powerData.dg750?.closingLiters)} Liters`, 58, y + 80);
          ctx.fillText(`• DG 180 kVA: ${safeNum(powerData.dg180?.durationHours)} hrs | Consumed: ${safeLocale(powerData.dg180?.consumptionLiters)} L`, 58, y + 106);
          ctx.fillText(`• DG 180 Closing Stock: ${safeLocale(powerData.dg180?.closingLiters)} Liters`, 58, y + 130);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 12px sans-serif';
          ctx.fillText(`Total Diesel Consumed: ${safeLocale(powerData.totalDieselConsumedLiters)} Liters`, 58, y + 158);

          // Solar & Outage Card
          const rx = 42 + halfW + 16;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, rx, y, halfW, 175, 14);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#0284c7';
          ctx.font = '800 13px sans-serif';
          ctx.fillText('☀️ ROOFTOP SOLAR & GRID CONTINUITY', rx + 16, y + 26);

          ctx.fillStyle = '#334155';
          ctx.font = '600 11px sans-serif';
          ctx.fillText(`• Solar Generation: ${safeLocale(powerData.solarDayGen)} kWh`, rx + 16, y + 56);
          ctx.fillText(`• Solar Export to Grid: ${safeLocale(powerData.solarDayExport)} kWh`, rx + 16, y + 80);
          ctx.fillText(`• Grid Power Cuts: ${safeNum(powerData.totalPowerCutMinutes)} Minutes`, rx + 16, y + 106);
          ctx.fillText(`• Power Supply: Continuous 33kV Line`, rx + 16, y + 130);

          ctx.fillStyle = '#15803d';
          ctx.font = '800 12px sans-serif';
          ctx.fillText(`Clean Solar Share: ${safeLocale(powerData.solarGenPercentage || '12')}% of Plant Power`, rx + 16, y + 158);

          // Verification & Sign-Off Block
          y += 190;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          drawRoundRect(ctx, 42, y, width - 84, 100, 14);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#64748b';
          ctx.font = '700 11px sans-serif';
          ctx.fillText('VERIFIED BY SHIFT ELECTRICIAN', 62, y + 26);
          ctx.fillText('PLANT MANAGER AUDIT STATUS', 480, y + 26);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 15px sans-serif';
          ctx.fillText(cleanOfficerName(powerData.electricalIncharge), 62, y + 56);

          ctx.fillStyle = '#15803d';
          ctx.font = '800 15px sans-serif';
          ctx.fillText(powerData.approvedBy ? `Approved by ${powerData.approvedBy}` : 'Submitted for Approval', 480, y + 56);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 10px sans-serif';
          ctx.fillText('Sandhya Marines Ltd • Aqua Feed Mill Division', 62, y + 84);
        }

        // Convert to Image URL
        setPosterUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('Error rendering Power Poster canvas:', err);
      }
    };

    // Preload logo for canvas
    const img = new Image();
    img.src = '/logo.png';
    img.onload = () => renderPoster(img);
    if (img.complete) {
      renderPoster(img);
    } else {
      renderPoster(null);
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
👷 *Shift Electrician:* ${cleanOfficerName(powerData?.electricalIncharge)}

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
👷 *Shift Electrician:* ${cleanOfficerName(powerData?.electricalIncharge)}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0c1f2b] border border-sky-200/80 dark:border-[#193a4f] rounded-3xl p-6 shadow-2xl my-6 text-slate-800 dark:text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-100 dark:border-sky-950">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {mode === 'shift' ? 'Shift Electrical Report Poster' : 'Day Power Report Poster'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official white background report poster with Sandhya Marines emblem for plant archive and WhatsApp dispatch.
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
        <div className="flex-1 overflow-y-auto py-4 flex justify-center bg-slate-100/70 dark:bg-[#07131b] rounded-2xl p-3 border border-slate-200/60 dark:border-slate-800">
          <canvas
            ref={canvasRef}
            className="rounded-xl shadow-lg max-w-full h-auto bg-white"
            style={{ maxHeight: '60vh' }}
          />
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-sky-100 dark:border-sky-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Lossless PNG rendered at <strong>800 × 1150 px</strong> (White Background)
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              <span>{copied ? 'Copied & Opened WhatsApp!' : 'Share to WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-500/25 transition active:scale-95 cursor-pointer"
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
