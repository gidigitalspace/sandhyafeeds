// Sandhya Marines Ltd (SML Feeds) Constants & Master Data - Clean Light Blue Theme

export const COMPANY_NAME = 'SANDHYA MARINES LTD';
export const DIVISION_NAME = 'SML FEEDS (SANDHYA FEEDS)';
export const APP_TITLE = 'Aqua Feed Mill Management Portal';

export const UNITS = ['Unit-1', 'Unit-2', 'Unit-3'];

export const LINES = ['A Line', 'B Line', 'Crumble Line'];

export const SHIFTS = [
  { id: 'Shift A', label: 'Shift A (06:00 AM - 02:00 PM)', timeRange: '06:00 AM - 02:00 PM', startHour: 6, endHour: 14 },
  { id: 'Shift B', label: 'Shift B (02:00 PM - 10:00 PM)', timeRange: '02:00 PM - 10:00 PM', startHour: 14, endHour: 22 },
  { id: 'Shift C', label: 'Shift C (10:00 PM - 06:00 AM)', timeRange: '10:00 PM - 06:00 AM', startHour: 22, endHour: 6 },
];

export const FEED_TYPES = {
  VANAMAI: 'Vanamai Feed',
  MONODON: 'Monodon Feed'
};

export const FEED_VARIETIES = {
  [FEED_TYPES.VANAMAI]: ['1C', '2C', '2P', '3S', '3SP', '3P', '4S', '4M'],
  [FEED_TYPES.MONODON]: ['1C', '2C', '2P', '3S', '3P', '4S', '4M', '4L']
};

export const ALL_VARIETIES = [
  ...FEED_VARIETIES[FEED_TYPES.VANAMAI].map(v => ({ type: FEED_TYPES.VANAMAI, variety: v, code: `VAN-${v}` })),
  ...FEED_VARIETIES[FEED_TYPES.MONODON].map(v => ({ type: FEED_TYPES.MONODON, variety: v, code: `MON-${v}` }))
];

export const DEPARTMENTS = [
  { 
    id: 'production', 
    name: 'Production Department', 
    shortName: 'Production',
    code: 'PROD',
    role: 'Shift & General In-Charge',
    quote: 'Precision in every batch, excellence in every pellet.',
    desc: 'Shift handover, manpower, machine run hours, packing output (MT), and maintenance logs.',
    icon: 'Factory',
    gradient: 'from-[#00b4d8] to-[#0284c7]',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    accentColor: '#00b4d8',
    defaultUser: 'Shift Engineer',
    defaultRole: 'shift_incharge'
  },
  { 
    id: 'electrical', 
    name: 'Electrical Department', 
    shortName: 'Electrical',
    code: 'ELEC',
    role: 'Electrical Engineer',
    quote: 'Uninterrupted power driving non-stop plant productivity.',
    desc: 'HT electricity consumption (kWh), DG fuel monitoring, and power outage logs.',
    icon: 'Zap',
    gradient: 'from-[#38bdf8] to-[#0284c7]',
    lightBg: 'bg-sky-50 dark:bg-sky-950/30',
    borderColor: 'border-sky-200 dark:border-sky-800',
    accentColor: '#38bdf8',
    defaultUser: 'Electrical In-Charge',
    defaultRole: 'electrical_engineer'
  },
  { 
    id: 'godown', 
    name: 'Godown Department', 
    shortName: 'Godown',
    code: 'GDWN',
    role: 'Godown Manager',
    quote: 'Accurate inventory today ensures seamless dispatch tomorrow.',
    desc: 'Single Central Godown stock sheet. Strict daily Opening Stock (MT) entry.',
    icon: 'Warehouse',
    gradient: 'from-[#0096c7] to-[#0077b6]',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    accentColor: '#0096c7',
    defaultUser: 'Godown Supervisor',
    defaultRole: 'godown_incharge'
  },
  { 
    id: 'sales', 
    name: 'Sales Department', 
    shortName: 'Sales',
    code: 'SALE',
    role: 'Sales Dispatch Officer',
    quote: 'Delivering trust and premium feed to every aqua farmer.',
    desc: 'Daily sales entry (MT) & automatic closing stock calculation per variety.',
    icon: 'TrendingUp',
    gradient: 'from-[#00b4d8] to-[#0077b6]',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    accentColor: '#00b4d8',
    defaultUser: 'Sales Dispatcher',
    defaultRole: 'sales_officer'
  },
  { 
    id: 'manager', 
    name: 'Plant Manager', 
    shortName: 'Plant Manager',
    code: 'MGMT',
    role: 'General Plant Manager',
    quote: 'Leadership with vision, quality with zero compromise.',
    desc: 'Executive plant review, day report approvals, auto-approve switch, and leave authorizations.',
    icon: 'ShieldCheck',
    gradient: 'from-[#0284c7] to-[#0369a1]',
    lightBg: 'bg-sky-50 dark:bg-sky-950/30',
    borderColor: 'border-sky-200 dark:border-sky-800',
    accentColor: '#0284c7',
    defaultUser: 'General Plant Manager',
    defaultRole: 'plant_manager'
  },
];

export const GI_CREATIVE_WHATSAPP = '918985361991';
export const GI_CREATIVE_PHONE = '+91 8985361991';

export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentShift() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 14) return 'Shift A';
  if (hour >= 14 && hour < 22) return 'Shift B';
  return 'Shift C';
}

export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return {
      salutation: 'Good Morning',
      note: 'Ensure pre-checks for boilers, coolers & dies before starting the shift. High quality feed is our top priority.'
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      salutation: 'Good Afternoon',
      note: 'Maintain steady steam pressure and monitor conditioning temperature for optimal pellet durability (PDI).'
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      salutation: 'Good Evening',
      note: 'Verify crumbler roll clearances and check bag weights regularly. Safety first at all packaging stations.'
    };
  }
  return {
    salutation: 'Good Night',
    note: 'Keep lines running smoothly. Check motor bearings and coordinate closely with the electrical power team.'
  };
}
