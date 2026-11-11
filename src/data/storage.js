import {
  INITIAL_PLASTIC_TYPES,
  INITIAL_PLASTIC_FORMS,
  INITIAL_CONTACTS,
  INITIAL_COST_COMPONENTS,
  INITIAL_PURCHASES,
  INITIAL_PRODUCTIONS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_SALES
} from './defaultData';

const STORAGE_KEY = 'POLYCOMP_ERP_DATABASE_V1';

export function getInitialDatabase() {
  return {
    plasticTypes: INITIAL_PLASTIC_TYPES,
    plasticForms: INITIAL_PLASTIC_FORMS,
    contacts: INITIAL_CONTACTS,
    costComponents: INITIAL_COST_COMPONENTS,
    purchases: INITIAL_PURCHASES,
    productions: INITIAL_PRODUCTIONS,
    stockAdjustments: INITIAL_STOCK_ADJUSTMENTS,
    sales: INITIAL_SALES
  };
}

export function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return {
      plasticTypes: parsed.plasticTypes || INITIAL_PLASTIC_TYPES,
      plasticForms: parsed.plasticForms || INITIAL_PLASTIC_FORMS,
      contacts: parsed.contacts || INITIAL_CONTACTS,
      costComponents: parsed.costComponents || INITIAL_COST_COMPONENTS,
      purchases: parsed.purchases || [],
      productions: parsed.productions || [],
      stockAdjustments: parsed.stockAdjustments || [],
      sales: parsed.sales || []
    };
  } catch (err) {
    console.error('Failed to load database from localStorage:', err);
    return getInitialDatabase();
  }
}

export function saveDatabase(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
  }
}

export function exportBackupJSON(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PolyComp_ERP_Backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBackupJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.purchases && !parsed.plasticTypes) {
          throw new Error('Format file backup tidak valid.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}
