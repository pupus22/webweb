import React, { useRef } from 'react';
import {
  Boxes,
  LayoutDashboard,
  Truck,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Database,
  Recycle,
  Sparkles,
  Warehouse,
  ShoppingBag,
  Flame,
  Menu
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onResetDemo,
  onExport,
  onImport,
  onToggleSidebar
}) {
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Alur', icon: LayoutDashboard },
    { id: 'stage1', label: 'Tahap 1: Reject', icon: Truck },
    { id: 'stage2', label: 'Tahap 2: Flakes', icon: Recycle },
    { id: 'stage3', label: 'Tahap 3: Ekstrusi', icon: Flame },
    { id: 'stage4', label: 'Tahap 4: Gudang Pelet', icon: Warehouse },
    { id: 'stage5', label: 'Tahap 5: Penjualan & DO', icon: ShoppingBag },
    { id: 'master', label: 'Master Data & Tarif', icon: Database },
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
      <div className="w-full px-3 sm:px-4 flex items-center justify-between h-14">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 min-h-[40px] flex items-center justify-center"
            title="Buka Menu Alur Pabrik"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-sm sm:text-base tracking-tight text-white">PolyComp ERP</span>
              <span className="text-3xs sm:text-2xs font-bold px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                END-TO-END FACTORY
              </span>
            </div>
            <p className="text-2xs text-slate-400 hidden md:block">
              Reject Limbah → Flakes Bersih → Ekstrusi Pelet → Gudang Sak @ 25Kg → Penjualan DO
            </p>
          </div>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center space-x-2">
          {/* Status Live */}
          <div className="hidden xl:flex items-center space-x-1.5 text-xs text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-mono text-2xs">5-Stage Auto-Recalibration Active</span>
          </div>

          {/* Backup / Restore / Reset */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onResetDemo}
              title="Reset ke data simulasi pabrik awal"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition min-h-[38px] sm:min-h-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <button
              onClick={onExport}
              title="Download backup data JSON"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition min-h-[38px] sm:min-h-0"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Backup JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Upload file backup JSON"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition min-h-[38px] sm:min-h-0"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Restore</span>
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

      {/* Horizontal Stage Navigation on Mobile/Tablet */}
      <div className="w-full px-2 sm:px-4 flex items-center space-x-1 overflow-x-auto no-scrollbar border-t border-slate-800/80 bg-slate-950/70 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 font-medium whitespace-nowrap border-b-2 transition text-xs min-h-[40px] ${
                isActive
                  ? 'border-purple-500 text-purple-300 bg-slate-900/90 shadow-sm font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
