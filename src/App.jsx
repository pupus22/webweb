import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Stage1PurchasesModule from './components/Stage1PurchasesModule';
import Stage2PreProcessingModule from './components/Stage2PreProcessingModule';
import Stage3ProductionModule from './components/Stage3ProductionModule';
import Stage4InventoryModule from './components/Stage4InventoryModule';
import Stage5SalesModule from './components/Stage5SalesModule';
import MasterDataModule from './components/MasterDataModule';
import PrintModal from './components/PrintModal';
import ConfirmModal from './components/ConfirmModal';
import ErrorBoundary from './components/ErrorBoundary';

import {
  loadDatabase,
  saveDatabase,
  getInitialDatabase,
  exportBackupJSON,
  importBackupJSON
} from './data/storage';
import { recalculateERP } from './utils/calculations';

export default function App() {
  const [database, setDatabase] = useState(() => loadDatabase());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [printOrder, setPrintOrder] = useState(null);
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

  // Persist to LocalStorage whenever database state updates
  useEffect(() => {
    saveDatabase(database);
  }, [database]);

  // Master 5-Stage Cascading Recalibration Engine
  const {
    recalibratedRawPurchases,
    recalibratedPreProcessings,
    recalibratedProductionSPKs,
    finishedGoodsPelletInventory,
    recalibratedSalesOrders,
    kpis
  } = useMemo(() => recalculateERP(database), [database]);

  // Setters for each sub-collection
  const setPolymers = (updater) => {
    setDatabase(prev => ({
      ...prev,
      polymers: typeof updater === 'function' ? updater(prev.polymers || []) : updater
    }));
  };

  const setAdditives = (updater) => {
    setDatabase(prev => ({
      ...prev,
      additives: typeof updater === 'function' ? updater(prev.additives || []) : updater
    }));
  };

  const setContacts = (updater) => {
    setDatabase(prev => ({
      ...prev,
      contacts: typeof updater === 'function' ? updater(prev.contacts || []) : updater
    }));
  };

  const setCostTariffs = (updater) => {
    setDatabase(prev => ({
      ...prev,
      costTariffs: typeof updater === 'function' ? updater(prev.costTariffs || {}) : updater
    }));
    showToast('Tarif biaya operasional pabrik diperbarui');
  };

  const setRawPurchases = (updater) => {
    setDatabase(prev => ({
      ...prev,
      rawPurchases: typeof updater === 'function' ? updater(prev.rawPurchases || []) : updater
    }));
    showToast('Pembelian limbah reject diperbarui & HPP ter-rekalibrasi');
  };

  const setPreProcessings = (updater) => {
    setDatabase(prev => ({
      ...prev,
      preProcessings: typeof updater === 'function' ? updater(prev.preProcessings || []) : updater
    }));
    showToast('Data sortasi/giling/cuci flakes diperbarui');
  };

  const setProductionSPKs = (updater) => {
    setDatabase(prev => ({
      ...prev,
      productionSPKs: typeof updater === 'function' ? updater(prev.productionSPKs || []) : updater
    }));
    showToast('SPK Blending & Ekstrusi pelet diperbarui');
  };

  const setStockAdjustments = (updater) => {
    setDatabase(prev => ({
      ...prev,
      stockAdjustments: typeof updater === 'function' ? updater(prev.stockAdjustments || []) : updater
    }));
    showToast('Catatan Stock Opname berhasil disimpan');
  };

  const setSalesOrders = (updater) => {
    setDatabase(prev => ({
      ...prev,
      salesOrders: typeof updater === 'function' ? updater(prev.salesOrders || []) : updater
    }));
    showToast('Transaksi Penjualan & Surat Jalan berhasil disimpan');
  };

  // Reset Demo Factory Data
  const handleResetDemo = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Demo Data Simulasi Pabrik',
      message: 'Apakah Anda yakin ingin mereset seluruh database ke simulasi pabrik awal? Semua riwayat transaksi akan ditimpa dengan data default pabrik compounding.',
      confirmVariant: 'danger',
      onConfirm: () => {
        const initial = getInitialDatabase();
        setDatabase(initial);
        saveDatabase(initial);
        showToast('Data simulasi pabrik berhasil dimuat ulang!');
      }
    });
  };

  // Export & Import Backup JSON
  const handleExportBackup = () => {
    exportBackupJSON(database);
    showToast('File backup JSON berhasil diunduh!');
  };

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

  // Counts for sidebar badges
  const sidebarCounts = {
    rawPurchases: recalibratedRawPurchases.length,
    preProcessings: recalibratedPreProcessings.length,
    productionSPKs: recalibratedProductionSPKs.length,
    finishedGoods: finishedGoodsPelletInventory.length,
    salesOrders: recalibratedSalesOrders.length
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden selection:bg-purple-600 selection:text-white">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg shadow-xl text-xs flex items-center space-x-2 border border-emerald-400/40">
              <span>✓</span>
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        {/* Global Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onResetDemo={handleResetDemo}
          onExport={handleExportBackup}
          onImport={handleImportBackup}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Main Layout Container (Sidebar + Content Area) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Responsive Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
            counts={sidebarCounts}
          />

          {/* Scrollable Main Content Body */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5 max-w-7xl w-full mx-auto space-y-4">
            {activeTab === 'dashboard' && (
              <Dashboard
                kpis={kpis}
                recalibratedRawPurchases={recalibratedRawPurchases}
                recalibratedPreProcessings={recalibratedPreProcessings}
                recalibratedProductionSPKs={recalibratedProductionSPKs}
                finishedGoodsPelletInventory={finishedGoodsPelletInventory}
                recalibratedSalesOrders={recalibratedSalesOrders}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'stage1' && (
              <Stage1PurchasesModule
                recalibratedRawPurchases={recalibratedRawPurchases}
                setRawPurchases={setRawPurchases}
                polymers={database.polymers || []}
                contacts={database.contacts || []}
                onRequestDelete={setConfirmModal}
              />
            )}

            {activeTab === 'stage2' && (
              <Stage2PreProcessingModule
                recalibratedPreProcessings={recalibratedPreProcessings}
                setPreProcessings={setPreProcessings}
                recalibratedRawPurchases={recalibratedRawPurchases}
                costTariffs={database.costTariffs || {}}
                onRequestDelete={setConfirmModal}
              />
            )}

            {activeTab === 'stage3' && (
              <Stage3ProductionModule
                recalibratedProductionSPKs={recalibratedProductionSPKs}
                setProductionSPKs={setProductionSPKs}
                recalibratedPreProcessings={recalibratedPreProcessings}
                additives={database.additives || []}
                costTariffs={database.costTariffs || {}}
                onRequestDelete={setConfirmModal}
              />
            )}

            {activeTab === 'stage4' && (
              <Stage4InventoryModule
                finishedGoodsPelletInventory={finishedGoodsPelletInventory}
                recalibratedPreProcessings={recalibratedPreProcessings}
                stockAdjustments={database.stockAdjustments || []}
                setStockAdjustments={setStockAdjustments}
                setProductionSPKs={setProductionSPKs}
                onRequestDelete={setConfirmModal}
              />
            )}

            {activeTab === 'stage5' && (
              <Stage5SalesModule
                recalibratedSalesOrders={recalibratedSalesOrders}
                setSalesOrders={setSalesOrders}
                finishedGoodsPelletInventory={finishedGoodsPelletInventory}
                contacts={database.contacts || []}
                onPrintOrder={(order) => setPrintOrder(order)}
                onRequestDelete={setConfirmModal}
              />
            )}

            {activeTab === 'master' && (
              <MasterDataModule
                polymers={database.polymers || []}
                setPolymers={setPolymers}
                additives={database.additives || []}
                setAdditives={setAdditives}
                contacts={database.contacts || []}
                setContacts={setContacts}
                costTariffs={database.costTariffs || {}}
                setCostTariffs={setCostTariffs}
                onRequestDelete={setConfirmModal}
              />
            )}
          </main>
        </div>

        {/* High-Density Footer Status Bar */}
        <footer className="no-print bg-slate-900 border-t border-slate-800 text-slate-500 text-2xs py-2 px-4 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-400">PolyComp ERP v2.0</span>
              <span>•</span>
              <span>Plastics Recycling, Washing, Compounding & Pellets Manufacturing</span>
            </div>
            <div className="flex items-center space-x-2.5 font-mono">
              <span>Reject: {recalibratedRawPurchases.length}</span>
              <span>•</span>
              <span>Flakes: {recalibratedPreProcessings.length}</span>
              <span>•</span>
              <span>SPK Pelet: {recalibratedProductionSPKs.length}</span>
              <span>•</span>
              <span>Gudang Sak: {finishedGoodsPelletInventory.reduce((a, b) => a + (b.availableBags || 0), 0)} Sak</span>
              <span>•</span>
              <span>Surat Jalan: {recalibratedSalesOrders.length}</span>
            </div>
          </div>
        </footer>

        {/* Global Print Modal */}
        {printOrder && (
          <PrintModal
            sale={printOrder}
            onClose={() => setPrintOrder(null)}
          />
        )}

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
    </ErrorBoundary>
  );
}
