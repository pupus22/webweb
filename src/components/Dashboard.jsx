import React from 'react';
import {
  Truck,
  Recycle,
  Flame,
  Warehouse,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Layers,
  Scale,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import {
  formatRupiah,
  formatNumber,
  formatWeight,
  formatPercent,
  formatDate,
  getStatusBadge
} from '../utils/formatters';

export default function Dashboard({
  kpis,
  recalibratedRawPurchases,
  recalibratedPreProcessings,
  recalibratedProductionSPKs,
  finishedGoodsPelletInventory,
  recalibratedSalesOrders,
  setActiveTab
}) {
  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* VISUAL PIPELINE ALUR PABRIK (STEP 1 s/d STEP 5) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Pipeline Alur Produksi Pabrik Daur Ulang & Compounding
            </h2>
          </div>
          <span className="text-2xs text-slate-400 font-mono">
            Total Valuasi Aset Fisik: <strong className="text-emerald-400">{formatRupiah(kpis.totalFactoryAssetValuation)}</strong>
          </span>
        </div>

        {/* 4 Stage Buffer Pipeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Step 1: Raw Reject */}
          <div
            onClick={() => setActiveTab('stage1')}
            className="cursor-pointer bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 rounded-lg p-3 transition group relative"
          >
            <div className="flex justify-between items-start text-xs">
              <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Tahap 1: Inbound
              </span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xs text-slate-400 block">Stok Bahan Reject Kotor</span>
              <span className="text-lg font-black text-white font-mono block">
                {formatWeight(kpis.rawStockKg)}
              </span>
              <span className="text-2xs text-emerald-400 font-mono">
                {formatRupiah(kpis.rawStockValue)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-2xs text-slate-400 group-hover:text-emerald-300">
              <span>{recalibratedRawPurchases.length} Lot Masuk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2: Clean Flakes */}
          <div
            onClick={() => setActiveTab('stage2')}
            className="cursor-pointer bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/60 rounded-lg p-3 transition group relative"
          >
            <div className="flex justify-between items-start text-xs">
              <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                Tahap 2: Pre-Processing
              </span>
              <Recycle className="w-4 h-4 text-sky-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xs text-slate-400 block">Stok Cacahan Flakes Bersih</span>
              <span className="text-lg font-black text-white font-mono block">
                {formatWeight(kpis.flakesStockKg)}
              </span>
              <span className="text-2xs text-sky-400 font-mono">
                {formatRupiah(kpis.flakesStockValue)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-2xs text-slate-400 group-hover:text-sky-300">
              <span>Susut Cuci: ~{formatPercent(kpis.avgSusutStage1)}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 3: FG Pellets */}
          <div
            onClick={() => setActiveTab('stage4')}
            className="cursor-pointer bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/60 rounded-lg p-3 transition group relative"
          >
            <div className="flex justify-between items-start text-xs">
              <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                Tahap 3 & 4: Pelet Jadi
              </span>
              <Warehouse className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xs text-slate-400 block">Gudang Pelet Siap Kirim</span>
              <span className="text-lg font-black text-white font-mono block">
                {formatWeight(kpis.pelletStockKg)}
              </span>
              <span className="text-2xs text-purple-400 font-mono">
                {formatRupiah(kpis.pelletStockValue)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-2xs text-slate-400 group-hover:text-purple-300">
              <span>Susut Ekstrusi: ~{formatPercent(kpis.avgSusutStage2)}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 4: Sales & Profit */}
          <div
            onClick={() => setActiveTab('stage5')}
            className="cursor-pointer bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/60 rounded-lg p-3 transition group relative"
          >
            <div className="flex justify-between items-start text-xs">
              <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                Tahap 5: Penjualan DO
              </span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2.5">
              <span className="text-2xs text-slate-400 block">Total Omset & Laba Kotor</span>
              <span className="text-lg font-black text-amber-400 font-mono block">
                {formatRupiah(kpis.totalGrossProfit)}
              </span>
              <span className="text-2xs text-slate-300 font-mono">
                Omset: {formatRupiah(kpis.totalRevenue)}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-2xs text-slate-400 group-hover:text-amber-300">
              <span>Margin: {formatPercent(kpis.avgProfitMargin)}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* QUICK OPERATIONS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="font-bold text-white uppercase text-2xs tracking-wider">Aksi Cepat Pabrik:</span>
          <span className="text-slate-400 hidden sm:inline text-2xs">Eksekusi transaksi harian di tiap stasiun kerja</span>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <button
            onClick={() => setActiveTab('stage1')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>+ Beli Limbah Reject</span>
          </button>
          <button
            onClick={() => setActiveTab('stage2')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold transition"
          >
            <Recycle className="w-3.5 h-3.5" />
            <span>+ Proses Giling & Cuci</span>
          </button>
          <button
            onClick={() => setActiveTab('stage3')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>+ SPK Blending Ekstrusi</span>
          </button>
          <button
            onClick={() => setActiveTab('stage5')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold transition"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>+ Order Penjualan DO</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MULTI-TIER SHRINKAGE & LOSS ANALYSIS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card Susut Tahap 1: Cuci & Giling */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Recycle className="w-4 h-4 text-sky-400" />
              <span>Susut Tahap 1: Sortir, Giling & Cuci</span>
            </span>
            <span className="font-mono text-xs font-bold text-amber-400">
              {formatPercent(kpis.avgSusutStage1)} Rata-rata
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-sky-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(5, kpis.avgSusutStage1 * 5))}%` }}
            />
          </div>
          <div className="flex justify-between text-2xs text-slate-400 font-mono">
            <span>Input Reject: {formatWeight(kpis.totalRawInputStage1)}</span>
            <span className="text-rose-400">Kotoran/Sampah: -{formatWeight(kpis.totalWasteStage1)}</span>
          </div>
        </div>

        {/* Card Susut Tahap 2: Ekstrusi & Pelletizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-purple-400" />
              <span>Susut Tahap 2: Ekstrusi Pelelehan & Filter Kasa</span>
            </span>
            <span className="font-mono text-xs font-bold text-amber-400">
              {formatPercent(kpis.avgSusutStage2)} Rata-rata
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-purple-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(5, kpis.avgSusutStage2 * 5))}%` }}
            />
          </div>
          <div className="flex justify-between text-2xs text-slate-400 font-mono">
            <span>Input Formulasi: {formatWeight(kpis.totalInputStage2)}</span>
            <span className="text-rose-400">Kerak/Purging: -{formatWeight(kpis.totalWasteStage2)}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RECENT PRODUCTION SPKS & FG BATCHES */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Aktivitas SPK Ekstrusi & Peletisasi Terkini
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('stage3')}
            className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <span>Buka SPK Ekstrusi</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-2xs uppercase">
                <th className="py-2.5 px-3">No. SPK & Lot</th>
                <th className="py-2.5 px-3">Nama Pelet & Polimer</th>
                <th className="py-2.5 px-3 text-right">Input Campuran</th>
                <th className="py-2.5 px-3 text-right">Hasil Pelet</th>
                <th className="py-2.5 px-3 text-right">Susut (%)</th>
                <th className="py-2.5 px-3 text-right">HPP Final / Kg</th>
                <th className="py-2.5 px-3 text-center">Status QC</th>
                <th className="py-2.5 px-3 text-center">Status SPK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {recalibratedProductionSPKs.slice(0, 5).map(spk => (
                <tr key={spk.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-2 px-3">
                    <span className="font-bold text-white block">{spk.spkNo}</span>
                    <span className="text-2xs text-purple-400">{spk.targetLotNo}</span>
                  </td>
                  <td className="py-2 px-3 font-sans">
                    <span className="font-medium text-slate-200 block truncate max-w-[220px]">
                      {spk.targetProductName}
                    </span>
                    <span className="text-2xs text-slate-400">
                      {spk.polymerType} • Warna: {spk.targetColor}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-300">
                    {formatNumber(spk.totalInputMixKg, 0)} Kg
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">
                    {formatNumber(spk.outputPelletKg, 0)} Kg
                    <span className="text-2xs text-slate-400 font-sans block">
                      ~{spk.bagCount} Sak
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <span className="text-rose-400 font-semibold block">
                      -{formatNumber(spk.wasteExtrusionKg, 0)} Kg
                    </span>
                    <span className="text-2xs text-slate-400">
                      ({formatPercent(spk.wastePercentage)})
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-sky-400">
                    {formatRupiah(spk.hppFinalPelletPerKg)}
                  </td>
                  <td className="py-2 px-3 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(spk.qcResult?.status)}`}>
                      {spk.qcResult?.status || 'Lulus QC'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-sans">
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${getStatusBadge(spk.status)}`}>
                      {spk.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
