import React, { useRef, useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Menu,
  ChevronDown,
  Truck,
  Waves,
  Flame,
  Scale,
  ShoppingBag,
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  activeTab = 'dashboard',
  setActiveTab,
  onToggleSidebar,
  onOpenSearch,
  theme = 'light',
  onToggleTheme,
  onExportCSV,
  onResetDemo,
  onExportJSON,
  onImportJSON,
  onQuickAction
}) {
  const fileInputRef = useRef(null);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      e.target.value = '';
    }
  };

  const handleTriggerQuickAction = (actionKey) => {
    setQuickMenuOpen(false);
    if (onQuickAction) {
      onQuickAction(actionKey);
    } else if (setActiveTab) {
      setActiveTab(actionKey);
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 select-none">
      <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Wide Search Bar */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 shrink-0"
            title="Buka Navigasi Alur"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Qargo Wide Search Bar (Ctrl+K) */}
          <div
            onClick={onOpenSearch}
            className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-400 flex items-center justify-between cursor-pointer w-full max-w-md transition group shadow-2xs"
          >
            <div className="flex items-center space-x-2 truncate min-w-0">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-violet-600 shrink-0 transition" />
              <span className="truncate text-slate-400 text-xs font-normal">
                Cari Batch, Lot, SPK, Supplier, Customer...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-3xs font-mono font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs shrink-0">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Right: Quick Action Pill, Notification, Export/Backup, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Quick Action Dropdown: "+ Transaksi Baru" */}
          <div className="relative">
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-violet-200 text-violet-600 bg-violet-50/60 hover:bg-violet-100/70 text-xs font-bold transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Transaksi Baru</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {quickMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-3xs uppercase font-bold text-slate-400 tracking-wider">
                    Pilih Jenis Transaksi
                  </div>

                  <button
                    onClick={() => handleTriggerQuickAction('stage1')}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Beli Limbah Reject</div>
                      <div className="text-3xs text-slate-400">Tahap 1: Inbound Timbangan</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTriggerQuickAction('stage2')}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Waves className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Proses Giling & Cuci</div>
                      <div className="text-3xs text-slate-400">Tahap 2: Flakes Bersih</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTriggerQuickAction('stage3')}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">SPK Blending & Ekstrusi</div>
                      <div className="text-3xs text-slate-400">Tahap 3: Formulasi Resep</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTriggerQuickAction('stage4')}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-50 transition text-slate-700 font-medium"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Catat Stock Opname</div>
                      <div className="text-3xs text-slate-400">Tahap 4: Timbangan Fisik Gudang</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleTriggerQuickAction('stage5')}
                    className="w-full px-3 py-2 text-left flex items-center space-x-2.5 hover:bg-slate-50 transition text-slate-700 font-medium border-t border-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">Surat Jalan & Penjualan DO</div>
                      <div className="text-3xs text-slate-400">Tahap 5: Kirim Armada & Faktur</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Action Icons: CSV Export, Backup, Demo Reset */}
          <div className="flex items-center space-x-1 border-l border-slate-100 pl-2">
            <button
              onClick={onExportCSV}
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
              title="Export Data Tabel ke Excel / CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              onClick={onExportJSON}
              className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition"
              title="Download Backup JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition"
              title="Restore Database dari File JSON"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={onResetDemo}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Reset ke Data Simulasi Pabrik Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Notification Bell Icon */}
          <div className="relative">
            <button
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition relative"
              title="Notifikasi Pabrik"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-violet-600 ring-2 ring-white"></span>
            </button>
          </div>

          {/* Qargo User Profile Badge: Admin Pabrik */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-100">
            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold text-xs flex items-center justify-center border border-violet-200 shrink-0 shadow-2xs">
              AP
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">Admin Pabrik</div>
              <div className="text-3xs text-slate-400 font-medium">Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
