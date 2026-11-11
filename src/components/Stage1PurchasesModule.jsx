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

  const handleSavePayment = (purchaseId, paymentData) => {
    setRawPurchases(prev => prev.map(p => {
      if (p.id !== purchaseId) return p;
      const additionalPaid = Number(paymentData.amount) || 0;
      const newPaidAmount = (Number(p.paidAmount) || 0) + additionalPaid;
      const total = Number(p.totalAmount) || 0;
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
      {/* Top Filter & Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Stok Reject Kotor</span>
            <span className="text-lg font-bold text-white font-mono">{formatWeight(totalStockKg)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5 font-mono">
              {recalibratedRawPurchases.length} Batch Masuk
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Nilai Aset Reject</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{formatRupiah(totalAssetValue)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Sisa stok dikali harga beli</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Total Hutang Lapak (AP)</span>
            <span className={`text-lg font-bold font-mono ${totalPayable > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {formatRupiah(totalPayable)}
            </span>
            <span className="text-2xs text-slate-500 block mt-0.5">Tagihan belum dibayar</span>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Total Pembelian</span>
            <span className="text-lg font-bold text-sky-400 font-mono">{formatRupiah(totalPurchasesAmount)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Seluruh nota reject</span>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Batch, Lapak, Polimer..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500 text-xs"
          >
            <option value="ALL">Semua Status Fisik</option>
            <option value="Belum Sortir">Belum Sortir</option>
            <option value="Siap Giling">Siap Giling</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500 text-xs"
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
            className="flex items-center space-x-1.5 px-3 py-2 md:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition min-h-[40px] md:min-h-0 text-xs w-full md:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Beli Limbah Reject Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px] font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-2xs uppercase text-slate-400 font-semibold tracking-wider">
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
                <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-950/90">Aksi & Alur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredPurchases.map((p) => {
                const isExhausted = p.remainingKg <= 0;
                const hasDebt = (p.remainingPayable || 0) > 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3">
                      <button
                        onClick={() => onOpenTraceability && onOpenTraceability(p.batchNo)}
                        className="font-bold text-emerald-400 hover:text-emerald-300 underline font-mono text-left flex items-center space-x-1"
                        title="Klik untuk lihat Silsilah & Riwayat Batch ini"
                      >
                        <span>{p.batchNo}</span>
                        <GitBranch className="w-3 h-3 opacity-60" />
                      </button>
                      <span className="text-2xs text-slate-400 font-sans block">{formatDate(p.date)}</span>
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <span className="font-semibold text-white block">{p.supplierName}</span>
                      {p.notes && (
                        <span className="text-2xs text-slate-400 block whitespace-normal max-w-[180px] leading-tight">
                          {p.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <span className="font-bold text-purple-300 block">{p.polymerName}</span>
                      <span className="text-2xs text-slate-400 block">{p.form} • {p.colorBase || '-'}</span>
                    </td>

                    <td className="py-2 px-3 text-right text-slate-300">
                      {formatNumber(p.grossWeight, 1)} Kg
                    </td>

                    <td className="py-2 px-3 text-right text-rose-400 font-bold">
                      -{formatNumber(p.deductionKg, 1)} Kg
                    </td>

                    <td className="py-2 px-3 text-right font-bold text-white text-sm">
                      {formatNumber(p.netWeight, 1)} Kg
                    </td>

                    <td className="py-2 px-3 text-right text-slate-300">
                      {formatRupiah(p.pricePerKg)}
                    </td>

                    <td className="py-2 px-3 text-right font-bold text-emerald-400">
                      {formatRupiah(p.totalAmount)}
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(p.paymentStatus || 'Lunas')}`}>
                        {p.paymentStatus || 'Lunas'}
                      </span>
                      {hasDebt && (
                        <div className="mt-0.5 font-mono text-2xs text-rose-400">
                          Hutang: {formatRupiah(p.remainingPayable)}
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <span className={`font-bold block text-sm ${isExhausted ? 'text-slate-500' : 'text-sky-400'}`}>
                        {formatNumber(p.remainingKg, 1)} Kg
                      </span>
                      <span className="text-2xs text-slate-400 font-sans block">
                        {isExhausted ? 'Habis terolah' : `Terpakai: ${formatNumber(p.usedKg, 1)} Kg`}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-center sticky right-0 bg-slate-950/90 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {/* 1-Click Fast Workflow to Stage 2 */}
                        {!isExhausted && onFastPreProcess && (
                          <button
                            onClick={() => onFastPreProcess(p)}
                            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-2xs flex items-center space-x-1 shadow transition"
                            title="Proses Giling & Cuci batch ini langsung di Tahap 2"
                          >
                            <Zap className="w-3 h-3 text-amber-300" />
                            <span>Giling</span>
                          </button>
                        )}

                        {/* Pay debt button */}
                        {hasDebt && (
                          <button
                            onClick={() => setPaymentModalState({ isOpen: true, item: p })}
                            className="p-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30"
                            title="Catat Pembayaran / Pelunasan Hutang Lapak"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setModalState({ isOpen: true, item: p })}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
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

      {/* MODAL: RECORD AP PAYMENT */}
      {paymentModalState.isOpen && (
        <PaymentAPModal
          item={paymentModalState.item}
          onSave={(data) => handleSavePayment(paymentModalState.item.id, data)}
          onClose={() => setPaymentModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Input / Edit Purchase
// -------------------------------------------------------------
function PurchaseFormModal({ item, polymers = [], suppliers = [], onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultBatch = `REJ-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;

  const [formData, setFormData] = useState({
    batchNo: item?.batchNo || defaultBatch,
    date: item?.date || today,
    supplierId: item?.supplierId || suppliers[0]?.id || '',
    polymerId: item?.polymerId || polymers[0]?.id || '',
    form: item?.form || 'Botol / Jerigen Belum Giling',
    colorBase: item?.colorBase || 'Campur / Belum Sortir',
    grossWeight: item?.grossWeight || 3000,
    deductionKg: item?.deductionKg || 150,
    pricePerKg: item?.pricePerKg || 9000,
    paymentStatus: item?.paymentStatus || 'Lunas',
    paidAmount: item?.paidAmount !== undefined ? item.paidAmount : (item ? item.totalAmount : 0),
    status: item?.status || 'Siap Giling',
    notes: item?.notes || ''
  });

  const gross = Number(formData.grossWeight) || 0;
  const deduction = Number(formData.deductionKg) || 0;
  const netWeight = Math.max(0, gross - deduction);
  const price = Number(formData.pricePerKg) || 0;
  const totalAmount = netWeight * price;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.batchNo || !formData.supplierId || !formData.polymerId || netWeight <= 0) return;

    onSave({
      ...formData,
      grossWeight: gross,
      deductionKg: deduction,
      netWeight,
      pricePerKg: price,
      totalAmount,
      paidAmount: formData.paymentStatus === 'Lunas' ? totalAmount : Number(formData.paidAmount || 0)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {item ? `Koreksi Pembelian Reject: ${item.batchNo}` : 'Input Nota Pembelian Limbah Reject Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-sans">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Kode Batch Reject *</label>
              <input
                required
                type="text"
                value={formData.batchNo}
                onChange={e => setFormData({ ...formData, batchNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Tanggal Masuk *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Status Fisik</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Siap Giling">Siap Giling</option>
                <option value="Belum Sortir">Belum Sortir</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Supplier / Lapak Pengepul *</label>
              <select
                required
                value={formData.supplierId}
                onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
              >
                <option value="">-- Pilih Supplier Lapak --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.phone || '-'})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-2xs mb-1">Jenis Polimer *</label>
              <select
                required
                value={formData.polymerId}
                onChange={e => setFormData({ ...formData, polymerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500 font-bold"
              >
                <option value="">-- Pilih Polimer --</option>
                {polymers.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Wujud / Bentuk Limbah</label>
              <input
                type="text"
                value={formData.form}
                onChange={e => setFormData({ ...formData, form: e.target.value })}
                placeholder="Misal: Botol/Jerigen, Afalan, Karungan"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Warna Dasar Limbah</label>
              <input
                type="text"
                value={formData.colorBase}
                onChange={e => setFormData({ ...formData, colorBase: e.target.value })}
                placeholder="Misal: Campur, Bening, Hitam"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Timbangan & Harga Card */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5 font-mono">
            <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block font-sans">
              Timbangan Masuk & Harga Beli
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
                  onChange={e => setFormData({ ...formData, grossWeight: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Potongan Air/Debu (Kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.deductionKg}
                  onChange={e => setFormData({ ...formData, deductionKg: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-rose-400 text-right text-xs focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Netto Bersih (Kg)</label>
                <div className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-right text-xs text-white font-bold">
                  {formatNumber(netWeight, 1)} Kg
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Harga Beli / Kg (Rp) *</label>
                <input
                  required
                  type="number"
                  min="100"
                  step="50"
                  value={formData.pricePerKg}
                  onChange={e => setFormData({ ...formData, pricePerKg: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-emerald-400 text-right text-xs focus:outline-hidden font-bold"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-sans">Total Tagihan Nota:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          {/* Payment Status row */}
          <div className="grid grid-cols-2 gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-800">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Status Pembayaran ke Lapak</label>
              <select
                value={formData.paymentStatus}
                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs focus:outline-hidden"
              >
                <option value="Lunas">Lunas (100% Terbayar)</option>
                <option value="DP">DP (Uang Muka)</option>
                <option value="Belum Dibayar">Belum Dibayar (Hutang Lapak)</option>
              </select>
            </div>

            {formData.paymentStatus === 'DP' && (
              <div>
                <label className="block text-slate-400 text-2xs mb-1">Jumlah DP yang Dibayarkan (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.paidAmount}
                  onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right text-xs focus:outline-hidden font-mono"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Catatan Tambahan</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan kondisi limbah, armada, atau kesepakatan susut"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              Simpan Pembelian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Record AP Debt Payment
// -------------------------------------------------------------
function PaymentAPModal({ item, onSave, onClose }) {
  const [amount, setAmount] = useState(item?.remainingPayable || 0);
  const [notes, setNotes] = useState('Pelunasan transfer BCA');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(amount) <= 0) return;
    onSave({
      amount: Number(amount),
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-xs font-sans">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Catat Pembayaran Hutang Lapak</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-mono font-bold text-emerald-400">{item.batchNo}</div>
            <div className="text-white font-medium">{item.supplierName}</div>
            <div className="flex justify-between text-2xs text-slate-400 pt-1 border-t border-slate-800 font-mono">
              <span>Sisa Hutang:</span>
              <strong className="text-rose-400">{formatRupiah(item.remainingPayable)}</strong>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Nominal yang Dibayarkan (Rp) *</label>
            <input
              required
              autoFocus
              type="number"
              min="1"
              max={item.remainingPayable}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-emerald-500 rounded px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-sm text-right focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Keterangan / Bukti Bayar</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Misal: Transfer Mandiri / Tunai"
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">Simpan Pembayaran</button>
          </div>
        </form>
      </div>
    </div>
  );
}
