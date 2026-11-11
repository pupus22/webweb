import React, { useRef } from 'react';
import {
  Boxes,
  Menu,
  Search,
  Sun,
  Moon,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Command
} from 'lucide-react';

const PAGE_TITLES = {
  dashboard: {
    title: 'Dashboard & Alur Produksi',
    subtitle: 'Pipeline 5 Tahap & Analisis KPI Susut'
  },
  stage1: {
    title: 'Tahap 1: Pembelian Limbah Reject',
    subtitle: 'Inbound Bahan Baku Kotor, Timbangan & Hutang Lapak'
  },
  stage2: {
    title: 'Tahap 2: Sortir, Giling & Cuci Flakes',
    subtitle: 'Pre-Processing Cacahan Flakes Kering (<1% Air)'
  },
  stage3: {
    title: 'Tahap 3: Formulasi Blending & Ekstrusi',
    subtitle: 'Resep Komposisi Campuran, Parameter Mesin & Pelet'
  },
  stage4: {
    title: 'Tahap 4: QC & Gudang Biji Plastik Pelet',
    subtitle: 'Stok Pelet Sak @ 25Kg, Flakes & Stock Opname'
  },
  stage5: {
    title: 'Tahap 5: Penjualan & Surat Jalan (DO)',
    subtitle: 'Pengiriman Armada, Faktur & Margin Keuntungan'
  },
  master: {
    title: 'Master Data & Tarif Biaya Olah',
    subtitle: 'Polimer, Aditif, Kontak & Tarif Listrik/Mesin'
  }
};

export default function Navbar({
  activeTab = 'dashboard',
  onToggleSidebar,
  onOpenSearch,
  theme = 'dark',
  onToggleTheme,
  onExportCSV,
  onResetDemo,
  onExportJSON,
  onImportJSON
}) {
  const fileInputRef = useRef(null);
  const pageInfo = PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none transition-colors">
      <div className="w-full px-3 sm:px-4 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 min-h-[40px] flex items-center justify-center shrink-0"
            title="Buka Menu Alur Pabrik"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center space-x-2">
              <span>{pageInfo.title}</span>
            </h1>
            <p className="text-2xs text-slate-400 hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar (Ctrl+K) */}
        <div className="flex-1 max-w-md mx-auto w-full md:w-auto">
          <button
            onClick={onOpenSearch}
            className="w-full bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-left text-slate-400 flex items-center justify-between transition group shadow-inner"
          >
            <div className="flex items-center space-x-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 shrink-0" />
              <span className="truncate">Cari Batch, Lot, SPK, Customer...</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0 ml-2">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-3xs font-mono text-slate-400">
                Ctrl
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-3xs font-mono text-slate-400">
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right: Operational Utility Actions */}
        <div className="flex items-center space-x-1.5 shrink-0 justify-end">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition"
            title={theme === 'dark' ? 'Ganti ke Mode Terang (Gudang Siang)' : 'Ganti ke Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
          </button>

          {/* Export CSV / Excel Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 transition shadow-sm"
            title="Download Data Tabel Ini ke Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Excel/CSV</span>
          </button>

          {/* Backup JSON */}
          <button
            onClick={onExportJSON}
            title="Download file backup JSON"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/60 hover:bg-sky-900 border border-sky-500/30 transition"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden xl:inline">Backup</span>
          </button>

          {/* Restore JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload file backup JSON"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900 border border-purple-500/30 transition"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Restore</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Reset Demo */}
          <button
            onClick={onResetDemo}
            title="Reset ke data simulasi pabrik awal"
            className="p-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-white bg-amber-950/40 hover:bg-amber-900 border border-amber-500/30 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
