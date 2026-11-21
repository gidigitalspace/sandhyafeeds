import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Save, 
  Lock, 
  CheckCircle2, 
  Scale 
} from 'lucide-react';
import { 
  FEED_VARIETIES, 
  FEED_TYPES, 
  getTodayDateString 
} from '../../constants/feedData';
import { 
  getGodownStock, 
  getDayProductionReport, 
  getSalesData, 
  saveSalesData 
} from '../../services/storage';

export default function SalesTab({ activeUser, onUpdateActiveUser }) {
  const [date, setDate] = useState(getTodayDateString());
  const [selectedFeedType, setSelectedFeedType] = useState(FEED_TYPES.VANAMAI);
  const [salesEntries, setSalesEntries] = useState({});
  const [godownStock, setGodownStock] = useState({});
  const [approvedProduction, setApprovedProduction] = useState({});
  const [isProductionApproved, setIsProductionApproved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [date]);

  const loadData = async () => {
    const gStock = await getGodownStock(date);
    setGodownStock(gStock || {});

    const dayReport = await getDayProductionReport(date);
    const isApproved = dayReport?.status === 'Approved';
    setIsProductionApproved(isApproved);
    setApprovedProduction(dayReport?.varietyTotals || {});

    const salesRec = await getSalesData(date);
    const existingEntries = salesRec?.entries || {};
    
    if (Object.keys(existingEntries).length === 0) {
      existingEntries['2P'] = 10.0;
      existingEntries['3S'] = 18.5;
      existingEntries['3P'] = 15.0;
      existingEntries['4S'] = 8.0;
    }
    setSalesEntries(existingEntries);
  };

  const handleSalesChange = (variety, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setSalesEntries(prev => ({
      ...prev,
      [variety]: num
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveSalesData(date, salesEntries);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const varieties = FEED_VARIETIES[selectedFeedType] || [];

  let totOpening = 0;
  let totProd = 0;
  let totSales = 0;
  let totClosing = 0;

  varieties.forEach(v => {
    const gItem = godownStock[v] || {};
    const open = parseFloat(gItem.openingMT || 30.0);
    const prod = parseFloat(approvedProduction[v] || approvedProduction[`VAN-${v}`] || approvedProduction[`MON-${v}`] || gItem.productionMT || 0);
    const sales = parseFloat(salesEntries[v] || 0);
    const closing = Math.max(0, (open + prod) - sales);

    totOpening += open;
    totProd += prod;
    totSales += sales;
    totClosing += closing;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                <TrendingUp className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Sales Department Sheet & Dispatch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily Sales Entry (MT) & Automatic Closing Stock Calculation across feed varieties.
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
              {isSaving ? 'Saving...' : 'Save Sales Report'}
            </button>
          </div>
        </div>

        {/* Formula Bar Callout */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Scale className="w-4 h-4 text-sky-500 shrink-0" />
            <span>
              <strong>Closing Stock Formula:</strong> <code className="font-mono bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded text-sky-700 dark:text-sky-300 font-bold">Closing Stock = (Opening Stock + Day Production) - Sales</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Production Sync:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isProductionApproved 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800'
            }`}>
              {isProductionApproved ? 'Approved by Manager' : 'Pending Manager Approval'}
            </span>
          </div>
        </div>

        {isSaved && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Sales data saved and Closing Stock balance updated in central ledger.
          </div>
        )}
      </div>

      {/* KPI Cards: Opening MT, Production MT, Sales MT, Closing Stock MT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Total Opening Stock (Godown)
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totOpening.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
            Total Production (Approved)
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {totProd.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-rose-300 dark:border-rose-900 shadow-sm ring-1 ring-rose-500/20">
          <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">
            Total Dispatched Sales
          </span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">
            {totSales.toFixed(2)} <span className="text-xs font-semibold text-rose-400">MT</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1f2b] border border-sky-300 dark:border-sky-800 shadow-sm ring-1 ring-sky-500/20">
          <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 block mb-1">
            Total Closing Stock (Calculated)
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totClosing.toFixed(2)} <span className="text-xs font-semibold text-slate-400">MT</span>
          </div>
        </div>
      </div>

      {/* Feed Type Switcher (Vanamai vs Monodon) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-[#0c1f2b] rounded-2xl border border-slate-200 dark:border-[#193a4f] w-fit">
        <button
          onClick={() => setSelectedFeedType(FEED_TYPES.VANAMAI)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            selectedFeedType === FEED_TYPES.VANAMAI
              ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🦐 Vanamai Feed (8 Varieties)</span>
        </button>

        <button
          onClick={() => setSelectedFeedType(FEED_TYPES.MONODON)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            selectedFeedType === FEED_TYPES.MONODON
              ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🦞 Monodon Feed (8 Varieties)</span>
        </button>
      </div>

      {/* Sales Sheet Table */}
      <div className="bg-white dark:bg-[#0c1f2b] border border-slate-200 dark:border-[#193a4f] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-bold">Feed Variety</th>
                <th className="py-3 px-4 font-bold">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Opening Stock (MT)</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Day Production (MT)</span>
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">Total Available (MT)</th>
                <th className="py-3 px-4 font-bold text-rose-500 bg-rose-50/50 dark:bg-rose-950/20">
                  <span>Today's Sales (MT) *</span>
                </th>
                <th className="py-3 px-4 font-bold text-right text-sky-600 dark:text-sky-400">
                  <span>Closing Stock (MT)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {varieties.map(variety => {
                const gItem = godownStock[variety] || {};
                const openMT = parseFloat(gItem.openingMT || 30.0);
                const prodMT = parseFloat(approvedProduction[variety] || approvedProduction[`VAN-${variety}`] || approvedProduction[`MON-${variety}`] || gItem.productionMT || 0);
                const availableMT = openMT + prodMT;
                const saleMT = parseFloat(salesEntries[variety] || 0);
                const closingMT = Math.max(0, availableMT - saleMT);

                return (
                  <tr key={variety} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-sans font-black text-sm text-slate-900 dark:text-white">
                      {variety}
                    </td>

                    {/* Read-Only: Opening Stock from Godown */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-bold">
                      {openMT.toFixed(2)} MT
                    </td>

                    {/* Read-Only: Production Output from General In-Charge */}
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      {prodMT.toFixed(2)} MT
                    </td>

                    {/* Read-Only: Available = Opening + Production */}
                    <td className="py-3.5 px-4 text-slate-500 font-bold">
                      {availableMT.toFixed(2)} MT
                    </td>

                    {/* ONLY THIS COLUMN IS EDITABLE BY SALES TEAM */}
                    <td className="py-2.5 px-4 bg-rose-50/30 dark:bg-rose-950/10">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={salesEntries[variety] ?? ''}
                        onChange={(e) => handleSalesChange(variety, e.target.value)}
                        placeholder="0.0"
                        className="w-28 p-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-rose-500"
                      />
                    </td>

                    {/* Auto-Calculated Closing Stock */}
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                      {closingMT.toFixed(2)} MT
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
