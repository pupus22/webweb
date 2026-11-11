import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PurchasesModule from './components/PurchasesModule';
import ProductionModule from './components/ProductionModule';
import InventoryModule from './components/InventoryModule';
import SalesModule from './components/SalesModule';
import MasterDataModule from './components/MasterDataModule';
import ConfirmModal from './components/ConfirmModal';

import {
  loadDatabase,
  saveDatabase,
  getInitialDatabase,
  exportBackupJSON,
  importBackupJSON
} from './data/storage';
import { recalculateAll } from './utils/calculations';

export default function App() {
  const [database, setDatabase] = useState(() => loadDatabase());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmVariant: 'danger',
    onConfirm: () => {}
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Save to LocalStorage whenever database changes
  useEffect(() => {
    saveDatabase(database);
  }, [database]);

  // Dynamic automatic recalculation & recalibration engine
  const {
    recalibratedPurchases,
    recalibratedProductions,
    finishedGoodsInventory,
    recalibratedSales,
    kpis
  } = useMemo(() => recalculateAll(database), [database]);

  // Setters for each sub-collection
  const setPlasticTypes = (updater) => {
    setDatabase(prev => ({
      ...prev,
      plasticTypes: typeof updater === 'function' ? updater(prev.plasticTypes) : updater
    }));
  };

  const setPlasticForms = (updater) => {
    setDatabase(prev => ({
      ...prev,
      plasticForms: typeof updater === 'function' ? updater(prev.plasticForms) : updater
    }));
  };

  const setContacts = (updater) => {
    setDatabase(prev => ({
      ...prev,
      contacts: typeof updater === 'function' ? updater(prev.contacts) : updater
    }));
  };

  const setCostComponents = (updater) => {
    setDatabase(prev => ({
      ...prev,
      costComponents: typeof updater === 'function' ? updater(prev.costComponents) : updater
    }));
  };

  const setPurchases = (updater) => {
    setDatabase(prev => ({
      ...prev,
      purchases: typeof updater === 'function' ? updater(prev.purchases) : updater
    }));
    showToast('Data Pembelian diperbarui & Stok/HPP ter-rekalibrasi');
  };

  const setProductions = (updater) => {
    setDatabase(prev => ({
      ...prev,
      productions: typeof updater === 'function' ? updater(prev.productions) : updater
    }));
    showToast('SPK Produksi diperbarui & Gudang Pelet ter-rekalibrasi');
  };

  const setStockAdjustments = (updater) => {
    setDatabase(prev => ({
      ...prev,
      stockAdjustments: typeof updater === 'function' ? updater(prev.stockAdjustments) : updater
    }));
    showToast('Penyesuaian Opname berhasil disimpan');
  };

  const setSales = (updater) => {
    setDatabase(prev => ({
      ...prev,
      sales: typeof updater === 'function' ? updater(prev.sales) : updater
    }));
    showToast('Data Penjualan berhasil disimpan');
  };

  // Reset to Demo Data
  const handleResetDemo = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Demo Data Simulasi Pabrik',
      message: 'Apakah Anda yakin ingin mengembalikan seluruh data ke simulasi pabrik awal? Semua input data saat ini akan ditimpa dengan data demo.',
      confirmVariant: 'danger',
      onConfirm: () => {
        const initial = getInitialDatabase();
        setDatabase(initial);
        saveDatabase(initial);
        showToast('Data simulasi pabrik berhasil dimuat ulang!');
      }
    });
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    exportBackupJSON(database);
    showToast('File backup JSON berhasil diunduh!');
  };

  // Import JSON Backup
  const handleImportBackup = async (file) => {
    try {
      const imported = await importBackupJSON(file);
      setDatabase(imported);
      saveDatabase(imported);
      showToast('File backup berhasil di-restore ke sistem!');
    } catch (err) {
      alert(`Gagal import backup: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg shadow-xl text-xs flex items-center space-x-2 border border-emerald-400/40">
            <span>✓</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        onExport={handleExportBackup}
        onImport={handleImportBackup}
      />

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4">
        {activeTab === 'dashboard' && (
          <Dashboard
            kpis={kpis}
            recalibratedPurchases={recalibratedPurchases}
            recalibratedProductions={recalibratedProductions}
            finishedGoodsInventory={finishedGoodsInventory}
            recalibratedSales={recalibratedSales}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesModule
            recalibratedPurchases={recalibratedPurchases}
            setPurchases={setPurchases}
            plasticTypes={database.plasticTypes}
            plasticForms={database.plasticForms}
            contacts={database.contacts}
            onRequestDelete={setConfirmModal}
          />
        )}

        {activeTab === 'production' && (
          <ProductionModule
            recalibratedProductions={recalibratedProductions}
            setProductions={setProductions}
            recalibratedPurchases={recalibratedPurchases}
            plasticTypes={database.plasticTypes}
            costComponents={database.costComponents}
            onRequestDelete={setConfirmModal}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryModule
            finishedGoodsInventory={finishedGoodsInventory}
            recalibratedPurchases={recalibratedPurchases}
            stockAdjustments={database.stockAdjustments}
            setStockAdjustments={setStockAdjustments}
            onRequestDelete={setConfirmModal}
          />
        )}

        {activeTab === 'sales' && (
          <SalesModule
            recalibratedSales={recalibratedSales}
            setSales={setSales}
            finishedGoodsInventory={finishedGoodsInventory}
            contacts={database.contacts}
            onRequestDelete={setConfirmModal}
          />
        )}

        {activeTab === 'master' && (
          <MasterDataModule
            plasticTypes={database.plasticTypes}
            setPlasticTypes={setPlasticTypes}
            plasticForms={database.plasticForms}
            setPlasticForms={setPlasticForms}
            contacts={database.contacts}
            setContacts={setContacts}
            costComponents={database.costComponents}
            setCostComponents={setCostComponents}
            onRequestDelete={setConfirmModal}
          />
        )}
      </main>

      {/* Footer Status Bar (High-density ERP footer) */}
      <footer className="no-print bg-slate-900 border-t border-slate-800 text-slate-500 text-2xs py-2 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-400">PolyComp ERP v1.0</span>
            <span>•</span>
            <span>Plastics Recycling, Sorting & Compounding Management System</span>
          </div>
          <div className="flex items-center space-x-3 font-mono">
            <span>Bahan Baku: {recalibratedPurchases.length} Batches</span>
            <span>•</span>
            <span>SPK: {recalibratedProductions.length}</span>
            <span>•</span>
            <span>Gudang Pelet: {finishedGoodsInventory.length}</span>
            <span>•</span>
            <span>Pesanan: {recalibratedSales.length}</span>
          </div>
        </div>
      </footer>

      {/* Global Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmVariant={confirmModal.confirmVariant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
