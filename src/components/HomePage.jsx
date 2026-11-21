import React, { useState } from 'react';
import { 
  Factory, 
  Zap, 
  Warehouse, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  UserCheck,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { DEPARTMENTS } from '../constants/feedData';

const iconMap = {
  Factory: Factory,
  Zap: Zap,
  Warehouse: Warehouse,
  TrendingUp: TrendingUp,
  ShieldCheck: ShieldCheck
};

export default function HomePage({ onOpenLogin }) {
  const [showProductionModal, setShowProductionModal] = useState(false);
  const productionDept = DEPARTMENTS.find(d => d.id === 'production');

  // Layout: 2 in Row 1, 2 in Row 2, and Plant Manager in Big across 2 rows
  const getGridPlacement = (id) => {
    switch (id) {
      case 'production':
        return 'order-1 lg:col-start-1 lg:row-start-1';
      case 'electrical':
        return 'order-2 lg:col-start-2 lg:row-start-1';
      case 'godown':
        return 'order-3 lg:col-start-1 lg:row-start-2';
      case 'sales':
        return 'order-4 lg:col-start-2 lg:row-start-2';
      case 'manager':
        return 'order-5 sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-2';
      default:
        return '';
    }
  };

  const handleCardClick = (dept) => {
    if (dept.id === 'production') {
      setShowProductionModal(true);
    } else {
      onOpenLogin(dept);
    }
  };

  return (
    <div className="space-y-4 py-2 animate-fade-in">
      
      {/* 
        GRID SPECIFICATION:
        - Row 1: Production Department, Electrical Department (2 in one row)
        - Row 2: Godown Department, Sales Department (2 in one row)
        - Plant Manager: Big executive card spanning two rows (lg:row-span-2)
        - Content: Strictly Department Name + Special Quote + Login Button
        - Strictly App Colors: Sandhya Marines Light Blue & Ocean Cyan (#00b4d8, #0284c7, #0077b6, #38bdf8)
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-1 pb-6 items-stretch">
        {DEPARTMENTS.map((dept) => {
          const Icon = iconMap[dept.icon] || Factory;
          const isManager = dept.id === 'manager';

          return (
            <div
              key={dept.id}
              onClick={() => handleCardClick(dept)}
              className={`group relative cursor-pointer rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-[#193a4f] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between ${
                isManager 
                  ? 'p-6 sm:p-8 ring-1 ring-cyan-400/50 dark:ring-cyan-500/40 shadow-cyan-500/10' 
                  : 'p-5 sm:p-6'
              } ${getGridPlacement(dept.id)}`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`absolute top-0 left-0 right-0 ${
                isManager 
                  ? 'h-2 sm:h-2.5 bg-gradient-to-r from-[#00b4d8] via-[#0284c7] to-[#0077b6]' 
                  : `h-1.5 sm:h-2 bg-gradient-to-r ${dept.gradient}`
              }`} />

              {isManager ? (
                /* ======================================================== */
                /* PLANT MANAGER: PURE PREMIUM (NAME + QUOTE ONLY)          */
                /* ======================================================== */
                <div className="relative flex flex-col justify-between h-full space-y-6">
                  
                  {/* Subtle Ambient Glow */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-400/15 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-400/10 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Faint SML Logo Watermark in Background */}
                  <div className="absolute -right-6 -bottom-6 w-44 h-44 opacity-[0.04] dark:opacity-[0.07] pointer-events-none select-none">
                    <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    {/* Executive Icon */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#00b4d8] via-[#0284c7] to-[#0077b6] text-white shadow-lg shadow-cyan-500/25 ring-4 ring-cyan-100 dark:ring-cyan-950/70 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
                      <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>

                    {/* Department Name */}
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-[#0096c7] dark:group-hover:text-cyan-400 transition-colors leading-tight">
                      {dept.name}
                    </h3>

                    {/* Special Quote Only */}
                    <p className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 italic leading-relaxed pt-1">
                      “{dept.quote}”
                    </p>
                  </div>

                  {/* Premium Login Button */}
                  <div className="relative z-10 pt-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(dept);
                      }}
                      className="w-full group/btn flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base text-white shadow-lg shadow-cyan-500/25 bg-gradient-to-r from-[#00b4d8] via-[#0284c7] to-[#0077b6] hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
                    </button>
                  </div>

                </div>
              ) : (
                /* ======================================================== */
                /* 4 DEPARTMENT CARDS: NAME + SPECIAL QUOTE ONLY            */
                /* ======================================================== */
                <>
                  <div className="space-y-3.5">
                    {/* Department Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/15 to-sky-400/20 text-[#0096c7] dark:text-[#38bdf8] border border-cyan-300/30 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[#0096c7] group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Department Name */}
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-[#0096c7] dark:group-hover:text-cyan-400 transition-colors leading-snug">
                      {dept.name}
                    </h3>

                    {/* Special Quote */}
                    <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 italic leading-relaxed pt-1">
                      “{dept.quote}”
                    </p>
                  </div>

                  {/* Login Button */}
                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(dept);
                      }}
                      className={`w-full group/btn flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-white shadow-md shadow-cyan-500/20 bg-gradient-to-r ${dept.gradient} hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer`}
                    >
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </>
              )}

            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* PRODUCTION ROLE SELECTION POPUP: SHIFT vs GENERAL        */}
      {/* ======================================================== */}
      {showProductionModal && productionDept && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowProductionModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white dark:bg-[#0c1f2b] border border-cyan-200/90 dark:border-[#193a4f] rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#00b4d8] to-[#0284c7]" />

            {/* Close Button */}
            <button
              onClick={() => setShowProductionModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#142e3f] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1.5 mb-6 pt-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0096c7] dark:text-[#38bdf8]">
                Production Department
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Select Operating Position
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your position to open your role-specific Firebase login page.
              </p>
            </div>

            {/* 2 Position Choice Cards */}
            <div className="space-y-3.5">
              
              {/* Option 1: Shift In-Charge */}
              <div
                onClick={() => {
                  setShowProductionModal(false);
                  onOpenLogin(productionDept, 'shift');
                }}
                className="group flex items-start gap-4 p-4 rounded-2xl border border-cyan-200/90 dark:border-[#193a4f] hover:border-cyan-400 dark:hover:border-cyan-500 bg-cyan-50/40 hover:bg-cyan-50/90 dark:bg-[#081822] dark:hover:bg-[#0c1f2b] transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-400 to-[#0284c7] text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base text-slate-900 dark:text-white group-hover:text-[#0096c7] dark:group-hover:text-cyan-400">
                      Shift In-Charge
                    </h4>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0096c7] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Shift handover notes, NMR manpower, machine run hours, packing output & machine breakdown logs.
                  </p>
                </div>
              </div>

              {/* Option 2: General In-Charge */}
              <div
                onClick={() => {
                  setShowProductionModal(false);
                  onOpenLogin(productionDept, 'general');
                }}
                className="group flex items-start gap-4 p-4 rounded-2xl border border-cyan-200/90 dark:border-[#193a4f] hover:border-cyan-400 dark:hover:border-cyan-500 bg-sky-50/40 hover:bg-sky-50/90 dark:bg-[#081822] dark:hover:bg-[#0c1f2b] transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-400 to-[#0077b6] text-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-base text-slate-900 dark:text-white group-hover:text-[#0096c7] dark:group-hover:text-cyan-400">
                      General In-Charge
                    </h4>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0096c7] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Day production report, total batch counts, input/output yield % & mill loss/gain consolidation.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
