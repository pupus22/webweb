import React, { useRef } from 'react';
import {
  Boxes,
  LayoutDashboard,
  Database,
  Truck,
  Cog,
  Warehouse,
  ShoppingBag,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onResetDemo,
  onExport,
  onImport
}) {
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'purchases', label: 'Inbound Bahan Baku', icon: Truck },
    { id: 'production', label: 'Produksi & Blending', icon: Cog },
    { id: 'inventory', label: 'Gudang & Stok', icon: Warehouse },
    { id: 'sales', label: 'Penjualan & DO', icon: ShoppingBag },
    { id: 'master', label: 'Master Data', icon: Database },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-white">PolyComp</span>
              <span className="text-2xs font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ERP RECYCLING & COMPOUNDING
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Sistem Manufaktur & Inventaris Biji Plastik</p>
          </div>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center space-x-2">
          {/* Status pill */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Auto-Recalibrate Active</span>
          </div>

          {/* Backup / Restore / Reset */}
          <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
            <button
              onClick={onResetDemo}
              title="Reset ke data simulasi pabrik"
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            <button
              onClick={onExport}
              title="Download backup data JSON"
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload file backup JSON"
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Import</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Dense High-Density Navigation) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center space-x-1 overflow-x-auto no-scrollbar border-t border-slate-800/80 bg-slate-950/60 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 font-medium whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900/90 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
