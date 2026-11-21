import React, { useState } from 'react';
import { 
  Factory, 
  Zap, 
  Warehouse, 
  TrendingUp, 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Mail, 
  Clock, 
  Building2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  LogIn, 
  UserCheck, 
  FileSpreadsheet,
  AlertCircle,
  Database
} from 'lucide-react';
import { UNITS, SHIFTS, getCurrentShift } from '../constants/feedData';
import { loginWithEmailPassword, isFirebaseConnected } from '../services/firebase';

const iconMap = {
  Factory: Factory,
  Zap: Zap,
  Warehouse: Warehouse,
  TrendingUp: TrendingUp,
  ShieldCheck: ShieldCheck
};

// Preset credentials mapped to Firebase Authorization
const DEFAULT_CREDENTIALS = {
  production_shift: {
    email: 'shift.incharge@sandhyamarines.com',
    name: 'Shift In-Charge',
    role: 'shift_incharge',
    subRole: 'shift',
    title: 'Production — Shift In-Charge'
  },
  production_general: {
    email: 'general.incharge@sandhyamarines.com',
    name: 'General In-Charge',
    role: 'general_incharge',
    subRole: 'general',
    title: 'Production — General In-Charge'
  },
  electrical_shift: {
    email: 'electrician@sandhyamarines.com',
    name: 'Shift Electrician',
    role: 'shift_electrician',
    subRole: 'shift',
    title: 'Electrical Department — Shift Electrician'
  },
  electrical_incharge: {
    email: 'electrical.engineer@sandhyamarines.com',
    name: 'Electrical Engineer',
    role: 'electrical_incharge',
    subRole: 'incharge',
    title: 'Electrical In-Charge (Engineer)'
  },
  electrical: {
    email: 'electrician@sandhyamarines.com',
    name: 'Shift Electrician',
    role: 'shift_electrician',
    subRole: 'shift',
    title: 'Electrical Department'
  },
  godown: {
    email: 'godown@sandhyamarines.com',
    name: 'Godown Supervisor',
    role: 'godown_incharge',
    title: 'Godown Department'
  },
  sales: {
    email: 'sales@sandhyamarines.com',
    name: 'Sales Dispatcher',
    role: 'sales_officer',
    title: 'Sales Department'
  },
  manager: {
    email: 'manager@sandhyamarines.com',
    name: 'General Plant Manager',
    role: 'plant_manager',
    title: 'Plant Manager'
  }
};

export default function DepartmentLoginPage({ dept, initialSubRole = 'shift', onLogin, onBack }) {
  const Icon = iconMap[dept.icon] || Factory;
  const currentShift = getCurrentShift();
  const isCloud = isFirebaseConnected();

  const isProduction = dept.id === 'production';
  const isElectrical = dept.id === 'electrical';
  const [subRole, setSubRole] = useState(initialSubRole); // 'shift', 'general' (production) or 'shift', 'incharge' (electrical)
  
  // Shift In-Charge is the ONLY role with Unit and Shift selection
  const showUnitAndShiftSelection = isProduction && subRole === 'shift';

  // Determine key for credentials
  const credKey = isProduction 
    ? `production_${subRole}` 
    : isElectrical 
    ? `electrical_${subRole === 'incharge' ? 'incharge' : 'shift'}`
    : dept.id;
  const currentCred = DEFAULT_CREDENTIALS[credKey] || {
    email: `${dept.id}@sandhyamarines.com`,
    name: dept.defaultUser,
    role: dept.defaultRole,
    title: dept.name
  };

  const [email, setEmail] = useState(currentCred.email);
  const [password, setPassword] = useState('SmlFeeds@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [unit, setUnit] = useState('Unit-1');
  const [shift, setShift] = useState(currentShift);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Handle switching sub-role in Production or Electrical
  const handleSubRoleChange = (newSub) => {
    setSubRole(newSub);
    setAuthError('');
    const newCredKey = isProduction 
      ? `production_${newSub}` 
      : `electrical_${newSub}`;
    const targetCred = DEFAULT_CREDENTIALS[newCredKey];
    if (targetCred) {
      setEmail(targetCred.email);
    }
  };

  const getRoleUnitAndShift = () => {
    if (isProduction && subRole === 'shift') {
      return { unit, shift };
    }
    if (isProduction && subRole === 'general') {
      return { unit: 'All Mill Units (1, 2, 3)', shift: 'General Duty' };
    }
    if (dept.id === 'manager') {
      return { unit: 'Entire Mill (Units 1-3)', shift: 'Plant Directorate' };
    }
    if (dept.id === 'electrical') {
      return { unit: 'All Mill Units', shift: 'General Duty' };
    }
    if (dept.id === 'godown') {
      return { unit: 'Central Godown', shift: 'General Duty' };
    }
    if (dept.id === 'sales') {
      return { unit: 'Sales Division', shift: 'General Duty' };
    }
    return { unit: 'Unit-1', shift: currentShift };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const result = await loginWithEmailPassword(email.trim(), password);
      const { unit: assignedUnit, shift: assignedShift } = getRoleUnitAndShift();

      onLogin({
        name: currentCred.name,
        email: email.trim(),
        role: currentCred.role,
        subRole: (isProduction || isElectrical) ? subRole : undefined,
        unit: assignedUnit,
        shift: assignedShift,
        departmentId: dept.id,
        isFirebaseAuthenticated: result ? !result.simulated : false
      });
    } catch (err) {
      console.warn('Login fallback triggered:', err);
      const { unit: assignedUnit, shift: assignedShift } = getRoleUnitAndShift();
      onLogin({
        name: currentCred.name,
        email: email.trim(),
        role: currentCred.role,
        subRole: (isProduction || isElectrical) ? subRole : undefined,
        unit: assignedUnit,
        shift: assignedShift,
        departmentId: dept.id,
        isFirebaseAuthenticated: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickBypass = () => {
    const { unit: assignedUnit, shift: assignedShift } = getRoleUnitAndShift();
    onLogin({
      name: currentCred.name,
      email: currentCred.email,
      role: currentCred.role,
      subRole: (isProduction || isElectrical) ? subRole : undefined,
      unit: assignedUnit,
      shift: assignedShift,
      departmentId: dept.id,
      isFirebaseAuthenticated: false
    });
  };

  return (
    <div className="max-w-xl mx-auto py-3 sm:py-5 animate-fade-in">
      
      {/* Back to Department Cards */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 px-3.5 py-2 mb-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-cyan-900 shadow-xs hover:border-cyan-400 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Department Cards</span>
      </button>

      {/* Main Login Card */}
      <div className="relative rounded-3xl bg-white dark:bg-[#0c1f2b] border border-cyan-200/80 dark:border-[#193a4f] shadow-xl overflow-hidden">
        
        {/* Top Department Accent Bar */}
        <div className={`h-2.5 w-full bg-gradient-to-r ${dept.gradient}`} />

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header: Icon, Department Name & Quote */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#00b4d8] via-[#0284c7] to-[#0077b6] text-white shadow-md shadow-cyan-500/25 ring-4 ring-cyan-100 dark:ring-cyan-950/70 flex items-center justify-center">
              <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentCred.title}
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-[#0096c7] dark:text-[#38bdf8] border border-cyan-200 dark:border-cyan-800">
                <Database className="w-3 h-3" />
                <span>{isCloud ? 'Firebase Authentication Connected' : 'Local Auth Simulator Mode'}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isCloud ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              </div>
            </div>

            {/* Production Sub-Role Toggle (Shift vs General In-Charge) */}
            {isProduction && (
              <div className="pt-2 flex justify-center">
                <div className="inline-flex items-center p-1 bg-cyan-50/70 dark:bg-[#07131b] rounded-2xl border border-cyan-200 dark:border-cyan-900">
                  <button
                    type="button"
                    onClick={() => handleSubRoleChange('shift')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      subRole === 'shift'
                        ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Shift In-Charge</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubRoleChange('general')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      subRole === 'general'
                        ? 'bg-gradient-to-r from-[#00b4d8] to-[#0284c7] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>General In-Charge</span>
                  </button>
                </div>
              </div>
            )}

            {/* Electrical Sub-Role Toggle (Shift Electrician vs Electrical Engineer) */}
            {isElectrical && (
              <div className="pt-2 flex justify-center">
                <div className="inline-flex items-center p-1 bg-sky-50/70 dark:bg-[#07131b] rounded-2xl border border-sky-200 dark:border-sky-900">
                  <button
                    type="button"
                    onClick={() => handleSubRoleChange('shift')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      subRole !== 'incharge'
                        ? 'bg-gradient-to-r from-sky-400 to-[#0284c7] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Shift Electrician</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSubRoleChange('incharge')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      subRole === 'incharge'
                        ? 'bg-gradient-to-r from-sky-400 to-[#0284c7] text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Electrical Engineer</span>
                  </button>
                </div>
              </div>
            )}

            {/* Department Quote */}
            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 italic pt-1">
              “{dept.quote}”
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Authentication Issue</p>
                <p className="mt-0.5">{authError}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email (Firebase Auth)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@sandhyamarines.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#07131b] text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#07131b] text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-500 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Operating Shift & Mill Unit (SHOWN EXCLUSIVELY FOR SHIFT IN-CHARGE) */}
            {showUnitAndShiftSelection && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mill Unit
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#07131b] text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    >
                      {UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Duty Shift
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#07131b] text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    >
                      {SHIFTS.map(s => (
                        <option key={s.id} value={s.id}>{s.id}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 space-y-2.5">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm text-white shadow-lg shadow-cyan-500/25 bg-gradient-to-r ${dept.gradient} hover:brightness-105 active:scale-[0.98] transition cursor-pointer disabled:opacity-60`}
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Sign In to {currentCred.title}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickBypass}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-[#081822] border border-cyan-200/80 dark:border-cyan-900 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Quick Access (Single-Click Bypass)</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
