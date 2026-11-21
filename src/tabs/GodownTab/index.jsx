import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Save, 
  Lock, 
  Edit3, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { 
  FEED_TYPES, 
  ALL_VARIETIES, 
  getTodayDateString 
} from '../../constants/feedData';
import { 
  getGodownStock, 
  saveGodownStock, 
  getDayProductionReport 
} from '../../services/storage';

export default function GodownTab({ activeUser, onUpdateActiveUser }) {
  const [date, setDate] = useState(getTodayDateString());
  const [stockData, setStockData] = useState({});
  const [selectedType, setSelectedType] = useState('ALL');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadStock();
  }, [date]);

  const loadStock = async () => {
    const data = await getGodownStock(date);
    const approvedDayReport = await getDayProductionReport(date);
    const prodTotals = approvedDayReport?.status === 'Approved' ? (approvedDayReport.varietyTotals || {}) : {};

    const merged = { ...data };
    ALL_VARIETIES.forEach(item => {
      if (!merged[item.variety]) {
        merged[item.variety] = {
          type: item.type,
          variety: item.variety,
          openingMT: 30.0,
          productionMT: 0,
          salesMT: 0,
          closingMT: 30.0
        };
      }
      const approvedMT = parseFloat(prodTotals[item.variety] || prodTotals[`VAN-${item.variety}`] || prodTotals[`MON-${item.variety}`] || 0);
      if (approvedMT > 0) {
        merged[item.variety].productionMT = approvedMT;
        merged[item.variety].closingMT = Math.max(0, (merged[item.variety].openingMT || 0) + approvedMT - (merged[item.variety].salesMT || 0));
      }
    });

    setStockData(merged);
  };

  // Godown team is STRICTLY RESTRICTED to only edit Opening Stock!
  const handleOpeningChange = (variety, value) => {
    const val = Math.max(0, parseFloat(value) || 0);
    setStockData(prev => {
      const item = prev[variety] || { variety, openingMT: 0, productionMT: 0, salesMT: 0 };
      const updatedItem = {
        ...item,
        openingMT: val,
        closingMT: Math.max(0, val + (item.productionMT || 0) - (item.salesMT || 0))
      };
      return {
        ...prev,
        [variety]: updatedItem
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveGodownStock(date, stockData);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const filteredVarieties = ALL_VARIETIES.filter(v => {
    if (selectedType === 'ALL') return true;
    return v.type === selectedType;
  });

  const totalOpening = Object.values(stockData).reduce((acc, curr) => acc + (parseFloat(curr.openingMT) || 0), 0);
  const totalProduction = Object.values(stockData).reduce((acc, curr) => acc + (parseFloat(curr.productionMT) || 0), 0);
  const totalSales = Object.values(stockData).reduce((acc, curr) => acc + (parseFloat(curr.salesMT) || 0), 0);
  const totalClosing = Object.values(stockData).reduce((acc, curr) => acc + (parseFloat(curr.closingMT) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                <Warehouse className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Godown Department Stock Management
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Single Central Mill Godown: Update daily <strong>Opening Stock (MT)</strong> for all 16 feed varieties.
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
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#00b4d8] to-[#0284c7] hover:from-[#0096c7] hover:to-[#0369a1] text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Opening Stock'}
            </button>
          </div>
        </div>

        {/* Security & Access Restriction Notice */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Access Restriction:</strong> Godown staff can strictly only edit the <strong>Opening Stock (MT)</strong> column. Production & Sales columns are read-only.
            </span>
          </div>
        </div>

        {isSaved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Godown Opening Stock saved successfully.
          </div>
        )}
      </div>

      {/* KPI Cards: Opening Stock, Received Prod, Dispatched, Closing Balance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-sky-300 dark:border-sky-800 shadow-sm ring-1 ring-sky-500/20">
          <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block mb-1">
            Total Opening Stock (Editable)
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totalOpening.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Received Production (Locked)
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {totalProduction.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Dispatched Sales (Locked)
          </span>
          <div className="text-xl font-black text-rose-500">
            {totalSales.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Current Balance Stock
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totalClosing.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs: All, Vanamai, Monodon */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#0c1f2b] rounded-xl w-fit">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedType === 'ALL'
              ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All 16 Varieties
        </button>
        <button
          onClick={() => setSelectedType(FEED_TYPES.VANAMAI)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedType === FEED_TYPES.VANAMAI
              ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🦐 Vanamai Feed (8)
        </button>
        <button
          onClick={() => setSelectedType(FEED_TYPES.MONODON)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedType === FEED_TYPES.MONODON
              ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🦞 Monodon Feed (8)
        </button>
      </div>

      {/* Godown Stock Table */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-bold">Feed Variety</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold text-sky-600 dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/20">
                  <div className="flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Opening Stock (MT) *</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Received Production (MT)</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Dispatched Sales (MT)</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-bold text-right">Balance Stock (MT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {filteredVarieties.map(item => {
                const row = stockData[item.variety] || { openingMT: 0, productionMT: 0, salesMT: 0, closingMT: 0 };
                return (
                  <tr key={item.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-sans font-extrabold text-slate-900 dark:text-white">
                      {item.variety}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-500">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.type === FEED_TYPES.VANAMAI ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600' : 'bg-teal-50 dark:bg-teal-950/40 text-teal-600'
                      }`}>
                        {item.type.split(' ')[0]}
                      </span>
                    </td>

                    {/* ONLY THIS COLUMN IS EDITABLE */}
                    <td className="py-2.5 px-4 bg-sky-50/30 dark:bg-sky-950/10">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={row.openingMT ?? ''}
                        onChange={(e) => handleOpeningChange(item.variety, e.target.value)}
                        className="w-28 p-2 rounded-xl border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-sky-500"
                      />
                    </td>

                    {/* Read-Only: Received Production */}
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      {row.productionMT?.toFixed(2) || '0.00'} MT
                    </td>

                    {/* Read-Only: Sales */}
                    <td className="py-3 px-4 text-rose-500 font-bold">
                      {row.salesMT?.toFixed(2) || '0.00'} MT
                    </td>

                    {/* Calculated Balance */}
                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                      {row.closingMT?.toFixed(2) || '0.00'} MT
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
