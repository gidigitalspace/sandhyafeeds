import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  LogOut, 
  Database, 
  Factory, 
  Zap, 
  Warehouse, 
  TrendingUp, 
  ShieldCheck,
  LayoutGrid,
  Building2,
  Layers,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { 
  DEPARTMENTS, 
  COMPANY_NAME, 
  DIVISION_NAME, 
  getCurrentShift 
} from '../constants/feedData';
import { isFirebaseConnected } from '../services/firebase';

const iconMap = {
  Factory: Factory,
  Zap: Zap,
  Warehouse: Warehouse,
  TrendingUp: TrendingUp,
  ShieldCheck: ShieldCheck
};

export default function Header({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  activeUser, 
  onLogout,
  onOpenFirebaseModal,
  pendingApprovalsCount = 0,
  onGoHome,
  electricalSubTab = 'shift',
  setElectricalSubTab
}) {
  const isCloud = isFirebaseConnected();
  const currentDept = DEPARTMENTS.find(d => d.id === activeTab);
  const currentShift = getCurrentShift();
  const isHome = activeTab === 'home';

  // Live real-time clock for status bar
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = `${currentDateTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })} • ${currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#07131b]/95 backdrop-blur-md border-b border-cyan-200/80 dark:border-cyan-950 transition-colors shadow-sm">
      
      {/* ======================================================== */}
      {/* CASE 1: WELCOME SCREEN - SLIM PREMIUM CENTERED MASTER    */}
      {/* ======================================================== */}
      {isHome ? (
        <div className="relative overflow-hidden bg-gradient-to-r from-sky-50/90 via-cyan-50/60 to-sky-50/90 dark:from-[#081822] dark:via-[#0a202d] dark:to-[#081822] transition-colors">
          
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

          {/* Compact Executive Header Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 relative z-10">
            
            {/* Left Brand Badge */}
            <div className="hidden sm:flex items-center shrink-0 w-32">
              <span className="text-[10px] font-black tracking-widest uppercase text-[#0096c7] dark:text-cyan-400 bg-cyan-100/70 dark:bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-300/50 dark:border-cyan-800">
                SML FEEDS
              </span>
            </div>

            {/* Center Logo & Corporate Branding */}
            <div 
              onClick={onGoHome}
              className="flex items-center justify-center gap-2.5 sm:gap-3.5 cursor-pointer group select-none mx-auto sm:mx-0"
              title="Sandhya Marines Ltd"
            >
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 to-sky-400 opacity-40 blur-sm group-hover:opacity-75 transition duration-300" />
                <img 
                  src="/logo.png" 
                  alt="Sandhya Marines Ltd" 
                  className="relative h-11 sm:h-12 w-auto max-w-[48px] sm:max-w-[54px] object-contain bg-white rounded-xl p-1 shadow-md ring-1 ring-cyan-200 dark:ring-cyan-800 group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="text-center sm:text-left">
                <h1 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {COMPANY_NAME}
                </h1>
                <p className="text-[10px] sm:text-xs font-extrabold text-[#0096c7] dark:text-[#38bdf8] tracking-wide uppercase">
                  Aqua Feed Mill Operations Portal
                </p>
              </div>
            </div>

            {/* Right Action Controls (Firestore Status & Theme Mode) */}
            <div className="flex items-center gap-2 shrink-0 sm:w-32 justify-end">
              <button
                onClick={onOpenFirebaseModal}
                title={isCloud ? "Firestore Database: Live Connected" : "Local Storage Mode (Click to connect Firebase Firestore)"}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isCloud 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isCloud ? 'Live' : 'Local'}</span>
                <span className={`w-2 h-2 rounded-full ${isCloud ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-cyan-100/70 dark:hover:bg-[#0c1f2b] border border-cyan-200 dark:border-cyan-900 transition"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
              </button>
            </div>

          </div>

          {/* Integrated Status Bar Ribbon (Strictly: Date & Time, Mill: Live Operating, 3 Mill Units, 16 Feed Varieties, 1 Central Godown) */}
          <div className="border-t border-cyan-200/80 dark:border-cyan-900/60 bg-white/80 dark:bg-[#07131b]/90 backdrop-blur-md py-2 px-3 sm:px-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-2 sm:gap-4 md:gap-6 text-[11px] sm:text-xs">
              
              {/* 1. DATE AND TIME */}
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-900/50 shadow-xs whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-[#0096c7] dark:text-[#38bdf8]" />
                <span>{formattedDateTime}</span>
              </div>

              {/* 2. Mill: Live Operating */}
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                <span>Mill: Live Operating</span>
              </div>

              {/* 3. 3 Mill Units */}
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-900/50 shadow-xs whitespace-nowrap">
                <Building2 className="w-3.5 h-3.5 text-[#0096c7] dark:text-[#38bdf8]" />
                <span>3 Mill Units</span>
              </div>

              {/* 4. 16 Feed Varieties */}
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-900/50 shadow-xs whitespace-nowrap">
                <Layers className="w-3.5 h-3.5 text-[#0096c7] dark:text-[#38bdf8]" />
                <span>16 Feed Varieties</span>
              </div>

              {/* 5. 1 Central Godown */}
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-lg bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/60 dark:border-cyan-900/50 shadow-xs whitespace-nowrap">
                <Warehouse className="w-3.5 h-3.5 text-[#0096c7] dark:text-[#38bdf8]" />
                <span>1 Central Godown</span>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* ======================================================== */
        /* CASE 2: INSIDE DEPARTMENT - OPERATIONAL COMPACT HEADER   */
        /* ======================================================== */
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
              
              {/* Logo & Company Title */}
              <div 
                onClick={onGoHome}
                className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
                title="Click to return to Welcome Screen"
              >
                <img 
                  src="/logo.png" 
                  alt="Sandhya Marines Ltd" 
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl bg-white p-1 shadow-sm ring-1 ring-cyan-300 dark:ring-cyan-800 group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-black text-xs sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {COMPANY_NAME}
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-cyan-100 text-[#0096c7] dark:bg-cyan-950/60 dark:text-[#38bdf8] border border-cyan-300/40">
                      SML FEEDS
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                    Aqua Feed Mill Operations Portal
                  </p>
                </div>
              </div>

              {/* Compact Status in Department View */}
              <div className="hidden xl:flex items-center gap-2 bg-cyan-50/60 dark:bg-[#0c1f2b] px-3 py-1 rounded-xl border border-cyan-200/80 dark:border-cyan-900/60 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 pr-2 border-r border-cyan-200 dark:border-cyan-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 px-1">
                  <Building2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span>3 Units</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 px-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{currentShift}</span>
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                
                <button
                  onClick={onGoHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border bg-cyan-50/60 dark:bg-[#0c1f2b] hover:bg-cyan-100/60 text-slate-700 dark:text-slate-200 border-cyan-200 dark:border-cyan-900"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span className="hidden sm:inline">Welcome Screen</span>
                </button>

                <button
                  onClick={onOpenFirebaseModal}
                  title={isCloud ? "Firestore Database: Live Connected" : "Local Storage Mode (Click to connect Firebase Firestore)"}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isCloud 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{isCloud ? 'Live' : 'Local'}</span>
                  <span className={`w-2 h-2 rounded-full ${isCloud ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                </button>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-[#0c1f2b] border border-slate-200 dark:border-slate-800 transition"
                  title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
                </button>

                <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
                  <div className="hidden lg:block text-right">
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                      {activeUser.name || 'Shift Operator'}
                    </div>
                    <div className="text-[10px] text-[#0096c7] dark:text-cyan-400 font-semibold uppercase">
                      {currentDept?.shortName || activeUser.role || 'Staff'}
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Switch Role / Back to Welcome Screen"
                    className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-800 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Navigation Ribbon */}
          {activeTab === 'electrical' ? (
            /* ELECTRICAL EXCLUSIVE NAVIGATION: 3 CLEAN TABS (SHIFT REPORT, DAY REPORT, REPORTS) */
            <div className="bg-sky-50/70 dark:bg-[#0c1f2b] border-t border-sky-200/70 dark:border-sky-950 px-2 sm:px-6 animate-fade-in shadow-xs">
              <div className="max-w-7xl mx-auto flex items-center justify-between py-2 gap-2">
                
                {/* Left: Department Tag & Sub-Tabs */}
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                  <span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-sky-800 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/50 rounded-xl border border-sky-300/40 mr-1 shrink-0">
                    <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Electrical</span>
                  </span>

                  <button
                    onClick={() => setElectricalSubTab && setElectricalSubTab('shift')}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      electricalSubTab === 'shift'
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-sm shadow-sky-500/25 scale-[1.01]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-sky-100/70 dark:hover:bg-[#07131b] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${electricalSubTab === 'shift' ? 'text-white' : 'text-sky-500'}`} />
                    <span>Shift Report</span>
                  </button>

                  <button
                    onClick={() => setElectricalSubTab && setElectricalSubTab('day')}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      electricalSubTab === 'day'
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-sm shadow-sky-500/25 scale-[1.01]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-sky-100/70 dark:hover:bg-[#07131b] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className={`w-3.5 h-3.5 ${electricalSubTab === 'day' ? 'text-white' : 'text-amber-500'}`} />
                    <span>Day Report</span>
                  </button>

                  <button
                    onClick={() => setElectricalSubTab && setElectricalSubTab('reports')}
                    className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      electricalSubTab === 'reports'
                        ? 'bg-gradient-to-r from-sky-500 to-cyan-600 text-white shadow-sm shadow-sky-500/25 scale-[1.01]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-sky-100/70 dark:hover:bg-[#07131b] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className={`w-3.5 h-3.5 ${electricalSubTab === 'reports' ? 'text-white' : 'text-teal-500'}`} />
                    <span>Reports</span>
                  </button>
                </div>

                {/* Right: Quick Return to Welcome Screen / All Departments */}
                <button
                  onClick={onGoHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-sky-700 hover:bg-white dark:hover:bg-[#07131b] border border-transparent hover:border-sky-200 transition shrink-0 cursor-pointer"
                  title="Switch Department / Back to Welcome Screen"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-sky-500" />
                  <span className="hidden sm:inline">All Departments</span>
                </button>

              </div>
            </div>
          ) : (
            /* STANDARD DEPARTMENT NAVIGATION RIBBON */
            <div className="bg-white dark:bg-[#0c1f2b] border-t border-cyan-100 dark:border-cyan-950 px-2 sm:px-6 animate-fade-in shadow-inner">
              <div className="max-w-7xl mx-auto flex items-center overflow-x-auto no-scrollbar py-2 gap-1.5 sm:gap-2">
                {DEPARTMENTS.map((dept) => {
                  const Icon = iconMap[dept.icon] || Factory;
                  const isActive = activeTab === dept.id;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setActiveTab(dept.id)}
                      className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-md shadow-cyan-500/20 scale-[1.02]'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-[#07131b] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-500'}`} />
                      <span>{dept.shortName}</span>

                      {dept.id === 'manager' && pendingApprovalsCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

    </header>
  );
}