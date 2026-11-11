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
import TraceabilityModal from './components/TraceabilityModal';
import BagLabelModal from './components/BagLabelModal';
import GlobalSearchModal from './components/GlobalSearchModal';
import ErrorBoundary from './components/ErrorBoundary';

import {
  loadDatabase,
  saveDatabase,
  getInitialDatabase,
  exportBackupJSON,
  importBackupJSON
} from './data/storage';
import { recalculateERP } from './utils/calculations';
import { exportToCSV } from './utils/csvExport';

export default function App() {
  const [database, setDatabase] = useState(() => loadDatabase());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Theme state: dark (default) | light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('polycomp_theme') || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('polycomp_theme', next);
      return next;
    });
  };

  // Modals & Cross-stage shortcut states
  const [printOrder, setPrintOrder] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmVariant: 'danger',
    onConfirm: () => {}
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [traceabilityIdentifier, setTraceabilityIdentifier] = useState(null);
  const [bagLabelLot, setBagLabelLot] = useState(null);

  // Shortcut staging state
  const [stage2InitialRawId, setStage2InitialRawId] = useState(null);
  const [stage3InitialFlakesId, setStage3InitialFlakesId] = useState(null);
  const [stage5InitialLotNo, setStage5InitialLotNo] = useState(null);

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist to LocalStorage whenever database state updates
  useEffect(() => {
    saveDatabase(database);
  }, [database]);

  // Master 5-Stage Cascading Recalibration Engine
  const recalibratedData = useMemo(() => recalculateERP(database), [database]);
  const {
    recalibratedRawPurchases,
    recalibratedPreProcessings,
    recalibratedProductionSPKs,
    finishedGoodsPelletInventory,
    recalibratedSalesOrders,
    kpis
  } = recalibratedData;

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

  // 1-Click Fast Workflow Handlers
  const handleFastPreProcess = (rawItem) => {
    setStage2InitialRawId(rawItem.id);
    setActiveTab('stage2');
    showToast(`Membuka form giling untuk batch ${rawItem.batchNo}`);
  };

  const handleFastCreateSPK = (flakesItem) => {
    setStage3InitialFlakesId(flakesItem.id);
    setActiveTab('stage3');
    showToast(`Membuka form SPK untuk flakes ${flakesItem.outputFlakesBatchNo}`);
  };

  const handleFastCreateSale = (pelletItem) => {
    setStage5InitialLotNo(pelletItem.lotNo);
    setActiveTab('stage5');
    showToast(`Membuka form penjualan untuk lot ${pelletItem.lotNo}`);
  };

  // Export Active Tab to CSV
  const handleExportCSV = () => {
    if (activeTab === 'stage1') {
      exportToCSV('Tahap1_Pembelian_Reject', [
        { label: 'Kode Batch', key: 'batchNo' },
        { label: 'Tanggal', key: 'date' },
        { label: 'Supplier', key: 'supplierName' },
        { label: 'Polimer', key: 'polymerCode' },
        { label: 'Bentuk Awal', key: 'formType' },
        { label: 'Warna Dasar', key: 'rawColor' },
        { label: 'Gross (Kg)', key: 'grossWeightKg' },
        { label: 'Potongan (Kg)', key: 'tareWeightKg' },
        { label: 'Netto (Kg)', key: 'netWeightKg' },
        { label: 'Harga Beli/Kg', key: 'pricePerKg' },
        { label: 'Total Beli (Rp)', key: 'totalAmount' },
        { label: 'Sisa Stok (Kg)', key: 'remainingKg' },
        { label: 'Status Stok', key: 'status' },
        { label: 'Status Bayar', key: 'paymentStatus' }
      ], recalibratedRawPurchases);
    } else if (activeTab === 'stage2') {
      exportToCSV('Tahap2_Sortir_Cuci_Flakes', [
        { label: 'Batch Flakes', key: 'outputFlakesBatchNo' },
        { label: 'Batch Reject', key: 'rawBatchNo' },
        { label: 'Tanggal', key: 'date' },
        { label: 'Nama Flakes', key: 'flakesName' },
        { label: 'Polimer', key: 'polymerCode' },
        { label: 'Warna', key: 'flakesColor' },
        { label: 'Bahan Masuk (Kg)', key: 'rawUsedKg' },
        { label: 'Output Flakes (Kg)', key: 'outputFlakesKg' },
        { label: 'Waste Sortir (Kg)', key: 'wasteSortirKg' },
        { label: 'Susut (%)', getter: (r) => Number(r.wastePercentage || 0).toFixed(2) + '%' },
        { label: 'HPP Flakes/Kg', key: 'hppFlakesPerKg' },
        { label: 'Sisa Stok (Kg)', key: 'remainingFlakesKg' }
      ], recalibratedPreProcessings);
    } else if (activeTab === 'stage3') {
      exportToCSV('Tahap3_SPK_Ekstrusi', [
        { label: 'No. SPK', key: 'spkNo' },
        { label: 'Kode Lot Pelet', key: 'targetLotNo' },
        { label: 'Tanggal', key: 'date' },
        { label: 'Nama Produk', key: 'targetProductName' },
        { label: 'Polimer', key: 'polymerType' },
        { label: 'Warna', key: 'targetColor' },
        { label: 'Status SPK', key: 'status' },
        { label: 'Total Input (Kg)', key: 'totalInputMixKg' },
        { label: 'Output Pelet (Kg)', key: 'outputPelletKg' },
        { label: 'Susut Ekstrusi (Kg)', key: 'wasteExtrusionKg' },
        { label: 'Loss (%)', getter: (r) => Number(r.wastePercentage || 0).toFixed(2) + '%' },
        { label: 'HPP Final Pelet/Kg', key: 'hppFinalPelletPerKg' },
        { label: 'Mesin Line', key: 'machineLine' }
      ], recalibratedProductionSPKs);
    } else if (activeTab === 'stage4') {
      exportToCSV('Tahap4_Gudang_Pelet', [
        { label: 'Kode Lot', key: 'lotNo' },
        { label: 'No. SPK', key: 'spkNo' },
        { label: 'Nama Produk', key: 'productName' },
        { label: 'Polimer', key: 'polymerType' },
        { label: 'Warna', key: 'targetColor' },
        { label: 'QC Status', key: 'qcStatus' },
        { label: 'MFI', key: 'mfi' },
        { label: 'Stok Pelet (Kg)', key: 'currentStockKg' },
        { label: 'Jumlah Sak (@25Kg)', key: 'availableBags' },
        { label: 'HPP Pelet/Kg', key: 'hppFinalPelletPerKg' },
        { label: 'Nilai Aset (Rp)', key: 'totalAssetValue' },
        { label: 'Status', key: 'stockStatus' }
      ], finishedGoodsPelletInventory);
    } else if (activeTab === 'stage5') {
      exportToCSV('Tahap5_Penjualan_DO', [
        { label: 'No. DO', key: 'orderNo' },
        { label: 'No. Invoice', key: 'invoiceNo' },
        { label: 'Tanggal', key: 'date' },
        { label: 'Customer', key: 'customerName' },
        { label: 'Lot Pelet', key: 'targetLotNo' },
        { label: 'Qty (Kg)', key: 'qtyKg' },
        { label: 'Jumlah Sak', key: 'bagCount' },
        { label: 'Harga/Kg', key: 'pricePerKg' },
        { label: 'Total Omset', key: 'netRevenue' },
        { label: 'HPP/Kg', key: 'cogsPerKg' },
        { label: 'Laba Kotor', key: 'grossProfit' },
        { label: 'Status Bayar', key: 'paymentStatus' },
        { label: 'Plat Truk', key: 'truckPlate' }
      ], recalibratedSalesOrders);
    } else {
      showToast('Pilih halaman Tahap 1 - 5 untuk mengekspor data tabel', 'info');
    }
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
      <div className={`min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-purple-600 selection:text-white ${
        theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
      }`}>
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
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenSearch={() => setSearchModalOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onExportCSV={handleExportCSV}
          onResetDemo={handleResetDemo}
          onExportJSON={handleExportBackup}
          onImportJSON={handleImportBackup}
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
                onFastPreProcess={handleFastPreProcess}
                onOpenTraceability={(id) => setTraceabilityIdentifier(id)}
              />
            )}

            {activeTab === 'stage2' && (
              <Stage2PreProcessingModule
                recalibratedPreProcessings={recalibratedPreProcessings}
                setPreProcessings={setPreProcessings}
                recalibratedRawPurchases={recalibratedRawPurchases}
                costTariffs={database.costTariffs || {}}
                onRequestDelete={setConfirmModal}
                onFastCreateSPK={handleFastCreateSPK}
                onOpenTraceability={(id) => setTraceabilityIdentifier(id)}
                initialRawBatchId={stage2InitialRawId}
                onClearInitialRawBatchId={() => setStage2InitialRawId(null)}
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
                onOpenTraceability={(id) => setTraceabilityIdentifier(id)}
                initialFlakesBatchId={stage3InitialFlakesId}
                onClearInitialFlakesBatchId={() => setStage3InitialFlakesId(null)}
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
                onFastCreateSale={handleFastCreateSale}
                onOpenBagLabel={(lot) => setBagLabelLot(lot)}
                onOpenTraceability={(id) => setTraceabilityIdentifier(id)}
                onFastCreateSPK={handleFastCreateSPK}
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
                onOpenTraceability={(id) => setTraceabilityIdentifier(id)}
                initialLotNo={stage5InitialLotNo}
                onClearInitialLotNo={() => setStage5InitialLotNo(null)}
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

        {/* Traceability Modal (Hulu ke Hilir 5-Tahap) */}
        {traceabilityIdentifier && (
          <TraceabilityModal
            identifier={traceabilityIdentifier}
            onClose={() => setTraceabilityIdentifier(null)}
            rawPurchases={recalibratedRawPurchases}
            preProcessings={recalibratedPreProcessings}
            productionSPKs={recalibratedProductionSPKs}
            finishedGoods={finishedGoodsPelletInventory}
            salesOrders={recalibratedSalesOrders}
          />
        )}

        {/* Bag / Pallet Tag Printable Modal */}
        {bagLabelLot && (
          <BagLabelModal
            lot={bagLabelLot}
            onClose={() => setBagLabelLot(null)}
          />
        )}

        {/* Global Search Modal (Ctrl+K) */}
        <GlobalSearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onNavigate={(tab) => {
            setActiveTab(tab);
            setSearchModalOpen(false);
          }}
          onOpenTraceability={(id) => {
            setTraceabilityIdentifier(id);
            setSearchModalOpen(false);
          }}
          database={database}
          recalibratedData={recalibratedData}
        />
      </div>
    </ErrorBoundary>
  );
}
