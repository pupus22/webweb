import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Truck,
  Filter,
  Layers,
  Scale,
  X
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  formatWeight,
  formatDate,
  getStatusBadge
} from '../utils/formatters';

export default function Stage1PurchasesModule({
  recalibratedRawPurchases,
  setRawPurchases,
  polymers,
  contacts,
  onRequestDelete
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  const suppliers = contacts.filter(c => c.type === 'supplier');

  const handleSave = (formData) => {
    if (modalState.item) {
      setRawPurchases(prev => prev.map(p => p.id === modalState.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `RAW-${String(Date.now()).slice(-4)}`;
      setRawPurchases(prev => [
        {
          id: newId,
          ...formData
        },
        ...prev
      ]);
    }
    setModalState({ isOpen: false, item: null });
  };

  const filteredPurchases = recalibratedRawPurchases.filter(p => {
    const matchesSearch = `${p.batchNo} ${p.supplierName} ${p.polymerName} ${p.form} ${p.colorBase}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3">
      {/* Top action and filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Batch, Lapak, Polimer..."
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
              <option value="Siap Giling">Siap Giling</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Beli Limbah Reject Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Tahap 1: Gudang Bahan Baku Kotor (Inbound Raw Reject Stock)
            </h3>
            <p className="text-2xs text-slate-400">
              Limbah plastik reject/afalan yang dibeli dari pengepul lapak sebelum dipilah dan dicacah di mesin crusher.
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xs text-slate-400 block">Total Aset Reject Kotor:</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatRupiah(recalibratedRawPurchases.reduce((acc, r) => acc + r.assetValue, 0))}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2.5 px-3">Batch & Tgl</th>
                <th className="py-2.5 px-3">Supplier Pengepul</th>
                <th className="py-2.5 px-3">Polimer & Wujud Awal</th>
                <th className="py-2.5 px-3">Warna Dasar</th>
                <th className="py-2.5 px-3 text-right">Timbangan Masuk</th>
                <th className="py-2.5 px-3 text-right">Potongan Air/Debu</th>
                <th className="py-2.5 px-3 text-right">Netto Beli (Kg)</th>
                <th className="py-2.5 px-3 text-right">Harga Beli / Kg</th>
                <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                <th className="py-2.5 px-3 text-right">Sisa Stok Kotor</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPurchases.map((p) => {
                const isExhausted = p.remainingKg <= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3">
                      <span className="font-bold text-emerald-400 block">{p.batchNo}</span>
                      <span className="text-2xs text-slate-400 font-sans">{formatDate(p.date)}</span>
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <span className="font-medium text-slate-200 block">{p.supplierName}</span>
                      <span className="text-2xs text-slate-400 truncate max-w-[140px] block">{p.notes || '-'}</span>
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <span className="font-semibold text-white block">{p.polymerName}</span>
                      <span className="text-2xs text-slate-400">{p.form}</span>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-300">
                      {p.colorBase || '-'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {formatNumber(p.grossWeight, 1)} Kg
                    </td>
                    <td className="py-2 px-3 text-right text-amber-300">
                      -{formatNumber(p.deductionKg, 1)} Kg
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white">
                      {formatNumber(p.netWeight, 1)} Kg
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      {formatRupiah(p.pricePerKg)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">
                      {formatRupiah(p.totalAmount)}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`font-bold block ${isExhausted ? 'text-slate-500' : 'text-sky-400'}`}>
                        {formatNumber(p.remainingKg, 1)} Kg
                      </span>
                      <span className="text-2xs text-slate-400 font-sans">
                        {isExhausted ? 'Habis terolah' : `Terpakai: ${formatNumber(p.usedKg, 1)} Kg`}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => setModalState({ isOpen: true, item: p })}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit Pembelian (Rekalibrasi Otomatis)"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDelete({
                            title: `Hapus Lot Reject ${p.batchNo}`,
                            message: `Yakin ingin menghapus pembelian reject ${p.batchNo}? Stok gudang kotor akan disesuaikan.`,
                            onConfirm: () => setRawPurchases(prev => prev.filter(x => x.id !== p.id))
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
                  <td colSpan={12} className="py-8 text-center text-slate-500 font-sans">
                    Tidak ditemukan data pembelian limbah reject.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalState.isOpen && (
        <RawPurchaseFormModal
          item={modalState.item}
          polymers={polymers}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Raw Purchase Form
// -------------------------------------------------------------
function RawPurchaseFormModal({ item, polymers, suppliers, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const selectedPoly = polymers[0]?.code || 'PP';
  const defaultBatch = `REJ-${selectedPoly}-${today.replace(/-/g, '').slice(2)}`;

  const [formData, setFormData] = useState({
    batchNo: item?.batchNo || defaultBatch,
    date: item?.date || today,
    supplierId: item?.supplierId || (suppliers[0]?.id || ''),
    polymerId: item?.polymerId || (polymers[0]?.id || ''),
    form: item?.form || 'Afalan Karungan (Bale/Press)',
    colorBase: item?.colorBase || 'Warna Campur',
    grossWeight: item?.grossWeight !== undefined ? item.grossWeight : 1000,
    deductionKg: item?.deductionKg !== undefined ? item.deductionKg : 40,
    pricePerKg: item?.pricePerKg !== undefined ? item.pricePerKg : 8500,
    status: item?.status || 'Siap Giling',
    notes: item?.notes || ''
  });

  const gross = Number(formData.grossWeight) || 0;
  const ded = Number(formData.deductionKg) || 0;
  const net = Math.max(0, gross - ded);
  const price = Number(formData.pricePerKg) || 0;
  const total = net * price;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.batchNo || !formData.supplierId || !formData.polymerId) return;

    onSave({
      ...formData,
      grossWeight: gross,
      deductionKg: ded,
      netWeight: net,
      pricePerKg: price,
      totalAmount: Math.round(total)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {item ? `Edit Nota Reject: ${item.batchNo}` : 'Input Pembelian Limbah Plastik Reject Kotor'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Kode Batch Reject *</label>
              <input
                required
                type="text"
                value={formData.batchNo}
                onChange={e => setFormData({ ...formData, batchNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tanggal Timbang *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Supplier / Pengepul *</label>
              <select
                required
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Jenis Polimer *</label>
              <select
                required
                value={formData.polymerId}
                onChange={e => setFormData({ ...formData, polymerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-400 font-bold focus:outline-hidden focus:border-emerald-500"
              >
                {polymers.map(pol => (
                  <option key={pol.id} value={pol.id}>{pol.code} - {pol.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Bentuk Awal Reject</label>
              <select
                value={formData.form}
                onChange={e => setFormData({ ...formData, form: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Afalan Karungan (Bale/Press)">Afalan Karungan (Bale/Press)</option>
                <option value="Botol / Jerigen Utuh">Botol / Jerigen Utuh</option>
                <option value="Reject Pabrik (Part Utuh)">Reject Pabrik (Part Utuh)</option>
                <option value="Daun / Film Bening">Daun / Film Bening</option>
                <option value="Monofilament / Tali Rafia">Monofilament / Tali Rafia</option>
                <option value="Emberan Cor / Perabot Rumah">Emberan Cor / Perabot Rumah</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Warna Dasar Bahan</label>
              <input
                type="text"
                value={formData.colorBase}
                onChange={e => setFormData({ ...formData, colorBase: e.target.value })}
                placeholder="misal: Bening, Putih Susu, Campur"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Timbangan Section */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Parameter Timbangan Jembatan Timbang & Potongan Kotoran
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Berat Kotor (Gross Kg) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.grossWeight}
                  onChange={e => setFormData({ ...formData, grossWeight: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-right text-sm font-bold focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-amber-300 font-sans text-2xs mb-1">Potongan Kotoran/Air (Kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.deductionKg}
                  onChange={e => setFormData({ ...formData, deductionKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-amber-300 text-right text-sm font-bold focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-emerald-400 font-sans text-2xs mb-1">Berat Bersih (Netto Kg)</label>
                <div className="bg-slate-900 border border-emerald-600/60 rounded px-2 py-1.5 text-emerald-400 text-right text-sm font-black">
                  {formatNumber(net, 1)} Kg
                </div>
              </div>
              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Harga Beli / Kg (Rp) *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="100"
                  value={formData.pricePerKg}
                  onChange={e => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-white text-right text-sm font-bold focus:outline-hidden"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="font-sans text-slate-400">Total Nilai Tagihan Beli:</span>
              <span className="text-base font-extrabold text-emerald-400">{formatRupiah(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status Alur Reject</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Siap Giling">Siap Giling (Langsung ke Crusher)</option>
                <option value="Belum Sortir">Belum Sortir (Masih Perlu Pilah Kotor)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Catatan Lapak / Kondisi Sampah</label>
              <input
                type="text"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Banyak tali rafia, tanah liat, botol ada sisa minyak..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <span className="text-2xs text-slate-500">
              * Perubahan harga beli langsung me-rekalibrasi HPP Flakes di Tahap 2.
            </span>
            <div className="flex space-x-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
              <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Simpan Pembelian</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
