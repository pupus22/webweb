import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Truck,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Scale,
  X
} from 'lucide-react';
import { formatRupiah, formatNumber, formatWeight, formatPercent, formatDate, getStatusBadge } from '../utils/formatters';

export default function PurchasesModule({
  recalibratedPurchases,
  setPurchases,
  plasticTypes,
  plasticForms,
  contacts,
  onRequestDelete
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  // Quick inline status change handler
  const handleInlineStatusChange = (purchaseId, newStatus) => {
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: newStatus } : p));
  };

  const handleSavePurchase = (formData) => {
    if (modalState.item) {
      setPurchases(prev => prev.map(p => p.id === modalState.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `PB-${String(Date.now()).slice(-4)}`;
      setPurchases(prev => [
        {
          id: newId,
          ...formData
        },
        ...prev
      ]);
    }
    setModalState({ isOpen: false, item: null });
  };

  const filteredPurchases = recalibratedPurchases.filter(p => {
    const matchesSearch = `${p.batchNo} ${p.invoiceNo} ${p.supplierName} ${p.plasticName} ${p.form}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3">
      {/* Top action and filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Batch, Nota, Lapak, Jenis..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="Belum Sortir">Belum Sortir</option>
              <option value="Proses Cuci/Giling">Proses Cuci/Giling</option>
              <option value="Siap Blending">Siap Blending</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Input Pembelian Bahan</span>
          </button>
        </div>
      </div>

      {/* High-density purchases table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2.5 px-3">Batch & Tgl</th>
                <th className="py-2.5 px-3">Supplier / Lapak</th>
                <th className="py-2.5 px-3">Jenis & Wujud Plastik</th>
                <th className="py-2.5 px-3 text-right">Gross (Kg)</th>
                <th className="py-2.5 px-3 text-right">Potongan</th>
                <th className="py-2.5 px-3 text-right">Netto (Kg)</th>
                <th className="py-2.5 px-3 text-right">Harga Beli/Kg</th>
                <th className="py-2.5 px-3 text-right">Total (Rp)</th>
                <th className="py-2.5 px-3 text-center">Status Alur</th>
                <th className="py-2.5 px-3 text-right">Sisa Stok (Kg)</th>
                <th className="py-2.5 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPurchases.map((p) => {
                const isExhausted = p.remainingKg <= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3">
                      <div className="font-mono font-bold text-emerald-400">{p.batchNo}</div>
                      <div className="text-2xs text-slate-400">
                        {p.invoiceNo ? `Nota: ${p.invoiceNo}` : '-'} • {formatDate(p.date)}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-slate-200">{p.supplierName}</div>
                      <div className="text-2xs text-slate-400">{p.notes ? p.notes.slice(0, 30) + '...' : ''}</div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-white">{p.plasticName}</div>
                      <div className="text-2xs text-slate-400">{p.form || '-'}</div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">
                      {formatNumber(p.grossWeight, 1)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-amber-300">
                      <div>-{formatNumber(p.deductionWeight, 1)} Kg</div>
                      <div className="text-2xs text-slate-400">({formatPercent(p.tareOrDeductionPercent)})</div>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      {formatNumber(p.netWeight, 1)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">
                      {formatRupiah(p.pricePerKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                      {formatRupiah(p.totalAmount)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <select
                        value={p.status}
                        onChange={(e) => handleInlineStatusChange(p.id, e.target.value)}
                        className={`text-2xs px-2 py-0.5 rounded font-medium cursor-pointer transition ${getStatusBadge(p.status)}`}
                      >
                        <option value="Belum Sortir" className="bg-slate-900 text-rose-300">Belum Sortir</option>
                        <option value="Proses Cuci/Giling" className="bg-slate-900 text-amber-300">Proses Cuci/Giling</option>
                        <option value="Siap Blending" className="bg-slate-900 text-emerald-300">Siap Blending</option>
                      </select>
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      <div className={`font-semibold ${isExhausted ? 'text-slate-500' : 'text-sky-400'}`}>
                        {formatNumber(p.remainingKg, 1)} Kg
                      </div>
                      <div className="text-2xs text-slate-400">
                        {isExhausted ? 'Habis terpakai' : `Terpakai ${formatNumber(p.usedKg, 1)} Kg`}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setModalState({ isOpen: true, item: p })}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Pembelian (Otomatis rekalibrasi HPP)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDelete({
                            title: `Hapus Pembelian ${p.batchNo}`,
                            message: `Yakin ingin menghapus transaksi pembelian ${p.batchNo}? Stok bahan baku terkait akan berkurang.`,
                            onConfirm: () => setPurchases(prev => prev.filter(x => x.id !== p.id))
                          })}
                          className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    Tidak ditemukan data pembelian bahan baku.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input / Edit Purchase Modal */}
      {modalState.isOpen && (
        <PurchaseFormModal
          item={modalState.item}
          plasticTypes={plasticTypes}
          plasticForms={plasticForms}
          contacts={contacts.filter(c => c.type === 'supplier' || c.type === 'both')}
          onSave={handleSavePurchase}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-Modal: Purchase Form Modal (Full CRUD & Recalibration Engine)
// -----------------------------------------------------------------
function PurchaseFormModal({ item, plasticTypes, plasticForms, contacts, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const selectedPlasticCode = plasticTypes[0]?.code || 'PP';
  const defaultBatch = `RAW-${selectedPlasticCode}-${today.replace(/-/g, '').slice(2)}`;

  const [formData, setFormData] = useState({
    batchNo: item?.batchNo || defaultBatch,
    invoiceNo: item?.invoiceNo || '',
    date: item?.date || today,
    supplierId: item?.supplierId || (contacts[0]?.id || ''),
    plasticTypeId: item?.plasticTypeId || (plasticTypes[0]?.id || ''),
    form: item?.form || (plasticForms[0]?.name || ''),
    grossWeight: item?.grossWeight !== undefined ? item.grossWeight : 1000,
    tareOrDeductionPercent: item?.tareOrDeductionPercent !== undefined ? item.tareOrDeductionPercent : 4,
    deductionWeight: item?.deductionWeight !== undefined ? item.deductionWeight : 40,
    netWeight: item?.netWeight !== undefined ? item.netWeight : 960,
    pricePerKg: item?.pricePerKg !== undefined ? item.pricePerKg : 8500,
    totalAmount: item?.totalAmount !== undefined ? item.totalAmount : 8160000,
    status: item?.status || 'Siap Blending',
    notes: item?.notes || ''
  });

  // Calculate net and total whenever gross, deduction, or price changes
  const updateWeightsAndPrices = (grossVal, dedPctVal, dedKgVal, priceVal, changedField) => {
    const gross = Number(grossVal) || 0;
    let dedPct = Number(dedPctVal) || 0;
    let dedKg = Number(dedKgVal) || 0;
    const price = Number(priceVal) || 0;

    if (changedField === 'gross' || changedField === 'dedPct') {
      dedKg = (gross * dedPct) / 100;
    } else if (changedField === 'dedKg') {
      dedPct = gross > 0 ? (dedKg / gross) * 100 : 0;
    }

    const net = Math.max(0, gross - dedKg);
    const total = net * price;

    setFormData(prev => ({
      ...prev,
      grossWeight: gross,
      tareOrDeductionPercent: Number(dedPct.toFixed(2)),
      deductionWeight: Number(dedKg.toFixed(2)),
      netWeight: Number(net.toFixed(2)),
      pricePerKg: price,
      totalAmount: Math.round(total)
    }));
  };

  const handlePlasticChange = (newPlasticId) => {
    const p = plasticTypes.find(x => x.id === newPlasticId);
    let updatedBatch = formData.batchNo;
    if (!item && p) {
      updatedBatch = `RAW-${p.code}-${formData.date.replace(/-/g, '').slice(2)}`;
    }
    setFormData(prev => ({
      ...prev,
      plasticTypeId: newPlasticId,
      batchNo: updatedBatch,
      form: p?.defaultForm || prev.form
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.batchNo || !formData.supplierId || !formData.plasticTypeId) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {item ? `Koreksi / Edit Inbound Batch: ${item.batchNo}` : 'Input Pembelian Bahan Baku Reject'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Row 1: Batch & Nota & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. Batch Bahan *</label>
              <input
                type="text"
                required
                value={formData.batchNo}
                onChange={e => setFormData({ ...formData, batchNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. Nota / Surat Timbang</label>
              <input
                type="text"
                value={formData.invoiceNo}
                onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })}
                placeholder="misal: NOTA-102"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tanggal Timbang *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Supplier, Jenis, Wujud */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Supplier / Lapak *</label>
              <select
                required
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Jenis Polimer *</label>
              <select
                required
                value={formData.plasticTypeId}
                onChange={e => handlePlasticChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-semibold text-emerald-400 focus:outline-hidden focus:border-emerald-500"
              >
                {plasticTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.code} - {pt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Wujud Bahan</label>
              <select
                value={formData.form}
                onChange={e => setFormData({ ...formData, form: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                {plasticForms.map(pf => (
                  <option key={pf.id} value={pf.name}>{pf.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Timbangan & Potongan Kotoran / Rafia / Air */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2.5">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
              Parameter Timbangan & Potongan Kotoran
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Berat Kotor (Gross Kg) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={formData.grossWeight}
                  onChange={e => updateWeightsAndPrices(e.target.value, formData.tareOrDeductionPercent, formData.deductionWeight, formData.pricePerKg, 'gross')}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Potongan (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.tareOrDeductionPercent}
                  onChange={e => updateWeightsAndPrices(formData.grossWeight, e.target.value, formData.deductionWeight, formData.pricePerKg, 'dedPct')}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-amber-300 font-mono text-right focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Potongan (Kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.deductionWeight}
                  onChange={e => updateWeightsAndPrices(formData.grossWeight, formData.tareOrDeductionPercent, e.target.value, formData.pricePerKg, 'dedKg')}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-amber-300 font-mono text-right focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-emerald-400 font-bold mb-1">Berat Bersih (Netto Kg)</label>
                <input
                  type="number"
                  readOnly
                  value={formData.netWeight}
                  className="w-full bg-slate-900/90 border border-emerald-600/50 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-right cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Harga Beli & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Harga Beli / Kg (Rp) *</label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.pricePerKg}
                onChange={e => updateWeightsAndPrices(formData.grossWeight, formData.tareOrDeductionPercent, formData.deductionWeight, e.target.value, 'price')}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status Alur Bahan</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Belum Sortir">Belum Sortir (Kotor)</option>
                <option value="Proses Cuci/Giling">Proses Cuci/Giling</option>
                <option value="Siap Blending">Siap Blending</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Total Pembelian (Netto × Harga)</label>
              <div className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-base text-right">
                {formatRupiah(formData.totalAmount)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Catatan Kondisi Bahan & Hasil Sortir Lapak</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="misal: Banyak tali rapia, tanah 3%, sudah dicuci setengah bersih"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-2xs text-slate-400">
              * Perubahan berat & harga otomatis me-rekalibrasi HPP pada SPK Produksi terkait.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
              >
                {item ? 'Simpan Koreksi' : 'Simpan Pembelian'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
