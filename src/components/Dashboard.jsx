import React, { useState } from 'react';
import {
  TrendingUp,
  Boxes,
  Truck,
  Flame,
  Waves,
  Scale,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ArrowUpRight,
  ArrowRight,
  Tag,
  GitBranch,
  Pencil,
  Plus
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
  recalibratedRawPurchases = [],
  recalibratedPreProcessings = [],
  recalibratedProductionSPKs = [],
  finishedGoodsPelletInventory = [],
  recalibratedSalesOrders = [],
  setActiveTab
}) {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Grouped KPI calculations
  const totalPaidRevenue = (kpis.totalRevenue || 0) - (kpis.totalAccountsReceivable || 0);
  const paidSalesCount = recalibratedSalesOrders.filter(s => s.paymentStatus === 'Lunas').length;
  const unpaidPurchasesCount = recalibratedRawPurchases.filter(r => r.paymentStatus !== 'Lunas').length;

  const totalPelletBags = finishedGoodsPelletInventory.reduce((acc, x) => acc + (x.availableBags || 0), 0);
  const readyPelletLots = finishedGoodsPelletInventory.filter(x => x.qcStatus === 'Lulus QC' && x.currentStockKg > 0);
  const readyPelletBags = readyPelletLots.reduce((acc, x) => acc + (x.availableBags || 0), 0);

  // Stage 1 & 2 Breakdown
  const totalStockKg = (kpis.rawStockKg || 0) + (kpis.flakesStockKg || 0);
  const rawRatio = totalStockKg > 0 ? ((kpis.rawStockKg || 0) / totalStockKg) : 0.5;
  const flakesRatio = totalStockKg > 0 ? ((kpis.flakesStockKg || 0) / totalStockKg) : 0.5;

  // Chart 2: Recent SPK Extrusion Curve points (last 6 SPKs)
  const recentSPKs = [...recalibratedProductionSPKs].slice(0, 6).reverse();
  const maxInputKg = Math.max(...recentSPKs.map(s => s.totalInputMixKg || 1000), 1500);

  // SVG Area Chart points generator
  const chartWidth = 260;
  const chartHeight = 85;
  const points = recentSPKs.length > 0
    ? recentSPKs.map((spk, idx) => {
        const x = (idx / Math.max(recentSPKs.length - 1, 1)) * (chartWidth - 20) + 10;
        const val = spk.outputPelletKg > 0 ? spk.outputPelletKg : (spk.totalInputMixKg || 500);
        const y = chartHeight - 15 - (val / maxInputKg) * (chartHeight - 30);
        return { x, y, spk };
      })
    : [
        { x: 10, y: 50 },
        { x: 70, y: 40 },
        { x: 130, y: 25 },
        { x: 190, y: 35 },
        { x: 250, y: 20 }
      ];

  const svgPath = points.length > 1
    ? points.reduce((acc, pt, idx, arr) => {
        if (idx === 0) return `M ${pt.x} ${pt.y}`;
        const prev = arr[idx - 1];
        const cpX1 = prev.x + (pt.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (pt.x - prev.x) / 2;
        const cpY2 = pt.y;
        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
      }, '')
    : `M 10 50 L ${chartWidth - 10} 30`;

  const areaPath = `${svgPath} L ${points[points.length - 1]?.x || chartWidth - 10} ${chartHeight} L ${points[0]?.x || 10} ${chartHeight} Z`;

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------- */}
      {/* BARIS 1: 3 KARTU GRUP METRIK BERDAMPINGAN (QARGO GROUPED KPIS) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KARTU GRUP 1: Status Pembayaran & Tagihan */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
              Status Pembayaran & Tagihan
            </span>
            <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-violet-50 text-violet-600 border border-violet-100">
              AP & AR Finansial
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 pt-3">
            {/* Sub-col 1: Hutang Bahan Baku (Pending) */}
            <div className="pr-3">
              <span className="text-3xs font-semibold uppercase text-slate-400 block mb-1">
                Hutang Bahan Baku (Pending)
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 tracking-tight">
                {formatRupiah(kpis.totalAccountsPayable)}
              </div>
              <div className="mt-1 flex items-center space-x-1.5 text-2xs">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-500 font-medium">{unpaidPurchasesCount} Nota Lapak Pending</span>
              </div>
            </div>

            {/* Sub-col 2: Piutang DO Terbayar (Paid) */}
            <div className="pl-3">
              <span className="text-3xs font-semibold uppercase text-slate-400 block mb-1">
                Piutang DO Terbayar (Paid)
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 tracking-tight">
                {formatRupiah(totalPaidRevenue)}
              </div>
              <div className="mt-1 flex items-center space-x-1.5 text-2xs">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500 font-medium">{paidSalesCount} Faktur Lunas</span>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU GRUP 2: Informasi Stok Pabrik */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
              Informasi Stok Pabrik
            </span>
            <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              Buffer Fisik
            </span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 pt-3">
            {/* Sub-col 1: Stok Reject & Flakes Aktif */}
            <div className="pr-3">
              <span className="text-3xs font-semibold uppercase text-slate-400 block mb-1">
                Reject & Flakes Aktif (Kg)
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 tracking-tight">
                {formatWeight(totalStockKg)}
              </div>
              <div className="mt-1 text-2xs text-slate-400 font-mono truncate">
                Raw: {formatNumber(kpis.rawStockKg, 0)} | Flk: {formatNumber(kpis.flakesStockKg, 0)} Kg
              </div>
            </div>

            {/* Sub-col 2: Stok Biji Plastik Siap Kirim */}
            <div className="pl-3">
              <span className="text-3xs font-semibold uppercase text-slate-400 block mb-1">
                Pelet Siap Kirim (Kg & Sak)
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-violet-600 tracking-tight">
                {formatWeight(kpis.pelletStockKg)}
              </div>
              <div className="mt-1 text-2xs text-violet-500 font-medium">
                ~ {formatNumber(totalPelletBags, 0)} Karung Sak (@ 25 Kg)
              </div>
            </div>
          </div>
        </div>

        {/* KARTU GRUP 3: Informasi Finansial (3 Sub-columns) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">
              Informasi Finansial & Valuasi
            </span>
            <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
              Profitabilitas
            </span>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-100 pt-3">
            {/* Sub-col 1: Omset */}
            <div className="pr-2">
              <span className="text-3xs font-semibold uppercase text-slate-400 block mb-1 truncate">
                Total Omset
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-800 tracking-tight truncate">
                {formatRupiah(kpis.totalRevenue)}
              </div>
              <div className="mt-1 text-3xs text-slate-400">
                {kpis.totalSalesCount} DO
              </div>
            </div>

            {/* Sub-col 2: Nilai Persediaan */}
            <div className="px-2">
              <span className="text-3xs font-semibold uppercase text-slate-400 block mb-1 truncate">
                Aset Persediaan
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 tracking-tight truncate">
                {formatRupiah(kpis.totalFactoryAssetValuation)}
              </div>
              <div className="mt-1 text-3xs text-slate-400">
                3 Buffer
              </div>
            </div>

            {/* Sub-col 3: Laba Kotor */}
            <div className="pl-2">
              <span className="text-3xs font-semibold uppercase text-slate-400 block mb-1 truncate">
                Laba Kotor
              </span>
              <div className="text-base sm:text-lg font-bold font-mono text-violet-600 tracking-tight truncate">
                {formatRupiah(kpis.totalGrossProfit)}
              </div>
              <div className="mt-1 text-3xs font-semibold text-violet-600">
                {formatPercent(kpis.avgProfitMargin)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BARIS 2: 3 KARTU GRAFIK VISUAL (PURE SVG CHARTS ROW) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KARTU 1: Komposisi Stok & Alur Giling (2 SVG Donuts) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Komposisi Stok & Alur Giling</span>
            <button
              onClick={() => setActiveTab('stage2')}
              className="text-3xs font-semibold text-violet-600 hover:text-violet-700 flex items-center space-x-0.5"
            >
              <span>Alur Cuci</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Dual SVG Donuts */}
            <div className="flex items-center space-x-3 shrink-0">
              {/* Donut 1: Raw Reject (Ungu) */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-violet-600"
                    strokeDasharray={`${rawRatio * 100}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xs font-bold font-mono text-slate-700 block leading-tight">
                    {Math.round(rawRatio * 100)}%
                  </span>
                  <span className="text-3xs text-slate-400 block -mt-0.5 scale-90">Raw</span>
                </div>
              </div>

              {/* Donut 2: Flakes Bersih (Hijau Emerald) */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${flakesRatio * 100}, 100`}
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xs font-bold font-mono text-slate-700 block leading-tight">
                    {Math.round(flakesRatio * 100)}%
                  </span>
                  <span className="text-3xs text-slate-400 block -mt-0.5 scale-90">Flk</span>
                </div>
              </div>
            </div>

            {/* Status Legend on the right */}
            <div className="space-y-1.5 flex-1 min-w-0 text-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0"></span>
                  <span className="text-slate-600 truncate">Siap Giling (Reject)</span>
                </div>
                <span className="font-mono font-semibold text-slate-800 text-3xs shrink-0">
                  {formatNumber(kpis.rawStockKg, 0)} Kg
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Proses Cuci / Susut</span>
                </div>
                <span className="font-mono font-semibold text-amber-600 text-3xs shrink-0">
                  ~{formatPercent(kpis.avgSusutStage1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Siap Blending (Flakes)</span>
                </div>
                <span className="font-mono font-semibold text-emerald-600 text-3xs shrink-0">
                  {formatNumber(kpis.flakesStockKg, 0)} Kg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 2: Tren Produksi & Susut SPK (Smooth Purple Area Chart) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Tren Produksi & Susut SPK</span>
            <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-violet-50 text-violet-600">
              Ekstrusi Line
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Left stats: Active, Completed, Loss % */}
            <div className="space-y-1.5 shrink-0 pr-2 border-r border-slate-100 text-2xs">
              <div>
                <span className="text-3xs text-slate-400 block uppercase">SPK Aktif</span>
                <span className="text-base font-bold font-mono text-violet-600">
                  {kpis.activeSPKCount || 0}
                </span>
              </div>
              <div>
                <span className="text-3xs text-slate-400 block uppercase">SPK Selesai</span>
                <span className="text-base font-bold font-mono text-emerald-600">
                  {kpis.completedSPKCount || 0}
                </span>
              </div>
              <div>
                <span className="text-3xs text-slate-400 block uppercase">Rata Susut</span>
                <span className="text-xs font-bold font-mono text-slate-700">
                  {formatPercent(kpis.avgSusutStage2)}
                </span>
              </div>
            </div>

            {/* Smooth SVG Area Chart */}
            <div className="flex-1 overflow-hidden">
              <svg className="w-full h-20" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                <defs>
                  <linearGradient id="violetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Fill Area */}
                <path d={areaPath} fill="url(#violetGradient)" />
                {/* Line Path */}
                <path d={svgPath} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
                {/* Dots */}
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    className="fill-white stroke-violet-600 stroke-2 hover:r-5 transition-all cursor-pointer"
                  >
                    <title>{pt.spk?.spkNo ? `${pt.spk.spkNo}: ${formatWeight(pt.spk.outputPelletKg)}` : 'Output Pelet'}</title>
                  </circle>
                ))}
              </svg>
              <div className="flex justify-between text-3xs text-slate-400 font-mono px-1">
                <span>Batch Lalu</span>
                <span>Batch Terkini</span>
              </div>
            </div>
          </div>
        </div>

        {/* KARTU 3: Kapasitas Gudang Pelet & DO (Large Ring Chart) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">Kapasitas Gudang Pelet & DO</span>
            <button
              onClick={() => setActiveTab('stage4')}
              className="text-3xs font-semibold text-violet-600 hover:text-violet-700 flex items-center space-x-0.5"
            >
              <span>Gudang</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Large SVG Ring Chart */}
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-600"
                  strokeDasharray={`${Math.min(100, Math.max(15, (readyPelletBags / Math.max(totalPelletBags, 1)) * 100))}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-bold font-mono text-slate-800 block leading-tight">
                  {totalPelletBags}
                </span>
                <span className="text-3xs text-slate-400 block scale-90">Sak Siap</span>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-1.5 flex-1 min-w-0 text-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Lulus QC Siap Kirim</span>
                </div>
                <span className="font-mono font-semibold text-emerald-600 text-3xs shrink-0">
                  {readyPelletBags} Sak
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-violet-600 shrink-0"></span>
                  <span className="text-slate-600 truncate">Dalam Proses Ekstrusi</span>
                </div>
                <span className="font-mono font-semibold text-violet-600 text-3xs shrink-0">
                  {kpis.activeSPKCount || 0} SPK
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                  <span className="text-slate-600 truncate">Terkirim Armada DO</span>
                </div>
                <span className="font-mono font-semibold text-sky-600 text-3xs shrink-0">
                  {recalibratedSalesOrders.reduce((a, b) => a + (b.bagCount || 0), 0)} Sak
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BARIS 3: SPLIT LAYOUT BAWAH (1/3 KIRI & 2/3 KANAN) */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KOLOM KIRI (1/3 LEBAR): Alur Giling & Cuci Terkini */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">Alur Giling & Cuci Terkini</span>
              <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                {recalibratedPreProcessings.length} Batch
              </span>
            </div>
            <button
              onClick={() => setActiveTab('stage2')}
              className="text-3xs font-semibold text-violet-600 hover:text-violet-700 flex items-center space-x-0.5"
            >
              <span>+ Cuci Baru</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2 space-y-2">
            {recalibratedPreProcessings.slice(0, 4).map((proc) => (
              <div key={proc.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-bold text-slate-800 font-mono text-2xs truncate">
                      {proc.rawBatchNo || 'RAW-REJECT'}
                    </span>
                    <span className="text-3xs text-slate-400">→</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold text-3xs font-mono">
                      {proc.polymerCode}
                    </span>
                  </div>
                  <div className="text-3xs text-slate-400 mt-0.5 font-mono">
                    Output: <strong className="text-emerald-600 font-semibold">{formatNumber(proc.outputFlakesKg, 0)} Kg</strong> Flakes ({proc.flakesColor})
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-1">
                  <button
                    onClick={() => setActiveTab('stage2')}
                    className="px-2.5 py-1 rounded-full text-3xs font-bold uppercase tracking-wider bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-100 transition"
                  >
                    PROSES
                  </button>
                </div>
              </div>
            ))}

            {recalibratedPreProcessings.length === 0 && (
              <div className="py-6 text-center text-slate-400 text-2xs">
                Belum ada batch proses cuci & giling.
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400">
            <span>Standar Kadar Air: &lt; 1%</span>
            <span className="text-violet-600 font-medium cursor-pointer" onClick={() => setActiveTab('stage2')}>
              Lihat Gudang Flakes →
            </span>
          </div>
        </div>

        {/* KOLOM KANAN (2/3 LEBAR): SPK Ekstrusi & Pengiriman Pelet Terkini */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800">SPK Ekstrusi & Pengiriman Pelet Terkini</span>
              <span className="px-2 py-0.5 rounded-full text-3xs font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                {recalibratedProductionSPKs.length} SPK
              </span>
            </div>

            <button
              onClick={() => setActiveTab('stage3')}
              className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-3xs font-bold flex items-center space-x-1 shadow-xs transition"
            >
              <Plus className="w-3 h-3" />
              <span>+ Buat SPK Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse min-w-[700px] text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-3xs font-semibold uppercase tracking-wider">
                  <th className="py-2 px-2.5">KODE LOT / SPK</th>
                  <th className="py-2 px-2.5 text-center">STATUS</th>
                  <th className="py-2 px-2.5">NAMA PRODUK / PELET</th>
                  <th className="py-2 px-2.5 text-right">BERAT (KG & SAK)</th>
                  <th className="py-2 px-2.5 text-right">HPP / KG</th>
                  <th className="py-2 px-2.5">TANGGAL</th>
                  <th className="py-2 px-2.5 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-2xs">
                {recalibratedProductionSPKs.slice(0, 5).map((spk) => {
                  const lotCode = spk.targetLotNo || spk.spkNo;
                  return (
                    <tr key={spk.id} className="hover:bg-slate-50/70 transition">
                      {/* Kode Lot / SPK with Copy Icon */}
                      <td className="py-2 px-2.5">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">{lotCode}</span>
                          <button
                            onClick={() => handleCopy(lotCode)}
                            className="text-slate-400 hover:text-violet-600 transition"
                            title="Salin Kode Lot"
                          >
                            {copiedCode === lotCode ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-3xs text-slate-400 font-sans">
                          SPK: {spk.spkNo}
                        </div>
                      </td>

                      {/* Status Soft Capsule Badge */}
                      <td className="py-2 px-2.5 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold ${
                          spk.status === 'Selesai'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-violet-50 text-violet-700 border border-violet-100'
                        }`}>
                          {spk.status === 'Selesai' ? 'Lulus QC' : 'Dalam Proses'}
                        </span>
                      </td>

                      {/* Nama Produk & Warna */}
                      <td className="py-2 px-2.5 font-sans">
                        <div className="font-semibold text-slate-800 truncate max-w-[190px]">
                          {spk.targetProductName}
                        </div>
                        <div className="text-3xs text-slate-400">
                          {spk.polymerType} • {spk.targetColor}
                        </div>
                      </td>

                      {/* Berat Kg & Sak */}
                      <td className="py-2 px-2.5 text-right font-bold text-slate-800">
                        <div>{formatNumber(spk.outputPelletKg || spk.totalInputMixKg, 0)} Kg</div>
                        <div className="text-3xs text-slate-400 font-sans font-normal">
                          ~{spk.bagCount || Math.floor((spk.outputPelletKg || 1000) / 25)} Sak
                        </div>
                      </td>

                      {/* HPP / Kg */}
                      <td className="py-2 px-2.5 text-right font-bold text-violet-600">
                        {formatRupiah(spk.hppFinalPelletPerKg)}
                      </td>

                      {/* Tanggal */}
                      <td className="py-2 px-2.5 text-slate-500 font-sans text-3xs">
                        {formatDate(spk.date)}
                      </td>

                      {/* Aksi Pills */}
                      <td className="py-2 px-2.5 text-center font-sans">
                        <button
                          onClick={() => setActiveTab('stage3')}
                          className="px-2 py-0.5 rounded-md text-3xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 transition"
                        >
                          Detail SPK
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
