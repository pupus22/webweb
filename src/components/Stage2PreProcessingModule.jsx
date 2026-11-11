import React, { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Recycle,
  Filter,
  Layers,
  Droplets,
  Wind,
  Scale,
  Zap,
  GitBranch,
  X
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  formatWeight,
  formatPercent,
  formatDate,
  getStatusBadge
} from '../utils/formatters';

export default function Stage2PreProcessingModule({
  recalibratedPreProcessings = [],
  setPreProcessings,
  recalibratedRawPurchases = [],
  polymers = [],
  costTariffs = {},
  onRequestDelete,
  onFastCreateSPK,
  onOpenTraceability,
  initialRawBatchId = null,
  onClearInitialRawBatchId
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, item: null, preselectedRawId: null });

  // Handle auto-open if fast-workflow triggered from Stage 1
  useEffect(() => {
    if (initialRawBatchId) {
      setModalState({ isOpen: true, item: null, preselectedRawId: initialRawBatchId });
      if (onClearInitialRawBatchId) onClearInitialRawBatchId();
    }
  }, [initialRawBatchId, onClearInitialRawBatchId]);

  // Filter available raw reject batches (stock > 0)
  const availableRawLots = recalibratedRawPurchases.filter(
    r => r.remainingKg > 0 || (modalState.item && modalState.item.rawPurchaseId === r.id) || (modalState.preselectedRawId === r.id)
  );

  const handleSave = (formData) => {
    if (modalState.item) {
      setPreProcessings(prev => prev.map(p => p.id === modalState.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `PRC-${String(Date.now()).slice(-4)}`;
      setPreProcessings(prev => [
        {
          id: newId,
          ...formData
        },
        ...prev
      ]);
    }
    setModalState({ isOpen: false, item: null, preselectedRawId: null });
  };

  const filtered = recalibratedPreProcessings.filter(p => {
    return `${p.processNo} ${p.outputFlakesBatchNo} ${p.flakesName} ${p.method} ${p.rawBatchNo}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-3">
      {/* Top Filter and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Batch Flakes, Metode, No Proses..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null, preselectedRawId: null })}
            className="flex items-center space-x-1.5 px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-semibold transition text-xs w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Proses Giling & Cuci Baru</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Recycle className="w-4 h-4 text-sky-400" />
              <span>Tahap 2: Sortir, Crushing (Giling), Cuci & Drying (Pre-Processing)</span>
            </h3>
            <p className="text-2xs text-slate-400">
              Mengubah limbah kotor menjadi cacahan bersih kering (Flakes). Susut lumpur/label & HPP Flakes terhitung otomatis.
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-2xs text-slate-400 block">Total Aset Flakes Bersih:</span>
            <span className="text-sm font-bold text-sky-400">
              {formatRupiah(recalibratedPreProcessings.reduce((acc, p) => acc + (p.assetValue || 0), 0))}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2.5 px-3">No. Proses & Tgl</th>
                <th className="py-2.5 px-3">Batch Reject Asal</th>
                <th className="py-2.5 px-3">Batch & Nama Flakes</th>
                <th className="py-2.5 px-3">Metode Cuci / Giling</th>
                <th className="py-2.5 px-3 text-right">Reject Masuk</th>
                <th className="py-2.5 px-3 text-right">Flakes Bersih</th>
                <th className="py-2.5 px-3 text-right">Lumpur / Sampah</th>
                <th className="py-2.5 px-3 text-right">HPP Flakes / Kg</th>
                <th className="py-2.5 px-3 text-right">Sisa Stok Flakes</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-900 shadow-md">Aksi & Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((prc) => {
                const isExhausted = prc.remainingFlakesKg <= 0;
                return (
                  <tr key={prc.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-sky-400 block">{prc.processNo}</span>
                      <span className="text-2xs text-slate-400 font-sans">{formatDate(prc.date)}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(prc.rawBatchNo)}
                        className="font-bold text-emerald-400 hover:text-emerald-300 underline font-mono text-left flex items-center space-x-1"
                        title="Klik untuk lacak asal reject ini"
                      >
                        <span>{prc.rawBatchNo}</span>
                        <GitBranch className="w-3 h-3 opacity-60" />
                      </button>
                      <span className="text-2xs text-slate-400">Beli: {formatRupiah(prc.rawUnitPrice)}/Kg</span>
                    </td>

                    <td className="py-2.5 px-3 font-sans">
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(prc.outputFlakesBatchNo)}
                        className="font-mono font-bold text-purple-400 hover:text-purple-300 underline text-left flex items-center space-x-1"
                        title="Klik untuk lacak silsilah flakes ini"
                      >
                        <span>{prc.outputFlakesBatchNo}</span>
                        <GitBranch className="w-3 h-3 opacity-60" />
                      </button>
                      <span className="font-semibold text-white block leading-snug">{prc.flakesName}</span>
                    </td>

                    <td className="py-2.5 px-3 font-sans text-2xs text-slate-300">
                      <div className="flex items-center space-x-1">
                        {prc.method.includes('Wash') ? <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" /> : <Wind className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span className="font-medium">{prc.method}</span>
                      </div>
                      <span className="text-slate-500">Tarif Olah: {formatRupiah(prc.processCostRatePerKg)}/Kg</span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatNumber(prc.rawUsedKg, 1)} Kg
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400 text-sm">
                      {formatNumber(prc.outputFlakesKg, 1)} Kg
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="text-rose-400 font-bold block">
                        -{formatNumber(prc.wasteSortirKg, 1)} Kg
                      </span>
                      <span className="text-2xs px-1.5 py-0.2 rounded font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
                        {formatPercent(prc.wastePercentage)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-sky-400">
                      {formatRupiah(prc.hppFlakesPerKg)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold block text-sm ${isExhausted ? 'text-slate-500' : 'text-purple-400'}`}>
                        {formatNumber(prc.remainingFlakesKg, 1)} Kg
                      </span>
                      <span className="text-2xs text-slate-400 font-sans">
                        {isExhausted ? 'Habis terolah' : `Terpakai: ${formatNumber(prc.usedInExtrusionKg, 1)} Kg`}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(prc.status)}`}>
                        {prc.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center sticky right-0 bg-slate-900 shadow-md font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {/* 1-Click Fast Workflow to Stage 3 */}
                        {!isExhausted && onFastCreateSPK && (
                          <button
                            onClick={() => onFastCreateSPK(prc)}
                            className="px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-2xs flex items-center space-x-1 shadow transition"
                            title="Buat SPK Blending di Tahap 3 menggunakan Flakes ini"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>SPK</span>
                          </button>
                        )}

                        <button
                          onClick={() => setModalState({ isOpen: true, item: prc, preselectedRawId: null })}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Hasil Timbangan Flakes"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDelete({
                            title: `Hapus Proses ${prc.processNo}`,
                            message: `Yakin ingin menghapus ${prc.processNo}? Stok cacahan flakes ${prc.outputFlakesBatchNo} akan ditarik dan bahan reject dikembalikan.`,
                            onConfirm: () => setPreProcessings(prev => prev.filter(x => x.id !== prc.id))
                          })}
                          className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    Belum ada proses giling dan cuci flakes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalState.isOpen && (
        <PreProcessingFormModal
          item={modalState.item}
          availableRawLots={availableRawLots}
          preselectedRawId={modalState.preselectedRawId}
          defaultCostRate={costTariffs.preProcessingRatePerKg}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null, preselectedRawId: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Input & Edit Pre-Processing
// -------------------------------------------------------------
function PreProcessingFormModal({ item, availableRawLots = [], preselectedRawId = null, defaultCostRate = 1250, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultProcess = `PRC-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;
  const defaultFlakesBatch = `FLK-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;

  const chosenRawId = item?.rawPurchaseId || preselectedRawId || availableRawLots[0]?.id || '';
  const initialRaw = availableRawLots.find(r => r.id === chosenRawId);

  const [formData, setFormData] = useState({
    processNo: item?.processNo || defaultProcess,
    date: item?.date || today,
    rawPurchaseId: chosenRawId,
    outputFlakesBatchNo: item?.outputFlakesBatchNo || defaultFlakesBatch,
    flakesName: item?.flakesName || (initialRaw ? `Cacahan Flakes ${initialRaw.polymerCode} Bersih Kering` : 'Cacahan Flakes Bersih Kering'),
    flakesColor: item?.flakesColor || (initialRaw ? initialRaw.colorBase : 'Campur'),
    rawUsedKg: item?.rawUsedKg !== undefined ? item.rawUsedKg : (initialRaw ? Math.min(2000, initialRaw.remainingKg) : 1000),
    outputFlakesKg: item?.outputFlakesKg !== undefined ? item.outputFlakesKg : 900,
    method: item?.method || 'Wet Washing Line + Hot Centrifugal Dryer',
    processCostRatePerKg: item?.processCostRatePerKg !== undefined ? item.processCostRatePerKg : defaultCostRate,
    operator: item?.operator || 'Regu Shift Giling Pagi',
    status: item?.status || 'Siap Blending',
    notes: item?.notes || ''
  });

  const selectedRaw = availableRawLots.find(r => r.id === formData.rawPurchaseId);
  const rawUnitPrice = selectedRaw ? selectedRaw.pricePerKg : 8500;
  const maxAvailableRawKg = selectedRaw ? (selectedRaw.remainingKg + (item && item.rawPurchaseId === selectedRaw.id ? Number(item.rawUsedKg || 0) : 0)) : 0;

  // Live Calculations
  const rawUsedKg = Number(formData.rawUsedKg) || 0;
  const outputFlakesKg = Number(formData.outputFlakesKg) || 0;
  const rawMaterialCost = rawUsedKg * rawUnitPrice;
  const processRate = Number(formData.processCostRatePerKg) || defaultCostRate;
  const totalProcessCost = outputFlakesKg * processRate;
  const totalStageCost = rawMaterialCost + totalProcessCost;
  const wasteKg = Math.max(0, rawUsedKg - outputFlakesKg);
  const wastePct = rawUsedKg > 0 ? (wasteKg / rawUsedKg) * 100 : 0;
  const hppFlakes = outputFlakesKg > 0 ? (totalStageCost / outputFlakesKg) : 0;

  const isRawExceeded = rawUsedKg > maxAvailableRawKg;
  const isOutputExceeded = outputFlakesKg > rawUsedKg;

  const handleRawChange = (rawId) => {
    const raw = availableRawLots.find(r => r.id === rawId);
    setFormData(prev => ({
      ...prev,
      rawPurchaseId: rawId,
      flakesName: raw ? `Cacahan Flakes ${raw.polymerCode} Bersih Kering` : prev.flakesName,
      flakesColor: raw ? raw.colorBase : prev.flakesColor,
      rawUsedKg: raw ? Math.min(prev.rawUsedKg, raw.remainingKg) : prev.rawUsedKg
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rawPurchaseId || !formData.outputFlakesBatchNo || rawUsedKg <= 0 || outputFlakesKg <= 0) return;
    if (isRawExceeded) {
      alert(`Berat kotor masuk (${rawUsedKg} Kg) melebihi stok tersedia (${maxAvailableRawKg} Kg)!`);
      return;
    }
    if (isOutputExceeded) {
      alert(`Output flakes bersih (${outputFlakesKg} Kg) tidak boleh melebihi bahan masuk (${rawUsedKg} Kg)!`);
      return;
    }

    onSave({
      ...formData,
      rawUsedKg,
      rawUnitPrice,
      rawMaterialCost,
      outputFlakesKg,
      processCostRatePerKg: processRate,
      totalProcessCost,
      totalStageCost,
      wasteSortirKg: wasteKg,
      wastePercentage: wastePct,
      hppFlakesPerKg: hppFlakes,
      polymerId: selectedRaw ? selectedRaw.polymerId : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Recycle className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-white text-sm">
              {item ? `Koreksi Hasil Giling & Cuci: ${item.processNo}` : 'Input Proses Giling, Cuci & Drying Flakes'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">No. Proses *</label>
              <input
                required
                type="text"
                value={formData.processNo}
                onChange={e => setFormData({ ...formData, processNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Tanggal Proses *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Regu / Operator</label>
              <input
                type="text"
                value={formData.operator}
                onChange={e => setFormData({ ...formData, operator: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          {/* Raw Material Inbound Selector */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-slate-300 font-bold text-2xs">
                Pilih Batch Limbah Reject dari Gudang Bahan Kotor *
              </label>
              {selectedRaw && (
                <span className="text-2xs text-emerald-400 font-mono">
                  Sisa Stok: {formatWeight(maxAvailableRawKg)} @ {formatRupiah(selectedRaw.pricePerKg)}
                </span>
              )}
            </div>

            <select
              required
              value={formData.rawPurchaseId}
              onChange={e => handleRawChange(e.target.value)}
              className="w-full bg-slate-900 border border-emerald-500/50 rounded px-2.5 py-1.5 text-white text-xs font-mono font-medium focus:outline-hidden"
            >
              <option value="">-- Pilih Batch Reject --</option>
              {availableRawLots.map(r => (
                <option key={r.id} value={r.id}>
                  {r.batchNo} - {r.polymerCode} ({r.form} • {r.colorBase}) | Sisa: {formatNumber(r.remainingKg, 0)} Kg
                </option>
              ))}
            </select>
          </div>

          {/* Flakes Output Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Kode Batch Flakes Bersih *</label>
              <input
                required
                type="text"
                value={formData.outputFlakesBatchNo}
                onChange={e => setFormData({ ...formData, outputFlakesBatchNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-purple-400 font-mono font-bold uppercase text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-2xs mb-1">Nama Deskripsi Flakes *</label>
              <input
                required
                type="text"
                value={formData.flakesName}
                onChange={e => setFormData({ ...formData, flakesName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-medium text-xs focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Metode & Jalur Pencucian</label>
              <input
                type="text"
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value })}
                placeholder="Misal: Wet Washing + Centrifugal Dryer"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-2xs mb-1">Warna Cacahan Flakes</label>
              <input
                type="text"
                value={formData.flakesColor}
                onChange={e => setFormData({ ...formData, flakesColor: e.target.value })}
                placeholder="Misal: Bening Transparan / Abu / Hitam"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Timbangan Masuk vs Hasil Timbangan Flakes */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5 font-mono">
            <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block font-sans">
              Timbangan Hasil & Rekalibrasi HPP Flakes
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Berat Masuk Giling (Kg) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.rawUsedKg}
                  onChange={e => setFormData({ ...formData, rawUsedKg: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right text-xs focus:outline-hidden"
                />
                {isRawExceeded && (
                  <span className="text-3xs text-rose-400 font-sans block mt-0.5 font-bold">
                    ⚠️ Melebihi stok kotor ({maxAvailableRawKg} Kg)!
                  </span>
                )}
              </div>

              <div>
                <label className="block text-emerald-400 font-sans text-2xs font-bold mb-1">
                  Hasil Flakes Kering (Output Kg) *
                </label>
                <input
                  required
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.outputFlakesKg}
                  onChange={e => setFormData({ ...formData, outputFlakesKg: e.target.value })}
                  className="w-full bg-slate-900 border border-emerald-500 rounded px-2 py-1 text-emerald-400 font-bold text-right text-sm focus:outline-hidden"
                />
                {isOutputExceeded && (
                  <span className="text-3xs text-rose-400 font-sans block mt-0.5 font-bold">
                    ⚠️ Output melebihi bahan masuk!
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Tarif Olah Cuci (Rp/Kg)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.processCostRatePerKg}
                  onChange={e => setFormData({ ...formData, processCostRatePerKg: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right text-xs focus:outline-hidden"
                />
              </div>
            </div>

            {/* Calculations Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Susut Lumpur / Label:</span>
                <span className="font-bold text-rose-400">-{formatWeight(wasteKg)}</span>
                <span className="text-3xs text-slate-500 block">({formatPercent(wastePct)})</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Total Nilai Bahan Kotor:</span>
                <span className="font-bold text-white">{formatRupiah(rawMaterialCost)}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Total Biaya Cuci:</span>
                <span className="font-bold text-amber-300">{formatRupiah(totalProcessCost)}</span>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <span className="text-2xs text-sky-400 font-sans font-bold block">HPP Flakes / Kg:</span>
                <span className="font-black text-sky-400 text-sm">{formatRupiah(hppFlakes)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold">Simpan Proses Flakes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
