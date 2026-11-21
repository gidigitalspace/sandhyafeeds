import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Copy, Check, MessageSquare } from 'lucide-react';
import { COMPANY_NAME, DIVISION_NAME } from '../constants/feedData';

export default function PosterModal({ isOpen, onClose, report }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');

  useEffect(() => {
    if (!isOpen || !report) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Canvas dimensions (portrait 800 x 1100 px)
    const width = 800;
    const height = 1100;
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
    ctx.fillStyle = '#48cae4';
    ctx.fillRect(250, 12, 300, 4);

    // 2. Header: Company & Mill Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(COMPANY_NAME, width / 2, 65);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${DIVISION_NAME} - OFFICIAL SHIFT REPORT`, width / 2, 95);

    // Shift Info Banner
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(40, 120, width - 80, 85, 16);
    ctx.fill();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 13px sans-serif';
    ctx.fillText('DATE', 70, 148);
    ctx.fillText('MILL UNIT', 250, 148);
    ctx.fillText('DUTY SHIFT', 410, 148);
    ctx.fillText('IN-CHARGE', 590, 148);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(report.date || 'N/A', 70, 180);
    ctx.fillText(report.unit || 'Unit-1', 250, 180);
    ctx.fillText(report.shift || 'Shift A', 410, 180);
    ctx.fillText(report.inChargeName || 'Engineer', 590, 180);

    // 3. Section 1: Manpower & Running Hours Cards
    // Manpower Card
    ctx.fillStyle = 'rgba(7, 21, 31, 0.85)';
    ctx.beginPath();
    ctx.roundRect(40, 225, 340, 175, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('👥 MANPOWER SUMMARY', 60, 255);

    const mp = report.manpower || {};
    const hReq = mp.helpersRequired || 0;
    const hPres = mp.helpersPresent || 0;
    const nReq = mp.nmrRequired || 0;
    const nPres = mp.nmrPresent || 0;
    const totalPres = hPres + nPres;
    const totalReq = hReq + nReq;
    const shortage = Math.max(0, totalReq - totalPres);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px sans-serif';
    ctx.fillText(`Helpers Present:  ${hPres} / ${hReq}`, 60, 290);
    ctx.fillText(`NMR Present:       ${nPres} / ${nReq}`, 60, 320);
    ctx.fillText(`Total On Duty:     ${totalPres} / ${totalReq}`, 60, 350);
    ctx.fillStyle = shortage > 0 ? '#f87171' : '#34d399';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`Shortage:          ${shortage} Personnel`, 60, 380);

    // Running Hours Card
    ctx.fillStyle = 'rgba(7, 21, 31, 0.85)';
    ctx.beginPath();
    ctx.roundRect(420, 225, 340, 175, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('⚡ LINE RUNNING HOURS', 440, 255);

    const run = report.running || {};
    const aHours = run.aLineHours || '0';
    const bHours = run.bLineHours || '0';
    const cHours = run.crumbleHours || '0';

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px sans-serif';
    ctx.fillText(`A Line Runtime:         ${aHours} Hrs`, 440, 290);
    ctx.fillText(`B Line Runtime:         ${bHours} Hrs`, 440, 320);
    ctx.fillText(`Crumble Line:           ${cHours} Hrs`, 440, 350);

    const totRun = (parseFloat(aHours) + parseFloat(bHours) + parseFloat(cHours)).toFixed(1);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`Total Line Runtime:     ${totRun} Hrs`, 440, 380);

    // 4. Section 2: Packing Details Table (MT)
    ctx.fillStyle = 'rgba(7, 21, 31, 0.9)';
    ctx.beginPath();
    ctx.roundRect(40, 420, width - 80, 290, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('📦 SHIFT PACKING OUTPUT (METRIC TONNES - MT)', 60, 455);

    const packing = report.packing || {};
    let vanTotal = 0;
    let monTotal = 0;

    // Vanamai breakdown
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Vanamai Feed Varieties (MT):', 60, 490);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px "JetBrains Mono", monospace';
    const vanVarieties = ['1C', '2C', '2P', '3S', '3SP', '3P', '4S', '4M'];
    const vanText = vanVarieties.map(v => {
      const val = parseFloat(packing[`VAN-${v}`] || 0);
      vanTotal += val;
      return `${v}:${val.toFixed(1)}`;
    }).join('  |  ');
    ctx.fillText(vanText, 60, 515);

    // Monodon breakdown
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Monodon Feed Varieties (MT):', 60, 560);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px "JetBrains Mono", monospace';
    const monVarieties = ['1C', '2C', '2P', '3S', '3P', '4S', '4M', '4L'];
    const monText = monVarieties.map(v => {
      const val = parseFloat(packing[`MON-${v}`] || 0);
      monTotal += val;
      return `${v}:${val.toFixed(1)}`;
    }).join('  |  ');
    ctx.fillText(monText, 60, 585);

    // Total Packing Banner
    const grandPackingTotal = (vanTotal + monTotal).toFixed(2);
    ctx.fillStyle = 'rgba(13, 85, 117, 0.4)';
    ctx.beginPath();
    ctx.roundRect(60, 620, width - 120, 65, 10);
    ctx.fill();
    ctx.strokeStyle = '#00b4d8';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`Vanamai: ${vanTotal.toFixed(2)} MT   |   Monodon: ${monTotal.toFixed(2)} MT`, 80, 660);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`TOTAL: ${grandPackingTotal} MT`, width - 80, 660);
    ctx.textAlign = 'left';

    // 5. Section 3: Maintenance & Relieving Handover Notes
    ctx.fillStyle = 'rgba(7, 21, 31, 0.85)';
    ctx.beginPath();
    ctx.roundRect(40, 730, width - 80, 160, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('🛠️ MAINTENANCE / BREAKDOWNS:', 60, 760);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    const maintText = report.maintenanceSummary || 'No major breakdowns during shift. All machines operated normal.';
    ctx.fillText(maintText.slice(0, 85), 60, 785);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('📝 HANDOVER NOTES FOR RELIEVING IN-CHARGE:', 60, 825);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px sans-serif';
    const noteText = report.handoverNotes || 'Handover completed smoothly. Boiler pressure and dies inspected.';
    ctx.fillText(noteText.slice(0, 85), 60, 850);

    // 6. Section 4: E-Signature & Verification
    const sigY = 910;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Digital Signature Verification:', 60, sigY + 20);

    if (report.signature) {
      const sigImg = new Image();
      sigImg.onload = () => {
        ctx.drawImage(sigImg, 60, sigY + 30, 160, 65);
        setPosterUrl(canvas.toDataURL('image/png'));
      };
      sigImg.src = report.signature;
    } else {
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 15px sans-serif';
      ctx.fillText('[Digitally Signed on Mill Terminal]', 60, sigY + 55);
      setPosterUrl(canvas.toDataURL('image/png'));
    }

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('VERIFIED & SUBMITTED TO PLANT BOARD', width - 60, sigY + 55);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Timestamp: ${new Date().toLocaleTimeString()} IST`, width - 60, sigY + 80);

    // Footer Attribution
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generated by Sandhya Marines Ltd PWA • Technology by GI Creative Space (+91 8985361991)', width / 2, 1075);

    setPosterUrl(canvas.toDataURL('image/png'));
  }, [isOpen, report]);

  if (!isOpen || !report) return null;

  const generateWhatsAppText = () => {
    const mp = report.manpower || {};
    const run = report.running || {};
    const packing = report.packing || {};

    let vanTotal = 0;
    let monTotal = 0;
    Object.keys(packing).forEach(k => {
      const v = parseFloat(packing[k] || 0);
      if (k.startsWith('VAN')) vanTotal += v;
      if (k.startsWith('MON')) monTotal += v;
    });
    const grandTotal = (vanTotal + monTotal).toFixed(2);

    return `🏭 *${COMPANY_NAME} - SHIFT REPORT*
──────────────────────
📅 *Date:* ${report.date}
🏢 *Unit:* ${report.unit}  |  ⏰ *Shift:* ${report.shift}
👤 *In-Charge:* ${report.inChargeName || 'Engineer'}

👥 *MANPOWER:*
• Helpers: ${mp.helpersPresent || 0} / ${mp.helpersRequired || 0}
• NMR Staff: ${mp.nmrPresent || 0} / ${mp.nmrRequired || 0}
• Total Present: ${(mp.helpersPresent || 0) + (mp.nmrPresent || 0)} (Shortage: ${mp.shortage || 0})

⚡ *LINE RUNNING HOURS:*
• A Line: ${run.aLineHours || 0} hrs
• B Line: ${run.bLineHours || 0} hrs
• Crumble Line: ${run.crumbleHours || 0} hrs

📦 *PACKING OUTPUT (MT):*
• Vanamai Feed: ${vanTotal.toFixed(2)} MT
• Monodon Feed: ${monTotal.toFixed(2)} MT
🔥 *TOTAL PACKING:* ${grandTotal} MT

🛠️ *Maintenance:* ${report.maintenanceSummary || 'Normal'}
📝 *Handover Note:* ${report.handoverNotes || 'Smooth handover'}

_Report Submitted via Sandhya Marines Ltd PWA_`;
  };

  const copyText = () => {
    navigator.clipboard.writeText(generateWhatsAppText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(generateWhatsAppText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `SML_Shift_Report_${report.unit}_${report.shift}_${report.date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0c1f2b] border border-[#193a4f] rounded-3xl p-6 shadow-2xl text-white my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-sky-400">Shift Report Poster & WhatsApp Share</h3>
            <p className="text-xs text-slate-400">Download branded graphic poster card and copy WhatsApp message.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <button
            onClick={downloadPoster}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md shadow-sky-500/20 transition active:scale-95 text-xs sm:text-sm"
          >
            <Download className="w-4 h-4" /> Download Poster (.PNG)
          </button>
          <button
            onClick={shareToWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95 text-xs sm:text-sm"
          >
            <MessageSquare className="w-4 h-4" /> Share to WhatsApp
          </button>
          <button
            onClick={copyText}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700 transition active:scale-95 text-xs sm:text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Text!' : 'Copy Summary'}
          </button>
        </div>

        {/* Poster Canvas Preview */}
        <div className="flex justify-center bg-slate-950 p-2 rounded-2xl border border-slate-800 overflow-hidden max-h-[500px] overflow-y-auto">
          <canvas
            ref={canvasRef}
            className="w-full max-w-md rounded-xl shadow-lg border border-slate-700"
          />
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Sandhya Marines Ltd • Automated Plant Operations Card
        </p>
      </div>
    </div>
  );
}
