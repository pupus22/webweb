import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Waves,
  Flame,
  Boxes,
  TrendingUp,
  Database,
  X,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  counts = {}
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & Alur',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Pipeline 5 Tahap & KPI Susut'
    },
    {
      id: 'stage1',
      label: 'Tahap 1: Limbah Reject',
      shortLabel: 'T1: Reject',
      icon: Truck,
      description: 'Inbound Pembelian Bahan Kotor'
    },
    {
      id: 'stage2',
      label: 'Tahap 2: Sortir, Giling & Cuci',
      shortLabel: 'T2: Flakes',
      icon: Waves,
      description: 'Pre-Processing Cacahan Kering'
    },
    {
      id: 'stage3',
      label: 'Tahap 3: Blending & Ekstrusi',
      shortLabel: 'T3: Ekstrusi',
      icon: Flame,
      description: 'SPK Formulasi Resep & Pelet'
    },
    {
      id: 'stage4',
      label: 'Tahap 4: Gudang Biji Plastik',
      shortLabel: 'T4: Gudang',
      icon: Boxes,
      description: 'QC, Pelet Sak @ 25Kg & Flakes'
    },
    {
      id: 'stage5',
      label: 'Tahap 5: Penjualan & DO',
      shortLabel: 'T5: Penjualan',
      icon: TrendingUp,
      description: 'Surat Jalan, DO & Margin'
    },
    {
      id: 'master',
      label: 'Master Data & Tarif Biaya',
      shortLabel: 'Master Data',
      icon: Database,
      description: 'Polimer, Aditif, Kontak & Tarif'
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* ----------------------------------------------------------- */}
      {/* DESKTOP & TABLET: QARGO SLIM ICON RAIL (w-20) */}
      {/* ----------------------------------------------------------- */}
      <aside className="hidden lg:flex w-20 bg-white border-r border-slate-100 flex-col items-center py-5 shrink-0 z-30 justify-between select-none">
        {/* Top: Violet Brand Logo */}
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className="w-11 h-11 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center font-black text-lg shadow-md shadow-violet-200 transition group relative"
            title="PolyComp ERP"
          >
            <span>P</span>
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-3xs font-semibold rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
              PolyComp ERP
            </div>
          </button>
        </div>

        {/* Center: Clean Icon Rail with Generous Spacing (No number badges stacked on icons) */}
        <nav className="flex flex-col items-center space-y-3.5 my-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group flex items-center justify-center">
                <button
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
                    isActive
                      ? 'bg-violet-50 text-violet-600 shadow-xs ring-1 ring-violet-200/60'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                  aria-label={item.label}
                >
                  <IconComponent className="w-5 h-5 stroke-[1.8]" />
                </button>

                {/* Floating Tooltip to the Right */}
                <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 whitespace-nowrap z-50 flex flex-col min-w-[140px]">
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-3xs text-slate-400">{item.description}</span>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom: Settings / Master Data Shortcut */}
        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => handleSelectTab('master')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
              activeTab === 'master'
                ? 'bg-violet-50 text-violet-600'
                : 'text-slate-300 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title="Pengaturan Master Data"
          >
            <Database className="w-4 h-4" />
          </button>
          <div className="absolute left-full ml-3.5 px-2.5 py-1 bg-slate-900 text-white text-3xs font-semibold rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-50">
            Master Data & Tarif
          </div>
        </div>
      </aside>

      {/* ----------------------------------------------------------- */}
      {/* MOBILE DRAWER: Full Slide-in on Smartphone / Small Screens */}
      {/* ----------------------------------------------------------- */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-full bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 border-r border-slate-100">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-violet-200">
                    P
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 leading-tight">PolyComp ERP</h2>
                    <p className="text-3xs text-slate-400">Recycled Plastics Compounding</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu List */}
              <nav className="mt-4 space-y-1.5">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-violet-50 text-violet-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                      <div className="text-left flex-1 min-w-0">
                        <div className="truncate">{item.label}</div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-violet-600 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-100 text-3xs text-slate-400 text-center">
              PolyComp ERP v2.0 • Clean Light SaaS
            </div>
          </div>
        </div>
      )}
    </>
  );
}
