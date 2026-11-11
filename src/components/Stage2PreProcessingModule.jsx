import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Recycle,
  Filter,
  Flame,
  Scale,
  X,
  Droplets,
  Wind
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
  recalibratedPreProcessings,
  setPreProcessings,
  recalibratedRawPurchases,
  polymers,
  costTariffs,
  onRequestDelete
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  // Filter available raw reject batches (stock > 0)
  const availableRawLots = recalibratedRawPurchases.filter(
    r => r.remainingKg > 0 || (modalState.item && modalState.item.rawPurchaseId === r.id)
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
    setModalState({ isOpen: false, item: null });
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
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="flex items-center space-x-1.5 px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Proses Giling & Cuci Baru</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Recycle className="w-4 h-4 text-sky-400" />
              <span>Tahap 2: Sortir, Crushing (Giling), Cuci & Drying (Pre-Processing)</span>
            </h3>
            <p className="text-2xs text-slate-400">
              Mengubah bahan reject kotor menjadi cacahan bersih kering (Flakes). Susut dan HPP Flakes terhitung otomatis.
            </p>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-2xs text-slate-400 block">Total Aset Cacahan Flakes:</span>
            <span className="text-sm font-bold text-sky-400">
              {formatRupiah(recalibratedPreProcessings.reduce((acc, p) => acc + p.assetValue, 0))}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2.5 px-3">No. Proses & Tgl</th>
                <th className="py-2.5 px-3">Lot Reject Asal</th>
                <th className="py-2.5 px-3">Batch & Nama Flakes Bersih</th>
                <th className="py-2.5 px-3">Metode Cuci / Giling</th>
                <th className="py-2.5 px-3 text-right">Reject Masuk (Kg)</th>
                <th className="py-2.5 px-3 text-right">Hasil Flakes (Kg)</th>
                <th className="py-2.5 px-3 text-right">Sampah Terbuang</th>
                <th className="py-2.5 px-3 text-right">HPP Flakes / Kg</th>
                <th className="py-2.5 px-3 text-right">Sisa Stok Flakes</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-24 sticky right-0 bg-slate-900 shadow-md">Aksi</th>
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
                      <span className="font-bold text-emerald-400 block">{prc.rawBatchNo}</span>
                      <span className="text-2xs text-slate-400">Beli: {formatRupiah(prc.rawUnitPrice)}/Kg</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-mono font-bold text-purple-400 block">{prc.outputFlakesBatchNo}</span>
                      <span className="font-semibold text-white truncate max-w-[200px] block">{prc.flakesName}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-2xs text-slate-300">
                      <div className="flex items-center space-x-1">
                        {prc.method.includes('Wash') ? <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" /> : <Wind className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        <span className="truncate max-w-[150px]">{prc.method}</span>
                      </div>
                      <span className="text-slate-500">Tarif: {formatRupiah(prc.processCostRatePerKg)}/Kg</span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">
                      {formatNumber(prc.rawUsedKg, 1)} Kg
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
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
                      <span className={`font-bold block ${isExhausted ? 'text-slate-500' : 'text-purple-400'}`}>
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
                    <td className="py-2.5 px-3 text-center sticky right-0 bg-slate-900 shadow-md">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setModalState({ isOpen: true, item: prc })}
                          className="p-1.5 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
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
                          className="p-1.5 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 flex items-center justify-center"
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
          polymers={polymers}
          defaultCostRate={costTariffs.preProcessingRatePerKg}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Pre-Processing Form
// -------------------------------------------------------------
function PreProcessingFormModal({ item, availableRawLots, polymers, defaultCostRate, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const dateCode = today.replace(/-/g, '').slice(2);
  const defaultProcessNo = `PRC-${dateCode}-${String(Date.now()).slice(-3)}`;
  const defaultFlakesBatch = `FLK-PP-${dateCode}-${String(Date.now()).slice(-2)}`;

  const initialRaw = availableRawLots[0];

  const [formData, setFormData] = useState({
    processNo: item?.processNo || defaultProcessNo,
    date: item?.date || today,
    rawPurchaseId: item?.rawPurchaseId || (initialRaw?.id || ''),
    polymerId: item?.polymerId || (initialRaw?.polymerId || polymers[0]?.id || ''),
    outputFlakesBatchNo: item?.outputFlakesBatchNo || defaultFlakesBatch,
    flakesName: item?.flakesName || 'Cacahan Flakes PP Bersih Kering',
    method: item?.method || 'Wet Grinding + Hot Wash + Spin Drying',
    rawUsedKg: item?.rawUsedKg !== undefined ? item.rawUsedKg : 1000,
    outputFlakesKg: item?.outputFlakesKg !== undefined ? item.outputFlakesKg : 940,
    processCostRatePerKg: item?.processCostRatePerKg !== undefined ? item.processCostRatePerKg : defaultCostRate,
    operator: item?.operator || 'Regu Cuci Shift 1',
    status: item?.status || 'Selesai',
    notes: item?.notes || ''
  });

  const selectedRaw = availableRawLots.find(r => r.id === formData.rawPurchaseId);
  const maxAvailableRawKg = selectedRaw ? (selectedRaw.remainingKg + (item ? item.rawUsedKg : 0)) : 0;
  const rawUnitPrice = selectedRaw ? selectedRaw.pricePerKg : 8500;

  const rawUsed = Number(formData.rawUsedKg) || 0;
  const outputFlakes = Number(formData.outputFlakesKg) || 0;
  const rate = Number(formData.processCostRatePerKg) || defaultCostRate;

  // Real-time calculations
  const rawCost = rawUsed * rawUnitPrice;
  const totalProcessCost = outputFlakes * rate;
  const totalStageCost = rawCost + totalProcessCost;
  const wasteKg = Math.max(0, rawUsed - outputFlakes);
  const wastePct = rawUsed > 0 ? (wasteKg / rawUsed) * 100 : 0;
  const hppFlakes = outputFlakes > 0 ? (totalStageCost / outputFlakes) : 0;

  const handleRawChange = (rawId) => {
    const raw = availableRawLots.find(r => r.id === rawId);
    setFormData(prev => ({
      ...prev,
      rawPurchaseId: rawId,
      polymerId: raw?.polymerId || prev.polymerId,
      outputFlakesBatchNo: raw ? `FLK-${raw.polymerCode || 'PL'}-${dateCode}-${String(Date.now()).slice(-2)}` : prev.outputFlakesBatchNo,
      flakesName: raw ? `Cacahan Flakes ${raw.polymerCode || ''} (${raw.form})` : prev.flakesName
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.processNo || !formData.rawPurchaseId || outputFlakes <= 0) return;

    onSave({
      ...formData,
      rawUsedKg: rawUsed,
      rawUnitPrice,
      rawMaterialCost: rawCost,
      outputFlakesKg: outputFlakes,
      processCostRatePerKg: rate,
      totalProcessCost,
      totalStageCost,
      wasteSortirKg: wasteKg,
      wastePercentage: wastePct,
      hppFlakesPerKg: hppFlakes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Recycle className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-white text-sm">
              {item ? `Koreksi Proses Giling & Cuci: ${item.processNo}` : 'Form Proses Sortir, Giling (Crusher) & Pencucian'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. Perintah Proses *</label>
              <input
                required
                type="text"
                value={formData.processNo}
                onChange={e => setFormData({ ...formData, processNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tanggal Proses *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Operator / Regu Cuci</label>
              <input
                type="text"
                value={formData.operator}
                onChange={e => setFormData({ ...formData, operator: e.target.value })}
                placeholder="Regu Shift 1"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          {/* Source Reject Selection */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
              1. Ambil Bahan Baku Reject dari Gudang Kotor
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 text-2xs mb-1">Pilih Lot Reject Kotor *</label>
                <select
                  required
                  value={formData.rawPurchaseId}
                  onChange={e => handleRawChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
                >
                  {availableRawLots.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.batchNo} - {r.polymerName} (Sisa: {formatNumber(r.remainingKg, 0)} Kg @ {formatRupiah(r.pricePerKg)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-2xs mb-1">Berat Masuk Giling (Kg) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.rawUsedKg}
                  onChange={e => setFormData({ ...formData, rawUsedKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right text-sm font-bold focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>

            {rawUsed > maxAvailableRawKg && (
              <p className="text-2xs text-rose-400 font-semibold">
                ⚠️ Jumlah input ({rawUsed} Kg) melebihi sisa stok lot reject ({formatNumber(maxAvailableRawKg, 1)} Kg).
              </p>
            )}
          </div>

          {/* Process Method & Output */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Metode Pengolahan</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
              >
                <option value="Wet Grinding + Hot Wash + Spin Drying">Wet Grinding + Wash + Spin Dryer</option>
                <option value="Crushing + Float-Sink Wash Tank + Dryer">Crushing + Bak Apung Sink + Dryer</option>
                <option value="Dry Grinding Direct (Tanpa Cuci Air)">Dry Grinding Direct (Tanpa Cuci)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Batch Flakes Dihasilkan *</label>
              <input
                required
                type="text"
                value={formData.outputFlakesBatchNo}
                onChange={e => setFormData({ ...formData, outputFlakesBatchNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-purple-400 font-mono uppercase font-bold focus:outline-hidden focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Nama Produk Cacahan Flakes</label>
              <input
                type="text"
                value={formData.flakesName}
                onChange={e => setFormData({ ...formData, flakesName: e.target.value })}
                placeholder="Cacahan Flakes PP Bersih"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          {/* Output Timbangan Flakes & Susut */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5 font-mono">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block font-sans">
              2. Timbangan Nyata Flakes Kering & Biaya Proses Cuci
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1 font-sans">
                  <label className="text-slate-400 text-2xs">Hasil Flakes Bersih (Kg) *</label>
                  {rawUsed > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, outputFlakesKg: Math.round(rawUsed * 0.94) }))}
                      className="text-2xs text-sky-400 hover:text-sky-300 underline"
                      title="Set timbangan estimasi susut cuci 6%"
                    >
                      Susut 6% ({Math.round(rawUsed * 0.94)} Kg)
                    </button>
                  )}
                </div>
                <input
                  required
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.outputFlakesKg}
                  onChange={e => setFormData({ ...formData, outputFlakesKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-sky-500 rounded px-2.5 py-1.5 text-emerald-400 font-bold text-base text-right focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Tarif Biaya Cuci/Giling (Rp/Kg)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.processCostRatePerKg}
                  onChange={e => setFormData({ ...formData, processCostRatePerKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-right text-sm focus:outline-hidden"
                />
                <span className="text-2xs text-slate-400 block text-right mt-0.5">
                  Biaya Cuci: {formatRupiah(totalProcessCost)}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Status Proses</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-sans focus:outline-hidden"
                >
                  <option value="Selesai">Selesai (Siap Blending)</option>
                  <option value="Sedang Cuci/Giling">Sedang Cuci/Giling</option>
                </select>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Kotoran/Sampah Dibuang:</span>
                <span className="font-bold text-rose-400">-{formatWeight(wasteKg)}</span>
                <span className="text-2xs text-slate-400 block">({formatPercent(wastePct)})</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Total Nilai Bahan Kotor:</span>
                <span className="font-bold text-white">{formatRupiah(rawCost)}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Total Beban Tahap 2:</span>
                <span className="font-bold text-amber-300">{formatRupiah(totalStageCost)}</span>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <span className="text-2xs text-sky-400 block font-sans font-bold">HPP Flakes / Kg:</span>
                <span className="font-black text-sky-400 text-sm">{formatRupiah(hppFlakes)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-2xs text-slate-500">
              * Flakes yang selesai otomatis masuk ke Gudang Cacahan Bersih dan siap diambil di Tahap 3 (SPK Ekstrusi).
            </span>
            <div className="flex space-x-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
              <button type="submit" className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold">Simpan Hasil Flakes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
