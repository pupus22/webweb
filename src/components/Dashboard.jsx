import React from 'react';
import {
  Boxes,
  Truck,
  Cog,
  Warehouse,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Flame,
  Scale
} from 'lucide-react';
import { formatRupiah, formatNumber, formatWeight, formatPercent, formatDate, getStatusBadge } from '../utils/formatters';

export default function Dashboard({
  kpis,
  recalibratedPurchases,
  recalibratedProductions,
  finishedGoodsInventory,
  recalibratedSales,
  setActiveTab
}) {
  // Low stock checks
  const lowRawStock = recalibratedPurchases.filter(p => p.remainingKg > 0 && p.remainingKg < p.netWeight * 0.25);
  const lowFgStock = finishedGoodsInventory.filter(fg => fg.currentStockKg > 0 && fg.currentStockKg < 500);

  // Group raw stock by plastic type
  const rawByPlastic = {};
  recalibratedPurchases.forEach(p => {
    const key = p.plasticName || 'Lain-lain';
    if (!rawByPlastic[key]) {
      rawByPlastic[key] = { kg: 0, val: 0 };
    }
    rawByPlastic[key].kg += p.remainingKg;
    rawByPlastic[key].val += p.remainingKg * p.pricePerKg;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Raw Material Stock */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Stok Bahan Baku Reject</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {formatWeight(kpis.totalRawStockKg)}
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {formatRupiah(kpis.totalRawStockValue)}
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Total {recalibratedPurchases.length} batch masuk</span>
            <button
              onClick={() => setActiveTab('purchases')}
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5"
            >
              <span>Lihat Inbound</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Finished Goods Inventory */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Stok Gudang Biji Plastik</span>
            <Warehouse className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-white font-mono">
              {formatWeight(kpis.totalFinishedGoodsStockKg)}
            </span>
            <span className="text-xs text-sky-400 font-mono">
              {formatRupiah(kpis.totalFinishedGoodsStockValue)}
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>{finishedGoodsInventory.filter(f => f.currentStockKg > 0).length} batch pelet aktif</span>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-sky-400 hover:text-sky-300 flex items-center space-x-0.5"
            >
              <span>Buka Gudang</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Production Shrinkage & Loss */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Rata-rata Susut Produksi</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-amber-400 font-mono">
              {formatPercent(kpis.avgShrinkagePercent)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Loss: {formatWeight(kpis.totalProductionShrinkageKg)}
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Input: {formatWeight(kpis.totalProductionInputKg)}</span>
            <button
              onClick={() => setActiveTab('production')}
              className="text-amber-400 hover:text-amber-300 flex items-center space-x-0.5"
            >
              <span>Detail SPK</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Sales & Gross Profit */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Total Omset & Laba Kotor</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-emerald-400 font-mono">
              {formatRupiah(kpis.totalSalesGrossProfit)}
            </span>
            <span className="text-xs text-slate-300 font-mono">
              Omset: {formatRupiah(kpis.totalSalesRevenue)}
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Margin: {formatPercent(kpis.avgGrossProfitMargin)}</span>
            <button
              onClick={() => setActiveTab('sales')}
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5"
            >
              <span>Lihat Penjualan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="font-semibold text-white">Aksi Cepat Operasional:</span>
          <span className="text-slate-400 hidden md:inline">Input transaksi harian pabrik biji plastik</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('purchases')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>+ Beli Bahan Baku</span>
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-sm transition"
          >
            <Cog className="w-3.5 h-3.5" />
            <span>+ SPK Blending Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium shadow-sm transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Buat Order Penjualan</span>
          </button>
        </div>
      </div>

      {/* Low stock alerts if any */}
      {(lowRawStock.length > 0 || lowFgStock.length > 0) && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-200 space-y-1">
          <div className="flex items-center space-x-1.5 font-semibold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Peringatan Stok Menipis / Perlu Restock Segera</span>
          </div>
          <div className="flex flex-wrap gap-2 text-2xs pt-1">
            {lowRawStock.map(p => (
              <span key={p.id} className="bg-rose-900/60 border border-rose-700/60 px-2 py-0.5 rounded">
                Bahan: <strong>{p.batchNo}</strong> ({p.plasticName}) sisa {formatWeight(p.remainingKg)}
              </span>
            ))}
            {lowFgStock.map(fg => (
              <span key={fg.batchNo} className="bg-amber-900/60 border border-amber-700/60 px-2 py-0.5 rounded text-amber-200">
                Pelet: <strong>{fg.batchNo}</strong> ({fg.productName}) sisa {formatWeight(fg.currentStockKg)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Production Activity & Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Production Work Orders Activity */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center space-x-2">
              <Cog className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Aktivitas SPK Produksi Terkini</h3>
            </div>
            <button
              onClick={() => setActiveTab('production')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>Semua SPK</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase">
                  <th className="py-2 px-3">No. SPK & Tgl</th>
                  <th className="py-2 px-3">Mode & Produk Target</th>
                  <th className="py-2 px-3 text-right">Input (Kg)</th>
                  <th className="py-2 px-3 text-right">Output (Kg)</th>
                  <th className="py-2 px-3 text-right">Susut (%)</th>
                  <th className="py-2 px-3 text-right">HPP/Kg</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recalibratedProductions.slice(0, 5).map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-white">{prod.spkNo}</div>
                      <div className="text-2xs text-slate-400 font-sans">{formatDate(prod.date)}</div>
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <div className="font-medium text-slate-200 truncate max-w-[200px]" title={prod.targetProductName}>
                        {prod.targetProductName}
                      </div>
                      <div className="text-2xs text-slate-400">
                        <span className="capitalize">{prod.mode === 'multi_blend' ? 'Multi-Plastic Blend' : 'Single Material'}</span> • {prod.targetColor}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{formatNumber(prod.totalInputKg, 0)} Kg</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-semibold">{formatNumber(prod.outputKg, 0)} Kg</td>
                    <td className="py-2 px-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-2xs font-semibold ${
                        prod.shrinkagePercent > 7 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {formatPercent(prod.shrinkagePercent)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-sky-400 font-semibold">{formatRupiah(prod.hppPerKg)}</td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-medium ${getStatusBadge(prod.status)}`}>
                        {prod.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recalibratedProductions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500 font-sans">
                      Belum ada SPK produksi. Klik "+ SPK Blending Baru" untuk mulai.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Raw Material Breakdown by Plastic Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
          <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sebaran Bahan Baku</h3>
            </div>
            <span className="text-2xs text-slate-400">Siap Olah</span>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {Object.keys(rawByPlastic).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Tidak ada stok bahan baku</p>
            ) : (
              Object.entries(rawByPlastic).map(([name, data]) => {
                const pct = kpis.totalRawStockKg > 0 ? (data.kg / kpis.totalRawStockKg) * 100 : 0;
                return (
                  <div key={name} className="p-2 rounded bg-slate-950/50 border border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center text-slate-200 font-medium">
                      <span className="truncate pr-2">{name}</span>
                      <span className="font-mono text-emerald-400">{formatWeight(data.kg)}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-2xs text-slate-400 mt-1 font-mono">
                      <span>{formatPercent(pct)} dari total</span>
                      <span>Nilai: {formatRupiah(data.val)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
