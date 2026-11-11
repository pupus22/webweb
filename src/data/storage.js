import {
  INITIAL_POLYMERS,
  INITIAL_ADDITIVES,
  INITIAL_CONTACTS,
  INITIAL_COST_TARIFFS,
  INITIAL_RAW_PURCHASES,
  INITIAL_PRE_PROCESSINGS,
  INITIAL_PRODUCTION_SPKS,
  INITIAL_STOCK_ADJUSTMENTS,
  INITIAL_SALES_ORDERS
} from './defaultData';

const STORAGE_KEY = 'POLYCOMP_ERP_DATABASE_V2';

export function getInitialDatabase() {
  return {
    polymers: INITIAL_POLYMERS,
    additives: INITIAL_ADDITIVES,
    contacts: INITIAL_CONTACTS,
    costTariffs: INITIAL_COST_TARIFFS,
    rawPurchases: INITIAL_RAW_PURCHASES,
    preProcessings: INITIAL_PRE_PROCESSINGS,
    productionSPKs: INITIAL_PRODUCTION_SPKS,
    stockAdjustments: INITIAL_STOCK_ADJUSTMENTS,
    salesOrders: INITIAL_SALES_ORDERS
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
      polymers: parsed.polymers || INITIAL_POLYMERS,
      additives: parsed.additives || INITIAL_ADDITIVES,
      contacts: parsed.contacts || INITIAL_CONTACTS,
      costTariffs: parsed.costTariffs || INITIAL_COST_TARIFFS,
      rawPurchases: parsed.rawPurchases || [],
      preProcessings: parsed.preProcessings || [],
      productionSPKs: parsed.productionSPKs || [],
      stockAdjustments: parsed.stockAdjustments || [],
      salesOrders: parsed.salesOrders || []
    };
  } catch (err) {
    console.error('Failed to parse database from localStorage:', err);
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
  a.download = `PolyComp_ERP_EndToEnd_Backup_${dateStr}.json`;
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
        if (!parsed.rawPurchases && !parsed.polymers) {
          throw new Error('Format file backup ERP tidak valid.');
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
