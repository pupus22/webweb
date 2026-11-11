import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Printer,
  FileText,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { formatRupiah, formatNumber, formatWeight, formatPercent, formatDate, getStatusBadge } from '../utils/formatters';
import PrintModal from './PrintModal';

export default function SalesModule({
  recalibratedSales,
  setSales,
  finishedGoodsInventory,
  contacts,
  onRequestDelete
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });
  const [printTarget, setPrintTarget] = useState(null);

  const customerList = contacts.filter(c => c.type === 'customer' || c.type === 'both');

  const handleSaveSale = (formData) => {
    if (modalState.item) {
      setSales(prev => prev.map(s => s.id === modalState.item.id ? { ...s, ...formData } : s));
    } else {
      const newId = `SLS-${String(Date.now()).slice(-4)}`;
      setSales(prev => [
        {
          id: newId,
          ...formData
        },
        ...prev
      ]);
    }
    setModalState({ isOpen: false, item: null });
  };

  const filteredSales = recalibratedSales.filter(s => {
    const matchesSearch = `${s.invoiceNo} ${s.doNo} ${s.customerName} ${s.batchNo} ${s.productName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || s.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-3">
      {/* Top Filter and Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Invoice, DO, Customer, Batch..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
          >
            <option value="ALL">Semua Pembayaran</option>
            <option value="Belum Lunas">Belum Lunas</option>
            <option value="DP">Uang Muka (DP)</option>
            <option value="Lunas">Lunas</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setModalState({ isOpen: true, item: null })}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Pesanan Penjualan (PO)</span>
          </button>
        </div>
      </div>

      {/* High-density sales orders table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase tracking-wider">
                <th className="py-2.5 px-3">No. Invoice & Surat Jalan</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Customer / Pabrik</th>
                <th className="py-2.5 px-3">Batch Pelet & Produk</th>
                <th className="py-2.5 px-3 text-right">Qty (Kg)</th>
                <th className="py-2.5 px-3 text-right">Harga / Kg</th>
                <th className="py-2.5 px-3 text-right">Total Tagihan</th>
                <th className="py-2.5 px-3 text-right">HPP Batch</th>
                <th className="py-2.5 px-3 text-right">Estimasi Laba Kotor</th>
                <th className="py-2.5 px-3 text-center">Status Bayar</th>
                <th className="py-2.5 px-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3">
                    <div className="font-mono font-bold text-white">{sale.invoiceNo}</div>
                    <div className="text-2xs font-mono text-slate-400">DO: {sale.doNo}</div>
                  </td>
                  <td className="py-2 px-3 text-slate-300 font-sans">
                    {formatDate(sale.date)}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-semibold text-white">{sale.customerName}</div>
                    <div className="text-2xs text-slate-400">{sale.customerPhone || '-'}</div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-mono font-bold text-sky-400">{sale.batchNo}</div>
                    <div className="text-2xs text-slate-300 truncate max-w-[180px]">{sale.productName}</div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-white">
                    <div>{formatNumber(sale.qtyKg, 1)} Kg</div>
                    <div className="text-2xs text-slate-400 font-sans font-normal">
                      ~{sale.bagCount || Math.floor(sale.qtyKg / 25)} Sak
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-300">
                    {formatRupiah(sale.pricePerKg)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                    <div>{formatRupiah(sale.totalAmount)}</div>
                    {(sale.discount > 0 || sale.shippingCost > 0) && (
                      <div className="text-2xs text-slate-400 font-sans">
                        {sale.discount > 0 ? `Disc: ${formatRupiah(sale.discount)} ` : ''}
                        {sale.shippingCost > 0 ? `Ongkir: ${formatRupiah(sale.shippingCost)}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-400">
                    {formatRupiah(sale.cogsPerKg)}/Kg
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <div className="text-emerald-400 font-bold">{formatRupiah(sale.grossProfit)}</div>
                    <span className="text-2xs px-1.5 py-0.2 rounded font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Margin: {formatPercent(sale.profitMarginPercent)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-medium ${getStatusBadge(sale.paymentStatus)}`}>
                      {sale.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => setPrintTarget(sale)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white"
                        title="Cetak Nota / Surat Jalan"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setModalState({ isOpen: true, item: sale })}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Pesanan Penjualan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRequestDelete({
                          title: `Hapus Order ${sale.invoiceNo}`,
                          message: `Yakin ingin menghapus penjualan ini? Stok ${sale.qtyKg} Kg akan dikembalikan ke gudang pelet.`,
                          onConfirm: () => setSales(prev => prev.filter(x => x.id !== sale.id))
                        })}
                        className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500 font-sans">
                    Tidak ditemukan data order penjualan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Form Modal */}
      {modalState.isOpen && (
        <SalesFormModal
          item={modalState.item}
          finishedGoodsInventory={finishedGoodsInventory}
          customerList={customerList}
          onSave={handleSaveSale}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}

      {/* Print Preview Modal */}
      {printTarget && (
        <PrintModal
          sale={printTarget}
          onClose={() => setPrintTarget(null)}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------
// Sub-Modal: Sales Form Modal
// -----------------------------------------------------------------
function SalesFormModal({ item, finishedGoodsInventory, customerList, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const dateCode = today.replace(/-/g, '').slice(2);
  const defaultInv = `INV-SLS-${dateCode}-${String(Date.now()).slice(-3)}`;
  const defaultDO = `SJ-${dateCode}-${String(Date.now()).slice(-3)}`;

  // Filter available FG batches or keep existing item batch
  const availableBatches = finishedGoodsInventory.filter(
    fg => fg.currentStockKg > 0 || (item && item.batchNo === fg.batchNo)
  );

  const initialBatch = availableBatches[0];

  const [formData, setFormData] = useState({
    invoiceNo: item?.invoiceNo || defaultInv,
    doNo: item?.doNo || defaultDO,
    date: item?.date || today,
    customerId: item?.customerId || (customerList[0]?.id || ''),
    batchNo: item?.batchNo || (initialBatch?.batchNo || ''),
    productName: item?.productName || (initialBatch?.productName || ''),
    qtyKg: item?.qtyKg !== undefined ? item.qtyKg : 1000,
    pricePerKg: item?.pricePerKg !== undefined ? item.pricePerKg : 14500,
    discount: item?.discount || 0,
    shippingCost: item?.shippingCost || 0,
    paymentStatus: item?.paymentStatus || 'Lunas',
    paymentAmount: item?.paymentAmount !== undefined ? item.paymentAmount : 14500000,
    driverName: item?.driverName || '',
    vehicleNo: item?.vehicleNo || '',
    notes: item?.notes || ''
  });

  const selectedBatchObj = finishedGoodsInventory.find(fg => fg.batchNo === formData.batchNo);
  const liveHppPerKg = selectedBatchObj ? selectedBatchObj.hppPerKg : (item?.cogsPerKg || 0);
  const availableStockKg = selectedBatchObj ? (selectedBatchObj.currentStockKg + (item ? item.qtyKg : 0)) : 0;

  // Real-time calculations
  const qty = Number(formData.qtyKg) || 0;
  const price = Number(formData.pricePerKg) || 0;
  const discount = Number(formData.discount) || 0;
  const shipping = Number(formData.shippingCost) || 0;

  const subtotal = qty * price;
  const netRevenue = Math.max(0, subtotal - discount);
  const totalAmount = netRevenue + shipping;
  const totalCogs = qty * liveHppPerKg;
  const grossProfit = netRevenue - totalCogs;
  const profitMarginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const bagCount = Math.floor(qty / (selectedBatchObj?.bagWeightKg || 25));

  const handleBatchChange = (newBatchNo) => {
    const batch = finishedGoodsInventory.find(b => b.batchNo === newBatchNo);
    setFormData(prev => ({
      ...prev,
      batchNo: newBatchNo,
      productName: batch ? batch.productName : prev.productName
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.invoiceNo || !formData.customerId || !formData.batchNo || qty <= 0) return;

    onSave({
      ...formData,
      qtyKg: qty,
      bagCount,
      pricePerKg: price,
      discount,
      shippingCost: shipping,
      subtotal,
      netRevenue,
      totalAmount,
      cogsPerKg: liveHppPerKg,
      totalCogs,
      grossProfit,
      profitMarginPercent
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-w-2xl w-full my-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {item ? `Koreksi Order Penjualan: ${item.invoiceNo}` : 'Buat Pesanan Penjualan & Surat Jalan Baru'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          {/* Row 1: Invoice & DO & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. Invoice *</label>
              <input
                type="text"
                required
                value={formData.invoiceNo}
                onChange={e => setFormData({ ...formData, invoiceNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">No. Surat Jalan (DO) *</label>
              <input
                type="text"
                required
                value={formData.doNo}
                onChange={e => setFormData({ ...formData, doNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tanggal Pesanan *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Customer & Batch Pelet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Customer / Pabrik Pemesan *</label>
              <select
                required
                value={formData.customerId}
                onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                {customerList.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Pilih Batch Biji Plastik Gudang *</label>
              <select
                required
                value={formData.batchNo}
                onChange={e => handleBatchChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-semibold text-sky-400 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="">-- Pilih Batch Gudang --</option>
                {availableBatches.map(b => (
                  <option key={b.batchNo} value={b.batchNo}>
                    {b.batchNo} - {b.productName} (Sisa: {formatNumber(b.currentStockKg, 0)} Kg | HPP: {formatRupiah(b.hppPerKg)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Qty & Price & Stock Alert */}
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
                Volume & Penentuan Harga Jual
              </span>
              <span className="text-2xs font-mono text-sky-400">
                Stok Batch Tersedia: <strong>{formatWeight(availableStockKg)}</strong> (HPP: {formatRupiah(liveHppPerKg)}/Kg)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Kuantitas (Qty Kg) *</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={formData.qtyKg}
                  onChange={e => setFormData({ ...formData, qtyKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-2xs text-slate-400 block text-right mt-0.5">
                  ~{bagCount} Sak @ 25 Kg
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Harga Jual / Kg (Rp) *</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={formData.pricePerKg}
                  onChange={e => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Diskon Khusus (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-rose-300 font-mono text-right focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Ongkos Kirim (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.shippingCost}
                  onChange={e => setFormData({ ...formData, shippingCost: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-right focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {qty > availableStockKg && (
              <div className="p-2 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-2xs flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Peringatan: Kuantitas melebihi sisa stok fisik batch pelet ({formatWeight(availableStockKg)}).</span>
              </div>
            )}
          </div>

          {/* Live Margin & Profit Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/60 font-mono">
            <div>
              <span className="text-2xs text-slate-400 block font-sans">Total Tagihan (Invoice)</span>
              <span className="text-base font-bold text-white">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            <div>
              <span className="text-2xs text-slate-400 block font-sans">Total Beban HPP</span>
              <span className="text-sm font-bold text-slate-300">
                {formatRupiah(totalCogs)}
              </span>
            </div>

            <div>
              <span className="text-2xs text-emerald-400 block font-sans font-semibold">Estimasi Laba Kotor</span>
              <span className="text-base font-extrabold text-emerald-400">
                {formatRupiah(grossProfit)}
              </span>
            </div>

            <div className="border-l border-emerald-800/80 pl-3">
              <span className="text-2xs text-slate-400 block font-sans">Profit Margin</span>
              <span className="text-base font-extrabold text-emerald-400">
                {formatPercent(profitMarginPercent)}
              </span>
            </div>
          </div>

          {/* Payment & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Status Pembayaran</label>
              <select
                value={formData.paymentStatus}
                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="DP">Uang Muka (DP)</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nama Sopir Ekspedisi</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="misal: Pak Slamet"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">No. Polisi Truk / Armada</label>
              <input
                type="text"
                value={formData.vehicleNo}
                onChange={e => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                placeholder="B 9876 KDA"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Catatan Pengiriman / Dokumen</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan di surat jalan atau nota..."
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-2xs text-slate-400">
              * Stok pelet gudang otomatis terpotong saat order disimpan.
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
                {item ? 'Simpan Koreksi Order' : 'Simpan Pesanan & Cetak'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
