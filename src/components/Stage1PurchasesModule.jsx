import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Truck,
  Filter,
  Zap,
  GitBranch,
  DollarSign,
  CreditCard,
  CheckCircle2,
  AlertCircle,
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
  recalibratedRawPurchases = [],
  setRawPurchases,
  polymers = [],
  contacts = [],
  onRequestDelete,
  onFastPreProcess,
  onOpenTraceability
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });
  const [paymentModalState, setPaymentModalState] = useState({ isOpen: false, item: null });

  const suppliers = contacts.filter(c => c.type === 'supplier' || c.type === 'SUPPLIER' || c.type === 'BOTH');

  // Summary Metrics
  const totalStockKg = recalibratedRawPurchases.reduce((acc, r) => acc + (r.remainingKg || 0), 0);
  const totalAssetValue = recalibratedRawPurchases.reduce((acc, r) => acc + (r.assetValue || 0), 0);
  const totalPayable = recalibratedRawPurchases.reduce((acc, r) => acc + (r.remainingPayable || 0), 0);
  const totalPurchasesAmount = recalibratedRawPurchases.reduce((acc, r) => acc + (r.totalAmount || 0), 0);

  const handleSave = (formData) => {
    if (modalState.item) {
      setRawPurchases(prev => prev.map(p => p.id === modalState.item.id ? { ...p, ...formData } : p));
    } else {
      const newId = `RAW-${String(Date.now()).slice(-4)}`;
      setRawPurchases(prev => [{ id: newId, ...formData }, ...prev]);
    }
    setModalState({ isOpen: false, item: null });
  };

  const handleSavePayment = (purchaseId, paymentData) => {
    setRawPurchases(prev => prev.map(p => {
      if (p.id !== purchaseId) return p;
      const total = Number(p.totalAmount || 0);
      const newPaidAmount = (Number(p.paidAmount) || 0) + Number(paymentData.amount);
      const newStatus = newPaidAmount >= total ? 'Lunas' : (newPaidAmount > 0 ? 'DP' : 'Belum Dibayar');

      return {
        ...p,
        paidAmount: newPaidAmount,
        paymentStatus: newStatus,
        paymentNotes: paymentData.notes || p.paymentNotes
      };
    }));
    setPaymentModalState({ isOpen: false, item: null });
  };

  const filteredPurchases = recalibratedRawPurchases.filter(p => {
    const matchesSearch = `${p.batchNo} ${p.supplierName} ${p.polymerName} ${p.form} ${p.colorBase} ${p.notes || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || p.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-4">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Stok Reject Kotor</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{formatWeight(totalStockKg)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5 font-mono">
              {recalibratedRawPurchases.length} Batch Masuk
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Nilai Aset Reject</span>
            <span className="text-xl font-bold text-emerald-600 font-mono">{formatRupiah(totalAssetValue)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Sisa stok dikali harga beli</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Hutang Lapak (AP)</span>
            <span className={`text-xl font-bold font-mono ${totalPayable > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {formatRupiah(totalPayable)}
            </span>
            <span className="text-3xs text-slate-400 block mt-0.5">Tagihan belum dibayar</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Total Pembelian</span>
            <span className="text-xl font-bold text-violet-600 font-mono">{formatRupiah(totalPurchasesAmount)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Seluruh nota reject</span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap gap-y-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Batch, Lapak, Polimer..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-violet-500 text-xs"
          >
            <option value="ALL">Semua Status Fisik</option>
            <option value="Belum Sortir">Belum Sortir</option>
            <option value="Siap Giling">Siap Giling</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-violet-500 text-xs"
          >
            <option value="ALL">Semua Pembayaran</option>
            <option value="Lunas">Lunas</option>
            <option value="DP">DP (Uang Muka)</option>
            <option value="Belum Dibayar">Belum Dibayar (Hutang)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition shadow-xs text-xs w-full md:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Beli Limbah Reject Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px] font-sans">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-3xs uppercase text-slate-400 font-semibold tracking-wider">
                <th className="py-2.5 px-3">Batch & Tgl</th>
                <th className="py-2.5 px-3">Supplier Pengepul</th>
                <th className="py-2.5 px-3">Polimer & Wujud Awal</th>
                <th className="py-2.5 px-3 text-right">Timbangan Masuk</th>
                <th className="py-2.5 px-3 text-right">Potongan Susut</th>
                <th className="py-2.5 px-3 text-right">Netto Beli</th>
                <th className="py-2.5 px-3 text-right">Harga / Kg</th>
                <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                <th className="py-2.5 px-3 text-center">Status Bayar & Hutang</th>
                <th className="py-2.5 px-3 text-right">Sisa Stok Kotor</th>
                <th className="py-2.5 px-3 text-center sticky right-0 bg-white/95">Aksi & Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filteredPurchases.map((p) => {
                const isExhausted = p.remainingKg <= 0;
                const hasDebt = (p.remainingPayable || 0) > 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2 px-3">
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(p.batchNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline font-mono text-left flex items-center space-x-1"
                        title="Klik untuk lihat Silsilah & Riwayat Batch ini"
                      >
                        <span>{p.batchNo}</span>
                        <GitBranch className="w-3 h-3 text-violet-400" />
                      </button>
                      <span className="text-3xs text-slate-400 font-sans block">{formatDate(p.date)}</span>
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <span className="font-semibold text-slate-800 block">{p.supplierName}</span>
                      {p.notes && (
                        <span className="text-3xs text-slate-400 block whitespace-normal max-w-[180px] leading-tight">
                          {p.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <span className="font-bold text-slate-800 block">{p.polymerName}</span>
                      <span className="text-3xs text-slate-400 block">{p.form} • {p.colorBase || '-'}</span>
                    </td>

                    <td className="py-2 px-3 text-right text-slate-600">
                      {formatNumber(p.grossWeight, 1)} Kg
                    </td>

                    <td className="py-2 px-3 text-right text-rose-500 font-bold">
                      -{formatNumber(p.deductionKg, 1)} Kg
                    </td>

                    <td className="py-2 px-3 text-right font-bold text-slate-800 text-sm">
                      {formatNumber(p.netWeight, 1)} Kg
                    </td>

                    <td className="py-2 px-3 text-right text-slate-600">
                      {formatRupiah(p.pricePerKg)}
                    </td>

                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {formatRupiah(p.totalAmount)}
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${getStatusBadge(p.paymentStatus || 'Lunas')}`}>
                        {p.paymentStatus || 'Lunas'}
                      </span>
                      {hasDebt && (
                        <div className="mt-0.5 font-mono text-3xs text-rose-500 font-semibold">
                          Hutang: {formatRupiah(p.remainingPayable)}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className={`font-bold block text-sm ${isExhausted ? 'text-slate-300' : 'text-violet-600'}`}>
                        {formatNumber(p.remainingKg, 1)} Kg
                      </span>
                      <span className="text-3xs text-slate-400 font-sans block">
                        {isExhausted ? 'Habis terolah' : `Terpakai: ${formatNumber(p.usedKg, 1)} Kg`}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center sticky right-0 bg-white/95 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {/* 1-Click Fast Workflow to Stage 2 */}
                        {!isExhausted && onFastPreProcess && (
                          <button
                            onClick={() => onFastPreProcess(p)}
                            className="px-2 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-3xs flex items-center space-x-1 border border-violet-200 transition"
                            title="Proses Giling & Cuci batch ini langsung di Tahap 2"
                          >
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>Giling</span>
                          </button>
                        )}

                        {/* Pay debt button */}
                        {hasDebt && (
                          <button
                            onClick={() => setPaymentModalState({ isOpen: true, item: p })}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition"
                            title="Catat Pembayaran / Pelunasan Hutang Lapak"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setModalState({ isOpen: true, item: p })}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                          title="Edit Nota Pembelian"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDelete({
                            title: `Hapus Lot Reject ${p.batchNo}`,
                            message: `Yakin ingin menghapus pembelian reject ${p.batchNo}? Stok gudang kotor akan disesuaikan.`,
                            onConfirm: () => setRawPurchases(prev => prev.filter(x => x.id !== p.id))
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
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-sans">
                    Tidak ditemukan data pembelian limbah reject.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INPUT / EDIT PURCHASE */}
      {modalState.isOpen && (
        <PurchaseFormModal
          item={modalState.item}
          polymers={polymers}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}

      {/* MODAL: PELUNASAN HUTANG LAPAK */}
      {paymentModalState.isOpen && paymentModalState.item && (
        <PelunasanModal
          item={paymentModalState.item}
          onSave={handleSavePayment}
          onClose={() => setPaymentModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Create & Edit Raw Purchase
// -------------------------------------------------------------
function PurchaseFormModal({ item, polymers = [], suppliers = [], onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultBatchNo = `REJ-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;

  const [formData, setFormData] = useState({
    batchNo: item?.batchNo || defaultBatchNo,
    date: item?.date || today,
    supplierId: item?.supplierId || suppliers[0]?.id || '',
    polymerId: item?.polymerId || polymers[0]?.id || '',
    form: item?.form || 'Afalan Pabrik',
    colorBase: item?.colorBase || 'Bening / Natural',
    grossWeight: item?.grossWeight || 1000,
    deductionKg: item?.deductionKg || 50,
    pricePerKg: item?.pricePerKg || 7500,
    paidAmount: item?.paidAmount !== undefined ? item.paidAmount : 0,
    paymentStatus: item?.paymentStatus || 'Lunas',
    notes: item?.notes || ''
  });

  const gross = Number(formData.grossWeight) || 0;
  const deduction = Number(formData.deductionKg) || 0;
  const netWeight = Math.max(0, gross - deduction);
  const price = Number(formData.pricePerKg) || 0;
  const totalAmount = netWeight * price;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.batchNo || !formData.supplierId || !formData.polymerId) return;

    const matchedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const matchedPolymer = polymers.find(p => p.id === formData.polymerId);

    const paid = formData.paymentStatus === 'Lunas' ? totalAmount : (Number(formData.paidAmount) || 0);
    const remainingPayable = Math.max(0, totalAmount - paid);

    onSave({
      ...formData,
      grossWeight: gross,
      deductionKg: deduction,
      netWeight,
      pricePerKg: price,
      totalAmount,
      paidAmount: paid,
      remainingPayable,
      supplierName: matchedSupplier ? matchedSupplier.name : formData.supplierId,
      polymerName: matchedPolymer ? `${matchedPolymer.name} (${matchedPolymer.code})` : formData.polymerId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {item ? `Koreksi Nota Beli Reject: ${item.batchNo}` : 'Input Nota Timbangan Limbah Reject Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Kode Batch Reject *</label>
              <input
                required
                type="text"
                value={formData.batchNo}
                onChange={e => setFormData({ ...formData, batchNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white focus:border-violet-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Tanggal Masuk *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Supplier / Pengepul *</label>
              <select
                required
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code || s.type})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Jenis Polimer *</label>
              <select
                required
                value={formData.polymerId}
                onChange={e => setFormData({ ...formData, polymerId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500 font-semibold"
              >
                <option value="">-- Pilih Polimer --</option>
                {polymers.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Bentuk / Wujud Bahan</label>
              <input
                type="text"
                value={formData.form}
                onChange={e => setFormData({ ...formData, form: e.target.value })}
                placeholder="Afalan Pabrik / Botol / Karungan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Warna Dasar Bahan</label>
              <input
                type="text"
                value={formData.colorBase}
                onChange={e => setFormData({ ...formData, colorBase: e.target.value })}
                placeholder="Bening / Natural / Hitam / Campur"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          {/* Timbangan & Perhitungan */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3 font-mono">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Rincian Timbangan Jembatan & Harga Beli
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Gross Timbangan (Kg) *</label>
                <input
                  required
                  type="number"
                  step="0.1"
                  value={formData.grossWeight}
                  onChange={e => setFormData({ ...formData, grossWeight: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold text-right text-xs"
                />
              </div>
              <div>
                <label className="block text-rose-500 font-sans text-3xs mb-1 font-semibold">Potongan Sampah/Air (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.deductionKg}
                  onChange={e => setFormData({ ...formData, deductionKg: e.target.value })}
                  className="w-full bg-white border border-rose-200 rounded-lg px-2.5 py-1.5 text-rose-600 font-bold text-right text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Netto Bersih Beli (Kg)</label>
                <input
                  readOnly
                  type="number"
                  value={netWeight}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-black text-right text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Harga Beli / Kg (Rp) *</label>
                <input
                  required
                  type="number"
                  step="50"
                  value={formData.pricePerKg}
                  onChange={e => setFormData({ ...formData, pricePerKg: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-emerald-600 font-bold text-right text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-sans font-medium">Total Nilai Tagihan Beli:</span>
              <span className="font-black text-emerald-600 text-base">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Status Pembayaran</label>
              <select
                value={formData.paymentStatus}
                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              >
                <option value="Lunas">Lunas (Langsung Ditransfer)</option>
                <option value="DP">DP (Uang Muka)</option>
                <option value="Belum Dibayar">Belum Dibayar (Tempo / Hutang Lapak)</option>
              </select>
            </div>

            {formData.paymentStatus === 'DP' && (
              <div>
                <label className="block text-amber-600 text-2xs mb-1 font-semibold">Nominal DP Dibayar (Rp) *</label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full bg-slate-50 border border-amber-300 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:bg-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Catatan Lapak / Kualitas Limbah</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Misal: Kadar kotoran sedang, butuh sortir ganda"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
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
              Simpan Nota Pembelian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Pelunasan Hutang Lapak (AP Management)
// -------------------------------------------------------------
function PelunasanModal({ item, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const total = Number(item.totalAmount || 0);
  const paid = Number(item.paidAmount || 0);
  const remaining = Math.max(0, total - paid);

  const [amount, setAmount] = useState(remaining);
  const [notes, setNotes] = useState('Pelunasan transfer kas bank');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(amount) <= 0) return;
    onSave(item.id, { amount: Number(amount), notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-sm w-full overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-slate-800 text-sm">Pelunasan Hutang Lapak</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex justify-between text-2xs text-slate-500">
              <span>Batch Reject:</span>
              <span className="font-mono font-bold text-slate-800">{item.batchNo}</span>
            </div>
            <div className="flex justify-between text-2xs text-slate-500">
              <span>Supplier Lapak:</span>
              <span className="font-semibold text-slate-800">{item.supplierName}</span>
            </div>
            <div className="flex justify-between text-2xs text-slate-500 pt-1 border-t border-slate-200">
              <span>Sisa Hutang:</span>
              <span className="font-mono font-bold text-rose-600 text-xs">{formatRupiah(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Nominal Bayar (Rp) *</label>
            <input
              required
              type="number"
              min="1"
              max={remaining}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono font-bold text-sm focus:bg-white focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Catatan Pembayaran</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-semibold">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">Simpan Pelunasan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
