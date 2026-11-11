import React, { useState, useEffect } from 'react';
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
  FileText,
  CreditCard,
  GitBranch,
  Building2
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
  onRequestDelete,
  onOpenTraceability,
  initialLotNo = null,
  onClearInitialLotNo
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [modalState, setModalState] = useState({ isOpen: false, item: null, preselectedLotNo: null });
  const [paymentModalState, setPaymentModalState] = useState({ isOpen: false, item: null });

  // Handle fast-workflow auto open if triggered from Stage 4 (Gudang Pelet)
  useEffect(() => {
    if (initialLotNo) {
      setModalState({ isOpen: true, item: null, preselectedLotNo: initialLotNo });
      if (onClearInitialLotNo) onClearInitialLotNo();
    }
  }, [initialLotNo, onClearInitialLotNo]);

  // Filter customers
  const customers = contacts.filter(c => c.type === 'CUSTOMER' || c.type === 'customer' || c.type === 'BOTH');

  // Summary Metrics
  const totalRevenue = recalibratedSalesOrders.reduce((acc, so) => acc + (so.netRevenue || 0), 0);
  const totalCogs = recalibratedSalesOrders.reduce((acc, so) => acc + (so.totalCogs || 0), 0);
  const totalGrossProfit = recalibratedSalesOrders.reduce((acc, so) => acc + (so.grossProfit || 0), 0);
  const avgMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;
  const totalKgSold = recalibratedSalesOrders.reduce((acc, so) => acc + (so.qtyKg || 0), 0);

  // Accounts Receivable (AR) Piutang Customer
  const totalReceivable = recalibratedSalesOrders.reduce((acc, so) => {
    const remaining = so.remainingReceivable !== undefined
      ? Number(so.remainingReceivable || 0)
      : (so.paymentStatus === 'Lunas' ? 0 : Math.max(0, (so.netRevenue || 0) - (so.paidAmount || 0)));
    return acc + remaining;
  }, 0);

  const totalPaidRevenue = totalRevenue - totalReceivable;

  // Filtered Orders
  const filteredOrders = recalibratedSalesOrders.filter(so => {
    const textMatch = `${so.orderNo} ${so.invoiceNo || ''} ${so.customerName} ${so.targetLotNo} ${so.productName || ''} ${so.truckPlate || ''}`
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
    setModalState({ isOpen: false, item: null, preselectedLotNo: null });
  };

  const handleSavePayment = (soId, paidAmount, paymentDate, notes) => {
    setSalesOrders(prev => prev.map(so => {
      if (so.id === soId) {
        const netRev = Number(so.netRevenue || 0);
        const newPaid = Number(paidAmount);
        const newStatus = newPaid >= netRev ? 'Lunas' : (newPaid > 0 ? 'DP' : 'Belum Lunas');
        const remaining = Math.max(0, netRev - newPaid);
        return {
          ...so,
          paidAmount: newPaid,
          paymentStatus: newStatus,
          remainingReceivable: remaining,
          lastPaymentDate: paymentDate,
          paymentNotes: notes
        };
      }
      return so;
    }));
    setPaymentModalState({ isOpen: false, item: null });
  };

  return (
    <div className="space-y-4">
      {/* Top Metric Cards: Revenue & Margin Analytics + AR Piutang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Total Omset Penjualan</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{formatRupiah(totalRevenue)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5 font-mono">
              Volume: {formatWeight(totalKgSold)} Pelet
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Total Beban Pokok (HPP)</span>
            <span className="text-xl font-bold text-slate-800 font-mono">{formatRupiah(totalCogs)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5">Bahan Flakes + Olah Ekstrusi</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Laba Kotor & Margin</span>
            <span className="text-xl font-bold text-violet-600 font-mono">{formatRupiah(totalGrossProfit)}</span>
            <span className="text-3xs text-violet-600 font-bold block mt-0.5 font-mono">
              Margin Rata-rata: {formatPercent(avgMargin)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex items-center justify-between">
          <div>
            <span className="text-3xs text-slate-400 block uppercase font-semibold">Sisa Piutang (AR)</span>
            <span className="text-xl font-bold text-rose-600 font-mono">{formatRupiah(totalReceivable)}</span>
            <span className="text-3xs text-slate-400 block mt-0.5 font-mono">
              Terbayar: {formatRupiah(totalPaidRevenue)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
            <CreditCard className="w-5 h-5" />
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
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari DO, Invoice, Customer, Lot..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white text-xs"
            />
          </div>

          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-violet-500 text-xs"
          >
            <option value="ALL">Semua Pembayaran</option>
            <option value="Lunas">Lunas</option>
            <option value="DP">DP (Uang Muka)</option>
            <option value="Belum Lunas">Belum Lunas / Tempo</option>
          </select>
        </div>

        <button
          onClick={() => setModalState({ isOpen: true, item: null, preselectedLotNo: null })}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition shadow-xs text-xs w-full md:w-auto justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Buat Surat Jalan & Penjualan Baru</span>
        </button>
      </div>

      {/* Main High-density Data Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 text-3xs uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">No. DO & No. Invoice</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Customer & Alamat</th>
                <th className="py-2.5 px-3">Lot Pelet Terjual</th>
                <th className="py-2.5 px-3 text-right">Volume (Kg & Sak)</th>
                <th className="py-2.5 px-3 text-right">Harga Jual / Kg</th>
                <th className="py-2.5 px-3 text-right">Total Omset</th>
                <th className="py-2.5 px-3 text-right">Laba Kotor & Margin</th>
                <th className="py-2.5 px-3 text-center">Status Bayar & Piutang</th>
                <th className="py-2.5 px-3 text-center sticky right-0 bg-white/95 min-w-[150px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {filteredOrders.map(so => {
                const orderNo = so.orderNo || so.doNo || 'DO-PENDING';
                const invoiceNo = so.invoiceNo || `INV-${orderNo.replace('DO-', '')}`;
                const remaining = so.remainingReceivable !== undefined
                  ? Number(so.remainingReceivable || 0)
                  : (so.paymentStatus === 'Lunas' ? 0 : Math.max(0, (so.netRevenue || 0) - (so.paidAmount || 0)));

                return (
                  <tr key={so.id} className="hover:bg-slate-50/70 transition">
                    {/* Fixed Column 1: DO & Invoice prominently displayed */}
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(orderNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline flex items-center space-x-1 text-left"
                        title="Klik untuk melihat silsilah batch pelet yang dikirim"
                      >
                        <GitBranch className="w-3 h-3 text-violet-400 shrink-0" />
                        <span>{orderNo}</span>
                      </button>
                      <div className="text-3xs text-emerald-600 font-mono font-bold">
                        {invoiceNo}
                      </div>
                      <div className="text-3xs text-slate-400 flex items-center space-x-1 font-sans mt-0.5">
                        <Truck className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{so.truckPlate || 'Armada Pabrik'} {so.driverName ? `(${so.driverName})` : ''}</span>
                      </div>
                    </td>

                    <td className="py-2 px-3 text-slate-600 font-sans">
                      {formatDate(so.date)}
                    </td>

                    <td className="py-2 px-3 font-sans">
                      <div className="font-semibold text-slate-800 leading-snug">{so.customerName}</div>
                      <div className="text-3xs text-slate-400 leading-tight">
                        {so.customerAddress || '-'}
                      </div>
                    </td>

                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => onOpenTraceability && onOpenTraceability(so.targetLotNo)}
                        className="font-bold text-violet-600 hover:text-violet-700 hover:underline flex items-center space-x-1 text-left"
                        title="Lacak lot pelet ini"
                      >
                        <GitBranch className="w-3 h-3 text-violet-400 shrink-0" />
                        <span>{so.targetLotNo}</span>
                      </button>
                      <div className="text-3xs text-slate-400 font-sans">HPP: {formatRupiah(so.cogsPerKg)}/Kg</div>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="font-bold text-slate-800 text-sm">{formatWeight(so.qtyKg)}</div>
                      <div className="text-3xs text-slate-500 font-sans font-medium">
                        {so.bagCount} Sak (@ 25 Kg)
                      </div>
                    </td>

                    <td className="py-2 px-3 text-right font-bold text-slate-800">
                      {formatRupiah(so.pricePerKg)}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="font-bold text-slate-800 text-sm">{formatRupiah(so.netRevenue)}</div>
                      {so.shippingCost > 0 && (
                        <div className="text-3xs text-slate-400 font-sans">+ Ongkir: {formatRupiah(so.shippingCost)}</div>
                      )}
                    </td>

                    <td className="py-2 px-3 text-right">
                      <div className="font-bold text-violet-600">{formatRupiah(so.grossProfit)}</div>
                      <div className="text-3xs text-violet-600 font-bold font-sans">
                        Margin: {formatPercent(so.marginPercent)}
                      </div>
                    </td>

                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${getStatusBadge(so.paymentStatus)}`}>
                        {so.paymentStatus}
                      </span>
                      {remaining > 0 ? (
                        <div className="text-3xs text-rose-500 font-mono mt-0.5 font-bold">
                          Sisa: {formatRupiah(remaining)}
                        </div>
                      ) : (
                        <div className="text-3xs text-emerald-600 font-mono mt-0.5 font-medium">
                          Lunas 100%
                        </div>
                      )}
                    </td>

                    <td className="py-2 px-3 text-center sticky right-0 bg-white/95 font-sans">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Pelunasan Piutang */}
                        {so.paymentStatus !== 'Lunas' && (
                          <button
                            onClick={() => setPaymentModalState({ isOpen: true, item: so })}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-3xs flex items-center space-x-0.5 transition"
                            title="Catat Pembayaran Customer / Pelunasan Piutang"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Bayar</span>
                          </button>
                        )}

                        {/* Cetak DO & Invoice */}
                        <button
                          onClick={() => onPrintOrder && onPrintOrder(so)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                          title="Cetak Surat Jalan & Faktur"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Transaksi */}
                        <button
                          onClick={() => setModalState({ isOpen: true, item: so, preselectedLotNo: null })}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition"
                          title="Edit Transaksi Penjualan"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Hapus Transaksi */}
                        <button
                          onClick={() => onRequestDelete({
                            title: `Hapus Penjualan ${orderNo}`,
                            message: `Yakin ingin menghapus penjualan ke ${so.customerName}? Stok pelet lot ${so.targetLotNo} sebanyak ${formatWeight(so.qtyKg)} akan dikembalikan ke gudang pelet.`,
                            onConfirm: () => setSalesOrders(prev => prev.filter(x => x.id !== so.id))
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
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 font-sans">
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
          preselectedLotNo={modalState.preselectedLotNo}
          availableLots={finishedGoodsPelletInventory}
          customers={customers}
          onSave={handleSave}
          onClose={() => setModalState({ isOpen: false, item: null, preselectedLotNo: null })}
        />
      )}

      {/* PAYMENT / PELUNASAN MODAL */}
      {paymentModalState.isOpen && paymentModalState.item && (
        <PelunasanCustomerModal
          item={paymentModalState.item}
          onSave={handleSavePayment}
          onClose={() => setPaymentModalState({ isOpen: false, item: null })}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Create & Edit Sales Order
// -------------------------------------------------------------
function SalesFormModal({ item, preselectedLotNo, availableLots = [], customers = [], onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const defaultOrderNo = `DO-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;
  const defaultInvoiceNo = `INV-${today.replace(/-/g, '').slice(2)}-${String(Date.now()).slice(-3)}`;

  // Filter lots with stock > 0, or currently edited item / preselected
  const selectableLots = availableLots.filter(l => l.currentStockKg > 0 || (item && item.targetLotNo === l.lotNo) || (preselectedLotNo && preselectedLotNo === l.lotNo));
  const initialLot = preselectedLotNo || item?.targetLotNo || selectableLots[0]?.lotNo || '';

  const [formData, setFormData] = useState({
    orderNo: item?.orderNo || item?.doNo || defaultOrderNo,
    invoiceNo: item?.invoiceNo || defaultInvoiceNo,
    date: item?.date || today,
    customerId: item?.customerId || customers[0]?.id || '',
    targetLotNo: initialLot,
    qtyKg: item?.qtyKg || 1000,
    pricePerKg: item?.pricePerKg || 16500,
    discount: item?.discount || 0,
    shippingCost: item?.shippingCost || 0,
    paymentStatus: item?.paymentStatus || 'Lunas',
    paidAmount: item?.paidAmount !== undefined ? item.paidAmount : (item ? item.netRevenue : 16500000),
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
    const paid = formData.paymentStatus === 'Lunas' ? netRevenue : (Number(formData.paidAmount) || 0);
    const remainingReceivable = Math.max(0, netRevenue - paid);

    onSave({
      ...formData,
      doNo: formData.orderNo,
      qtyKg,
      bagCount,
      pricePerKg,
      discount,
      shippingCost,
      subtotal,
      netRevenue,
      totalAmount,
      paidAmount: paid,
      remainingReceivable,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-2xl w-full my-6 overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              {item ? `Koreksi Penjualan: ${formData.orderNo}` : 'Input Surat Jalan (DO) & Penjualan Biji Pelet'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 font-sans">
          {/* Header row: DO No, Invoice No, Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">No. DO / Surat Jalan *</label>
              <input
                required
                type="text"
                value={formData.orderNo}
                onChange={e => setFormData({ ...formData, orderNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono uppercase text-xs focus:bg-white focus:border-violet-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">No. Faktur / Invoice *</label>
              <input
                required
                type="text"
                value={formData.invoiceNo}
                onChange={e => setFormData({ ...formData, invoiceNo: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-emerald-700 font-mono uppercase text-xs focus:bg-white focus:border-violet-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Tanggal Kirim *</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          {/* Customer & Lot Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Customer / Pabrik Pembeli *</label>
              <select
                required
                value={formData.customerId}
                onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500 font-medium"
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
                <label className="text-slate-500 text-2xs font-semibold">Pilih Lot Biji Pelet dari Gudang *</label>
                {matchedLot && (
                  <span className="text-3xs text-violet-600 font-mono font-medium">
                    Sisa: {formatWeight(availableStock)}
                  </span>
                )}
              </div>
              <select
                required
                value={formData.targetLotNo}
                onChange={e => setFormData({ ...formData, targetLotNo: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-violet-700 font-mono text-xs focus:bg-white focus:border-violet-500 font-bold"
              >
                <option value="">-- Pilih Lot Gudang Pelet --</option>
                {selectableLots.map(l => (
                  <option key={l.lotNo} value={l.lotNo}>
                    {l.lotNo} - {l.productName} ({l.targetColor}) | Sisa: {formatNumber(l.currentStockKg, 0)} Kg
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity & Pricing */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 font-mono">
            <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block font-sans">
              Rincian Timbangan Kirim & Harga Jual
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Qty Kirim (Kg) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.qtyKg}
                  onChange={e => setFormData({ ...formData, qtyKg: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold text-right text-xs"
                />
                <span className="text-3xs text-slate-500 font-sans block text-right mt-0.5">
                  = {bagCount} Sak (@ 25 Kg)
                </span>
                {isStockExceeded && (
                  <span className="text-3xs text-rose-500 font-sans font-bold block mt-0.5">
                    ⚠️ Melebihi stok gudang!
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Harga Jual / Kg *</label>
                <input
                  required
                  type="number"
                  min="100"
                  step="50"
                  value={formData.pricePerKg}
                  onChange={e => setFormData({ ...formData, pricePerKg: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-emerald-600 font-bold text-right text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Diskon Total (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-right text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-sans text-3xs mb-1 font-semibold">Ongkir Ekspedisi (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.shippingCost}
                  onChange={e => setFormData({ ...formData, shippingCost: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-right text-xs"
                />
              </div>
            </div>

            {/* Profit Margin Preview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-3xs text-slate-400 block font-sans">Total Omset Net:</span>
                <span className="font-bold text-slate-800 text-sm">{formatRupiah(netRevenue)}</span>
              </div>
              <div>
                <span className="text-3xs text-slate-400 block font-sans">Beban Pokok (HPP):</span>
                <span className="font-bold text-slate-600">{formatRupiah(totalCogs)}</span>
              </div>
              <div>
                <span className="text-3xs text-slate-400 block font-sans font-semibold text-violet-700">Laba Kotor:</span>
                <span className="font-bold text-violet-700 text-sm">{formatRupiah(grossProfit)}</span>
              </div>
              <div className="border-l border-slate-200 pl-2">
                <span className="text-3xs text-violet-600 block font-sans font-semibold">Margin Keuntungan:</span>
                <span className="font-black text-violet-700 text-sm">{formatPercent(marginPercent)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms & Piutang */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Status Pembayaran Customer</label>
              <select
                value={formData.paymentStatus}
                onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:border-violet-500"
              >
                <option value="Lunas">Lunas (Tunai / Transfer Full)</option>
                <option value="DP">DP (Uang Muka Sebagian)</option>
                <option value="Belum Lunas">Belum Lunas / Tempo (Kredit)</option>
              </select>
            </div>

            {formData.paymentStatus === 'DP' && (
              <div>
                <label className="block text-amber-600 text-2xs mb-1 font-semibold">Nominal DP Diterima (Rp) *</label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Delivery & Logistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Plat Nomor Truk / Armada</label>
              <input
                type="text"
                value={formData.truckPlate}
                onChange={e => setFormData({ ...formData, truckPlate: e.target.value.toUpperCase() })}
                placeholder="Misal: B 9123 XYZ"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono uppercase text-xs focus:bg-white focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-2xs mb-1 font-semibold">Nama Pengemudi / Sopir</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={e => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Misal: Pak Bambang (Ekspedisi)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Catatan Pengiriman / Faktur</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan tambahan spesifikasi atau instruksi bongkar"
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
              Simpan Surat Jalan & Penjualan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Pelunasan Piutang Customer (AR Management)
// -------------------------------------------------------------
function PelunasanCustomerModal({ item, onSave, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const totalBill = Number(item.netRevenue || item.totalAmount || 0);
  const currentPaid = Number(item.paidAmount || 0);
  const remaining = Math.max(0, totalBill - currentPaid);

  const [paymentAmount, setPaymentAmount] = useState(remaining);
  const [paymentDate, setPaymentDate] = useState(today);
  const [notes, setNotes] = useState('Pelunasan transfer bank BCA');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTotalPaid = currentPaid + Number(paymentAmount);
    onSave(item.id, newTotalPaid, paymentDate, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden text-xs text-slate-800">
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Pelunasan Piutang Customer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 font-sans">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500 text-3xs font-semibold">No. DO & Faktur:</span>
              <span className="font-mono font-bold text-slate-800">{item.orderNo || item.doNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-3xs font-semibold">Customer:</span>
              <span className="font-bold text-slate-800">{item.customerName}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5">
              <span className="text-slate-500 text-3xs">Total Tagihan:</span>
              <span className="font-mono font-bold text-slate-800">{formatRupiah(totalBill)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-3xs">Sudah Dibayar:</span>
              <span className="font-mono font-bold text-emerald-600">{formatRupiah(currentPaid)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-rose-600 text-3xs">Sisa Piutang:</span>
              <span className="font-mono text-rose-600 text-sm">{formatRupiah(remaining)}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Tanggal Pembayaran *</label>
            <input
              required
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-500 text-2xs font-semibold">Nominal Bayar / Pelunasan (Rp) *</label>
              <button
                type="button"
                onClick={() => setPaymentAmount(remaining)}
                className="text-3xs text-violet-600 hover:text-violet-700 font-bold"
              >
                Bayar Penuh ({formatRupiah(remaining)})
              </button>
            </div>
            <input
              required
              type="number"
              min="1"
              max={remaining}
              value={paymentAmount}
              onChange={e => setPaymentAmount(e.target.value)}
              className="w-full bg-slate-50 border border-emerald-300 rounded-xl px-2.5 py-1.5 text-emerald-700 font-mono font-black text-sm focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-slate-500 text-2xs mb-1 font-semibold">Metode & Catatan Pembayaran</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Misal: Transfer BCA Rekening Pabrik / Cek Giro"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:bg-white focus:border-violet-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-semibold">Batal</button>
            <button type="submit" className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold">Simpan Pembayaran</button>
          </div>
        </form>
      </div>
    </div>
  );
}
