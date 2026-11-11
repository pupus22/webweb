import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Plus,
  Pencil,
  Trash2,
  Printer,
  Search,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  formatWeight,
  formatPercent,
  formatDate,
  getStatusBadge
} from '../utils/formatters';

export default function Stage5SalesModule({
  recalibratedSalesOrders = [],
  setSalesOrders,
  finishedGoodsPelletInventory = [],
  contacts = [],
  onPrintOrder,
  onRequestDelete
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null });

  // Filter customers
  const customers = contacts.filter(c => c.type === 'CUSTOMER' || c.type === 'BOTH');

  // Summary Metrics
  const totalRevenue = recalibratedSalesOrders.reduce((acc, so) => acc + (so.netRevenue || 0), 0);
  const totalCogs = recalibratedSalesOrders.reduce((acc, so) => acc + (so.totalCogs || 0), 0);
  const totalGrossProfit = recalibratedSalesOrders.reduce((acc, so) => acc + (so.grossProfit || 0), 0);
  const avgMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const totalKgSold = recalibratedSalesOrders.reduce((acc, so) => acc + (so.qtyKg || 0), 0);

  // Filtered Orders
  const filteredOrders = recalibratedSalesOrders.filter(so => {
    const textMatch = `${so.orderNo} ${so.customerName} ${so.targetLotNo} ${so.productName || ''} ${so.truckPlate || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const payMatch = paymentFilter === 'ALL' || so.paymentStatus === paymentFilter;
    return textMatch && payMatch;
  });

  const handleSave = (formData) => {
    if (modalState.item) {
      setSalesOrders(prev => prev.map(o => o.id === modalState.item.id ? { ...o, ...formData } : o));
    } else {
      const newId = `SO-${String(Date.now()).slice(-4)}`;
      setSalesOrders(prev => [{ id: newId, ...formData }, ...prev]);
    }
    setModalState({ isOpen: false, item: null });
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari DO, Customer, Lot Pelet, Plat..."
              className="w-full bg-slate-950 border border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-md px-2.5 py-1.5 text-white focus:outline-hidden focus:border-purple-500 text-xs"
          >
            <option value="ALL">Semua Pembayaran</option>
            <option value="Lunas">Lunas</option>
            <option value="DP">DP (Uang Muka)</option>
            <option value="Belum Lunas">Belum Lunas</option>
          </select>
        </div>

        <button
          onClick={() => setModalState({ isOpen: true, item: null })}
          className="flex items-center space-x-1.5 px-3 py-2 md:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-semibold transition min-h-[40px] md:min-h-0 text-xs w-full md:w-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Buat Surat Jalan & Penjualan Baru</span>
        </button>
      </div>

      {/* KPI Cards: Revenue & Margin Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Total Omset Penjualan</span>
            <span className="text-lg font-bold text-white font-mono">{formatRupiah(totalRevenue)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5 font-mono">
              Volume: {formatWeight(totalKgSold)} Pelet
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Total Beban Pokok (HPP)</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{formatRupiah(totalCogs)}</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Bahan Flakes + Ekstrusi</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Total Laba Kotor (Gross Profit)</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{formatRupiah(totalGrossProfit)}</span>
            <span className="text-2xs text-emerald-400 font-bold block mt-0.5 font-mono">
              Margin Rata-rata: {formatPercent(avgMargin)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="text-2xs text-slate-400 block uppercase font-medium">Status Pengiriman DO</span>
            <span className="text-lg font-bold text-sky-400 font-mono">{recalibratedSalesOrders.length} Surat Jalan</span>
            <span className="text-2xs text-slate-500 block mt-0.5">Siap Cetak DO & Invoice</span>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main High-density Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-2xs uppercase text-slate-400 font-semibold tracking-wider">
                <th className="py-2.5 px-3">No. DO / Invoice</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Customer & Alamat</th>
                <th className="py-2.5 px-3">Lot Pelet Terjual</th>
                <th className="py-2.5 px-3 text-right">Volume (Kg & Sak)</th>
                <th className="py-2.5 px-3 text-right">Harga Jual / Kg</th>
                <th className="py-2.5 px-3 text-right">Total Omset</th>
                <th className="py-2.5 px-3 text-right">Laba Kotor & Margin</th>
                <th className="py-2.5 px-3 text-center">Status Bayar</th>
                <th className="py-2.5 px-3 text-center sticky right-0 bg-slate-950/90">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredOrders.map(so => (
                <tr key={so.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3">
                    <div className="font-bold text-white">{so.orderNo}</div>
                    <div className="text-2xs text-slate-500 flex items-center space-x-1 font-sans">
                      <Truck className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{so.truckPlate || 'Armada Pabrik'}</span>
                    </div>
                  </td>

                  <td className="py-2 px-3 text-slate-300 font-sans">
                    {formatDate(so.date)}
                  </td>

                  <td className="py-2 px-3 font-sans">
                    <div className="font-semibold text-emerald-400">{so.customerName}</div>
                    <div className="text-2xs text-slate-400 truncate max-w-[180px]">
                      {so.customerAddress || '-'}
                    </div>
                  </td>

                  <td className="py-2 px-3">
                    <div className="font-bold text-purple-400">{so.targetLotNo}</div>
                    <div className="text-2xs text-slate-400 font-sans">HPP: {formatRupiah(so.cogsPerKg)}/Kg</div>
                  </td>

                  <td className="py-2 px-3 text-right">
                    <div className="font-bold text-white text-sm">{formatWeight(so.qtyKg)}</div>
                    <div className="text-2xs text-amber-300 font-sans font-semibold">
                      {so.bagCount} Sak (@ 25 Kg)
                    </div>
                  </td>

                  <td className="py-2 px-3 text-right font-bold text-white">
                    {formatRupiah(so.pricePerKg)}
                  </td>

                  <td className="py-2 px-3 text-right">
                    <div className="font-bold text-emerald-400 text-sm">{formatRupiah(so.netRevenue)}</div>
                    {so.shippingCost > 0 && (
                      <div className="text-2xs text-slate-500 font-sans">+ Ongkir: {formatRupiah(so.shippingCost)}</div>
                    )}
                  </td>

                  <td className="py-2 px-3 text-right">
                    <div className="font-bold text-emerald-400">{formatRupiah(so.grossProfit)}</div>
                    <div className="text-2xs text-purple-400 font-bold font-sans">
                      Margin: {formatPercent(so.marginPercent)}
                    </div>
                  </td>

                  <td className="py-2 px-3 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(so.paymentStatus)}`}>
                      {so.paymentStatus}
                    </span>
                  </td>

                  <td className="py-2 px-3 text-center sticky right-0 bg-slate-950/90 font-sans">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onPrintOrder && onPrintOrder(so)}
                        className="p-1 rounded bg-sky-950/80 hover:bg-sky-900 text-sky-300 hover:text-white border border-sky-500/30"
                        title="Cetak Surat Jalan & Faktur"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setModalState({ isOpen: true, item: so })}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Transaksi Penjualan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRequestDelete({
                          title: `Hapus Penjualan ${so.orderNo}`,
                          message: `Yakin ingin menghapus penjualan ke ${so.customerName}? Stok pelet lot ${so.targetLotNo} sebanyak ${formatWeight(so.qtyKg)} akan dikembalikan ke gudang pelet.`,
                          onConfirm: () => setSalesOrders(prev => prev.filter(x => x.id !== so.id))
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
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                    Tidak ditemukan data transaksi penjualan / surat jalan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SALES MODAL FORM */}
      {modalState.isOpen && (
        <SalesFormModal
          item={modalState.item}
          availableLots={finishedGoodsPelletInventory}
          customers={customers}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Create & Edit Sales Order
// -------------------------------------------------------------
function SalesFormModal({ item, availableLots = [], customers = [], onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultOrderNo = `DO-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;

  // Filter lots with stock > 0, or currently edited item
  const selectableLots = availableLots.filter(l => l.currentStockKg > 0 || (item && item.targetLotNo === l.lotNo));
  const initialLot = item?.targetLotNo || selectableLots[0]?.lotNo || '';
  const initialMatchedLot = selectableLots.find(l => l.lotNo === initialLot);

  const [formData, setFormData] = useState({
    orderNo: item?.orderNo || defaultOrderNo,
    date: item?.date || today,
    customerId: item?.customerId || customers[0]?.id || '',
    targetLotNo: initialLot,
    qtyKg: item?.qtyKg || 1000,
    pricePerKg: item?.pricePerKg || 16500,
    discount: item?.discount || 0,
    shippingCost: item?.shippingCost || 0,
    paymentStatus: item?.paymentStatus || 'Lunas',
    truckPlate: item?.truckPlate || 'B 9876 PQR',
    driverName: item?.driverName || 'Pak Supri (Ekspedisi)',
    notes: item?.notes || 'Biji Pelet Lulus QC - Kadar Air < 0.2%'
  });

  const matchedLot = selectableLots.find(l => l.lotNo === formData.targetLotNo);
  const liveHppPerKg = matchedLot ? matchedLot.hppFinalPelletPerKg : 11000;
  const availableStock = matchedLot ? (matchedLot.currentStockKg + (item && item.targetLotNo === matchedLot.lotNo ? Number(item.qtyKg || 0) : 0)) : 0;

  // Live Calculations
  const qtyKg = Number(formData.qtyKg) || 0;
  const pricePerKg = Number(formData.pricePerKg) || 0;
  const discount = Number(formData.discount) || 0;
  const shippingCost = Number(formData.shippingCost) || 0;

  const subtotal = qtyKg * pricePerKg;
  const netRevenue = Math.max(0, subtotal - discount);
  const totalAmount = netRevenue + shippingCost;
  const totalCogs = qtyKg * liveHppPerKg;
  const grossProfit = netRevenue - totalCogs;
  const marginPercent = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
  const bagCount = Math.floor(qtyKg / 25);

  const isStockExceeded = qtyKg > availableStock;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.orderNo || !formData.customerId || !formData.targetLotNo || qtyKg <= 0) return;
    if (isStockExceeded) {
      alert(`Jumlah order (${qtyKg} Kg) melebihi stok tersedia (${availableStock} Kg) untuk lot ${formData.targetLotNo}!`);
      return;
    }

    const customerObj = customers.find(c => c.id === formData.customerId);

    onSave({
      ...formData,
      qtyKg,
      bagCount,
      pricePerKg,
      discount,
      shippingCost,
      subtotal,
      netRevenue,
      totalAmount,
      cogsPerKg: liveHppPerKg,
      totalCogs,
      grossProfit,
      marginPercent,
      customerName: customerObj ? customerObj.name : formData.customerId,
      customerPhone: customerObj ? customerObj.phone : '',
      customerAddress: customerObj ? customerObj.address : ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {item ? `Koreksi Penjualan: ${item.orderNo}` : 'Input Surat Jalan (DO) & Penjualan Biji Pelet'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 font-sans">
          {/* Header row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">No. DO / Surat Jalan *</label>
              <input
                required
                type="text"
                value={formData.orderNo}
                onChange={e => setFormData({ ...formData, orderNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-2xs mb-1">Tanggal Kirim *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-2xs mb-1">Status Pembayaran</label>
              <select
                value={formData.paymentStatus}
                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Lunas">Lunas</option>
                <option value="DP">DP (Uang Muka)</option>
                <option value="Belum Lunas">Belum Lunas / Tempo</option>
              </select>
            </div>
          </div>

          {/* Customer & Lot Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Customer / Pabrik Pembeli *</label>
              <select
                required
                value={formData.customerId}
                onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500 font-medium"
              >
                <option value="">-- Pilih Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.notes ? `(${c.notes})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-400 text-2xs">Pilih Lot Biji Pelet dari Gudang *</label>
                {matchedLot && (
                  <span className="text-2xs text-purple-400 font-mono">
                    Sisa: {formatWeight(availableStock)}
                  </span>
                )}
              </div>
              <select
                required
                value={formData.targetLotNo}
                onChange={e => setFormData({ ...formData, targetLotNo: e.target.value })}
                className="w-full bg-slate-950 border border-purple-500 rounded px-2.5 py-1.5 text-purple-300 font-mono text-xs focus:outline-hidden font-bold"
              >
                <option value="">-- Pilih Lot Gudang Pelet --</option>
                {selectableLots.map(l => (
                  <option key={l.lotNo} value={l.lotNo}>
                    {l.lotNo} - {l.productName} ({l.targetColor}) | Sisa: {formatNumber(l.currentStockKg, 0)} Kg @ HPP {formatRupiah(l.hppFinalPelletPerKg)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2.5 font-mono">
            <span className="text-2xs font-bold text-slate-300 uppercase tracking-wider block font-sans">
              Rincian Timbangan Kirim & Harga
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Qty Kirim (Kg) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.qtyKg}
                  onChange={e => setFormData({ ...formData, qtyKg: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold text-right text-xs focus:outline-hidden"
                />
                <span className="text-2xs text-amber-400 font-sans block text-right mt-0.5">
                  = {bagCount} Sak (@ 25 Kg)
                </span>
                {isStockExceeded && (
                  <span className="text-2xs text-rose-400 font-sans font-bold block mt-0.5">
                    ⚠️ Melebihi stok gudang!
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Harga Jual / Kg *</label>
                <input
                  required
                  type="number"
                  min="100"
                  step="50"
                  value={formData.pricePerKg}
                  onChange={e => setFormData({ ...formData, pricePerKg: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-emerald-400 font-bold text-right text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Diskon Total (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-right text-xs focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-sans text-2xs mb-1">Ongkir Ekspedisi (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.shippingCost}
                  onChange={e => setFormData({ ...formData, shippingCost: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white text-right text-xs focus:outline-hidden"
                />
              </div>
            </div>

            {/* Profit Margin Preview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Total Omset Net:</span>
                <span className="font-bold text-white text-sm">{formatRupiah(netRevenue)}</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans">Beban Pokok (HPP):</span>
                <span className="font-bold text-amber-400">{formatRupiah(totalCogs)}</span>
                <span className="text-2xs text-slate-500 block">@ {formatRupiah(liveHppPerKg)}/Kg</span>
              </div>
              <div>
                <span className="text-2xs text-slate-400 block font-sans font-bold text-emerald-400">Laba Kotor (Profit):</span>
                <span className="font-bold text-emerald-400 text-sm">{formatRupiah(grossProfit)}</span>
              </div>
              <div className="border-l border-slate-800 pl-2">
                <span className="text-2xs text-purple-400 block font-sans font-bold">Margin Keuntungan:</span>
                <span className="font-black text-purple-400 text-sm">{formatPercent(marginPercent)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-2xs mb-1">Plat Nomor Truk / Kendaraan</label>
              <input
                type="text"
                value={formData.truckPlate}
                onChange={e => setFormData({ ...formData, truckPlate: e.target.value.toUpperCase() })}
                placeholder="Misal: B 9123 XYZ"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono uppercase text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-2xs mb-1">Nama Pengemudi / Sopir Ekspedisi</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Misal: Pak Bambang (Ekspedisi Mandiri)"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-2xs mb-1">Catatan Pengiriman / Faktur</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan spesifikasi atau instruksi kirim"
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
              Simpan Surat Jalan & Penjualan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
