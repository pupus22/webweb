import React, { useState } from 'react';
import {
  Warehouse,
  Scale,
  Search,
  SlidersHorizontal,
  History,
  Trash2,
  Package,
  Layers,
  ArrowUpDown,
  X
} from 'lucide-react';
import { formatRupiah, formatNumber, formatWeight, formatDate, getStatusBadge } from '../utils/formatters';

export default function InventoryModule({
  finishedGoodsInventory,
  recalibratedPurchases,
  stockAdjustments,
  setStockAdjustments,
  onRequestDelete
}) {
  const [activeTab, setActiveTab] = useState('finished');
  const [searchQuery, setSearchQuery] = useState('');
  const [opnameModal, setOpnameModal] = useState({ isOpen: false, item: null });

  const handleSaveOpname = (formData) => {
    const newId = `ADJ-${String(Date.now()).slice(-4)}`;
    setStockAdjustments(prev => [
      {
        id: newId,
        ...formData
      },
      ...prev
    ]);
    setOpnameModal({ isOpen: false, item: null });
  };

  const filteredFinishedGoods = finishedGoodsInventory.filter(fg => {
    return `${fg.batchNo} ${fg.productName} ${fg.targetColor} ${fg.targetType}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const filteredRawMaterials = recalibratedPurchases.filter(p => {
    return `${p.batchNo} ${p.plasticName} ${p.supplierName} ${p.form}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-3">
      {/* Top Filter & Tab Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-1.5 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('finished')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'finished'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Gudang Biji Plastik / Pelet (Barang Jadi)</span>
            <span className="text-2xs bg-slate-950 px-1.5 py-0.2 rounded-full font-mono">
              {finishedGoodsInventory.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'raw'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gudang Bahan Baku Reject</span>
            <span className="text-2xs bg-slate-950 px-1.5 py-0.2 rounded-full font-mono">
              {recalibratedPurchases.length}
            </span>
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Batch, Produk, Warna..."
            className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. FINISHED GOODS TABLE */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'finished' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Inventaris Pelet / Biji Plastik Siap Kirim
                </h4>
                <p className="text-2xs text-slate-400">
                  Data stok tersinkronisasi otomatis dengan hasil SPK Produksi, Penjualan, dan Koreksi Opname.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xs text-slate-400 block">Total Aset Pelet Gudang:</span>
                <span className="text-sm font-bold font-mono text-sky-400">
                  {formatRupiah(finishedGoodsInventory.reduce((acc, f) => acc + f.totalAssetValue, 0))}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                    <th className="py-2.5 px-3">Kode Batch (SPK)</th>
                    <th className="py-2.5 px-3">Nama Produk & Grade</th>
                    <th className="py-2.5 px-3">Warna & Tgl</th>
                    <th className="py-2.5 px-3 text-right">Hasil Awal</th>
                    <th className="py-2.5 px-3 text-right">Opname</th>
                    <th className="py-2.5 px-3 text-right">Terjual</th>
                    <th className="py-2.5 px-3 text-right">Sisa Stok (Kg)</th>
                    <th className="py-2.5 px-3 text-right">Kemasan Sak</th>
                    <th className="py-2.5 px-3 text-right">HPP / Kg</th>
                    <th className="py-2.5 px-3 text-right">Nilai Aset</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredFinishedGoods.map((fg) => {
                    const isExhausted = fg.currentStockKg <= 0;
                    return (
                      <tr key={fg.batchNo} className="hover:bg-slate-800/40 transition">
                        <td className="py-2 px-3 font-mono font-bold text-sky-400">
                          {fg.batchNo}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-white">{fg.productName}</div>
                          <div className="text-2xs text-slate-400">Tipe: {fg.targetType || 'Compounding'}</div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="text-slate-200">{fg.targetColor || '-'}</div>
                          <div className="text-2xs text-slate-400">{formatDate(fg.productionDate)}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">
                          {formatNumber(fg.originalOutputKg, 0)} Kg
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          {fg.adjustmentKg !== 0 ? (
                            <span className={fg.adjustmentKg > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {fg.adjustmentKg > 0 ? `+${fg.adjustmentKg}` : fg.adjustmentKg} Kg
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-amber-300">
                          {fg.soldKg > 0 ? `-${formatNumber(fg.soldKg, 0)} Kg` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          <span className={isExhausted ? 'text-slate-500' : 'text-emerald-400 text-sm'}>
                            {formatNumber(fg.currentStockKg, 1)} Kg
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-300">
                          ~{fg.availableBags} Sak @ {fg.bagWeightKg} Kg
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-sky-400">
                          {formatRupiah(fg.hppPerKg)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-white font-semibold">
                          {formatRupiah(fg.totalAssetValue)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-2xs font-medium ${getStatusBadge(fg.status)}`}>
                            {fg.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => setOpnameModal({ isOpen: true, item: fg })}
                            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-2xs font-medium transition mx-auto"
                            title="Koreksi stok manual (Opname gudang)"
                          >
                            <Scale className="w-3 h-3 text-sky-400" />
                            <span>Opname</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFinishedGoods.length === 0 && (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-500 font-sans">
                        Tidak ada persediaan barang jadi di gudang.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Riwayat Penyesuaian / Stock Opname History */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Riwayat Koreksi Stok Opname Gudang
                </h4>
              </div>
              <span className="text-2xs text-slate-400">{stockAdjustments.length} log transaksi koreksi</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase">
                    <th className="py-2 px-3">Tanggal & Batch</th>
                    <th className="py-2 px-3">Nama Produk</th>
                    <th className="py-2 px-3 text-right">Stok Sistem</th>
                    <th className="py-2 px-3 text-right">Timbangan Fisik</th>
                    <th className="py-2 px-3 text-right">Selisih Delta</th>
                    <th className="py-2 px-3">Alasan Koreksi</th>
                    <th className="py-2 px-3">Petugas</th>
                    <th className="py-2 px-3 text-center w-16">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {stockAdjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3">
                        <div className="font-mono font-bold text-sky-400">{adj.batchNo}</div>
                        <div className="text-2xs text-slate-400">{formatDate(adj.date)}</div>
                      </td>
                      <td className="py-2 px-3 font-medium text-white">{adj.productName}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">
                        {formatNumber(adj.previousKg, 1)} Kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-white font-semibold">
                        {formatNumber(adj.adjustedKg, 1)} Kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <span className={adj.deltaKg >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {adj.deltaKg >= 0 ? `+${adj.deltaKg}` : adj.deltaKg} Kg
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300 text-xs">{adj.reason || '-'}</td>
                      <td className="py-2 px-3 text-slate-400 text-xs">{adj.adjustedBy || '-'}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => onRequestDelete({
                            title: `Hapus Log Opname ${adj.batchNo}`,
                            message: `Hapus catatan koreksi ini? Stok barang jadi akan dikembalikan ke posisi sebelum koreksi.`,
                            onConfirm: () => setStockAdjustments(prev => prev.filter(x => x.id !== adj.id))
                          })}
                          className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
                          title="Hapus Koreksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {stockAdjustments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-slate-500 font-sans text-xs">
                        Belum ada penyesuaian timbangan opname manual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. RAW MATERIALS INVENTORY TABLE */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'raw' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Inventaris Bahan Baku Reject / Lapak (Inbound Inventory)
              </h4>
              <p className="text-2xs text-slate-400">
                Stok bahan baku otomatis berkurang saat digunakan dalam SPK Single maupun Multi-Blending.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xs text-slate-400 block">Total Aset Bahan Baku:</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {formatRupiah(recalibratedPurchases.reduce((acc, p) => acc + (p.remainingKg * p.pricePerKg), 0))}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">Batch & Tgl</th>
                  <th className="py-2.5 px-3">Supplier / Lapak</th>
                  <th className="py-2.5 px-3">Polimer & Wujud</th>
                  <th className="py-2.5 px-3 text-right">Netto Masuk</th>
                  <th className="py-2.5 px-3 text-right">Terpakai Produksi</th>
                  <th className="py-2.5 px-3 text-right">Sisa Stok (Kg)</th>
                  <th className="py-2.5 px-3 text-right">Harga Beli / Kg</th>
                  <th className="py-2.5 px-3 text-right">Total Nilai Sisa</th>
                  <th className="py-2.5 px-3 text-center">Status Alur</th>
                  <th className="py-2.5 px-3 text-center">Ketersediaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredRawMaterials.map((p) => {
                  const isExhausted = p.remainingKg <= 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                        {p.batchNo}
                        <div className="text-2xs text-slate-400 font-sans font-normal">{formatDate(p.date)}</div>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-200">{p.supplierName}</td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-white">{p.plasticName}</div>
                        <div className="text-2xs text-slate-400">{p.form || '-'}</div>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">
                        {formatNumber(p.netWeight, 1)} Kg
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-300">
                        {p.usedKg > 0 ? `-${formatNumber(p.usedKg, 1)} Kg` : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        <span className={isExhausted ? 'text-slate-500' : 'text-emerald-400 text-sm'}>
                          {formatNumber(p.remainingKg, 1)} Kg
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">
                        {formatRupiah(p.pricePerKg)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">
                        {formatRupiah(p.remainingKg * p.pricePerKg)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-2xs font-medium ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                          isExhausted
                            ? 'bg-slate-800 text-slate-400'
                            : p.stockStatus === 'Menipis'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {p.stockStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Opname Modal */}
      {opnameModal.isOpen && (
        <StockOpnameModal
          item={opnameModal.item}
          onSave={handleSaveOpname}
          onClose={() => setOpnameModal({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-Modal: Stock Opname Modal
// -----------------------------------------------------------------
function StockOpnameModal({ item, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const currentKg = item?.currentStockKg || 0;

  const [formData, setFormData] = useState({
    date: today,
    batchNo: item?.batchNo || '',
    productName: item?.productName || '',
    previousKg: currentKg,
    adjustedKg: currentKg,
    deltaKg: 0,
    reason: 'Koreksi timbangan fisik rutin akhir shift',
    adjustedBy: 'Kepala Gudang'
  });

  const handleAdjustedKgChange = (newVal) => {
    const val = Number(newVal) || 0;
    const delta = val - currentKg;
    setFormData(prev => ({
      ...prev,
      adjustedKg: val,
      deltaKg: Number(delta.toFixed(2))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.deltaKg === 0) {
      alert('Tidak ada selisih timbangan.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Stock Opname Batch: {item?.batchNo}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div>
            <span className="block text-2xs text-slate-400 mb-0.5">Produk Biji Plastik</span>
            <div className="font-semibold text-white">{item?.productName}</div>
            <div className="text-2xs text-slate-400">Warna: {item?.targetColor}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tanggal Koreksi *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Petugas / PIC Opname *</label>
              <input
                type="text"
                required
                value={formData.adjustedBy}
                onChange={e => setFormData({ ...formData, adjustedBy: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Stok Tercatat Sistem:</span>
              <span className="font-bold text-white">{formatWeight(currentKg)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <label className="font-sans font-medium text-sky-400">Timbangan Fisik Nyata (Kg):</label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={formData.adjustedKg}
                onChange={e => handleAdjustedKgChange(e.target.value)}
                className="w-28 bg-slate-900 border border-sky-500 rounded px-2 py-1 text-right text-white font-bold text-sm focus:outline-hidden"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="font-sans font-semibold">Selisih Penyesuaian (Delta):</span>
              <span className={`font-bold ${formData.deltaKg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formData.deltaKg >= 0 ? `+${formData.deltaKg}` : formData.deltaKg} Kg
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Alasan Penyesuaian / Selisih *</label>
            <textarea
              rows={2}
              required
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              placeholder="misal: Selisih sampling tara karung sak, susut dingin, rembesan..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold">Simpan Opname</button>
          </div>
        </form>
      </div>
    </div>
  );
}
