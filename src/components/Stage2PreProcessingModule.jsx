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

  // Handle fast-workflow auto open if triggered from Stage 1
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

  const filtered = recalibratedPreProcessings.filter(p => {
    return `${p.processNo} ${p.outputFlakesBatchNo} ${p.rawBatchNo} ${p.flakesName} ${p.polymerCode} ${p.method}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const handleSave = (data) => {
    if (modalState.item) {
      setPreProcessings(prev => prev.map(x => x.id === modalState.item.id ? { ...x, ...data } : x));
    } else {
      const newId = `PRC-${String(Date.now()).slice(-4)}`;
      setPreProcessings(prev => [{ id: newId, ...data }, ...prev]);
    }
    setModalState({ isOpen: false, item: null, preselectedRawId: null });
  };

  return (
    <div className="space-y-4">
      {/* Top Action and Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Batch Flakes, Metode, No Proses..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white text-xs"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null, preselectedRawId: null })}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition shadow-xs text-xs w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Proses Giling & Cuci Baru</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden text-xs">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Recycle className="w-4 h-4 text-violet-600" />
              <span>Tahap 2: Sortir, Crushing (Giling), Cuci & Drying (Pre-Processing)</span>
            </h3>
            <p className="text-3xs text-slate-400 mt-0.5">
              Mengubah limbah kotor menjadi cacahan bersih kering (Flakes). Susut kotoran/label & HPP Flakes terhitung otomatis.
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-3xs text-slate-400 block">Total Aset Flakes Bersih:</span>
            <span className="text-sm font-bold text-emerald-600">
              {formatRupiah(recalibratedPreProcessings.reduce((acc, p) => acc + (p.assetValue || 0), 0))}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-3xs uppercase tracking-wider font-semibold">
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
                <th className="py-2.5 px-3 text-center sticky right-0 bg-white/95">Aksi & Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filtered.map((prc) => {
                const isExhausted = prc.remainingFlakesKg <= 0;
                return (
                  <tr key={prc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800 block">{prc.processNo}</span>
                      <span className="text-3xs text-slate-400 font-sans">{formatDate(prc.date)}</span>
                    </td>

                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(prc.rawBatchNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline font-mono text-left flex items-center space-x-1"
                        title="Klik untuk lacak asal reject ini"
                      >
                        <span>{prc.rawBatchNo}</span>
                        <GitBranch className="w-3 h-3 text-violet-400" />
                      </button>
                      <span className="text-3xs text-slate-400">Beli: {formatRupiah(prc.rawUnitPrice)}/Kg</span>
                    </td>

                    <td className="py-2.5 px-3 font-sans">
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(prc.outputFlakesBatchNo)}
                        className="font-mono font-bold text-slate-800 hover:text-violet-600 hover:underline text-left flex items-center space-x-1"
                        title="Klik untuk lacak silsilah flakes ini"
                      >
                        <span>{prc.outputFlakesBatchNo}</span>
                        <GitBranch className="w-3 h-3 text-slate-400" />
                      </button>
                      <span className="font-semibold text-slate-700 block leading-snug">{prc.flakesName}</span>
                    </td>

                    <td className="py-2.5 px-3 font-sans text-2xs text-slate-600">
                      <div className="flex items-center space-x-1">
                        {prc.method.includes('Wash') ? <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" /> : <Wind className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        <span className="font-medium">{prc.method}</span>
                      </div>
                      <span className="text-slate-400 text-3xs">Tarif Olah: {formatRupiah(prc.processCostRatePerKg)}/Kg</span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatNumber(prc.rawUsedKg, 1)} Kg
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-slate-800 text-sm">
                      {formatNumber(prc.outputFlakesKg, 1)} Kg
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className="text-rose-500 font-bold block">
                        -{formatNumber(prc.wasteSortirKg, 1)} Kg
                      </span>
                      <span className="text-3xs px-1.5 py-0.2 rounded font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                        {formatPercent(prc.wastePercentage)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-violet-600">
                      {formatRupiah(prc.hppFlakesPerKg)}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <span className={`font-bold block text-sm ${isExhausted ? 'text-slate-300' : 'text-emerald-600'}`}>
                        {formatNumber(prc.remainingFlakesKg, 1)} Kg
                      </span>
                      <span className="text-3xs text-slate-400 font-sans">
                        {isExhausted ? 'Habis terolah' : `Terpakai: ${formatNumber(prc.usedInExtrusionKg, 1)} Kg`}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${getStatusBadge(prc.status)}`}>
                        {prc.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center sticky right-0 bg-white/95 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {/* 1-Click Fast Workflow to Stage 3 */}
                        {!isExhausted && onFastCreateSPK && (
                          <button
                            onClick={() => onFastCreateSPK(prc)}
                            className="px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-3xs flex items-center space-x-1 border border-violet-200 transition"
                            title="Buat SPK Blending di Tahap 3 menggunakan Flakes ini"
                          >
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>SPK</span>
                          </button>
                        )}

                        <button
                          onClick={() => setModalState({ isOpen: true, item: prc, preselectedRawId: null })}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
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
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-500 transition"
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
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-sans">
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

  const wasteSortirKg = Math.max(0, rawUsedKg - outputFlakesKg);
  const wastePercentage = rawUsedKg > 0 ? (wasteSortirKg / rawUsedKg) * 100 : 0;
  const hppFlakesPerKg = outputFlakesKg > 0 ? (totalStageCost / outputFlakesKg) : 0;

  const isRawOverStock = rawUsedKg > maxAvailableRawKg;

  const handleRawChange = (rawId) => {
    const raw = availableRawLots.find(r => r.id === rawId);
    setFormData(prev => ({
      ...prev,
      rawPurchaseId: rawId,
      flakesName: raw ? `Cacahan Flakes ${raw.polymerCode} Bersih Kering` : prev.flakesName,
      flakesColor: raw ? raw.colorBase : prev.flakesColor,
      rawUsedKg: raw ? Math.min(2000, raw.remainingKg) : prev.rawUsedKg
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.processNo || !formData.rawPurchaseId || !formData.outputFlakesBatchNo || rawUsedKg <= 0 || outputFlakesKg <= 0) return;
    if (isRawOverStock) {
      alert(`Bahan reject yang dimasukkan (${rawUsedKg} Kg) melebihi sisa stok yang tersedia (${maxAvailableRawKg} Kg)!`);
      return;
    }

    onSave({
      ...formData,
      rawUsedKg,
      outputFlakesKg,
      wasteSortirKg,
      wastePercentage,
      hppFlakesPerKg,
      totalStageCost,
      rawUnitPrice,
      polymerId: selectedRaw ? selectedRaw.polymerId : null
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Recycle className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {item ? `Koreksi Proses: ${formData.processNo}` : 'Input Proses Sortasi, Giling & Cuci Flakes Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">No. Proses Sortir/Giling *</label>
              <input
                required
                type="text"
                value={formData.processNo}
                onChange={e => setFormData({ ...formData, processNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white focus:border-violet-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Tanggal Proses *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Regu / Operator Shift</label>
              <input
                type="text"
                value={formData.operator}
                onChange={e => setFormData({ ...formData, operator: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-500 text-2xs font-semibold">Ambil Batch Bahan Reject *</label>
                {selectedRaw && (
                  <span className="text-3xs text-violet-600 font-mono font-medium">
                    Sisa: {formatWeight(maxAvailableRawKg)} @ {formatRupiah(rawUnitPrice)}
                  </span>
                )}
              </div>
              <select
                required
                value={formData.rawPurchaseId}
                onChange={e => handleRawChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white focus:border-violet-500 font-bold"
              >
                <option value="">-- Pilih Batch Reject --</option>
                {availableRawLots.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.batchNo} - {r.polymerName} ({r.form}) | Sisa: {formatNumber(r.remainingKg, 0)} Kg
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Metode Pencucian / Grinding</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              >
                <option value="Wet Washing Line + Hot Centrifugal Dryer">Wet Washing Line + Centrifugal Dryer (&lt;1% Air)</option>
                <option value="Dry Grinding (Crusher Kering)">Dry Grinding (Crusher Kering Tanpa Cuci)</option>
                <option value="Sink-Float Tank Washing + Drying">Sink-Float Density Separation Tank + Drying</option>
              </select>
            </div>
          </div>

          {/* Mass Balance Calculation */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 font-mono">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Neraca Massa Timbangan (Mass Balance Input vs Output)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Bahan Reject Dipakai (Kg) *</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={formData.rawUsedKg}
                  onChange={e => setFormData({ ...formData, rawUsedKg: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold text-right text-xs"
                />
                {isRawOverStock && (
                  <span className="text-3xs text-rose-500 font-sans block mt-0.5 font-bold">
                    ⚠️ Melebihi stok kotor ({maxAvailableRawKg} Kg)
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Hasil Flakes Bersih (Kg) *</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={formData.outputFlakesKg}
                  onChange={e => setFormData({ ...formData, outputFlakesKg: e.target.value })}
                  className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-emerald-600 font-black text-right text-xs"
                />
                <span className="text-3xs text-slate-400 font-sans block text-right mt-0.5">
                  Kadar air &lt; 1%
                </span>
              </div>

              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Tarif Olah Cuci / Kg (Rp)</label>
                <input
                  type="number"
                  value={formData.processCostRatePerKg}
                  onChange={e => setFormData({ ...formData, processCostRatePerKg: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-right text-xs"
                />
              </div>
            </div>

            {/* Susut Preview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-3xs text-slate-400 block font-sans">Sampah/Lumpur (Loss):</span>
                <span className="font-bold text-rose-500">-{formatNumber(wasteSortirKg, 1)} Kg</span>
              </div>
              <div>
                <span className="text-3xs text-slate-400 block font-sans font-semibold">Persentase Susut (%):</span>
                <span className="font-black text-rose-500">{formatPercent(wastePercentage)}</span>
              </div>
              <div>
                <span className="text-3xs text-slate-400 block font-sans">Total Biaya Tahap Ini:</span>
                <span className="font-bold text-slate-800">{formatRupiah(totalStageCost)}</span>
              </div>
              <div className="border-l border-slate-200 pl-2">
                <span className="text-3xs text-slate-400 block font-sans font-semibold text-violet-600">HPP Flakes per Kg:</span>
                <span className="font-black text-violet-600 text-sm">{formatRupiah(hppFlakesPerKg)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Kode Batch Flakes Dihasilkan *</label>
              <input
                required
                type="text"
                value={formData.outputFlakesBatchNo}
                onChange={e => setFormData({ ...formData, outputFlakesBatchNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-violet-600 font-mono text-xs focus:bg-white focus:border-violet-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Nama Cacahan Flakes *</label>
              <input
                required
                type="text"
                value={formData.flakesName}
                onChange={e => setFormData({ ...formData, flakesName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Warna Flakes Bersih</label>
              <input
                type="text"
                value={formData.flakesColor}
                onChange={e => setFormData({ ...formData, flakesColor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-xs"
            >
              Simpan Hasil Giling & Cuci
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
