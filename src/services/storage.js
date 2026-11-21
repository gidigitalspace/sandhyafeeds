// Storage & Firestore Integration Service
import { getDb } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { getTodayDateString, ALL_VARIETIES, FEED_TYPES } from '../constants/feedData';

// LocalStorage Keys
const KEYS = {
  SHIFTS: 'sml_shifts_v1',
  DAY_REPORTS: 'sml_day_reports_v1',
  GODOWN: 'sml_godown_stock_v1',
  SALES: 'sml_sales_v1',
  ELECTRICAL: 'sml_electrical_v1',
  LEAVES: 'sml_leaves_v1',
  SETTINGS: 'sml_plant_settings_v1',
  ACTIVE_USER: 'sml_active_user_v1'
};

// Seed initial opening stock for varieties
function getInitialStockTemplate() {
  const stock = {};
  ALL_VARIETIES.forEach(item => {
    // Initial opening MT (e.g., between 15 MT and 60 MT)
    const base = item.type === FEED_TYPES.VANAMAI ? 35 : 25;
    stock[item.variety] = {
      type: item.type,
      variety: item.variety,
      openingMT: base,
      productionMT: 0,
      salesMT: 0,
      closingMT: base
    };
  });
  return stock;
}

// Helper to read localStorage safely
function readLocal(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

// Helper to write localStorage safely
function writeLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Local write error:', e);
  }
}

// Initialize default seed data if empty
export function initSeedData() {
  const today = getTodayDateString();
  
  // Settings default
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    writeLocal(KEYS.SETTINGS, {
      autoApprove: false,
      plantName: 'Sandhya Feeds (SML Feeds)',
      millLocation: 'Aquaculture Zone, Andhra Pradesh',
      lastUpdated: new Date().toISOString()
    });
  }

  // Godown initial stock
  const allGodown = readLocal(KEYS.GODOWN, {});
  if (!allGodown[today]) {
    allGodown[today] = getInitialStockTemplate();
    writeLocal(KEYS.GODOWN, allGodown);
  }

  // Sample leaves
  const leaves = readLocal(KEYS.LEAVES, []);
  if (leaves.length === 0) {
    writeLocal(KEYS.LEAVES, [
      {
        id: 'LV-101',
        name: 'R. Krishna',
        role: 'Shift In-Charge (Unit-1)',
        unit: 'Unit-1',
        type: 'Casual Leave',
        fromDate: today,
        toDate: today,
        days: 1,
        reason: 'Family function in hometown',
        status: 'Pending',
        appliedAt: new Date(Date.now() - 3600000 * 5).toISOString()
      }
    ]);
  }

  // Electrical Seed Records (Yesterday & Today)
  const allElec = readLocal(KEYS.ELECTRICAL, {});
  const curD = new Date(today);
  curD.setDate(curD.getDate() - 1);
  const yesterday = curD.toISOString().slice(0, 10);

  if (!allElec[yesterday]) {
    allElec[yesterday] = {
      date: yesterday,
      shifts: {
        'Shift A': {
          startMwh: 450.120,
          endMwh: 453.680,
          diffMwh: 3.560,
          consumedKwh: 3560,
          startMvah: 458.200,
          endMvah: 461.820,
          diffMvah: 3.620,
          consumedKvah: 3620,
          powerFactor: 0.983,
          submittedBy: 'K. Ramesh (Electrical)',
          submittedAt: `${yesterday}T14:05:00Z`
        },
        'Shift B': {
          startMwh: 453.680,
          endMwh: 457.420,
          diffMwh: 3.740,
          consumedKwh: 3740,
          startMvah: 461.820,
          endMvah: 465.630,
          diffMvah: 3.810,
          consumedKvah: 3810,
          powerFactor: 0.982,
          submittedBy: 'K. Ramesh (Electrical)',
          submittedAt: `${yesterday}T22:10:00Z`
        },
        'Shift C': {
          startMwh: 457.420,
          endMwh: 460.550,
          diffMwh: 3.130,
          consumedKwh: 3130,
          startMvah: 465.630,
          endMvah: 468.850,
          diffMvah: 3.220,
          consumedKvah: 3220,
          powerFactor: 0.972,
          submittedBy: 'M. Srinu (Electrical)',
          submittedAt: `${today}T06:15:00Z`
        }
      },
      dayTotalMwh: 10.430,
      dayTotalKwh: 10430,
      dayTotalMvah: 10.650,
      dayTotalKvah: 10650,
      dayPowerFactor: '0.979',
      powerCuts: [
        {
          id: 'PC-101',
          startTime: '11:15',
          endTime: '11:55',
          durationMins: 40,
          reason: '33kV Substation Line Trip'
        }
      ],
      totalPowerCutMinutes: 40,
      dg750: {
        startTime: '11:16',
        endTime: '11:54',
        durationHours: 0.63,
        openingLiters: 650,
        fillingLiters: 200,
        availableLiters: 850,
        consumptionLiters: 68,
        closingLiters: 782,
        efficiencyRate: '107.9'
      },
      dg180: {
        startTime: '11:16',
        endTime: '11:54',
        durationHours: 0.63,
        openingLiters: 280,
        fillingLiters: 0,
        availableLiters: 280,
        consumptionLiters: 16,
        closingLiters: 264,
        efficiencyRate: '25.4'
      },
      totalDieselConsumedLiters: 84,
      solarDayGen: 1480,
      solarDayExport: 95,
      electricalIncharge: 'K. Ramesh (Shift Electrician)',
      reportTime: `${yesterday}T23:30:00Z`,
      status: 'Approved',
      approvedBy: 'General Plant Manager',
      approvedAt: `${today}T08:00:00Z`
    };
  }

  // Seed previous days in current month if empty
  const seedDates = [
    {
      date: '2026-11-18',
      dayTotalMwh: 11.200,
      dayTotalMvah: 11.410,
      dayTotalKwh: 11200,
      dayPowerFactor: '0.982',
      shifts: {
        'Shift A': { consumedKwh: 3800, diffMwh: 3.800, diffMvah: 3.865, powerFactor: 0.983, submittedBy: 'K. Ramesh (Electrician)' },
        'Shift B': { consumedKwh: 3950, diffMwh: 3.950, diffMvah: 4.020, powerFactor: 0.983, submittedBy: 'K. Ramesh (Electrician)' },
        'Shift C': { consumedKwh: 3450, diffMwh: 3.450, diffMvah: 3.525, powerFactor: 0.979, submittedBy: 'M. Srinu (Electrician)' }
      },
      powerCuts: [{ id: 'PC-91', startTime: '15:20', endTime: '15:45', durationMins: 25, reason: 'Feeder Maintenance' }],
      totalPowerCutMinutes: 25,
      dg750: { durationHours: 0.4, openingLiters: 680, fillingLiters: 0, consumptionLiters: 42, closingLiters: 638 },
      dg180: { durationHours: 0.4, openingLiters: 270, fillingLiters: 0, consumptionLiters: 11, closingLiters: 259 },
      totalDieselConsumedLiters: 53,
      solarDayGen: 1520,
      solarDayExport: 105,
      status: 'Approved',
      approvedBy: 'General Plant Manager',
      electricalIncharge: 'K. Ramesh (Shift Electrician)'
    },
    {
      date: '2026-11-19',
      dayTotalMwh: 10.850,
      dayTotalMvah: 11.030,
      dayTotalKwh: 10850,
      dayPowerFactor: '0.984',
      shifts: {
        'Shift A': { consumedKwh: 3700, diffMwh: 3.700, diffMvah: 3.755, powerFactor: 0.985, submittedBy: 'K. Ramesh (Electrician)' },
        'Shift B': { consumedKwh: 3850, diffMwh: 3.850, diffMvah: 3.910, powerFactor: 0.985, submittedBy: 'K. Ramesh (Electrician)' },
        'Shift C': { consumedKwh: 3300, diffMwh: 3.300, diffMvah: 3.365, powerFactor: 0.981, submittedBy: 'M. Srinu (Electrician)' }
      },
      powerCuts: [],
      totalPowerCutMinutes: 0,
      dg750: { durationHours: 0, openingLiters: 638, fillingLiters: 250, consumptionLiters: 0, closingLiters: 888 },
      dg180: { durationHours: 0, openingLiters: 259, fillingLiters: 50, consumptionLiters: 0, closingLiters: 309 },
      totalDieselConsumedLiters: 0,
      solarDayGen: 1610,
      solarDayExport: 125,
      status: 'Approved',
      approvedBy: 'General Plant Manager',
      electricalIncharge: 'K. Ramesh (Shift Electrician)'
    }
  ];

  seedDates.forEach(sd => {
    if (!allElec[sd.date]) {
      allElec[sd.date] = sd;
    }
  });

  if (!allElec[today]) {
    allElec[today] = {
      date: today,
      shifts: {
        'Shift A': {
          startMwh: 460.550,
          endMwh: 464.200,
          diffMwh: 3.650,
          consumedKwh: 3650,
          startMvah: 468.850,
          endMvah: 472.580,
          diffMvah: 3.730,
          consumedKvah: 3730,
          powerFactor: 0.979,
          submittedBy: 'K. Ramesh (Electrical)',
          submittedAt: `${today}T14:05:00Z`
        }
      },
      dayTotalMwh: 3.650,
      dayTotalKwh: 3650,
      dayTotalMvah: 3.730,
      dayTotalKvah: 3730,
      dayPowerFactor: '0.979',
      powerCuts: [],
      totalPowerCutMinutes: 0,
      dg750: {
        startTime: '',
        endTime: '',
        durationHours: 0,
        openingLiters: 782,
        fillingLiters: 0,
        availableLiters: 782,
        consumptionLiters: 0,
        closingLiters: 782,
        efficiencyRate: '0.0'
      },
      dg180: {
        startTime: '',
        endTime: '',
        durationHours: 0,
        openingLiters: 264,
        fillingLiters: 0,
        availableLiters: 264,
        consumptionLiters: 0,
        closingLiters: 264,
        efficiencyRate: '0.0'
      },
      totalDieselConsumedLiters: 0,
      solarDayGen: 1540,
      solarDayExport: 110,
      electricalIncharge: 'Shift Electrician',
      reportTime: new Date().toISOString(),
      status: 'Submitted'
    };
  }

  // Sanitize any existing cached entries to ensure "Shift Electrician" is always used
  Object.keys(allElec).forEach(d => {
    if (allElec[d]?.electricalIncharge) {
      allElec[d].electricalIncharge = allElec[d].electricalIncharge
        .replace(/Electrical Engineer/gi, 'Shift Electrician')
        .replace(/Engineer/gi, 'Electrician');
    }
  });

  writeLocal(KEYS.ELECTRICAL, allElec);
}

// ==========================================
// 1. SHIFT IN-CHARGE STORAGE & FIRESTORE
// ==========================================

export async function saveShiftReport(report) {
  // Report ID format: YYYY-MM-DD_Unit-1_Shift-A
  const id = `${report.date}_${report.unit}_${report.shift.replace(/\s+/g, '-')}`;
  report.id = id;
  report.savedAt = new Date().toISOString();

  // Local write
  const allShifts = readLocal(KEYS.SHIFTS, {});
  allShifts[id] = report;
  writeLocal(KEYS.SHIFTS, allShifts);

  // Firestore sync if connected
  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'shifts', id), report);
    } catch (err) {
      console.warn('Firestore shift save failed, using local:', err);
    }
  }

  return report;
}

export async function getShiftReport(date, unit, shift) {
  const id = `${date}_${unit}_${shift.replace(/\s+/g, '-')}`;
  
  // Check local first
  const allShifts = readLocal(KEYS.SHIFTS, {});
  let report = allShifts[id];

  // Try firestore
  const db = getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'shifts', id));
      if (snap.exists()) {
        report = snap.data();
        allShifts[id] = report;
        writeLocal(KEYS.SHIFTS, allShifts);
      }
    } catch (e) {
      console.warn('Firestore fetch failed:', e);
    }
  }

  return report || null;
}

export function getAllShiftsForDate(date) {
  const allShifts = readLocal(KEYS.SHIFTS, {});
  return Object.values(allShifts).filter(s => s.date === date);
}

export function getLatestHandoverNote(unit, currentShift) {
  const allShifts = Object.values(readLocal(KEYS.SHIFTS, {}));
  const filtered = allShifts
    .filter(s => s.unit === unit && s.handoverNotes)
    .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));

  return filtered.length > 0 ? filtered[0] : null;
}

// ==========================================
// 2. DAY PRODUCTION REPORT (GENERAL IN-CHARGE)
// ==========================================

export async function saveDayProductionReport(report) {
  const id = report.date; // One day report per date
  report.id = id;
  report.updatedAt = new Date().toISOString();

  const allDays = readLocal(KEYS.DAY_REPORTS, {});
  allDays[id] = report;
  writeLocal(KEYS.DAY_REPORTS, allDays);

  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'dayReports', id), report);
    } catch (err) {
      console.warn('Firestore day report save failed:', err);
    }
  }

  // If report is approved, automatically update Godown received production & Sales sheet!
  if (report.status === 'Approved') {
    syncApprovedProductionToGodownAndSales(report);
  }

  return report;
}

export async function getDayProductionReport(date) {
  const allDays = readLocal(KEYS.DAY_REPORTS, {});
  let report = allDays[date];

  const db = getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'dayReports', date));
      if (snap.exists()) {
        report = snap.data();
        allDays[date] = report;
        writeLocal(KEYS.DAY_REPORTS, allDays);
      }
    } catch (e) {
      console.warn('Firestore fetch day report failed:', e);
    }
  }

  return report || null;
}

export function getAllDayReports() {
  const allDays = readLocal(KEYS.DAY_REPORTS, {});
  return Object.values(allDays).sort((a, b) => b.date.localeCompare(a.date));
}

// Sync approved production numbers into Godown & Sales
function syncApprovedProductionToGodownAndSales(dayReport) {
  const date = dayReport.date;
  const varietyTotals = dayReport.varietyTotals || {};

  // Update Godown Stock record
  const allGodown = readLocal(KEYS.GODOWN, {});
  const todayStock = allGodown[date] || getInitialStockTemplate();

  Object.keys(todayStock).forEach(v => {
    const prod = parseFloat(varietyTotals[v] || 0);
    todayStock[v].productionMT = prod;
    // Closing = (Opening + Production) - Sales
    todayStock[v].closingMT = Math.max(0, (todayStock[v].openingMT || 0) + prod - (todayStock[v].salesMT || 0));
  });

  allGodown[date] = todayStock;
  writeLocal(KEYS.GODOWN, allGodown);

  // Update Sales sheet
  const allSales = readLocal(KEYS.SALES, {});
  const todaySales = allSales[date] || {};
  todaySales.productionSynced = true;
  todaySales.updatedAt = new Date().toISOString();
  allSales[date] = todaySales;
  writeLocal(KEYS.SALES, allSales);
}

// ==========================================
// 3. GODOWN OPENING STOCK
// ==========================================

export async function getGodownStock(date) {
  const allGodown = readLocal(KEYS.GODOWN, {});
  let stock = allGodown[date];

  if (!stock) {
    // If not found, copy previous day's closing or default
    stock = getInitialStockTemplate();
    allGodown[date] = stock;
    writeLocal(KEYS.GODOWN, allGodown);
  }

  const db = getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'godownStock', date));
      if (snap.exists()) {
        stock = snap.data().stock;
        allGodown[date] = stock;
        writeLocal(KEYS.GODOWN, allGodown);
      }
    } catch (e) {
      console.warn('Firestore godown fetch error:', e);
    }
  }

  return stock;
}

export async function saveGodownStock(date, stockData) {
  const allGodown = readLocal(KEYS.GODOWN, {});
  allGodown[date] = stockData;
  writeLocal(KEYS.GODOWN, allGodown);

  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'godownStock', date), {
        date,
        stock: stockData,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Firestore godown save error:', e);
    }
  }

  return stockData;
}

// ==========================================
// 4. SALES DEPARTMENT STORAGE
// ==========================================

export async function getSalesData(date) {
  const allSales = readLocal(KEYS.SALES, {});
  let sales = allSales[date];

  const db = getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'sales', date));
      if (snap.exists()) {
        sales = snap.data();
        allSales[date] = sales;
        writeLocal(KEYS.SALES, allSales);
      }
    } catch (e) {
      console.warn('Firestore sales fetch error:', e);
    }
  }

  return sales || { date, entries: {} };
}

export async function saveSalesData(date, salesEntries) {
  const allSales = readLocal(KEYS.SALES, {});
  const record = {
    date,
    entries: salesEntries,
    updatedAt: new Date().toISOString()
  };
  allSales[date] = record;
  writeLocal(KEYS.SALES, allSales);

  // Also update Godown closing stock
  const allGodown = readLocal(KEYS.GODOWN, {});
  const todayGodown = allGodown[date] || getInitialStockTemplate();

  Object.keys(todayGodown).forEach(v => {
    const s = parseFloat(salesEntries[v] || 0);
    todayGodown[v].salesMT = s;
    todayGodown[v].closingMT = Math.max(0, (todayGodown[v].openingMT || 0) + (todayGodown[v].productionMT || 0) - s);
  });
  allGodown[date] = todayGodown;
  writeLocal(KEYS.GODOWN, allGodown);

  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'sales', date), record);
      await setDoc(doc(db, 'godownStock', date), { date, stock: todayGodown, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('Firestore sales save error:', e);
    }
  }

  return record;
}

// ==========================================
// 5. ELECTRICAL DEPARTMENT & ENERGY AUDIT
// ==========================================

export async function getElectricalData(date) {
  const allElec = readLocal(KEYS.ELECTRICAL, {});
  let record = allElec[date];

  const db = getDb();
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'electrical', date));
      if (snap.exists()) {
        record = snap.data();
        allElec[date] = record;
        writeLocal(KEYS.ELECTRICAL, allElec);
      }
    } catch (e) {
      console.warn('Firestore electrical fetch error:', e);
    }
  }

  if (record && record.electricalIncharge) {
    record.electricalIncharge = record.electricalIncharge
      .replace(/Electrical Engineer/gi, 'Shift Electrician')
      .replace(/Engineer/gi, 'Electrician');
  }

  return record || null;
}

export async function saveElectricalData(data) {
  const date = data.date;
  const allElec = readLocal(KEYS.ELECTRICAL, {});
  allElec[date] = { ...data, updatedAt: new Date().toISOString() };
  writeLocal(KEYS.ELECTRICAL, allElec);

  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'electrical', date), allElec[date]);
    } catch (e) {
      console.warn('Firestore electrical save error:', e);
    }
  }

  return allElec[date];
}

// Fetch previous shift ending readings to auto-carry forward starting MWH & MVAH
export function getPreviousShiftReadings(currentDate, currentShift) {
  const allElec = readLocal(KEYS.ELECTRICAL, {});
  
  if (currentShift === 'Shift B') {
    const todayDoc = allElec[currentDate];
    if (todayDoc?.shifts?.['Shift A']?.endMwh) {
      return {
        startMwh: todayDoc.shifts['Shift A'].endMwh,
        startMvah: todayDoc.shifts['Shift A'].endMvah,
        source: 'Shift A Ending Reading'
      };
    }
  }

  if (currentShift === 'Shift C') {
    const todayDoc = allElec[currentDate];
    if (todayDoc?.shifts?.['Shift B']?.endMwh) {
      return {
        startMwh: todayDoc.shifts['Shift B'].endMwh,
        startMvah: todayDoc.shifts['Shift B'].endMvah,
        source: 'Shift B Ending Reading'
      };
    }
  }

  if (currentShift === 'Shift A') {
    // Look at previous day's Shift C
    const curD = new Date(currentDate);
    curD.setDate(curD.getDate() - 1);
    const prevDateStr = curD.toISOString().slice(0, 10);
    const prevDoc = allElec[prevDateStr];
    if (prevDoc?.shifts?.['Shift C']?.endMwh) {
      return {
        startMwh: prevDoc.shifts['Shift C'].endMwh,
        startMvah: prevDoc.shifts['Shift C'].endMvah,
        source: `Yesterday (${prevDateStr}) Shift C Ending`
      };
    }
  }

  return null;
}

// Retrieve full month date-wise electrical history & cumulative KPIs
export function getMonthlyElectricalHistory(yearMonth) {
  const allElec = readLocal(KEYS.ELECTRICAL, {});
  const prefix = yearMonth; // e.g. "2026-11"
  
  // Filter days belonging to this month and sort by date ascending
  const dayKeys = Object.keys(allElec)
    .filter(d => d.startsWith(prefix))
    .sort();

  let cumMwh = 0;
  let cumMvah = 0;
  let cumKwh = 0;
  let cumDiesel = 0;
  let cumDieselFilling = 0;
  let totalTrips = 0;
  let cumSolarGen = 0;
  let cumSolarExport = 0;
  let cumOutageMinutes = 0;

  const records = dayKeys.map(date => {
    const rec = allElec[date] || {};
    const dayMwh = parseFloat(rec.dayTotalMwh || 0);
    const dayMvah = parseFloat(rec.dayTotalMvah || 0);
    const dayKwh = parseFloat(rec.dayTotalKwh || 0);
    const dayDiesel = parseFloat(rec.totalDieselConsumedLiters || 0);
    const daySolarGen = parseFloat(rec.solarDayGen || 0);
    const daySolarExp = parseFloat(rec.solarDayExport || 0);
    const dayOutageMins = parseFloat(rec.totalPowerCutMinutes || 0);

    const filling750 = parseFloat(rec.dg750?.fillingLiters || 0);
    const filling180 = parseFloat(rec.dg180?.fillingLiters || 0);
    const dayDieselFilling = filling750 + filling180;
    const dayFilling = dayDieselFilling;

    const tripsCount = rec.powerCuts ? rec.powerCuts.length : 0;

    cumMwh += dayMwh;
    cumMvah += dayMvah;
    cumKwh += dayKwh;
    cumDiesel += dayDiesel;
    cumDieselFilling += dayFilling;
    totalTrips += tripsCount;
    cumSolarGen += daySolarGen;
    cumSolarExport += daySolarExp;
    cumOutageMinutes += dayOutageMins;

    const cumulativePf = cumMvah > 0 ? (cumMwh / cumMvah).toFixed(3) : '1.000';

    // Shift breakdown
    const shiftAKwh = rec.shifts?.['Shift A']?.consumedKwh || (rec.shifts?.['Shift A']?.diffMwh ? Math.round(rec.shifts['Shift A'].diffMwh * 1000) : 0);
    const shiftBKwh = rec.shifts?.['Shift B']?.consumedKwh || (rec.shifts?.['Shift B']?.diffMwh ? Math.round(rec.shifts['Shift B'].diffMwh * 1000) : 0);
    const shiftCKwh = rec.shifts?.['Shift C']?.consumedKwh || (rec.shifts?.['Shift C']?.diffMwh ? Math.round(rec.shifts['Shift C'].diffMwh * 1000) : 0);

    // DG breakdown
    const dg750Hours = rec.dg750?.durationHours || 0;
    const dg750Liters = rec.dg750?.consumptionLiters || 0;
    const dg180Hours = rec.dg180?.durationHours || 0;
    const dg180Liters = rec.dg180?.consumptionLiters || 0;
    const dayDieselOpening = (rec.dg750?.openingLiters || 0) + (rec.dg180?.openingLiters || 0);
    const dayDieselClosing = (rec.dg750?.closingLiters || 0) + (rec.dg180?.closingLiters || 0);
    const outageReasons = rec.powerCuts && rec.powerCuts.length > 0 
      ? rec.powerCuts.map(pc => `${pc.startTime}-${pc.endTime} (${pc.reason})`).join('; ') 
      : 'Continuous Supply';

    // Solar breakdown
    const netSolar = Math.max(0, daySolarGen - daySolarExp);
    const totalMillPower = dayKwh + daySolarGen;
    const solarOffsetPct = totalMillPower > 0 ? ((daySolarGen / totalMillPower) * 100).toFixed(1) : '0.0';

    return {
      date,
      ...rec,
      dayTotalMwh: dayMwh.toFixed(3),
      dayTotalMvah: dayMvah.toFixed(3),
      dayTotalKwh: dayKwh,
      dayPowerFactor: rec.dayPowerFactor || (dayMvah > 0 ? (dayMwh / dayMvah).toFixed(3) : '0.985'),
      shiftAKwh,
      shiftBKwh,
      shiftCKwh,
      cumMwh: cumMwh.toFixed(3),
      cumMvah: cumMvah.toFixed(3),
      cumKwh: Math.round(cumKwh),
      cumulativePf,
      // DG data
      dg750Hours,
      dg750Liters,
      dg180Hours,
      dg180Liters,
      dayDieselFilling,
      dayDieselOpening,
      dayDieselClosing,
      totalDieselConsumedLiters: dayDiesel,
      cumDiesel: Math.round(cumDiesel),
      cumDieselFilling: Math.round(cumDieselFilling),
      outageMinutes: dayOutageMins,
      outageHours: (dayOutageMins / 60).toFixed(1),
      tripsCount,
      outageReasons,
      cumOutageMinutes,
      cumOutageHours: (cumOutageMinutes / 60).toFixed(1),
      // Solar data
      solarDayGen: Math.round(daySolarGen),
      solarDayExport: Math.round(daySolarExp),
      netSolar: Math.round(netSolar),
      solarOffsetPct,
      cumSolarGen: Math.round(cumSolarGen),
      cumSolarExport: Math.round(cumSolarExport)
    };
  });

  const overallPf = cumMvah > 0 ? (cumMwh / cumMvah).toFixed(3) : '0.985';

  return {
    yearMonth,
    records,
    totals: {
      daysCount: records.length,
      cumMwh: cumMwh.toFixed(3),
      cumMvah: cumMvah.toFixed(3),
      cumKwh: Math.round(cumKwh),
      overallPf,
      cumDiesel: Math.round(cumDiesel),
      cumDieselFilling: Math.round(cumDieselFilling),
      totalTrips,
      cumSolarGen: Math.round(cumSolarGen),
      cumSolarExport: Math.round(cumSolarExport),
      netSolarConsumed: Math.round(Math.max(0, cumSolarGen - cumSolarExport)),
      cumOutageHours: (cumOutageMinutes / 60).toFixed(1)
    }
  };
}

// Plant Manager approval of Day Power Report
export async function approveElectricalDayReport(date, managerName = 'General Plant Manager') {
  const allElec = readLocal(KEYS.ELECTRICAL, {});
  if (allElec[date]) {
    allElec[date].status = 'Approved';
    allElec[date].approvedBy = managerName;
    allElec[date].approvedAt = new Date().toISOString();
    writeLocal(KEYS.ELECTRICAL, allElec);

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'electrical', date), allElec[date]);
      } catch (e) {
        console.warn('Firestore approval sync error:', e);
      }
    }
    return allElec[date];
  }
  return null;
}

// ==========================================
// 6. LEAVE APPLICATIONS
// ==========================================

export function getLeaveApplications() {
  return readLocal(KEYS.LEAVES, []);
}

export async function applyLeave(application) {
  const leaves = readLocal(KEYS.LEAVES, []);
  const newLeave = {
    ...application,
    id: `LV-${Date.now().toString().slice(-4)}`,
    status: 'Pending',
    appliedAt: new Date().toISOString()
  };
  leaves.unshift(newLeave);
  writeLocal(KEYS.LEAVES, leaves);

  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'leaves', newLeave.id), newLeave);
    } catch (e) {
      console.warn('Firestore leave save error:', e);
    }
  }

  return newLeave;
}

export async function updateLeaveStatus(leaveId, status) {
  const leaves = readLocal(KEYS.LEAVES, []);
  const index = leaves.findIndex(l => l.id === leaveId);
  if (index !== -1) {
    leaves[index].status = status;
    leaves[index].reviewedAt = new Date().toISOString();
    writeLocal(KEYS.LEAVES, leaves);

    const db = getDb();
    if (db) {
      try {
        await setDoc(doc(db, 'leaves', leaveId), leaves[index]);
      } catch (e) {
        console.warn('Firestore leave status update error:', e);
      }
    }
  }
  return leaves;
}

// ==========================================
// 7. PLANT SETTINGS (AUTO-APPROVE, ETC.)
// ==========================================

export function getPlantSettings() {
  return readLocal(KEYS.SETTINGS, { autoApprove: false });
}

export async function updatePlantSettings(settings) {
  const cur = readLocal(KEYS.SETTINGS, {});
  const updated = { ...cur, ...settings, lastUpdated: new Date().toISOString() };
  writeLocal(KEYS.SETTINGS, updated);

  const db = getDb();
  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'plant'), updated);
    } catch (e) {
      console.warn('Firestore settings update error:', e);
    }
  }

  return updated;
}

// ==========================================
// 8. ACTIVE USER PROFILE
// ==========================================

export function getActiveUser() {
  return readLocal(KEYS.ACTIVE_USER, {
    name: 'Shift Engineer',
    role: 'shift_incharge',
    unit: 'Unit-1',
    shift: 'Shift A'
  });
}

export function saveActiveUser(user) {
  writeLocal(KEYS.ACTIVE_USER, user);
}
